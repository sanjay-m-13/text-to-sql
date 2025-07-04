"use client";

// Simple Add Icon component to replace MUI icon
const AddIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const drawerWidth = 280;

// Mock conversation history data
const conversationHistory = [
  {
    id: "1",
    title: "User registration queries",
    lastMessage: "SELECT * FROM users WHERE...",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Product analytics",
    lastMessage: "How to find top selling products?",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    title: "Order management",
    lastMessage: "JOIN orders with customers",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    title: "Database optimization",
    lastMessage: "CREATE INDEX for better performance",
    timestamp: "1 week ago",
  },
];

interface ConversationHistoryProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationHistory({
  selectedConversation,
  onSelectConversation,
  onNewConversation,
}: ConversationHistoryProps) {
  return (
    <div
      className="flex-shrink-0 border-r"
      style={{
        width: `${drawerWidth}px`,
        backgroundColor: "var(--grey-50)",
        borderColor: "var(--grey-200)",
      }}
    >
      <div className="p-6">
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--primary-main)" }}
        >
          SQL Assistant
        </h2>
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:transform hover:scale-105 mb-6"
          style={{
            backgroundColor: "var(--primary-main)",
            boxShadow: "0 4px 12px rgb(99 102 241 / 0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-dark)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-main)";
          }}
        >
          <AddIcon />
          New Conversation
        </button>
      </div>

      <div
        className="border-t px-4 py-2"
        style={{ borderColor: "var(--grey-200)" }}
      >
        <p
          className="text-sm font-semibold px-2 mb-2"
          style={{ color: "var(--grey-600)" }}
        >
          Recent Conversations
        </p>
      </div>

      <div className="px-4 flex-1 overflow-auto custom-scrollbar">
        {conversationHistory.map((conversation, index) => (
          <div
            key={conversation.id}
            className="mb-2 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <button
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02] ${
                selectedConversation === conversation.id ? "border-l-4" : ""
              }`}
              style={{
                backgroundColor:
                  selectedConversation === conversation.id
                    ? "var(--primary-50)"
                    : "transparent",
                borderLeftColor:
                  selectedConversation === conversation.id
                    ? "var(--primary-main)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedConversation !== conversation.id) {
                  e.currentTarget.style.backgroundColor = "var(--grey-100)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedConversation !== conversation.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div className="w-full">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--grey-800)" }}
                >
                  {conversation.title}
                </p>
                <p
                  className="text-xs block overflow-hidden text-ellipsis whitespace-nowrap mb-1"
                  style={{ color: "var(--grey-600)" }}
                >
                  {conversation.lastMessage}
                </p>
                <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                  {conversation.timestamp}
                </p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
