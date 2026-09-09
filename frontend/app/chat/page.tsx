"use client";

import { useEffect, useRef, useState } from "react";

type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // -------------------------------------------------------------------------
  // Auto-scroll
  // -------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // -------------------------------------------------------------------------
  // Load conversations
  // -------------------------------------------------------------------------

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/conversations`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Create new conversation
  // -------------------------------------------------------------------------

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/conversations`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();

      setActiveConversationId(data.conversation_id);
      setMessages([]);

      await loadConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Load messages
  // -------------------------------------------------------------------------

  const loadMessages = async (conversationId: number) => {
    setLoadingMessages(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/conversations/${conversationId}/messages`,
        {
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();

      setMessages(data);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // -------------------------------------------------------------------------
  // Generate conversation title
  // -------------------------------------------------------------------------

  const generateConversationTitle = (message: string) => {
    const cleanedMessage = message
      .replace(/\s+/g, " ")
      .trim();

    if (cleanedMessage.length <= 35) {
      return cleanedMessage;
    }

    return `${cleanedMessage.slice(0, 35)}...`;
  };

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    let conversationId = activeConversationId;

    try {
      // Create conversation automatically
      if (!conversationId) {
        const conversationResponse = await fetch(
          `${API_URL}/api/v1/conversations`,
          {
            method: "POST",
            headers: getHeaders(),
          }
        );

        if (!conversationResponse.ok) {
          throw new Error("Failed to create conversation");
        }

        const conversationData = await conversationResponse.json();

        conversationId = conversationData.conversation_id;

        setActiveConversationId(conversationId);

        await loadConversations();
      }

      const userMessage = input.trim();

      setInput("");

      // Add user message immediately
      const temporaryMessage: Message = {
        id: Date.now(),
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, temporaryMessage]);

      setLoading(true);

      // Send message to backend
      const response = await fetch(
        `${API_URL}/api/v1/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            content: userMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to send message"
        );
      }

      const data = await response.json();

      // Add AI response
      const assistantMessage: Message = {
        id: data.message_id,
        role: "assistant",
        content: data.answer,
        created_at: data.created_at,
      };

      setMessages((previous) => [...previous, assistantMessage]);

      // Refresh conversations
      await loadConversations();

      // Update first conversation title visually
      if (messages.length === 0) {
        const generatedTitle = generateConversationTitle(userMessage);

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  title: generatedTitle,
                }
              : conversation
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Maaf, KelanaAI sedang mengalami kendala. Coba lagi sebentar ya.",
        created_at: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------------------

  useEffect(() => {
    loadConversations();
  }, []);

  // -------------------------------------------------------------------------
  // Enter key
  // -------------------------------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="flex h-screen bg-gray-50">
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar */}
      {/* ------------------------------------------------------------------ */}

      <aside className="flex w-80 flex-col border-r bg-white">
        <div className="border-b p-5">
          <h1 className="text-2xl font-bold text-gray-900">
            KelanaAI
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your AI travel companion
          </p>

          <button
            onClick={createNewConversation}
            className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Conversations
          </p>

          {conversations.length === 0 ? (
            <p className="px-2 text-sm text-gray-400">
              No conversations yet.
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => loadMessages(conversation.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    activeConversationId === conversation.id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-gray-800">
                    {conversation.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(
                      conversation.created_at
                    ).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Chat */}
      {/* ------------------------------------------------------------------ */}

      <section className="flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Travel Assistant
          </h2>

          <p className="text-sm text-gray-500">
            Ask KelanaAI anything about your trip.
          </p>
        </header>

        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl space-y-5">
            {!activeConversationId && messages.length === 0 && (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-5xl">
                    ✈️
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    Where are we going?
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Start a conversation with KelanaAI.
                  </p>
                </div>
              </div>
            )}

            {loadingMessages && (
              <div className="text-center text-sm text-gray-400">
                Loading conversation...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-white text-gray-800 shadow-sm ring-1 ring-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>

                  <p
                    className={`mt-2 text-[10px] ${
                      message.role === "user"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      KelanaAI is thinking
                    </span>

                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}

        <div className="border-t bg-white p-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask KelanaAI about your trip..."
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            Press Enter to send • Shift + Enter for a new line
          </p>
        </div>
      </section>
    </main>
  );
}