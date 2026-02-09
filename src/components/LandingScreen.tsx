import { motion } from "framer-motion";
import { Shield, Eye, MessageCircle, AlertTriangle } from "lucide-react";

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-noise relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
          <span className="text-sm text-primary font-medium tracking-wide">Anonymous • Free • 18+</span>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-gradient">ShadowChats</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          Talk to strangers. Share confessions. Be bold.
          <br />
          <span className="text-foreground/60">No accounts. No history. Just raw conversation.</span>
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Eye, label: "Anonymous" },
            { icon: Shield, label: "Safe" },
            { icon: MessageCircle, label: "Text Only" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-lg glow-primary transition-all duration-300 hover:opacity-90"
        >
          Start Chat
        </motion.button>

        <div className="mt-8 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-accent mb-1">18+ Content Notice</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This platform is for adults only. Content may include flirty, romantic, and emotionally bold conversations.
                Explicit sexual content and any mention of minors is strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 mt-6">
          No data stored • No identity tracking • Chats deleted on disconnect
        </p>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
