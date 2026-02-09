import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface PostChatSurveyProps {
  onComplete: () => void;
}

const PostChatSurvey = ({ onComplete }: PostChatSurveyProps) => {
  const handleSelect = () => {
    // Gender data is not stored — immediately proceed
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-noise relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm relative z-10"
      >
        <div className="inline-flex p-3 rounded-full bg-secondary/50 mb-6">
          <MessageCircle className="w-6 h-6 text-muted-foreground" />
        </div>

        <h2 className="text-xl font-bold mb-2">Chat ended</h2>
        <p className="text-sm text-muted-foreground mb-8">
          All messages have been deleted. Nothing was stored.
        </p>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Optional: What gender do you identify as?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {["Male", "Female", "Prefer not to say"].map(option => (
              <button
                key={option}
                onClick={handleSelect}
                className="py-2.5 px-3 rounded-lg border border-border bg-secondary/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-3.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold glow-primary hover:opacity-90 transition-all"
        >
          Find New Stranger
        </button>

        <button
          onClick={onComplete}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default PostChatSurvey;
