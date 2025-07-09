"use client";

import { Message } from "ai";
import QueryResultCard from "./QueryResultCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";

// Define types for tool invocations
interface ToolInvocation {
  toolName: string;
  result?: QueryResultType;
}

interface QueryResultType {
  success: boolean;
  sql: string;
  explanation: string;
  data?: Record<string, unknown>[];
  rowCount?: number;
  columns?: Array<{ name: string; dataType: number }>;
  error?: string;
}

// Enhanced Message Bubble Component with Monochrome Liquid Glass
export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // Parse tool results from message
  const toolResults: QueryResultType[] =
    (
      message.toolInvocations ||
      (message as { toolCalls?: ToolInvocation[] }).toolCalls
    )
      ?.map((invocation: ToolInvocation) => {
        if (
          invocation.toolName === "executeQuery" &&
          "result" in invocation &&
          invocation.result
        ) {
          return invocation.result;
        }
        return null;
      })
      .filter(
        (result: QueryResultType | null): result is QueryResultType =>
          result !== null
      ) || [];

  return (
    <div
      className={`flex gap-3 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-200 shadow-sm flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`${
          isUser ? "max-w-[90%] sm:max-w-[85%] order-first" : "w-full"
        }`}
      >
        <Card
          className={`${
            isUser
              ? "bg-blue-600 text-white shadow-md border border-blue-700"
              : "bg-white shadow-md border border-gray-200 hover:shadow-lg"
          } overflow-hidden transition-shadow duration-200`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              {isUser ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-blue-600" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isUser ? "text-white" : "text-gray-900"
                }`}
              >
                {isUser ? "You" : "SQL Assistant"}
              </span>

              {/* Timestamp */}
              <span
                className={`text-xs ml-auto ${
                  isUser ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                isUser ? "text-white" : "text-gray-800"
              }`}
            >
              {message.content}
            </div>

            {/* Render query results */}
            {toolResults.map((result: QueryResultType, resultIndex: number) => (
              <QueryResultCard key={resultIndex} result={result} />
            ))}
          </div>
        </Card>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-200 shadow-sm flex-shrink-0">
          <AvatarFallback className="bg-gray-600 text-white">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
