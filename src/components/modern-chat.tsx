"use client";

import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect } from "react";

// Import our new components
import LiquidGlassBackground from "./LiquidGlassBackground";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import LoadingMessage from "./LoadingMessage";
import WelcomeScreen from "./WelcomeScreen";
import InputArea from "./InputArea";

export default function ModernChat() {
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/chat",
    });

  const isGenerating = status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change or when generating
  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Monochrome Liquid Glass Background */}
      <LiquidGlassBackground />

      {/* Enhanced Fixed Header with Liquid Glass */}
      <Header />

      {/* Enhanced Scrollable Messages Area with Liquid Glass */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {messages.length === 0 ? (
              <WelcomeScreen onExampleClick={handleExampleClick} />
            ) : (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isGenerating && <LoadingMessage />}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Fixed Input Area with Liquid Glass */}
      <InputArea
        input={input}
        isGenerating={isGenerating}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />
    </div>
  );
}
