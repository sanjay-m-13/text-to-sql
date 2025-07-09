"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";

interface InputAreaProps {
  input: string;
  isGenerating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

// Enhanced Input Area Component with Monochrome Liquid Glass
export default function InputArea({
  input,
  isGenerating,
  onInputChange,
  onSubmit,
  onClear,
}: InputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSubmit(e as React.FormEvent<HTMLTextAreaElement>);
      }
    }
  };

  return (
    <div className="relative flex-shrink-0 border-t border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <form onSubmit={onSubmit} className="w-full">
          {/* Mobile-first responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center">
            <div className="flex-1 max-w-4xl">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={onInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the SQL query you need... (e.g., 'Show customers with orders over $100')"
                  className="w-full min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none border-2 border-white/25 focus:border-white/60 focus:ring-2 focus:ring-white/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 transition-all duration-500 bg-white/10 backdrop-blur-md shadow-2xl text-white placeholder:text-white/60 text-sm sm:text-base hover:bg-white/15 hover:border-white/40 hover:shadow-white/10 focus:scale-[1.02]"
                  disabled={isGenerating}
                />

                {/* Clear button for mobile */}
                {input && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="absolute right-2 sm:right-3 top-2 sm:top-3 p-1.5 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200 sm:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-white/60 hidden sm:block">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <span className="text-xs text-white/60 sm:hidden">
                    Tap Send or press Enter
                  </span>

                  {/* Character count for longer inputs */}
                  {input.length > 100 && (
                    <span className="text-xs text-white/50">
                      {input.length}/500
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              {/* Clear button for desktop */}
              {input && (
                <Button
                  type="button"
                  onClick={onClear}
                  variant="outline"
                  className="hidden sm:flex h-[60px] px-4 bg-white/5 border-white/20 text-white/70 hover:bg-white/15 hover:border-white/40 hover:text-white/90 rounded-xl backdrop-blur-md transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <Button
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="w-full sm:w-auto h-[50px] sm:h-[60px] px-6 sm:px-8 bg-gradient-to-r from-white/25 via-gray-200/20 to-white/15 hover:from-white/35 hover:via-gray-100/30 hover:to-white/25 disabled:from-white/10 disabled:to-white/5 text-white border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-white/25 backdrop-blur-md transition-all duration-500 transform hover:scale-110 hover:rotate-1 disabled:transform-none disabled:shadow-sm font-medium animate-pulse hover:animate-none"
                size="lg"
              >
                {isGenerating ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {isGenerating ? "Generating..." : "Send"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
