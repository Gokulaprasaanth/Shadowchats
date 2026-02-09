import { motion } from "framer-motion";
import { Heart, Flame, MessageSquare, ArrowLeft } from "lucide-react";
import { ChatMode } from "@/types/chat";

interface ModeSelectionProps {
  onSelect: (mode: ChatMode) => void;
  onBack: () => void;
}

const modes = [
  {
    id: "confession" as ChatMode,
    icon: Heart,
    title: "Confession Mode",
    description: "Share secrets and hidden feelings anonymously",
    accent: "primary",
  },
  {
    id: "spicy" as ChatMode,
    icon: Flame,
    title: "Spicy Memories",
    description: "Bold 18+ conversations — suggestive, not explicit",
    accent: "accent",
  },
  {
    id: "free" as ChatMode,
    icon: MessageSquare,
    title: "Free Talk",
    description: "Talk about anything with a random stranger",
    accent: "primary",
  },
];

const ModeSelection = ({ onSelect, onBack }: ModeSelectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-noise relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <h2 className="text-2xl font-bold mb-2">Choose your vibe</h2>
        <p className="text-muted-foreground text-sm mb-8">Pick a conversation mode to get matched</p>

        <div className="space-y-3">
          {modes.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(mode.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                mode.accent === "accent"
                  ? "border-accent/20 bg-accent/5 hover:border-accent/40 hover:bg-accent/10"
                  : "border-border hover:border-primary/30 bg-secondary/30 hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${
                  mode.accent === "accent" ? "bg-accent/15" : "bg-primary/10"
                }`}>
                  <mode.icon className={`w-5 h-5 ${
                    mode.accent === "accent" ? "text-accent" : "text-primary"
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ModeSelection;
