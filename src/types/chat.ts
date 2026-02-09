export type ChatMode = "confession" | "spicy" | "free";

export type AppScreen = "landing" | "mode-select" | "matching" | "chat" | "post-chat";

export type ChatMessage = {
  id: string;
  text: string;
  sender: "you" | "stranger" | "system";
  timestamp: Date;
};

export type TruthOrDareType = "truth" | "dare";
