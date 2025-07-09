"use client";

import { Database, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

// Classic Header Component
export default function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="relative flex-shrink-0 border-b border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                SQL Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block dark:text-gray-300">
                Transform natural language into powerful SQL queries
              </p>
              <p className="text-xs text-gray-600 sm:hidden dark:text-gray-300">
                AI-powered SQL queries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-200 dark:bg-green-900 dark:border-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-800 dark:text-green-200">Online</span>
            </div>
            {/* Theme toggle button */}
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
