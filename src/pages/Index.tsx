import { useState, useCallback } from "react";
import { AppScreen, ChatMode } from "@/types/chat";
import LandingScreen from "@/components/LandingScreen";
import ModeSelection from "@/components/ModeSelection";
import MatchingQueue from "@/components/MatchingQueue";
import ChatRoom from "@/components/ChatRoom";
import PostChatSurvey from "@/components/PostChatSurvey";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [mode, setMode] = useState<ChatMode>("free");

  const handleStartChat = () => setScreen("mode-select");

  const handleModeSelect = (selectedMode: ChatMode) => {
    setMode(selectedMode);
    setScreen("matching");
  };

  const handleMatched = useCallback(() => setScreen("chat"), []);

  const handleEndChat = () => setScreen("post-chat");

  const handleNewChat = () => setScreen("mode-select");

  const handleBackToLanding = () => setScreen("landing");

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={handleStartChat} />}
      {screen === "mode-select" && (
        <ModeSelection onSelect={handleModeSelect} onBack={handleBackToLanding} />
      )}
      {screen === "matching" && (
        <MatchingQueue mode={mode} onMatched={handleMatched} onCancel={handleBackToLanding} />
      )}
      {screen === "chat" && (
        <ChatRoom
          mode={mode}
          onSkip={handleEndChat}
          onReport={handleEndChat}
          onDisconnect={handleEndChat}
        />
      )}
      {screen === "post-chat" && <PostChatSurvey onComplete={handleNewChat} />}
    </>
  );
};

export default Index;
