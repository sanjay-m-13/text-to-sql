"use client";

import { useState } from "react";
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
  Copy,
  Check,
} from "lucide-react";
import { DynamicChart } from "./DynamicChart";
import { Button } from "@/components/ui/button";

interface QueryResult {
  success: boolean;
  sql?: string;
  explanation?: string;
  data?: Record<string, unknown>[];
  rowCount?: number;
  error?: string;
}

// Copy Button Component
function CopyButton({
  text,
  label = "Copy SQL",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
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

  // Generate comprehensive summary for all query types
  const generateComprehensiveSummary = (result: QueryResult) => {
    if (!result.success) {
      return {
        title: "Query Failed",
        description: `The SQL query encountered an error: ${
          result.error || "Unknown error"
        }. Please check your query syntax and try again.`,
        type: "error" as const,
        stats: null,
      };
    }

    if (!result.data || result.data.length === 0) {
      return {
        title: "No Results Found",
        description: `The query executed successfully but returned no data. This could mean:
        • The table is empty
        • Your filter conditions didn't match any records
        • The data you're looking for doesn't exist in the database`,
        type: "empty" as const,
        stats: { recordCount: 0 },
      };
    }

    const data = result.data;
    const recordCount = data.length;
    const columns = Object.keys(data[0]);

    // Analyze the actual data content for business insights
    let description = "";

    // Identify what type of data this appears to be
    const hasCustomers = columns.some((col) =>
      col.toLowerCase().includes("customer")
    );
    const hasOrders = columns.some((col) =>
      col.toLowerCase().includes("order")
    );
    const hasProducts = columns.some((col) =>
      col.toLowerCase().includes("product")
    );
    const hasEmployees = columns.some((col) =>
      col.toLowerCase().includes("employee")
    );
    const hasUsers = columns.some((col) => col.toLowerCase().includes("user"));
    const hasAmount = columns.some(
      (col) =>
        col.toLowerCase().includes("amount") ||
        col.toLowerCase().includes("price") ||
        col.toLowerCase().includes("total")
    );
    const hasDate = columns.some(
      (col) =>
        col.toLowerCase().includes("date") || col.toLowerCase().includes("time")
    );

    // Generate contextual business summary
    if (hasCustomers && hasOrders) {
      description = `This shows ${recordCount} customer order${
        recordCount !== 1 ? "s" : ""
      }. `;

      if (hasAmount) {
        const amounts = data
          .map((row) => {
            const amountCol = columns.find(
              (col) =>
                col.toLowerCase().includes("amount") ||
                col.toLowerCase().includes("price") ||
                col.toLowerCase().includes("total")
            );
            return amountCol ? parseFloat(String(row[amountCol])) : 0;
          })
          .filter((val) => !isNaN(val));

        if (amounts.length > 0) {
          const total = amounts.reduce((sum, val) => sum + val, 0);
          const average = total / amounts.length;
          const max = Math.max(...amounts);
          const min = Math.min(...amounts);

          description += `Total value: $${total.toLocaleString()}. Average order value: $${average.toFixed(
            2
          )}. `;
          description += `Highest order: $${max.toLocaleString()}, lowest: $${min.toLocaleString()}. `;
        }
      }

      if (hasDate) {
        description += `Orders span across different time periods. `;
      }
    } else if (hasCustomers) {
      description = `This shows ${recordCount} customer${
        recordCount !== 1 ? "s" : ""
      }. `;

      // Look for customer names or identifiers
      const nameCol = columns.find((col) => col.toLowerCase().includes("name"));
      if (nameCol && recordCount <= 10) {
        const names = data
          .slice(0, 5)
          .map((row) => String(row[nameCol]))
          .filter((name) => name && name !== "null");
        if (names.length > 0) {
          description += `Including: ${names.join(", ")}${
            recordCount > 5 ? " and others" : ""
          }. `;
        }
      }
    } else if (hasProducts) {
      description = `This shows ${recordCount} product${
        recordCount !== 1 ? "s" : ""
      }. `;

      if (hasAmount) {
        const priceCol = columns.find(
          (col) =>
            col.toLowerCase().includes("price") ||
            col.toLowerCase().includes("amount")
        );
        if (priceCol) {
          const prices = data
            .map((row) => parseFloat(String(row[priceCol])))
            .filter((val) => !isNaN(val));
          if (prices.length > 0) {
            const avgPrice =
              prices.reduce((sum, val) => sum + val, 0) / prices.length;
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);
            description += `Price range: $${minPrice.toFixed(
              2
            )} - $${maxPrice.toFixed(2)}. Average price: $${avgPrice.toFixed(
              2
            )}. `;
          }
        }
      }
    } else if (hasEmployees || hasUsers) {
      const entityType = hasEmployees ? "employee" : "user";
      description = `This shows ${recordCount} ${entityType}${
        recordCount !== 1 ? "s" : ""
      }. `;
    } else {
      // Generic data analysis
      description = `This dataset contains ${recordCount} record${
        recordCount !== 1 ? "s" : ""
      }. `;

      // Look for key identifying columns
      const nameCol = columns.find(
        (col) =>
          col.toLowerCase().includes("name") ||
          col.toLowerCase().includes("title")
      );

      if (nameCol && recordCount <= 10) {
        const items = data
          .slice(0, 5)
          .map((row) => String(row[nameCol]))
          .filter((item) => item && item !== "null");
        if (items.length > 0) {
          description += `Items include: ${items.join(", ")}${
            recordCount > 5 ? " and others" : ""
          }. `;
        }
      }
    }

    // Add numerical insights if available
    const numericalCols = columns.filter((col) => {
      return data.some(
        (row) =>
          typeof row[col] === "number" ||
          (!isNaN(parseFloat(String(row[col]))) &&
            !col.toLowerCase().includes("id"))
      );
    });

    if (numericalCols.length > 0 && !hasAmount) {
      const numCol = numericalCols[0];
      const values = data
        .map((row) => parseFloat(String(row[numCol])))
        .filter((val) => !isNaN(val));
      if (values.length > 0) {
        const total = values.reduce((sum, val) => sum + val, 0);
        const average = total / values.length;
        description += `${numCol.replace(
          /_/g,
          " "
        )}: total of ${total.toLocaleString()}, average of ${average.toFixed(
          1
        )}. `;
      }
    }

    // Add context about data size
    if (recordCount === 1) {
      description += `This is a single record with detailed information.`;
    } else if (recordCount <= 5) {
      description += `This is a small, focused result set ideal for detailed review.`;
    } else if (recordCount <= 20) {
      description += `This is a manageable dataset that can be easily reviewed.`;
    } else if (recordCount <= 100) {
      description += `This is a substantial dataset with good coverage.`;
    } else {
      description += `This is a large dataset - you may want to add filters to narrow down the results.`;
    }

    return {
      title: "Data Summary",
      description,
      type: "success" as const,
      stats: {
        recordCount,
        columnCount: columns.length,
        hasBusinessData:
          hasCustomers || hasOrders || hasProducts || hasEmployees,
        hasFinancialData: hasAmount,
        hasTimeData: hasDate,
      },
    };
  };

  // Determine if query should show charts based on content
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

  // Generate comprehensive summary for all cases
  const comprehensiveSummary = generateComprehensiveSummary(result);

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
    ? {
        ...chartConfig,
        type: selectedChartType as "bar" | "line" | "area" | "pie",
      }
    : null;

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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Generated SQL:
              </h4>
              <CopyButton text={result.sql} />
            </div>
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

        {/* Data Display with Classic Tabs - Always show summary */}
        {result.success && (
          <div className="mt-4">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList
                className={`grid w-full ${
                  result.data && result.data.length > 0
                    ? showCharts
                      ? "grid-cols-3"
                      : "grid-cols-2"
                    : "grid-cols-1"
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
              {result.data && result.data.length > 0 && (
                <TabsContent value="table" className="mt-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <ScrollArea className="h-96">
                      <Table>
                        <TableHeader className="bg-gray-50 sticky top-0">
                          <TableRow>
                            {Object.keys(result.data[0]).map(
                              (column: string) => (
                                <TableHead
                                  key={column}
                                  className="text-sm font-semibold text-gray-700 px-4 py-3"
                                >
                                  {column.replace(/_/g, " ").toUpperCase()}
                                </TableHead>
                              )
                            )}
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
              )}

              {/* Chart View */}
              {showCharts && chartConfigWithType && (
                <TabsContent value="chart" className="mt-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    {/* Chart Type Selector */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-end">
                      {chartTypes.map((ct) => (
                        <Button
                          key={ct.type}
                          variant={
                            selectedChartType === ct.type
                              ? "default"
                              : "outline"
                          }
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

              {/* Summary View - Always show */}
              <TabsContent value="summary" className="mt-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {comprehensiveSummary.title}
                  </h4>

                  {/* Natural Language Summary */}
                  <div
                    className={`mb-6 p-4 rounded-lg border ${
                      comprehensiveSummary.type === "error"
                        ? "bg-red-50 border-red-200"
                        : comprehensiveSummary.type === "empty"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                      {comprehensiveSummary.description}
                    </p>
                  </div>

                  {/* Statistics Grid - Only show for successful queries with data */}
                  {/* {comprehensiveSummary.type === "success" &&
                    comprehensiveSummary.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-gray-900">
                            {comprehensiveSummary.stats.recordCount}
                          </div>
                          <div className="text-xs text-gray-600">Records</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-gray-900">
                            {comprehensiveSummary.stats.columnCount}
                          </div>
                          <div className="text-xs text-gray-600">Columns</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-gray-900">
                            {comprehensiveSummary.stats.hasFinancialData
                              ? "✓"
                              : "✗"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Financial Data
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-gray-900">
                            {comprehensiveSummary.stats.hasBusinessData
                              ? "✓"
                              : "✗"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Business Data
                          </div>
                        </div>
                      </div>
                    )} */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Card>
  );
}
