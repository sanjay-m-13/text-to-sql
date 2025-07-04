"use client";

// Simple SmartToy Icon component to replace MUI icon
const SmartToyIcon = () => (
  <svg
    className="w-16 h-16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);

export default function WelcomeScreen() {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-6 animate-fade-in">
      <div
        className="p-8 rounded-2xl border-2 border-dashed"
        style={{
          backgroundColor: "var(--primary-50)",
          borderColor: "var(--primary-200)",
        }}
      >
        <div style={{ color: "var(--primary-main)" }}>
          <SmartToyIcon />
        </div>
      </div>
      <div className="flex flex-col items-center text-center space-y-4">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--grey-800)" }}
        >
          Ready to help with SQL queries
        </h2>
        <p
          className="text-base max-w-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Ask me to convert natural language to SQL queries. I can help with
          SELECT statements, JOINs, aggregations, and more.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span
            className="px-3 py-1 rounded-full border text-sm"
            style={{
              borderColor: "var(--grey-300)",
              color: "var(--grey-700)",
              backgroundColor: "var(--background-paper)",
            }}
          >
            Try: Find all users who registered last month
          </span>
          <span
            className="px-3 py-1 rounded-full border text-sm"
            style={{
              borderColor: "var(--grey-300)",
              color: "var(--grey-700)",
              backgroundColor: "var(--background-paper)",
            }}
          >
            Try: Show top 10 selling products
          </span>
        </div>
      </div>
    </div>
  );
}
