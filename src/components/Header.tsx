"use client";

import { Database } from "lucide-react";

// Classic Header Component
export default function Header() {
  return (
    <div className="relative flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                SQL Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Transform natural language into powerful SQL queries
              </p>
              <p className="text-xs text-gray-600 sm:hidden">
                AI-powered SQL queries
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-800">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
