"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Send,
  User,
  Bot,
  Database,
  Menu,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Modern Message Bubble Component
function MessageBubble({ message, index }: { message: any; index: number }) {
  const isUser = message.role === "user";

  // Parse tool results
  const toolResults =
    (message.toolInvocations || [])
      ?.map((invocation: any) => {
        if (
          invocation.toolName === "executeQuery" &&
          "result" in invocation &&
          invocation.result
        ) {
          return invocation.result;
        }
        return null;
      })
      .filter(Boolean) || [];

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`${isUser ? "max-w-[85%] order-first" : "w-full"}`}>
        <Card
          className={`p-4 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {isUser ? (
                <User className="w-3 h-3" />
              ) : (
                <Bot className="w-3 h-3" />
              )}
              <span className="text-xs font-medium opacity-70">
                {isUser ? "You" : "SQL Assistant"}
              </span>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Render Query Results */}
            {toolResults.map((result: any, idx: number) => (
              <QueryResultCard key={idx} result={result} />
            ))}
          </div>
        </Card>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// Modern Query Result Component
function QueryResultCard({ result }: { result: any }) {
  return (
    <Card className="mt-3 bg-background border w-full">
      <div className="p-6">
        {/* Status Header */}
        <div className="flex items-center gap-2 mb-3">
          {result.success ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="font-medium text-sm">
            {result.success ? "Query Executed Successfully" : "Query Failed"}
          </span>
          {result.success && result.rowCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {result.rowCount} row{result.rowCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground mb-3 italic">
          {result.explanation}
        </p>

        {/* SQL Query Accordion */}
        <Accordion type="single" collapsible className="mb-3">
          <AccordionItem value="sql-query">
            <AccordionTrigger className="text-sm font-medium">
              SQL Query
            </AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                {result.sql}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Error Display */}
        {!result.success && result.error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {result.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Table */}
        {result.success && result.data && result.data.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(result.data[0]).map((column: string) => (
                      <TableHead key={column} className="text-xs">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((row: any, index: number) => (
                    <TableRow key={index}>
                      {Object.values(row).map(
                        (value: any, cellIndex: number) => (
                          <TableCell key={cellIndex} className="text-xs">
                            {value === null ? (
                              <span className="text-muted-foreground italic">
                                NULL
                              </span>
                            ) : (
                              String(value)
                            )}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* No Results */}
        {result.success && result.data && result.data.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Query executed successfully but returned no results.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}

// Loading Message Component
function LoadingMessage() {
  return (
    <div className="flex gap-3 justify-start mb-6">
      <Avatar className="w-8 h-8 border">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      <Card className="p-4 bg-muted max-w-[80%]">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-sm text-muted-foreground">
            Generating SQL query...
          </span>
        </div>
      </Card>
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) {
  const examples = [
    "Find all customers who have total amount more than 50",
    "Show top 10 selling products",
    "List orders from last month",
    "Get customer details with their order count",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Database className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          SQL Assistant
        </h1>
        <p className="text-muted-foreground max-w-lg text-lg">
          Transform natural language into powerful SQL queries with AI
          assistance. Just describe what you need and I'll handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl w-full">
        {examples.map((example, index) => (
          <Card
            key={index}
            className="p-4 hover:bg-muted/50 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] border-dashed"
            onClick={() => onExampleClick(example)}
          >
            <p className="text-sm text-muted-foreground font-medium">
              {example}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        💡 Tip: Click on any example above to get started, or type your own
        query below
      </div>
    </div>
  );
}

export default function ModernChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/chat",
  });

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-80 border-r bg-muted/30">
        <ConversationSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <ConversationSidebar />
        </SheetContent>
      </Sheet>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-semibold">Text to SQL Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Convert natural language to SQL queries
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <WelcomeScreen onExampleClick={handleExampleClick} />
          ) : (
            <div className="max-w-6xl mx-auto">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}
              {isLoading && <LoadingMessage />}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Describe the SQL query you need... (e.g., 'Show all customers with orders over $100')"
                  className="min-h-[60px] resize-none border-2 focus:border-primary/50 transition-colors"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{input.length}/500</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Conversation Sidebar Component
function ConversationSidebar() {
  const conversations = [
    {
      id: "1",
      title: "Customer Analytics",
      lastMessage: "Show customers with orders > $100",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      title: "Product Queries",
      lastMessage: "Top selling products by category",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      title: "Order Management",
      lastMessage: "Recent orders with customer details",
      timestamp: "2 days ago",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{conversation.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conversation.lastMessage}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {conversation.timestamp}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
