"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

// Classic Loading Message Component
export default function LoadingMessage() {
  return (
    <div className="flex gap-4 justify-start mb-4">
      <Avatar className="w-10 h-10 border border-gray-200 shadow-sm flex-shrink-0">
        <AvatarFallback className="bg-blue-600 text-white">
          <Bot className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
      <Card className="bg-white shadow-md border border-gray-200 max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-gray-900 font-medium">
              Generating SQL query...
            </span>
          </div>
          <div className="mt-3 flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
