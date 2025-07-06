"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Message } from "ai";
import QueryResult from "./QueryResult";

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

// Simple Person Icon component to replace MUI icon
const PersonIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

// Simple SmartToy Icon component to replace MUI icon
const SmartToyIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const containsSQL =
    message.content.includes("SELECT") ||
    message.content.includes("CREATE") ||
    message.content.includes("INSERT") ||
    message.content.includes("UPDATE") ||
    message.content.includes("DELETE");

  // Parse tool results from message
  const toolResults =
    (message.toolInvocations || (message as any).toolCalls)
      ?.map((invocation: any) => {
        if (
          invocation.toolName === "executeQuery" &&
          "result" in invocation &&
          invocation.result
        ) {
          return invocation.result as {
            success: boolean;
            sql: string;
            explanation: string;
            data?: Record<string, unknown>[];
            rowCount?: number;
            columns?: Array<{ name: string; dataType: number }>;
            error?: string;
          };
        }
        return null;
      })
      .filter(
        (result: QueryResultType | null): result is QueryResultType =>
          result !== null
      ) || [];

  // Debug logging - remove this after debugging
  console.log("Message:", message);
  console.log("Tool Invocations:", message.toolInvocations);
  console.log("Tool Calls:", (message as any).toolCalls);
  if (toolResults.length > 0) {
    console.log("Tool Results:", toolResults);
    console.log("First result data:", toolResults[0]?.data);
  }

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`p-6 rounded-2xl ${
          isUser ? "ml-12 border" : "mr-12 shadow-sm"
        }`}
        style={{
          backgroundColor: isUser
            ? "var(--primary-50)"
            : "var(--background-paper)",
          borderColor: isUser ? "var(--primary-200)" : "transparent",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{
              backgroundColor: isUser
                ? "var(--primary-main)"
                : "var(--secondary-main)",
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </div>
          <div className="flex-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{
                color: isUser ? "var(--primary-main)" : "var(--secondary-main)",
              }}
            >
              {isUser ? "You" : "Assistant"}
            </span>
            <div
              className={`whitespace-pre-wrap leading-relaxed ${
                containsSQL ? "p-4 rounded-lg text-sm font-mono" : ""
              }`}
              style={{
                fontFamily: containsSQL
                  ? 'Monaco, Menlo, "Ubuntu Mono", monospace'
                  : "inherit",
                backgroundColor: containsSQL
                  ? "var(--grey-100)"
                  : "transparent",
                fontSize: containsSQL ? "0.875rem" : "inherit",
              }}
            >
              {message.content}
            </div>

            {/* Render query results */}
            {toolResults.map((result: QueryResultType, resultIndex: number) => (
              <QueryResult key={resultIndex} result={result} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
