"use client";

import { Database } from "lucide-react";

// Enhanced Header Component with Monochrome Liquid Glass
export default function Header() {
  return (
    <div className="relative flex-shrink-0 border-b border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/20 to-gray-300/30 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 animate-pulse">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent animate-pulse">
                SQL Assistant
              </h1>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">
                Transform natural language into powerful SQL queries
              </p>
              <p className="text-xs text-white/80 sm:hidden">
                AI-powered SQL queries
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-xs font-medium text-white/90">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
