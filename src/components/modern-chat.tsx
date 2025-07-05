"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Send,
  User,
  Bot,
  Database,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Table as TableIcon,
  FileText,
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
      className={`flex gap-3 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      } animate-in slide-in-from-bottom-2 duration-300`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-lg flex-shrink-0 ring-2 ring-blue-100">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`${
          isUser ? "max-w-[90%] sm:max-w-[85%] order-first" : "w-full"
        }`}
      >
        <Card
          className={`${
            isUser
              ? "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-xl border-0"
              : "bg-white/90 backdrop-blur-md shadow-xl border border-white/20"
          } overflow-hidden transition-all duration-300 hover:shadow-2xl`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              {isUser ? (
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              )}
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  isUser ? "text-white/90" : "text-slate-700"
                }`}
              >
                {isUser ? "You" : "SQL Assistant"}
              </span>

              {/* Timestamp */}
              <span
                className={`text-xs opacity-60 ml-auto ${
                  isUser ? "text-white/60" : "text-slate-500"
                }`}
              >
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                isUser ? "text-white" : "text-slate-800"
              }`}
            >
              {message.content}
            </div>

            {/* Render Query Results */}
            {toolResults.map((result: any, idx: number) => (
              <div key={idx} className="mt-4">
                <QueryResultCard result={result} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-lg flex-shrink-0 ring-2 ring-green-100">
          <AvatarFallback className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// Enhanced Query Result Component with Dynamic Views
function QueryResultCard({ result }: { result: any }) {
  // Determine if query should show charts and summary based on content
  const shouldShowChartsAndSummary = (result: any) => {
    if (!result.success || !result.data || result.data.length === 0)
      return false;

    const query = result.sql?.toLowerCase() || "";
    const explanation = result.explanation?.toLowerCase() || "";

    console.log("🔍 Query Analysis:", { query, explanation }); // Debug log

    // Show charts/summary for analytical queries
    const analyticalKeywords = [
      "total_amount",
      "amount",
      "sum",
      "count",
      "avg",
      "average",
      "max",
      "min",
      "greater than",
      "less than",
      "more than",
      "higher than",
      "lower than",
      "top",
      "bottom",
      "most",
      "least",
      "analysis",
      "statistics",
      "where",
      "having",
      "group by",
      "order by",
      "limit",
      ">",
      "<",
      ">=",
      "<=",
      "=",
      "!=",
      "between",
    ];

    // Don't show charts for simple listing queries (exact matches for basic selects)
    const listingKeywords = [
      "select * from customers",
      "show all customers",
      "list all customers",
      "get all customers",
      "display all customers",
    ];

    // Check if it's a simple listing query (exact matches)
    const isListingQuery = listingKeywords.some(
      (keyword) => query.includes(keyword) || explanation.includes(keyword)
    );

    // Check if it's an analytical query
    const isAnalyticalQuery = analyticalKeywords.some(
      (keyword) => query.includes(keyword) || explanation.includes(keyword)
    );

    // Check if data has numerical fields suitable for charts
    const hasNumericalData = result.data.some((row: any) =>
      Object.keys(row).some(
        (key) =>
          (key.includes("amount") ||
            key.includes("total") ||
            key.includes("sum") ||
            key.includes("count") ||
            key.includes("price")) &&
          !isNaN(parseFloat(row[key]))
      )
    );

    // Additional check: if query has WHERE clause with conditions, it's likely analytical
    const hasWhereClause =
      query.includes("where") &&
      (query.includes(">") ||
        query.includes("<") ||
        query.includes("=") ||
        query.includes("between") ||
        query.includes("like"));

    console.log("📊 Analysis Results:", {
      isListingQuery,
      isAnalyticalQuery,
      hasNumericalData,
      hasWhereClause,
      shouldShow:
        (isAnalyticalQuery || hasWhereClause) &&
        hasNumericalData &&
        !isListingQuery,
    }); // Debug log

    // Show charts if it's analytical OR has WHERE conditions, has numerical data, but not if it's a simple listing
    return (
      (isAnalyticalQuery || hasWhereClause) &&
      hasNumericalData &&
      !isListingQuery
    );
  };

  const showCharts = shouldShowChartsAndSummary(result);

  // Generate chart data from the result
  const generateChartData = (data: any[]) => {
    if (!data || data.length === 0) return [];

    // Find the best numerical field for charting
    const firstRow = data[0];
    const numericalField = Object.keys(firstRow).find(
      (key) =>
        (key.includes("amount") ||
          key.includes("total") ||
          key.includes("sum") ||
          key.includes("count") ||
          key.includes("price")) &&
        !isNaN(parseFloat(firstRow[key]))
    );

    if (!numericalField) return [];

    return data.map((row, index) => ({
      name: row.name || row.customer_name || row.title || `Item ${index + 1}`,
      value: parseFloat(row[numericalField] || 0),
      [numericalField]: parseFloat(row[numericalField] || 0),
      id: row.id || index,
      ...row,
    }));
  };

  // Generate summary statistics and natural language description
  const generateSummary = (data: any[]) => {
    if (!data || data.length === 0) return null;

    // Find the numerical field to analyze
    const firstRow = data[0];
    const numericalField = Object.keys(firstRow).find(
      (key) =>
        (key.includes("amount") ||
          key.includes("total") ||
          key.includes("sum") ||
          key.includes("count") ||
          key.includes("price")) &&
        !isNaN(parseFloat(firstRow[key]))
    );

    if (!numericalField) {
      // If no numerical field, just provide basic summary
      return {
        totalRecords: data.length,
        naturalLanguage: `Found ${data.length} record${
          data.length !== 1 ? "s" : ""
        } matching your query.`,
        fieldName: null,
      };
    }

    const values = data
      .map((row) => parseFloat(row[numericalField] || 0))
      .filter((value) => !isNaN(value));

    if (values.length === 0) return null;

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Generate natural language summary
    const itemNames = data
      .map((row) => row.name || row.customer_name || row.title || "Item")
      .slice(0, 5);
    const remainingCount = Math.max(0, data.length - 5);

    // Determine the field type for better descriptions
    const fieldDisplayName = numericalField.replace(/_/g, " ").toLowerCase();
    const isAmount =
      numericalField.includes("amount") || numericalField.includes("price");
    const currency = isAmount ? "$" : "";

    let naturalLanguage = "";
    if (data.length === 1) {
      naturalLanguage = `${
        itemNames[0]
      } has a ${fieldDisplayName} of ${currency}${values[0].toFixed(2)}.`;
    } else if (data.length === 2) {
      naturalLanguage = `${itemNames[0]} and ${
        itemNames[1]
      } have ${fieldDisplayName}s of ${currency}${values[0].toFixed(
        2
      )} and ${currency}${values[1].toFixed(2)} respectively.`;
    } else if (data.length <= 5) {
      const lastItem = itemNames.pop();
      naturalLanguage = `${itemNames.join(
        ", "
      )} and ${lastItem} meet your criteria. The highest ${fieldDisplayName} is ${currency}${max.toFixed(
        2
      )} and the lowest is ${currency}${min.toFixed(2)}.`;
    } else {
      naturalLanguage = `${itemNames.slice(0, 3).join(", ")} and ${
        remainingCount + 2
      } other items meet your criteria. The ${fieldDisplayName} values range from ${currency}${min.toFixed(
        2
      )} to ${currency}${max.toFixed(
        2
      )}, with an average of ${currency}${average.toFixed(2)}.`;
    }

    return {
      totalRecords: data.length,
      totalValue: total,
      averageValue: average,
      maxValue: max,
      minValue: min,
      naturalLanguage,
      fieldName: numericalField,
      fieldDisplayName,
      isAmount,
    };
  };

  const chartData =
    result.success && result.data ? generateChartData(result.data) : [];
  const summary =
    result.success && result.data ? generateSummary(result.data) : null;

  // Colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <Card className="mt-3 bg-white/95 backdrop-blur-sm border border-slate-200/50 w-full shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-4 sm:p-6">
        {/* Enhanced Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            )}
            <span className="font-medium text-sm sm:text-base">
              {result.success ? "Query Executed Successfully" : "Query Failed"}
            </span>
          </div>

          {result.success && result.rowCount !== undefined && (
            <Badge variant="secondary" className="w-fit">
              {result.rowCount} row{result.rowCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Explanation */}
        <p className="text-muted-foreground mb-4 italic">
          {result.explanation}
        </p>

        {/* SQL Query Accordion */}
        <Accordion type="single" collapsible className="mb-4">
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
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {result.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results with Dynamic Tabs */}
        {result.success && result.data && result.data.length > 0 && (
          <Tabs defaultValue="table" className="w-full">
            <TabsList
              className={`grid w-full ${
                showCharts ? "grid-cols-3" : "grid-cols-1"
              } bg-slate-100/80 backdrop-blur-sm rounded-xl p-1`}
            >
              <TabsTrigger
                value="table"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                <TableIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Table</span>
                <span className="sm:hidden">📊</span>
              </TabsTrigger>
              {showCharts && (
                <>
                  <TabsTrigger
                    value="chart"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Chart</span>
                    <span className="sm:hidden">📈</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Summary</span>
                    <span className="sm:hidden">📋</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Enhanced Table View */}
            <TabsContent value="table" className="mt-4">
              <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <ScrollArea className="h-64 sm:h-80 lg:h-96">
                  <Table>
                    <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0">
                      <TableRow>
                        {Object.keys(result.data[0]).map((column: string) => (
                          <TableHead
                            key={column}
                            className="text-xs sm:text-sm font-semibold text-slate-700 px-2 sm:px-4 py-2 sm:py-3"
                          >
                            {column.replace(/_/g, " ").toUpperCase()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.map((row: any, index: number) => (
                        <TableRow
                          key={index}
                          className="hover:bg-blue-50/50 transition-colors duration-150 border-slate-100"
                        >
                          {Object.values(row).map(
                            (value: any, cellIndex: number) => (
                              <TableCell
                                key={cellIndex}
                                className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 text-slate-700"
                              >
                                {value === null ? (
                                  <span className="text-slate-400 italic text-xs">
                                    NULL
                                  </span>
                                ) : (
                                  <span className="break-words">
                                    {String(value)}
                                  </span>
                                )}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Table info footer */}
                <div className="px-3 sm:px-4 py-2 bg-slate-50/80 border-t border-slate-200/60 text-xs text-slate-500 flex justify-between items-center">
                  <span>
                    Showing {result.data.length} record
                    {result.data.length !== 1 ? "s" : ""}
                  </span>
                  <span className="hidden sm:inline">
                    Scroll horizontally to see more columns
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Chart View - Only show if charts are enabled */}
            {showCharts && (
              <TabsContent value="chart" className="mt-4">
                <div className="space-y-6">
                  {/* Bar Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      {summary?.fieldDisplayName
                        ? `${
                            summary.fieldDisplayName.charAt(0).toUpperCase() +
                            summary.fieldDisplayName.slice(1)
                          } Analysis`
                        : "Data Analysis"}
                    </h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={10}
                          />
                          <YAxis fontSize={10} />
                          <Tooltip
                            formatter={(value: any) => [
                              `${summary?.isAmount ? "$" : ""}${value}`,
                              summary?.fieldDisplayName || "Value",
                            ]}
                            labelFormatter={(label) => `Item: ${label}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill="#8884d8"
                            name={summary?.fieldDisplayName || "Value"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  {chartData.length <= 10 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Distribution</h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) =>
                                `${name}: ${
                                  summary?.isAmount ? "$" : ""
                                }${value}`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((_entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [
                                `${summary?.isAmount ? "$" : ""}${value}`,
                                summary?.fieldDisplayName || "Value",
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Summary View - Only show if charts are enabled */}
            {showCharts && (
              <TabsContent value="summary" className="mt-4">
                {summary && (
                  <div className="space-y-6">
                    {/* Natural Language Summary */}
                    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Summary
                          </h3>
                          <p className="text-blue-800 leading-relaxed">
                            {summary.naturalLanguage}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Statistics Grid - Only show if we have numerical data */}
                    {summary.fieldName && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {summary.totalRecords}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Records
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {summary.isAmount ? "$" : ""}
                                {summary.totalValue?.toLocaleString("en-US", {
                                  minimumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                  maximumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total {summary.fieldDisplayName}
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Database className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {summary.isAmount ? "$" : ""}
                                {summary.averageValue?.toLocaleString("en-US", {
                                  minimumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                  maximumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Average {summary.fieldDisplayName}
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-orange-600">
                                {summary.isAmount ? "$" : ""}
                                {summary.maxValue?.toLocaleString("en-US", {
                                  minimumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                  maximumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Highest {summary.fieldDisplayName}
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-orange-600" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {summary.isAmount ? "$" : ""}
                                {summary.minValue?.toLocaleString("en-US", {
                                  minimumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                  maximumFractionDigits: summary.isAmount
                                    ? 2
                                    : 0,
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Lowest {summary.fieldDisplayName}
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-purple-600" />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-indigo-600">
                                {summary.isAmount ? "$" : ""}
                                {summary.totalValue && summary.totalRecords
                                  ? (
                                      summary.totalValue / summary.totalRecords
                                    ).toLocaleString("en-US", {
                                      minimumFractionDigits: summary.isAmount
                                        ? 2
                                        : 0,
                                      maximumFractionDigits: summary.isAmount
                                        ? 2
                                        : 0,
                                    })
                                  : "0"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {summary.fieldDisplayName} per Record
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Bot className="w-5 h-5 text-indigo-600" />
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
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
    <div className="flex gap-4 justify-start">
      <Avatar className="w-10 h-10 border-2 border-white shadow-lg flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <Bot className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-slate-700 font-medium">
              Generating SQL query...
            </span>
          </div>
          <div className="mt-3 flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
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
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    "Find all customers who have total amount more than 50",
    "Show top 10 selling products",
    "List orders from last month",
    "Get customer details with their order count",
  ];

  // Fetch database schema information
  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/schema");
        if (!response.ok) {
          throw new Error("Failed to fetch database schema");
        }
        const data = await response.json();

        // Transform the schema data into natural language format
        const transformedInfo = transformSchemaToNaturalLanguage(data);
        setDatabaseInfo(transformedInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to default info if API fails
        setDatabaseInfo({
          description:
            "Your database contains various tables with business data.",
          tables: [],
          summary: "Database schema information is currently unavailable.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseInfo();
  }, []);

  // Transform schema data to natural language
  const transformSchemaToNaturalLanguage = (schemaData: any) => {
    const { tables, totalTables } = schemaData;

    // Generate overall description
    const tableNames = tables.map((t: any) => t.name).join(", ");
    const description = `Your database contains ${totalTables} table${
      totalTables !== 1 ? "s" : ""
    }: ${tableNames}. This appears to be a ${inferDatabaseType(
      tables
    )} system.`;

    // Transform each table
    const transformedTables = tables.map((table: any) => {
      const columnCount = table.columns.length;
      const primaryKeys = table.columns
        .filter((c: any) => c.isPrimaryKey)
        .map((c: any) => c.name);
      const foreignKeys = table.foreignKeys || [];

      // Generate natural description
      let tableDescription = `The ${
        table.name
      } table contains ${columnCount} field${columnCount !== 1 ? "s" : ""}`;

      if (primaryKeys.length > 0) {
        tableDescription += ` with ${primaryKeys.join(
          ", "
        )} as the primary key${primaryKeys.length > 1 ? "s" : ""}`;
      }

      if (foreignKeys.length > 0) {
        const relationships = foreignKeys
          .map(
            (fk: any) =>
              `${fk.column} links to ${fk.referencedTable}.${fk.referencedColumn}`
          )
          .join(", ");
        tableDescription += `. It has relationships: ${relationships}`;
      }

      return {
        name: table.name,
        description: tableDescription,
        columns: table.columns.map((col: any) => ({
          name: col.name,
          type: col.type,
          description: generateColumnDescription(col, table.name),
          isPrimaryKey: col.isPrimaryKey,
          nullable: col.nullable,
        })),
        foreignKeys: foreignKeys,
        recordCount: `Contains business data records`, // We could fetch actual counts if needed
      };
    });

    return {
      description,
      tables: transformedTables,
      summary: generateDatabaseSummary(tables),
    };
  };

  // Infer database type from table names
  const inferDatabaseType = (tables: any[]) => {
    const tableNames = tables.map((t: any) => t.name.toLowerCase());

    if (
      tableNames.some((name) =>
        ["customer", "order", "product", "payment"].some((keyword) =>
          name.includes(keyword)
        )
      )
    ) {
      return "e-commerce";
    } else if (
      tableNames.some((name) =>
        ["user", "post", "comment", "like"].some((keyword) =>
          name.includes(keyword)
        )
      )
    ) {
      return "social media";
    } else if (
      tableNames.some((name) =>
        ["employee", "department", "salary", "project"].some((keyword) =>
          name.includes(keyword)
        )
      )
    ) {
      return "HR/business management";
    } else if (
      tableNames.some((name) =>
        ["student", "course", "grade", "enrollment"].some((keyword) =>
          name.includes(keyword)
        )
      )
    ) {
      return "educational";
    }
    return "business";
  };

  // Generate column description based on name and type
  const generateColumnDescription = (column: any, tableName: string) => {
    const { name, type, isPrimaryKey, nullable } = column;

    let description = "";

    if (isPrimaryKey) {
      description = `Unique identifier for ${tableName}`;
    } else if (name.toLowerCase().includes("id") && name !== "id") {
      description = `Reference to ${name.replace(/_id$|Id$/, "")} record`;
    } else if (name.toLowerCase().includes("name")) {
      description = `Name or title field`;
    } else if (name.toLowerCase().includes("email")) {
      description = `Email address`;
    } else if (name.toLowerCase().includes("phone")) {
      description = `Phone number`;
    } else if (
      name.toLowerCase().includes("date") ||
      name.toLowerCase().includes("time")
    ) {
      description = `Date/time information`;
    } else if (
      name.toLowerCase().includes("amount") ||
      name.toLowerCase().includes("price") ||
      name.toLowerCase().includes("cost")
    ) {
      description = `Monetary value`;
    } else if (
      name.toLowerCase().includes("count") ||
      name.toLowerCase().includes("quantity")
    ) {
      description = `Numeric count or quantity`;
    } else if (
      type.includes("text") ||
      type.includes("varchar") ||
      type.includes("char")
    ) {
      description = `Text information`;
    } else if (
      type.includes("int") ||
      type.includes("numeric") ||
      type.includes("decimal")
    ) {
      description = `Numeric value`;
    } else if (type.includes("bool")) {
      description = `True/false flag`;
    } else {
      description = `${type} data field`;
    }

    if (!nullable && !isPrimaryKey) {
      description += " (required)";
    }

    return description;
  };

  // Generate overall database summary
  const generateDatabaseSummary = (tables: any[]) => {
    const totalTables = tables.length;
    const totalColumns = tables.reduce(
      (sum, table) => sum + table.columns.length,
      0
    );
    const tablesWithRelationships = tables.filter(
      (table) => (table.foreignKeys || []).length > 0
    ).length;

    return `This database has ${totalTables} tables with a total of ${totalColumns} fields. ${tablesWithRelationships} table${
      tablesWithRelationships !== 1 ? "s have" : " has"
    } relationships with other tables, indicating a well-structured relational database design.`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto">
          <Database className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to SQL Assistant
        </h1>
        <p className="text-slate-600 max-w-2xl text-xl leading-relaxed">
          Transform natural language into powerful SQL queries with AI
          assistance. Just describe what you need and I'll handle the rest.
        </p>
      </div>

      {/* Database Information Section */}
      <div className="mb-8 max-w-5xl w-full">
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Your Database Overview
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  <span className="text-slate-600">
                    Loading database information...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">
                  Failed to load database information
                </p>
                <p className="text-slate-500 text-sm">{error}</p>
              </div>
            ) : databaseInfo ? (
              <>
                <p className="text-slate-700 mb-4 text-lg leading-relaxed">
                  {databaseInfo.description}
                </p>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm leading-relaxed">
                    💡 {databaseInfo.summary}
                  </p>
                </div>

                {databaseInfo.tables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {databaseInfo.tables.map((table: any, index: number) => (
                      <Card
                        key={index}
                        className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <TableIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 capitalize">
                              {table.name}
                            </h3>
                          </div>

                          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                            {table.description}
                          </p>

                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              Available Fields:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {table.columns.map(
                                (column: any, colIndex: number) => (
                                  <span
                                    key={colIndex}
                                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      column.isPrimaryKey
                                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                    title={column.description}
                                  >
                                    {column.name}
                                    {column.isPrimaryKey && " 🔑"}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          {table.foreignKeys &&
                            table.foreignKeys.length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                <h5 className="text-xs font-semibold text-purple-700 mb-1">
                                  Relationships:
                                </h5>
                                {table.foreignKeys.map(
                                  (fk: any, fkIndex: number) => (
                                    <p
                                      key={fkIndex}
                                      className="text-xs text-purple-600"
                                    >
                                      🔗 {fk.column} → {fk.referencedTable}.
                                      {fk.referencedColumn}
                                    </p>
                                  )
                                )}
                              </div>
                            )}

                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-600 italic">
                              📊 {table.recordCount}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">
                      No tables found in the database.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Example Queries Section */}
      <div className="mb-8 max-w-4xl w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Try These Example Queries
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <Card
              key={index}
              className="p-6 hover:bg-white hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 border-dashed border-slate-200 hover:border-blue-300 bg-white/50 backdrop-blur-sm"
              onClick={() => onExampleClick(example)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-slate-700 font-medium text-left leading-relaxed">
                  {example}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
        <span className="text-lg">💡</span>
        <span>
          Click on any example above to get started, or type your own query
          below
        </span>
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
    isLoading: isGenerating,
    setInput,
  } = useChat({
    api: "/api/chat",
  });

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Fixed Header */}
      <div className="flex-shrink-0 border-b border-white/20 bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SQL Assistant
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                  Transform natural language into powerful SQL queries
                </p>
                <p className="text-xs text-slate-600 sm:hidden">
                  AI-powered SQL queries
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scrollable Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {messages.length === 0 ? (
              <WelcomeScreen onExampleClick={handleExampleClick} />
            ) : (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))}
                {isGenerating && <LoadingMessage />}
              </div>
            )}
          </div>

          {/* Scroll to bottom indicator */}
          {messages.length > 3 && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full w-10 h-10 p-0 bg-white/90 backdrop-blur-sm shadow-lg border-white/20 hover:bg-white/95 transition-all duration-200"
                onClick={() => {
                  const scrollArea = document.querySelector(
                    "[data-radix-scroll-area-viewport]"
                  );
                  if (scrollArea) {
                    scrollArea.scrollTop = scrollArea.scrollHeight;
                  }
                }}
              >
                <Send className="w-4 h-4 rotate-90" />
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Enhanced Fixed Input Area */}
      <div className="flex-shrink-0 border-t border-white/20 bg-white/90 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <form onSubmit={handleSubmit} className="w-full">
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center">
              <div className="flex-1 max-w-4xl">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Describe the SQL query you need... (e.g., 'Show customers with orders over $100')"
                    className="w-full min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none border-2 border-slate-200/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !isGenerating) {
                          handleSubmit(e as any);
                        }
                      }
                    }}
                  />
                  {/* Character counter inside textarea */}
                  <div className="absolute bottom-2 right-2 sm:bottom-2 sm:right-3 text-xs text-slate-400 bg-white/80 rounded px-1">
                    {input.length}/500
                  </div>
                </div>

                {/* Help text - responsive */}
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-slate-500 hidden sm:block">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <span className="text-xs text-slate-500 sm:hidden">
                    Tap Send or press Enter
                  </span>

                  {/* Quick actions on mobile */}
                  <div className="flex gap-2 sm:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setInput("")}
                      disabled={!input.trim()}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Send Button - Responsive */}
              <div className="flex items-center justify-center sm:items-start sm:pt-0">
                <Button
                  type="submit"
                  disabled={isGenerating || !input.trim()}
                  className="w-full sm:w-auto h-[50px] sm:h-[60px] px-6 sm:px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-sm font-medium"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span className="text-sm sm:text-base">Thinking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">
                        Send Query
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile keyboard spacer */}
            <div className="h-safe-area-inset-bottom sm:hidden"></div>
          </form>
        </div>
      </div>
    </div>
  );
}
