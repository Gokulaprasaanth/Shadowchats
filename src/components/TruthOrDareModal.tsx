import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { TruthOrDareType } from "@/types/chat";

interface TruthOrDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (type: TruthOrDareType) => void;
  prompt: string | null;
  promptType: TruthOrDareType | null;
  onSkipPrompt: () => void;
}

const TruthOrDareModal = ({ isOpen, onClose, onChoose, prompt, promptType, onSkipPrompt }: TruthOrDareModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!prompt ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Truth or Dare 🎲</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose one — you'll get a random prompt!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onChoose("truth")}
                    className="py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 transition-all"
                  >
                    Truth
                  </button>
                  <button
                    onClick={() => onChoose("dare")}
                    className="py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-semibold hover:bg-accent/20 transition-all"
                  >
                    Dare
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{promptType === "truth" ? "🤔" : "🔥"}</span>
                  <h3 className="font-bold text-lg capitalize">{promptType}</h3>
                </div>
                <p className="text-foreground leading-relaxed mb-6">{prompt}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onSkipPrompt}
                    className="py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={onClose}
                    className="py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
                  >
                    Answer in Chat
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TruthOrDareModal;
