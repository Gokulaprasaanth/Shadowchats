import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SkipForward, Flag, Dice5 } from "lucide-react";
import { ChatMode, TruthOrDareType } from "@/types/chat";
import { getRandomTruth, getRandomDare } from "@/data/truthOrDare";
import { useChat } from "@/hooks/useChat";
import TruthOrDareModal from "./TruthOrDareModal";

interface ChatRoomProps {
  mode: ChatMode;
  sessionId: string;
  role: "user1" | "user2";
  onEnd: () => void;
}

const ChatRoom = ({ mode, sessionId, role, onEnd }: ChatRoomProps) => {
  const [input, setInput] = useState("");
  const [todOpen, setTodOpen] = useState(false);
  const [todPrompt, setTodPrompt] = useState<string | null>(null);
  const [todType, setTodType] = useState<TruthOrDareType | null>(null);
  const [todRoundsUsed, setTodRoundsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isStrangerTyping, sendMessage, endSession, reportUser, setMessages } = useChat({
    sessionId,
    role,
    onDisconnected: onEnd,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStrangerTyping, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    const result = await sendMessage(text);

    if (!result.success && result.warning) {
      setMessages((prev) => [
        ...prev,
        { id: `warn-${Date.now()}`, text: result.warning!, sender: "system", timestamp: new Date() },
      ]);
    }
  };

  const handleSkip = async () => {
    await endSession();
    onEnd();
  };

  const handleReport = async () => {
    await reportUser("reported_by_user");
    onEnd();
  };

  const handleTodChoose = (type: TruthOrDareType) => {
    setTodType(type);
    setTodPrompt(type === "truth" ? getRandomTruth() : getRandomDare());
  };

  const handleTodClose = () => {
    if (todPrompt && todType) {
      setMessages((prev) => [
        ...prev,
        {
          id: `tod-${Date.now()}`,
          text: `🎲 ${todType === "truth" ? "Truth" : "Dare"}: ${todPrompt}`,
          sender: "system",
          timestamp: new Date(),
        },
      ]);
      setTodRoundsUsed((prev) => prev + 1);
    }
    setTodOpen(false);
    setTodPrompt(null);
    setTodType(null);
  };

  const handleSkipPrompt = () => {
    setTodPrompt(null);
    setTodType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modeLabel = mode === "confession" ? "Confession" : mode === "spicy" ? "Spicy Memories" : "Free Talk";

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div>
            <span className="text-sm font-semibold">Stranger</span>
            <span className="text-xs text-muted-foreground ml-2">{modeLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {todRoundsUsed < 2 && (
            <button
              onClick={() => setTodOpen(true)}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              title="Truth or Dare"
            >
              <Dice5 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSkip}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Skip"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={handleReport}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Report"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.sender === "you" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"
              }`}
            >
              {msg.sender === "system" ? (
                <div className="px-4 py-2 rounded-full bg-secondary/50 text-xs text-muted-foreground max-w-[85%] text-center">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "you"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStrangerTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-secondary text-secondary-foreground">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <TruthOrDareModal
        isOpen={todOpen}
        onClose={handleTodClose}
        onChoose={handleTodChoose}
        prompt={todPrompt}
        promptType={todType}
        onSkipPrompt={handleSkipPrompt}
      />
    </div>
  );
};

export default ChatRoom;
