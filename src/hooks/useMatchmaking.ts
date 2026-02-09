import { useState, useEffect, useCallback, useRef } from "react";
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

  const cleanup = useCallback(async () => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;
    if (queueIdRef.current) {
      await supabase.from("match_queue").delete().eq("id", queueIdRef.current);
      queueIdRef.current = null;
    }
  }, []);

  const joinQueue = useCallback(async () => {
    cleanedUpRef.current = false;
    setState("queued");

    // Check for existing waiting user in same mode
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

    // No match — enter queue and wait
    const { data: entry } = await supabase
      .from("match_queue")
      .insert({ mode })
      .select("id")
      .single();

    if (entry) {
      queueIdRef.current = entry.id;
    }
  }, [mode]);

  // Listen for being matched (someone created a session and removed us)
  useEffect(() => {
    if (state !== "queued" || !queueIdRef.current) return;

    const channel = supabase
      .channel(`queue-${queueIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "match_queue",
          filter: `id=eq.${queueIdRef.current}`,
        },
        async () => {
          // We were removed from queue — find the session
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("mode", mode)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (session) {
            queueIdRef.current = null;
            setState("matched");
            setMatch({ sessionId: session.id, role: "user1" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state, mode]);

  // Cleanup on unmount / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (queueIdRef.current) {
        // Use sendBeacon for reliability on tab close
        const url = `https://gbjkkjrxjfymmjbgymav.supabase.co/rest/v1/match_queue?id=eq.${queueIdRef.current}`;
        navigator.sendBeacon(url); // best-effort
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanup();
    };
  }, [cleanup]);

  return { state, match, joinQueue, cleanup };
}
