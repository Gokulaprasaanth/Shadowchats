import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SkipForward, Flag, Dice5 } from "lucide-react";
import { ChatMessage, ChatMode, TruthOrDareType } from "@/types/chat";
import { moderateMessage, getModerationWarning } from "@/utils/moderation";
import { getRandomTruth, getRandomDare } from "@/data/truthOrDare";
import TruthOrDareModal from "./TruthOrDareModal";

interface ChatRoomProps {
  mode: ChatMode;
  onSkip: () => void;
  onReport: () => void;
  onDisconnect: () => void;
}

const strangerResponses = [
  "That's interesting, tell me more...",
  "Hmm, I feel the same way sometimes.",
  "I've never thought about it like that before.",
  "Wow, that's bold. I respect that.",
  "I can relate to that more than you'd think.",
  "That actually made me think...",
  "You're more open than most people I talk to here.",
  "I appreciate you sharing that.",
  "That's a fascinating perspective.",
  "I've had a similar experience actually.",
];

const ChatRoom = ({ mode, onSkip, onReport, onDisconnect }: ChatRoomProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-1",
      text: "You're now connected with a stranger. Be bold, be kind.",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [todOpen, setTodOpen] = useState(false);
  const [todPrompt, setTodPrompt] = useState<string | null>(null);
  const [todType, setTodType] = useState<TruthOrDareType | null>(null);
  const [todRoundsUsed, setTodRoundsUsed] = useState(0);
  const [violations, setViolations] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStrangerTyping, scrollToBottom]);

  const addMessage = (text: string, sender: ChatMessage["sender"]) => {
    setMessages(prev => [
      ...prev,
      { id: `${sender}-${Date.now()}`, text, sender, timestamp: new Date() },
    ]);
  };

  const simulateStrangerResponse = () => {
    setIsStrangerTyping(true);
    const delay = 1500 + Math.random() * 3000;
    setTimeout(() => {
      setIsStrangerTyping(false);
      const response = strangerResponses[Math.floor(Math.random() * strangerResponses.length)];
      addMessage(response, "stranger");
    }, delay);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Rate limit: 1 message per second
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      addMessage(getModerationWarning("spam"), "system");
      return;
    }
    setLastMessageTime(now);

    const modResult = moderateMessage(text);
    if (!modResult.allowed) {
      const warning = getModerationWarning(modResult.reason);
      addMessage(warning, "system");

      if (modResult.reason === "minor") {
        setTimeout(onDisconnect, 1500);
        return;
      }

      const newViolations = violations + 1;
      setViolations(newViolations);
      if (newViolations >= 3) {
        addMessage("⚠️ Too many violations. You have been disconnected.", "system");
        setTimeout(onDisconnect, 1500);
        return;
      }
      setInput("");
      return;
    }

    addMessage(text, "you");
    setInput("");
    simulateStrangerResponse();
  };

  const handleTodChoose = (type: TruthOrDareType) => {
    setTodType(type);
    setTodPrompt(type === "truth" ? getRandomTruth() : getRandomDare());
  };

  const handleTodClose = () => {
    if (todPrompt && todType) {
      addMessage(`🎲 ${todType === "truth" ? "Truth" : "Dare"}: ${todPrompt}`, "system");
      setTodRoundsUsed(prev => prev + 1);
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
            onClick={onSkip}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Skip"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={onReport}
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
          {messages.map(msg => (
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-secondary text-secondary-foreground">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
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
            onChange={e => setInput(e.target.value)}
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
