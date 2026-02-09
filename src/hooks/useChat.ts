import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types/chat";
import { moderateMessage, getModerationWarning } from "@/utils/moderation";

interface UseChatOptions {
  sessionId: string;
  role: "user1" | "user2";
  onDisconnected: () => void;
}

export function useChat({ sessionId, role, onDisconnected }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-connected",
      text: "You're now connected with a stranger. Be bold, be kind.",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [violations, setViolations] = useState(0);
  const lastMessageTimeRef = useRef(0);

  // Listen for new messages via realtime
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const msg = payload.new as { id: string; sender: string; content: string; created_at: string };
          // Only show messages from the other user
          if (msg.sender !== role) {
            setIsStrangerTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: msg.id,
                text: msg.content,
                sender: "stranger",
                timestamp: new Date(msg.created_at),
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, role]);

  // Listen for session deletion (other user disconnected)
  useEffect(() => {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_sessions",
          filter: `id=eq.${sessionId}`,
        },
        () => {
          setMessages((prev) => [
            ...prev,
            {
              id: "sys-disconnected",
              text: "Stranger has disconnected.",
              sender: "system",
              timestamp: new Date(),
            },
          ]);
          setTimeout(onDisconnected, 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, onDisconnected]);

  const sendMessage = useCallback(
    async (text: string): Promise<{ success: boolean; warning?: string }> => {
      const trimmed = text.trim();
      if (!trimmed) return { success: false };

      // Rate limit
      const now = Date.now();
      if (now - lastMessageTimeRef.current < 1000) {
        return { success: false, warning: getModerationWarning("spam") };
      }
      lastMessageTimeRef.current = now;

      // Moderate
      const modResult = moderateMessage(trimmed);
      if (!modResult.allowed) {
        const warning = getModerationWarning(modResult.reason);

        if (modResult.reason === "minor") {
          await endSession();
          return { success: false, warning };
        }

        const newViolations = violations + 1;
        setViolations(newViolations);
        if (newViolations >= 3) {
          await endSession();
          return { success: false, warning: "⚠️ Too many violations. You have been disconnected." };
        }

        return { success: false, warning };
      }

      // Add to local messages immediately
      setMessages((prev) => [
        ...prev,
        { id: `you-${now}`, text: trimmed, sender: "you", timestamp: new Date() },
      ]);

      // Insert into DB
      await supabase.from("messages").insert({
        session_id: sessionId,
        sender: role,
        content: trimmed,
      });

      return { success: true };
    },
    [sessionId, role, violations]
  );

  const endSession = useCallback(async () => {
    // Delete session — cascade deletes messages
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
  }, [sessionId]);

  const reportUser = useCallback(
    async (reason: string = "inappropriate") => {
      await supabase.from("reports").insert({
        session_id: sessionId,
        reason,
      });
      await endSession();
    },
    [sessionId, endSession]
  );

  return {
    messages,
    isStrangerTyping,
    sendMessage,
    endSession,
    reportUser,
    setMessages,
  };
}
