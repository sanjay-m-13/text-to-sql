"use client";

import { Message } from "ai";
import { useRef, useEffect, useCallback } from "react";
import WelcomeScreen from "./WelcomeScreen";
import MessageBubble from "./MessageBubble";
import LoadingMessage from "./LoadingMessage";

interface ConversationAreaProps {
  messages: Message[];
  isLoading: boolean;
  onExampleClick: (example: string) => void;
}

export default function ConversationArea({
  messages,
  isLoading,
  onExampleClick,
}: ConversationAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    // Only scroll if messages length has actually changed
    if (messages.length !== prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;

      // Use a small delay to ensure DOM is updated and prevent infinite loops
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]);

  // Also scroll when loading state changes (when a response starts/ends)
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, scrollToBottom, messages.length]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        {messages.length === 0 ? (
          <WelcomeScreen onExampleClick={onExampleClick} />
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <LoadingMessage />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
