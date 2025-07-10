"use client";

import { useState, useEffect } from "react";
import { Database, Lightbulb, Table, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TableInfo {
  schema: string;
  name: string;
  type: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
    position: number;
    isPrimaryKey: boolean;
  }>;
  foreignKeys: Array<{
    column: string;
    referencedSchema: string;
    referencedTable: string;
    referencedColumn: string;
  }>;
}

interface SchemaResponse {
  tables: TableInfo[];
  totalTables: number;
}

export default function WelcomeScreen({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) {
  const [schemaInfo, setSchemaInfo] = useState<string>("");
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string>("");

  const exampleQueries = [
    "Show me all customers",
    "Find customers with orders over $100",
    "List the top 5 products by sales",
    "Show monthly sales totals",
    "Find customers who haven't placed orders recently",
  ];

  // Fetch database schema on component mount
  useEffect(() => {
    const fetchDatabaseSchema = async () => {
      try {
        setIsLoadingSchema(true);
        const response = await fetch("/api/schema");

        if (!response.ok) {
          throw new Error(`Failed to fetch schema: ${response.status}`);
        }

        const data: SchemaResponse = await response.json();
        const naturalLanguageSchema = convertSchemaToNaturalLanguage(data);
        setSchemaInfo(naturalLanguageSchema);
      } catch (error) {
        console.error("Error fetching schema:", error);
        setSchemaError(
          error instanceof Error
            ? error.message
            : "Failed to load database schema"
        );
      } finally {
        setIsLoadingSchema(false);
      }
    };

    fetchDatabaseSchema();
  }, []);

  // Convert schema data to natural language description
  const convertSchemaToNaturalLanguage = (data: SchemaResponse): string => {
    if (!data.tables || data.tables.length === 0) {
      return "No database tables found.";
    }

    let description = `Your database contains ${data.totalTables} table${
      data.totalTables !== 1 ? "s" : ""
    }:\n\n`;

    data.tables.forEach((table, index) => {
      const tableName = table.name;
      const columnCount = table.columns.length;
      const primaryKeys = table.columns
        .filter((col) => col.isPrimaryKey)
        .map((col) => col.name);
      const foreignKeys = table.foreignKeys;

      description += `${
        index + 1
      }. **${tableName}** - Contains ${columnCount} column${
        columnCount !== 1 ? "s" : ""
      }`;

      if (primaryKeys.length > 0) {
        description += ` with primary key: ${primaryKeys.join(", ")}`;
      }

      // Add column details
      const keyColumns = table.columns.filter(
        (col) =>
          col.name.toLowerCase().includes("name") ||
          col.name.toLowerCase().includes("title") ||
          col.name.toLowerCase().includes("email") ||
          col.name.toLowerCase().includes("amount") ||
          col.name.toLowerCase().includes("price") ||
          col.name.toLowerCase().includes("total")
      );

      if (keyColumns.length > 0) {
        description += `. Key fields: ${keyColumns
          .map((col) => col.name)
          .join(", ")}`;
      }

      // Add foreign key relationships
      if (foreignKeys.length > 0) {
        description += `. Related to: ${foreignKeys
          .map((fk) => `${fk.referencedTable} (via ${fk.column})`)
          .join(", ")}`;
      }

      description += ".\n";
    });

    description +=
      "\nYou can ask questions about this data using natural language, and I'll convert them to SQL queries for you!";

    return description;
  };

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

      {/* Database Schema Information */}
      <div className="w-full max-w-4xl mb-8">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Your Database Overview
            </h3>
          </div>

          {isLoadingSchema ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading database schema...</span>
            </div>
          ) : schemaError ? (
            <div className="text-red-600 py-4">
              <p>⚠️ {schemaError}</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure your database API is running at http://localhost:8080/
              </p>
            </div>
          ) : (
            <div className="text-left">
              <div className="prose prose-sm max-w-none text-gray-700">
                {schemaInfo.split("\n").map((line, index) => {
                  if (line.trim() === "") return <br key={index} />;

                  // Handle bold text (markdown-style)
                  if (line.includes("**")) {
                    const parts = line.split("**");
                    return (
                      <p key={index} className="mb-2">
                        {parts.map((part, partIndex) =>
                          partIndex % 2 === 1 ? (
                            <strong
                              key={partIndex}
                              className="font-semibold text-gray-900"
                            >
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  }

                  return (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="w-full max-w-4xl">
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
