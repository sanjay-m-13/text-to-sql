"use client";

import { useState } from "react";
import ConversationHistory from "./ConversationHistory";
import ChatHeader from "./ChatHeader";
import ConversationArea from "./ConversationArea";
import ChatInput from "./ChatInput";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const handleNewConversation = () => {
    setSelectedConversation(null);
    // In a real app, you would clear the current conversation
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    // In a real app, you would load the selected conversation
  };

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--background-default)" }}
    >
      <ConversationHistory
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ConversationArea messages={messages} isLoading={isLoading} />
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
