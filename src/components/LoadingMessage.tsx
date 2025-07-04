"use client";

// Simple SmartToy Icon component to replace MUI icon
const SmartToyIcon = () => (
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
      strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);

// Simple loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function LoadingMessage() {
  return (
    <div
      className="p-6 rounded-2xl mr-12 shadow-sm"
      style={{ backgroundColor: "var(--background-paper)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--secondary-main)" }}
        >
          <SmartToyIcon />
        </div>
        <div className="flex items-center gap-3">
          <div style={{ color: "var(--primary-main)" }}>
            <LoadingSpinner />
          </div>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Generating SQL query...
          </p>
        </div>
      </div>
    </div>
  );
}
