import { useState, useCallback } from "react";
import { AppScreen, ChatMode } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import LandingScreen from "@/components/LandingScreen";
import ModeSelection from "@/components/ModeSelection";
import MatchingQueue from "@/components/MatchingQueue";
import ChatRoom from "@/components/ChatRoom";
import PostChatSurvey from "@/components/PostChatSurvey";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [mode, setMode] = useState<ChatMode>("free");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<"user1" | "user2">("user1");

  const handleStartChat = () => setScreen("mode-select");

  const handleModeSelect = (selectedMode: ChatMode) => {
    setMode(selectedMode);
    setScreen("matching");
  };

  const handleMatched = useCallback((sid: string, r: "user1" | "user2") => {
    setSessionId(sid);
    setRole(r);
    setScreen("chat");
  }, []);

  const handleEndChat = () => {
    setSessionId(null);
    setScreen("post-chat");
  };

  const handleNewChat = () => setScreen("mode-select");

  const handleBackToLanding = () => setScreen("landing");

  const handlePostChatFeedback = async (gender?: string) => {
    if (gender && sessionId) {
      await supabase.from("post_chat_feedback").insert({
        session_id: sessionId,
        gender,
      });
    }
    handleNewChat();
  };

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={handleStartChat} />}
      {screen === "mode-select" && (
        <ModeSelection onSelect={handleModeSelect} onBack={handleBackToLanding} />
      )}
      {screen === "matching" && (
        <MatchingQueue mode={mode} onMatched={handleMatched} onCancel={handleBackToLanding} />
      )}
      {screen === "chat" && sessionId && (
        <ChatRoom mode={mode} sessionId={sessionId} role={role} onEnd={handleEndChat} />
      )}
      {screen === "post-chat" && <PostChatSurvey onComplete={handlePostChatFeedback} />}
    </>
  );
};

export default Index;
