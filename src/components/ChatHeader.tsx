"use client";

export default function ChatHeader() {
  return (
    <div
      className="p-6 border-b"
      style={{
        borderColor: "var(--grey-200)",
        backgroundColor: "var(--background-paper)",
      }}
    >
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--grey-800)" }}
      >
        Text to SQL Assistant
      </h1>
      <p className="text-base" style={{ color: "var(--text-secondary)" }}>
        Convert natural language to SQL queries with AI assistance
      </p>
    </div>
  );
}
