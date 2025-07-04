"use client";

import { FormEvent } from "react";

// Simple Send Icon component to replace MUI icon
const SendIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <div
      className="p-6 m-6 rounded-3xl shadow-lg"
      style={{
        backgroundColor: "var(--background-paper)",
        boxShadow: "0 10px 25px rgb(0 0 0 / 0.1)",
      }}
    >
      <form onSubmit={onSubmit}>
        <div className="flex gap-4 items-end">
          <textarea
            className="flex-1 p-3 rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
            style={{
              backgroundColor: isLoading ? "var(--grey-100)" : "var(--grey-50)",
              maxHeight: "120px",
              minHeight: "48px",
            }}
            placeholder="Describe the SQL query you need..."
            value={input}
            onChange={onInputChange}
            disabled={isLoading}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-lg text-white transition-all duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
            style={{
              backgroundColor:
                isLoading || !input.trim()
                  ? "var(--grey-300)"
                  : "var(--primary-main)",
              color: isLoading || !input.trim() ? "var(--grey-500)" : "white",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.backgroundColor = "var(--primary-dark)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.backgroundColor = "var(--primary-main)";
              }
            }}
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
