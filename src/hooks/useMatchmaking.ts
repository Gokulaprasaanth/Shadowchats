import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ChatMode } from "@/types/chat";

type MatchState = "idle" | "queued" | "matched";

interface MatchResult {
  sessionId: string;
  role: "user1" | "user2";
}

export function useMatchmaking(mode: ChatMode) {
  const [state, setState] = useState<MatchState>("idle");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const queueIdRef = useRef<string | null>(null);
  const cleanedUpRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const cleanup = useCallback(async () => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (queueIdRef.current) {
      await supabase.from("match_queue").delete().eq("id", queueIdRef.current);
      queueIdRef.current = null;
    }
  }, []);

  const joinQueue = useCallback(async () => {
    cleanedUpRef.current = false;
    setState("queued");

    // Check for an existing waiting user in same mode
    const { data: waiting } = await supabase
      .from("match_queue")
      .select("id")
      .eq("mode", mode)
      .order("joined_at", { ascending: true })
      .limit(1)
      .single();

    if (waiting) {
      // Match found — create session, remove the other user from queue
      const { data: session } = await supabase
        .from("chat_sessions")
        .insert({ mode })
        .select("id")
        .single();

      if (session) {
        await supabase.from("match_queue").delete().eq("id", waiting.id);
        setState("matched");
        setMatch({ sessionId: session.id, role: "user2" });
        return;
      }
    }

    // No match found — enter queue
    const { data: entry } = await supabase
      .from("match_queue")
      .insert({ mode })
      .select("id")
      .single();

    if (!entry) return;

    queueIdRef.current = entry.id;

    // Subscribe to realtime DELETE on our queue row
    const channel = supabase
      .channel(`queue-${entry.id}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "match_queue",
          filter: `id=eq.${entry.id}`,
        },
        async () => {
          // We were matched — find the most recent session for this mode
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("mode", mode)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (session) {
            queueIdRef.current = null;
            channelRef.current = null;
            setState("matched");
            setMatch({ sessionId: session.id, role: "user1" });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount / tab close
    const handleBeforeUnload = () => {
      if (queueIdRef.current) {
        const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://gbjkkjrxjfymmjbgymav.supabase.co"}/rest/v1/match_queue?id=eq.${queueIdRef.current}`;
        navigator.sendBeacon(url);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [mode]);

  return { state, match, joinQueue, cleanup };
}
