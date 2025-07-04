"use client";

import { useState } from "react";

// Simple ExpandMore Icon component to replace MUI icon
const ExpandMoreIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-200 ${
      isExpanded ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Simple CheckCircle Icon component to replace MUI icon
const CheckCircleIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Simple Error Icon component to replace MUI icon
const ErrorIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface QueryColumn {
  name: string;
  dataType: number;
}

interface QueryResultData {
  success: boolean;
  sql: string;
  explanation: string;
  data?: Record<string, unknown>[];
  rowCount?: number;
  columns?: QueryColumn[];
  error?: string;
}

interface QueryResultProps {
  result: QueryResultData;
}

export default function QueryResult({ result }: QueryResultProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  return (
    <div className="mt-4">
      {/* Query Status */}
      <div className="flex items-center gap-2 mb-4">
        <div
          style={{
            color: result.success ? "var(--success-main)" : "var(--error-main)",
          }}
        >
          {result.success ? <CheckCircleIcon /> : <ErrorIcon />}
        </div>
        <h3 className="text-lg font-semibold">
          {result.success ? "Query Executed Successfully" : "Query Failed"}
        </h3>
        {result.success && result.rowCount !== undefined && (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "var(--primary-main)" }}
          >
            {result.rowCount} row{result.rowCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Explanation */}
      <p className="mb-4 italic" style={{ color: "var(--text-secondary)" }}>
        {result.explanation}
      </p>

      {/* SQL Query */}
      <div
        className="mb-4 border rounded-lg overflow-hidden"
        style={{ borderColor: "var(--grey-200)" }}
      >
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
          style={{ backgroundColor: "var(--background-paper)" }}
        >
          <h4 className="text-base font-semibold">SQL Query</h4>
          <ExpandMoreIcon isExpanded={isAccordionOpen} />
        </button>
        {isAccordionOpen && (
          <div className="border-t" style={{ borderColor: "var(--grey-200)" }}>
            <pre
              className="p-4 overflow-auto text-sm leading-relaxed whitespace-pre-wrap font-mono"
              style={{
                backgroundColor: "var(--grey-100)",
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              }}
            >
              {result.sql}
            </pre>
          </div>
        )}
      </div>

      {/* Error Display */}
      {!result.success && result.error && (
        <div
          className="mb-4 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: "#fef2f2",
            borderLeftColor: "var(--error-main)",
            borderColor: "#fecaca",
          }}
        >
          <p className="text-sm" style={{ color: "var(--error-main)" }}>
            <strong>Error:</strong> {result.error}
          </p>
        </div>
      )}

      {/* Results Table */}
      {result.success && result.data && result.data.length > 0 && (
        <div
          className="border rounded-lg overflow-hidden custom-scrollbar"
          style={{
            maxHeight: "400px",
            borderColor: "var(--grey-200)",
            backgroundColor: "var(--background-paper)",
          }}
        >
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr>
                  {Object.keys(result.data[0]).map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left font-semibold border-b-2"
                      style={{
                        backgroundColor: "var(--primary-50)",
                        borderBottomColor: "var(--primary-200)",
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-opacity-50 transition-colors duration-150"
                    style={{
                      backgroundColor:
                        index % 2 === 1 ? "var(--grey-50)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--primary-50)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 1 ? "var(--grey-50)" : "transparent";
                    }}
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 border-b"
                        style={{ borderColor: "var(--grey-200)" }}
                      >
                        {value === null ? (
                          <span
                            className="italic text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            NULL
                          </span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {result.success && result.data && result.data.length === 0 && (
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: "#f0f9ff",
            borderLeftColor: "#0ea5e9",
            borderColor: "#bae6fd",
          }}
        >
          <p className="text-sm" style={{ color: "#0369a1" }}>
            Query executed successfully but returned no results.
          </p>
        </div>
      )}
    </div>
  );
}
