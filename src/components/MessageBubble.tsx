"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
      } animate-in slide-in-from-bottom-2 duration-500 hover:scale-[1.02] transition-all`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/40 shadow-2xl flex-shrink-0 ring-2 ring-white/20 backdrop-blur-md animate-pulse hover:animate-spin transition-all duration-300">
          <AvatarFallback className="bg-gradient-to-br from-white/20 to-gray-300/30 text-white backdrop-blur-md">
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
              ? "bg-gradient-to-r from-white/25 via-gray-200/20 to-white/15 text-white shadow-2xl border border-white/30 backdrop-blur-md animate-pulse"
              : "bg-white/8 backdrop-blur-xl shadow-2xl border border-white/15 text-white hover:bg-white/12"
          } overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] hover:border-white/40`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              {isUser ? (
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white/90 animate-pulse" />
              ) : (
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white/90 animate-bounce" />
              )}
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  isUser ? "text-white/90" : "text-white/90"
                }`}
              >
                {isUser ? "You" : "SQL Assistant"}
              </span>

              {/* Timestamp */}
              <span
                className={`text-xs opacity-60 ml-auto ${
                  isUser ? "text-white/60" : "text-white/60"
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
                isUser ? "text-white" : "text-white/90"
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
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/40 shadow-2xl flex-shrink-0 ring-2 ring-white/20 backdrop-blur-md">
          <AvatarFallback className="bg-gradient-to-br from-white/25 via-gray-200/20 to-white/15 text-white backdrop-blur-md">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
