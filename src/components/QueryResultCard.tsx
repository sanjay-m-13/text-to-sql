"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface QueryResult {
  success: boolean;
  sql?: string;
  explanation?: string;
  data?: Record<string, unknown>[];
  rowCount?: number;
  error?: string;
}

// Enhanced Query Result Component with Dynamic Views and Monochrome Styling
export default function QueryResultCard({ result }: { result: QueryResult }) {
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

  // Generate chart data from the result
  const generateChartData = (data: Record<string, unknown>[]) => {
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
        !isNaN(parseFloat(String(firstRow[key])))
    );

    if (!numericalField) return [];

    return data.map((row, index) => ({
      name: String(
        row.name || row.customer_name || row.title || `Item ${index + 1}`
      ),
      value: parseFloat(String(row[numericalField] || 0)),
      [numericalField]: parseFloat(String(row[numericalField] || 0)),
      id: row.id || index,
      ...row,
    }));
  };

  const chartData =
    showCharts && result.data ? generateChartData(result.data) : [];

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

  const COLORS = ["#ffffff", "#e5e7eb", "#9ca3af", "#6b7280", "#4b5563"];

  return (
    <Card className="mt-3 bg-white/8 backdrop-blur-xl border border-white/15 w-full shadow-2xl hover:shadow-white/20 hover:bg-white/12 hover:border-white/25 transition-all duration-500 hover:scale-[1.01] animate-pulse hover:animate-none">
      <div className="p-4 sm:p-6">
        {/* Enhanced Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 animate-bounce" />
            )}
            <span className="font-medium text-sm sm:text-base text-white/90">
              {result.success ? "Query Executed Successfully" : "Query Failed"}
            </span>
          </div>

          {result.success && result.rowCount !== undefined && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white/80 border-white/20 text-xs"
            >
              {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} affected
            </Badge>
          )}
        </div>

        {/* SQL Query Display */}
        {result.sql && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">
              Generated SQL:
            </h4>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <code className="text-xs sm:text-sm text-white/90 font-mono break-all">
                {result.sql}
              </code>
            </div>
          </div>
        )}

        {/* Explanation */}
        {result.explanation && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">
              Explanation:
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}

        {/* Error Display */}
        {!result.success && result.error && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-300 mb-2">Error:</h4>
            <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-400/20">
              <code className="text-xs sm:text-sm text-red-200 font-mono break-all">
                {result.error}
              </code>
            </div>
          </div>
        )}

        {/* Enhanced Data Display with Dynamic Views */}
        {result.success && result.data && result.data.length > 0 && (
          <div className="mt-4">
            <Tabs defaultValue="table" className="w-full">
              <TabsList
                className={`grid w-full ${
                  showCharts ? "grid-cols-3" : "grid-cols-1"
                } bg-white/10 backdrop-blur-sm rounded-xl p-1`}
              >
                <TabsTrigger
                  value="table"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white/20 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-white/80"
                >
                  <TableIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Table</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                {showCharts && (
                  <>
                    <TabsTrigger
                      value="chart"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white/20 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-white/80"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Chart</span>
                      <span className="sm:hidden">📈</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="summary"
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-white/20 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-white/80"
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
                <div className="border border-white/15 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                  <ScrollArea className="h-64 sm:h-80 lg:h-96">
                    <Table>
                      <TableHeader className="bg-white/10 backdrop-blur-sm sticky top-0">
                        <TableRow>
                          {Object.keys(result.data[0]).map((column: string) => (
                            <TableHead
                              key={column}
                              className="text-xs sm:text-sm font-semibold text-white/80 px-2 sm:px-4 py-2 sm:py-3"
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
                              className="hover:bg-white/10 transition-colors duration-150 border-white/10"
                            >
                              {Object.values(row).map(
                                (value: unknown, cellIndex: number) => (
                                  <TableCell
                                    key={cellIndex}
                                    className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 text-white/80"
                                  >
                                    {value === null ? (
                                      <span className="text-white/40 italic text-xs">
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
                  <div className="px-3 sm:px-4 py-2 bg-white/5 border-t border-white/10 text-xs text-white/60 flex justify-between items-center">
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
              {showCharts && (
                <TabsContent value="chart" className="mt-4">
                  <div className="space-y-6">
                    {/* Bar Chart */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-white/80 mb-4">
                        Bar Chart
                      </h4>
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 12,
                                fill: "rgba(255,255,255,0.7)",
                              }}
                              stroke="rgba(255,255,255,0.3)"
                            />
                            <YAxis
                              tick={{
                                fontSize: 12,
                                fill: "rgba(255,255,255,0.7)",
                              }}
                              stroke="rgba(255,255,255,0.3)"
                            />
                            <Tooltip
                              formatter={(value: number) => [
                                `${summary?.isAmount ? "$" : ""}${value}`,
                                summary?.fieldDisplayName || "Value",
                              ]}
                              labelFormatter={(label) => `Item: ${label}`}
                              contentStyle={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "8px",
                                backdropFilter: "blur(8px)",
                                color: "white",
                              }}
                            />
                            <Bar dataKey="value" fill="rgba(255,255,255,0.8)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <h4 className="text-sm font-medium text-white/80 mb-4">
                        Distribution
                      </h4>
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="rgba(255,255,255,0.8)"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${summary?.isAmount ? "$" : ""}${value}`,
                                summary?.fieldDisplayName || "Value",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "8px",
                                backdropFilter: "blur(8px)",
                                color: "white",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Summary View */}
              {showCharts && summary && (
                <TabsContent value="summary" className="mt-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white/90 mb-4">
                      Query Summary
                    </h4>

                    {/* Natural Language Summary */}
                    <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/80 leading-relaxed">
                        {summary.description}
                      </p>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-lg sm:text-xl font-bold text-white/90">
                          {summary.count}
                        </div>
                        <div className="text-xs text-white/60">Records</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-lg sm:text-xl font-bold text-white/90">
                          {summary.isAmount ? "$" : ""}
                          {summary.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-white/60">Total</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-lg sm:text-xl font-bold text-white/90">
                          {summary.isAmount ? "$" : ""}
                          {summary.average.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/60">Average</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-lg sm:text-xl font-bold text-white/90">
                          {summary.isAmount ? "$" : ""}
                          {summary.max}
                        </div>
                        <div className="text-xs text-white/60">Maximum</div>
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
