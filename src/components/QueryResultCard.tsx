"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertCircle,
  TableIcon,
  BarChart3,
  FileText,
} from "lucide-react";
import { DynamicChart } from "./DynamicChart";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface QueryResult {
  success: boolean;
  sql?: string;
  explanation?: string;
  data?: Record<string, unknown>[];
  rowCount?: number;
  error?: string;
}

// Enhanced Query Result Component with Classic UI and DynamicChart
export default function QueryResultCard({ result }: { result: QueryResult }) {
  // Transform data for DynamicChart component
  const transformDataForChart = (data: Record<string, unknown>[]) => {
    if (!data || data.length === 0) return { chartData: [], chartConfig: null };

    // Find the best numerical field for charting
    const firstRow = data[0];
    const numericalField = Object.keys(firstRow).find(
      (key) =>
        (key.includes("amount") ||
          key.includes("total") ||
          key.includes("sum") ||
          key.includes("count") ||
          key.includes("price")) &&
        !isNaN(parseFloat(String(firstRow[key])))
    );

    if (!numericalField) return { chartData: [], chartConfig: null };

    const nameField =
      Object.keys(firstRow).find(
        (key) =>
          key.includes("name") ||
          key.includes("customer") ||
          key.includes("title")
      ) || Object.keys(firstRow)[0];

    const chartData = data.map((row) => ({
      [nameField]: String(row[nameField] || "Unknown"),
      [numericalField]: parseFloat(String(row[numericalField] || 0)),
    }));

    const chartConfig = {
      type: "bar" as const,
      title: `${numericalField.replace(/_/g, " ").toUpperCase()} Analysis`,
      description: `Analysis of ${numericalField} by ${nameField}`,
      takeaway: `This chart shows the distribution of ${numericalField} across different ${nameField} values.`,
      xKey: nameField,
      yKeys: [numericalField],
      legend: false,
    };

    return { chartData, chartConfig };
  };

  // Determine if query should show charts and summary based on content
  const shouldShowChartsAndSummary = (result: QueryResult) => {
    if (!result.success || !result.data || result.data.length === 0) {
      return false;
    }

    // Don&apos;t show charts for simple listing queries (exact matches for basic selects)
    const simpleListingPatterns = [
      /^SELECT \* FROM \w+;?$/i,
      /^SELECT .+ FROM \w+ LIMIT \d+;?$/i,
      /^SELECT .+ FROM \w+ ORDER BY .+ LIMIT \d+;?$/i,
    ];

    const sql = result.sql || "";
    const isSimpleListing = simpleListingPatterns.some((pattern) =>
      pattern.test(sql.trim())
    );

    if (isSimpleListing) {
      return false;
    }

    // Check if data has numerical fields suitable for charts
    const hasNumericalData =
      result.data?.some((row: Record<string, unknown>) =>
        Object.keys(row).some(
          (key) =>
            (key.includes("amount") ||
              key.includes("total") ||
              key.includes("sum") ||
              key.includes("count") ||
              key.includes("price")) &&
            !isNaN(parseFloat(String(row[key])))
        )
      ) || false;

    // Check if query involves aggregation, grouping, or analytical functions
    const hasAnalyticalKeywords =
      /\b(GROUP BY|HAVING|COUNT|SUM|AVG|MAX|MIN|DISTINCT)\b/i.test(sql);

    return hasNumericalData && hasAnalyticalKeywords;
  };

  const showCharts = shouldShowChartsAndSummary(result);

  const chartTypes = [
    { type: "bar", label: "Bar" },
    { type: "line", label: "Line" },
    { type: "area", label: "Area" },
    { type: "pie", label: "Pie" },
  ];
  const [selectedChartType, setSelectedChartType] = useState<string>("bar");

  // Get data for DynamicChart component
  const { chartData: dynamicChartData, chartConfig } =
    showCharts && result.data
      ? transformDataForChart(result.data)
      : { chartData: [], chartConfig: null };

  // If chartConfig exists, override type with selectedChartType
  const chartConfigWithType = chartConfig
    ? { ...chartConfig, type: selectedChartType as any }
    : null;

  // Generate summary statistics and natural language description
  const generateSummary = (data: Record<string, unknown>[]) => {
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
        !isNaN(parseFloat(String(firstRow[key])))
    );

    if (!numericalField) return null;

    const values = data
      .map((row) => parseFloat(String(row[numericalField] || 0)))
      .filter((value) => !isNaN(value));

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Generate natural language summary
    const itemNames = data
      .map((row) =>
        String(row.name || row.customer_name || row.title || "Item")
      )
      .slice(0, 5);
    const remainingCount = Math.max(0, data.length - 5);

    const fieldDisplayName = numericalField
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const isAmount =
      numericalField.includes("amount") || numericalField.includes("price");

    let summary = `Found ${data.length} record${
      data.length !== 1 ? "s" : ""
    }. `;

    if (itemNames.length > 0) {
      summary += `Top items: ${itemNames.join(", ")}`;
      if (remainingCount > 0) {
        summary += ` and ${remainingCount} more`;
      }
      summary += ". ";
    }

    summary += `Total ${fieldDisplayName.toLowerCase()}: ${
      isAmount ? "$" : ""
    }${total.toLocaleString()}. `;
    summary += `Average: ${isAmount ? "$" : ""}${average.toFixed(2)}. `;
    summary += `Range: ${isAmount ? "$" : ""}${min} - ${
      isAmount ? "$" : ""
    }${max}.`;

    return {
      total,
      average,
      max,
      min,
      count: data.length,
      fieldDisplayName,
      isAmount,
      description: summary,
    };
  };

  const summary =
    showCharts && result.data ? generateSummary(result.data) : null;

  return (
    <Card className="mt-4 bg-white border border-gray-200 w-full shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-2xl">
      <div className="p-6">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-base text-gray-900">
              {result.success ? "Query Executed Successfully" : "Query Failed"}
            </span>
          </div>

          {result.success && result.rowCount !== undefined && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
            >
              {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} affected
            </Badge>
          )}
        </div>

        {/* SQL Query Display */}
        {result.sql && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Generated SQL:
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <code className="text-sm text-gray-800 font-mono break-all">
                {result.sql}
              </code>
            </div>
          </div>
        )}

        {/* Explanation */}
        {result.explanation && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Explanation:
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}

        {/* Error Display */}
        {!result.success && result.error && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-700 mb-2">Error:</h4>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <code className="text-sm text-red-800 font-mono break-all">
                {result.error}
              </code>
            </div>
          </div>
        )}

        {/* Data Display with Classic Tabs */}
        {result.success && result.data && result.data.length > 0 && (
          <div className="mt-4">
            <Tabs defaultValue="table" className="w-full">
              <TabsList
                className={`grid w-full ${
                  showCharts ? "grid-cols-3" : "grid-cols-1"
                } bg-gray-100 rounded-lg p-1`}
              >
                <TabsTrigger
                  value="table"
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 text-gray-700"
                >
                  <TableIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                {showCharts && (
                  <>
                    <TabsTrigger
                      value="chart"
                      className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 text-gray-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Chart</span>
                      <span className="sm:hidden">📈</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="summary"
                      className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 text-gray-700"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Summary</span>
                      <span className="sm:hidden">📋</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Table View */}
              <TabsContent value="table" className="mt-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader className="bg-gray-50 sticky top-0">
                        <TableRow>
                          {Object.keys(result.data[0]).map((column: string) => (
                            <TableHead
                              key={column}
                              className="text-sm font-semibold text-gray-700 px-4 py-3"
                            >
                              {column.replace(/_/g, " ").toUpperCase()}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.data.map(
                          (row: Record<string, unknown>, index: number) => (
                            <TableRow
                              key={index}
                              className="hover:bg-gray-50 transition-colors duration-150 border-gray-100"
                            >
                              {Object.values(row).map(
                                (value: unknown, cellIndex: number) => (
                                  <TableCell
                                    key={cellIndex}
                                    className="text-sm px-4 py-3 text-gray-900"
                                  >
                                    {value === null ? (
                                      <span className="text-gray-400 italic text-xs">
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
                          )
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Table info footer */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-center">
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

              {/* Chart View */}
              {showCharts && chartConfigWithType && (
                <TabsContent value="chart" className="mt-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    {/* Chart Type Selector */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-end">
                      {chartTypes.map((ct) => (
                        <Button
                          key={ct.type}
                          variant={selectedChartType === ct.type ? "default" : "outline"}
                          size="sm"
                          className={
                            selectedChartType === ct.type
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                          onClick={() => setSelectedChartType(ct.type)}
                        >
                          {ct.label}
                        </Button>
                      ))}
                    </div>
                    <DynamicChart
                      chartData={dynamicChartData}
                      chartConfig={chartConfigWithType}
                    />
                  </div>
                </TabsContent>
              )}

              {/* Summary View */}
              {showCharts && summary && (
                <TabsContent value="summary" className="mt-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Query Summary
                    </h4>

                    {/* Natural Language Summary */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {summary.description}
                      </p>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xl font-bold text-gray-900">
                          {summary.count}
                        </div>
                        <div className="text-xs text-gray-600">Records</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xl font-bold text-gray-900">
                          {summary.isAmount ? "$" : ""}
                          {summary.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xl font-bold text-gray-900">
                          {summary.isAmount ? "$" : ""}
                          {summary.average.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Average</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xl font-bold text-gray-900">
                          {summary.isAmount ? "$" : ""}
                          {summary.max}
                        </div>
                        <div className="text-xs text-gray-600">Maximum</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </Card>
  );
}
