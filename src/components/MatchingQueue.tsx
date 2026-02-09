import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ChatMode } from "@/types/chat";
import { useMatchmaking } from "@/hooks/useMatchmaking";

interface MatchingQueueProps {
  mode: ChatMode;
  onMatched: (sessionId: string, role: "user1" | "user2") => void;
  onCancel: () => void;
}

const modeLabels: Record<ChatMode, string> = {
  confession: "Confession Mode",
  spicy: "Spicy Memories",
  free: "Free Talk",
};

const MatchingQueue = ({ mode, onMatched, onCancel }: MatchingQueueProps) => {
  const { state, match, joinQueue, cleanup } = useMatchmaking(mode);

  useEffect(() => {
    joinQueue();
    return () => {
      cleanup();
    };
  }, [joinQueue, cleanup]);

  useEffect(() => {
    if (state === "matched" && match) {
      onMatched(match.sessionId, match.role);
    }
  }, [state, match, onMatched]);

  const dots = state === "queued" ? "..." : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-noise relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-8"
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Finding a stranger{dots}</h2>
        <p className="text-muted-foreground text-sm mb-2">{modeLabels[mode]}</p>
        <p className="text-xs text-muted-foreground/50 mb-8">You'll be connected anonymously</p>

        <button
          onClick={() => { cleanup(); onCancel(); }}
          className="px-6 py-2.5 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default MatchingQueue;
