"use client";

import { Database, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomeScreen({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) {
  const exampleQueries = [
    "Show me all customers",
    "Find customers with orders over $100",
    "List the top 5 products by sales",
    "Show monthly sales totals",
    "Find customers who haven't placed orders recently",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg mx-auto">
          <Database className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Welcome to SQL Assistant
        </h1>
        <p className="text-gray-600 max-w-2xl text-xl leading-relaxed">
          Transform natural language into powerful SQL queries with AI
          assistance. Just describe what you need and I&apos;ll handle the rest.
        </p>
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Try these example queries:
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleQueries.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onExampleClick(query)}
              className="text-left justify-start h-auto p-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            >
              <span className="text-sm leading-relaxed">{query}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
