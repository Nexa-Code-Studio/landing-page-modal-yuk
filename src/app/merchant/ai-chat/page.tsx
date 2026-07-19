"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, MessageSquare, Plus, Wrench, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { marked } from "marked";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "ai" | "system";
  content: string;
  timestamp: string;
  tool_calls?: any[];
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  store_id: string | null;
}

// Custom function to parse message markdown and post-process mermaid code blocks
const parseMessageContent = (content: string) => {
  if (!content) return "";
  
  // Parse with marked first
  let parsedHtml = marked.parse(content) as string;
  
  // Custom regex to find mermaid code blocks rendered inside <code> tags and replace them with <pre class="mermaid-diagram">
  const parser = new RegExp('<pre><code class="(?:language|lang)-mermaid">([\\s\\S]*?)<\\/code><\\/pre>', 'g');
  parsedHtml = parsedHtml.replace(parser, (match, p1) => {
    // Decode HTML entities that marked escapes automatically inside <code> blocks
    const decoded = p1
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `<pre class="mermaid-diagram">${decoded.trim()}</pre>`;
  });
  
  return parsedHtml;
};

const formatJSON = (str: string) => {
  if (!str) return "null";
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
};

// Single tool call row inside the thinking dropdown
function ToolCallAccordion({ toolCall }: { toolCall: any }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white/60 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-3 h-3 text-indigo-400" />
          <span className="text-[11px]">Tool Call: <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{toolCall.tool_name}</span></span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-3 border-t border-slate-200 space-y-2.5 bg-white text-[11px] font-mono overflow-x-auto">
          <div>
            <div className="font-sans font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Input Parameters</div>
            <pre className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap break-all text-[10px]">{formatJSON(toolCall.tool_input)}</pre>
          </div>
          <div>
            <div className="font-sans font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Output Result</div>
            <pre className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap break-all text-[10px]">{formatJSON(toolCall.tool_output)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible thinking steps panel shown BELOW the final assistant message
function ThinkingDropdown({ thinkingMsgs }: { thinkingMsgs: ChatMessage[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const totalTools = thinkingMsgs.reduce((sum, m) => sum + (m.tool_calls?.length ?? 0), 0);

  return (
    <div className="mt-2 ml-14">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none group"
      >
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
          isOpen ? "border-indigo-300 bg-indigo-50" : "border-slate-300 bg-slate-50 group-hover:border-slate-400"
        }`}>
          {isOpen 
            ? <ChevronUp className="w-2 h-2 text-indigo-400" />
            : <ChevronDown className="w-2 h-2 text-slate-400" />
          }
        </div>
        <span className={`transition-colors ${isOpen ? "text-indigo-500" : ""}`}>
          {isOpen ? "Sembunyikan" : "Lihat"} proses berpikir
          {totalTools > 0 && (
            <span className="ml-1.5 bg-indigo-50 text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              {totalTools} tool call{totalTools > 1 ? "s" : ""}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 backdrop-blur-sm overflow-hidden shadow-sm">
          {thinkingMsgs.map((msg, idx) => (
            <div key={msg.id} className={`p-3 space-y-2 ${idx > 0 ? "border-t border-slate-200/60" : ""}`}>
              {/* Internal monologue / small talk text */}
              {msg.content && (
                <p className="text-[11px] italic text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              )}
              {/* Tool calls for this thinking step */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="space-y-1.5">
                  {msg.tool_calls.map((tc: any) => (
                    <ToolCallAccordion key={tc.id} toolCall={tc} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MerchantAIChatPage() {
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  
  // Pagination & infinite scroll state for sidebar
  const [visibleCount, setVisibleCount] = useState(10);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  
  // Language settings (default to Indonesian)
  const [lang, setLang] = useState<"en" | "id">("id");

  // SSR-safe Mermaid Initialization
  const [isMermaidInitialized, setIsMermaidInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("mermaid").then((m) => {
        m.default.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        });
        setIsMermaidInitialized(true);
      });
    }
  }, []);

  // Run mermaid compiler when messages or mermaid init state updates
  useEffect(() => {
    if (!isMermaidInitialized) return;
    const timer = setTimeout(() => {
      try {
        import("mermaid").then((m) => {
          m.default.run({
            querySelector: ".mermaid-diagram",
          });
        });
      } catch (err) {
        console.error("Mermaid compile error:", err);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, isMermaidInitialized]);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as "en" | "id" | null;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Fetch initial conversations on page mount
  useEffect(() => {
    const initChat = async () => {
      setLoadingConversations(true);
      try {
        const res = await apiClient.get<ChatSession[]>("/chat/conversations");
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };
    initChat();
  }, []);

  // Polling data when tab has focus to keep messages and sidebar in sync with backend
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollData = async () => {
      // Avoid querying if tab is blurred/inactive to minimize server load
      if (typeof document !== "undefined" && !document.hasFocus()) return;

      try {
        // 1. Fetch conversations in background
        const res = await apiClient.get<ChatSession[]>("/chat/conversations");
        setConversations(prev => {
          // Check if conversation titles or count changed
          const isSame = prev.length === res.length && 
                         prev.every((c, i) => c.id === res[i].id && c.title === res[i].title && c.updated_at === res[i].updated_at);
          return isSame ? prev : res;
        });

        // 2. Fetch active messages in background
        if (activeConversationId && !sending && !loadingMessages) {
          const msgRes = await apiClient.get<any[]>(`/chat/conversations/${activeConversationId}/messages`);
          const mapped = msgRes
            .filter((m: any) => m.role !== "system")
            .map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              tool_calls: m.tool_calls
            }));

          setMessages(prev => {
            const isSame = prev.length === mapped.length && 
                           prev.every((msg, idx) => msg.id === mapped[idx].id && msg.content === mapped[idx].content);
            return isSame ? prev : mapped;
          });
        }
      } catch (err) {
        // Silently skip network errors (backend down / restarting) — this is expected during dev
        const isNetworkError = err instanceof TypeError && 
          (err.message === "Failed to fetch" || err.message.includes("NetworkError") || err.message.includes("fetch"));
        if (!isNetworkError) {
          console.error("Smart Polling failed:", err);
        }
      }
    };

    // Run immediately when window is refocused
    const handleFocus = () => {
      pollData();
    };

    // Set polling interval of 5 seconds
    intervalId = setInterval(pollData, 5000);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeConversationId, sending, loadingMessages]);

  // Scroll to bottom when messages list changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load messages for a given conversation
  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await apiClient.get<any[]>(`/chat/conversations/${convId}/messages`);
      const mapped = res
        .filter((m: any) => m.role !== "system") // hide system prompts
        .map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tool_calls: m.tool_calls
        }));
      setMessages(mapped);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Select a conversation from sidebar
  const handleSelectConversation = (convId: string) => {
    if (convId === activeConversationId) return;
    setActiveConversationId(convId);
    loadMessages(convId);
  };

  // Start a new blank conversation session
  const startNewConversation = async (firstMessageText?: string) => {
    setSending(true);
    try {
      const storeId = typeof window !== "undefined" ? localStorage.getItem("auth_store_id") : null;

      const res = await apiClient.post<ChatSession>("/chat/conversations", {
        store_id: storeId || null,
        title: null
      });

      setActiveConversationId(res.id);

      if (firstMessageText) {
        await sendMessage(res.id, firstMessageText);
      } else {
        setMessages([]);
        setSending(false);
      }
    } catch (err: any) {
      console.error("Create conversation failed:", err);
      alert("Gagal memulai percakapan baru: " + err.message);
      setSending(false);
    }
  };

  // Send a message inside an active conversation session
  const sendMessage = async (convId: string, text: string) => {
    setSending(true);
    
    // Add user bubble instantly
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await apiClient.post<any[]>(
        `/chat/conversations/${convId}/messages?user_message=${encodeURIComponent(text)}`,
        {}
      );
      
      const mapped = response
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tool_calls: m.tool_calls
        }));
        
      setMessages(mapped);

      // Fetch updated conversation list to instantly show the summarized title in the sidebar
      const updatedList = await apiClient.get<ChatSession[]>("/chat/conversations");
      setConversations(updatedList);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Gagal mengirim pesan: ${err.message}. Harap periksa koneksi backend.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // Submit handler for user chat input
  const handleSendSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");

    if (activeConversationId) {
      sendMessage(activeConversationId, text);
    } else {
      startNewConversation(text);
    }
  };

  // Handle sidebar scrolling for infinite scroll pagination
  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
      if (visibleCount < conversations.length) {
        setVisibleCount(prev => Math.min(prev + 10, conversations.length));
      }
    }
  };

  // Group sliced conversations by dates
  const groupedSessions = useMemo(() => {
    // Filter out conversations with null or empty titles to hide unsummarized/empty new chats
    const validConversations = conversations.filter(
      c => c.title !== null && c.title !== "" && c.title !== "New Conversation"
    );

    const sliced = validConversations.slice(0, visibleCount);
    
    const todayGroup: ChatSession[] = [];
    const yesterdayGroup: ChatSession[] = [];
    const last7DaysGroup: ChatSession[] = [];
    const historyGroup: ChatSession[] = [];
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    sliced.forEach(s => {
      const date = new Date(s.updated_at);
      if (date >= startOfToday) {
        todayGroup.push(s);
      } else if (date >= startOfYesterday) {
        yesterdayGroup.push(s);
      } else if (date >= startOf7DaysAgo) {
        last7DaysGroup.push(s);
      } else {
        historyGroup.push(s);
      }
    });
    
    return {
      today: todayGroup,
      yesterday: yesterdayGroup,
      last7Days: last7DaysGroup,
      history: historyGroup
    };
  }, [conversations, visibleCount]);

  const renderSessionItem = (session: ChatSession) => {
    const isSelected = activeConversationId === session.id;
    return (
      <button
        key={session.id}
        onClick={() => handleSelectConversation(session.id)}
        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group text-slate-700 cursor-pointer ${
          isSelected 
            ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100/50" 
            : "hover:bg-slate-200/60 border border-transparent"
        }`}
      >
        <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${
          isSelected ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
        }`} />
        <span className="text-sm truncate flex-1">{session.title || `Obrolan #${session.id.substring(0,6)}`}</span>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] w-full">
      <style>{`
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        .markdown-content th {
          background: #f8fafc;
          color: #334155;
          font-weight: 600;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }
        .markdown-content td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.25rem;
          margin-bottom: 0.75rem;
          list-style-type: disc;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .mermaid-diagram {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin: 12px 0;
          display: flex;
          justify-content: center;
          overflow-x: auto;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }
        .mermaid-diagram svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Sidebar History (Left Pane) */}
        <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col hidden md:flex shrink-0">
          <div className="p-4 border-b border-slate-200">
            <Button 
              onClick={() => startNewConversation()}
              className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white flex items-center gap-2 justify-start h-11 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">Percakapan Baru</span>
            </Button>
          </div>
          
          {loadingConversations ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-resurva-dark" />
              <span>Memuat riwayat...</span>
            </div>
          ) : (
            <div 
              ref={sidebarContainerRef}
              onScroll={handleSidebarScroll}
              className="flex-1 overflow-y-auto p-3 space-y-5"
            >
              {/* Today Group */}
              {groupedSessions.today.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Hari ini</h4>
                  {groupedSessions.today.map(session => renderSessionItem(session))}
                </div>
              )}
              
              {/* Yesterday Group */}
              {groupedSessions.yesterday.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Kemarin</h4>
                  {groupedSessions.yesterday.map(session => renderSessionItem(session))}
                </div>
              )}

              {/* 7 Days Ago Group */}
              {groupedSessions.last7Days.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">7 Hari Lalu</h4>
                  {groupedSessions.last7Days.map(session => renderSessionItem(session))}
                </div>
              )}

              {/* History Group (Older than 7 days) */}
              {groupedSessions.history.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">History</h4>
                  {groupedSessions.history.map(session => renderSessionItem(session))}
                </div>
              )}

              {conversations.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-10 px-4">
                  Belum ada riwayat obrolan.
                </div>
              )}

              {/* Infinite Scroll Loader Indicator */}
              {visibleCount < conversations.length && (
                <div className="flex justify-center p-3 text-xs text-slate-400 gap-1.5 items-center border-t border-slate-100">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Memuat lainnya...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Chat Area (Right Pane) */}
        <div className="flex-1 flex flex-col bg-white relative">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <Bot className="w-5 h-5 text-resurva-dark" />
              </div>
              <span className="font-bold text-slate-800">RESURVA AI</span>
            </div>
            <Button 
              onClick={() => startNewConversation()}
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer hover:bg-slate-150 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/20">
            {loadingMessages ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-resurva-dark" />
                <span>Memuat pesan percakapan...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20 px-6">
                <Bot className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <h3 className="font-bold text-slate-700 text-lg mb-1">Mulai Obrolan Baru</h3>
                <p className="text-sm max-w-sm">Tanyakan seputar data produk, audit stok, tanggal kedaluwarsa, atau grafik summary penjualan toko Anda.</p>
              </div>
            ) : (() => {
              // Group messages: pair each final assistant message with its preceding thinking messages
              type RenderGroup = {
                key: string;
                type: "user" | "final_assistant" | "orphan_thinking";
                msg?: ChatMessage;
                thinkingMsgs?: ChatMessage[];
              };
              const groups: RenderGroup[] = [];
              let pendingThinking: ChatMessage[] = [];

              for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                const isAssistant = msg.role === "assistant" || msg.role === "ai";
                const isThinking = isAssistant && msg.tool_calls && msg.tool_calls.length > 0;

                if (isThinking) {
                  pendingThinking.push(msg);
                } else if (isAssistant) {
                  // Final assistant reply — attach accumulated thinking
                  groups.push({ key: msg.id, type: "final_assistant", msg, thinkingMsgs: [...pendingThinking] });
                  pendingThinking = [];
                } else {
                  // User message — flush any orphan thinking first
                  if (pendingThinking.length > 0) {
                    groups.push({ key: pendingThinking[0].id + "_orphan", type: "orphan_thinking", thinkingMsgs: [...pendingThinking] });
                    pendingThinking = [];
                  }
                  groups.push({ key: msg.id, type: "user", msg });
                }
              }
              // Flush any trailing thinking (e.g. still in-flight)
              if (pendingThinking.length > 0) {
                groups.push({ key: pendingThinking[0].id + "_orphan", type: "orphan_thinking", thinkingMsgs: [...pendingThinking] });
              }

              return groups.map((group) => {
                if (group.type === "user") {
                  const msg = group.msg!;
                  return (
                    <div key={group.key} className="flex gap-4 justify-end">
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm border bg-resurva-dark text-white rounded-tr-sm border-resurva-dark">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] mt-2.5 block text-indigo-200 text-right">{msg.timestamp}</span>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 mt-1 shadow-sm">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                  );
                }

                if (group.type === "final_assistant") {
                  const msg = group.msg!;
                  const hasThinking = (group.thinkingMsgs?.length ?? 0) > 0;
                  return (
                    <div key={group.key}>
                      <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 mt-1 shadow-sm">
                          <Bot className="w-5 h-5 text-resurva-dark" />
                        </div>
                        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm border bg-white text-slate-800 rounded-tl-sm border-slate-100">
                          <div
                            className="markdown-content text-[15px] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: parseMessageContent(msg.content) }}
                          />
                          <span className="text-[10px] mt-2.5 block text-slate-400">{msg.timestamp}</span>
                        </div>
                      </div>
                      {/* Thinking dropdown BELOW the final answer */}
                      {hasThinking && <ThinkingDropdown thinkingMsgs={group.thinkingMsgs!} />}
                    </div>
                  );
                }

                // Orphan thinking (still in-flight, no final answer yet)
                if (group.type === "orphan_thinking" && group.thinkingMsgs && group.thinkingMsgs.length > 0) {
                  const lastThinking = group.thinkingMsgs[group.thinkingMsgs.length - 1];
                  return (
                    <div key={group.key} className="flex gap-4 justify-start">
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 mt-1 shadow-sm">
                        <Bot className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-sm border bg-slate-50 border-slate-200/60 rounded-tl-sm space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-3 h-3 text-slate-400" />
                          <span>Sedang memproses...</span>
                        </div>
                        {lastThinking.content && (
                          <p className="text-[12px] italic text-slate-500 font-mono whitespace-pre-wrap">{lastThinking.content}</p>
                        )}
                        <span className="text-[10px] block text-slate-400">{lastThinking.timestamp}</span>
                      </div>
                    </div>
                  );
                }

                return null;
              });
            })()}

            {/* Typing Indicator Bubble */}
            {sending && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 mt-1 shadow-sm animate-pulse">
                  <Bot className="w-5 h-5 text-resurva-dark" />
                </div>
                <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm p-4 md:p-5 shadow-sm max-w-[85%] md:max-w-[75%] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="text-[15px] font-medium text-slate-500">Mencari data dan merumuskan jawaban...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 md:p-6 bg-white border-t border-slate-100">
            <form onSubmit={handleSendSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2">
              <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-resurva-dark focus-within:ring-1 focus-within:ring-resurva-dark transition-all overflow-hidden flex items-end min-h-[56px] shadow-sm">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendSubmit();
                    }
                  }}
                  placeholder="Tanyakan performa toko, total penjualan, carbon saving, atau minta rekomendasi audit produk..."
                  className="w-full bg-transparent border-0 focus:outline-none resize-none py-4 px-5 text-[15px] max-h-32 text-slate-700 placeholder:text-slate-400"
                  rows={1}
                  style={{ minHeight: "56px" }}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || sending}
                className="h-14 w-14 shrink-0 rounded-2xl bg-resurva-dark hover:bg-resurva-dark-light text-white disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm cursor-pointer"
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
            <p className="text-center text-[11px] text-slate-400 mt-3 hidden md:block">
              RESURVA AI Assistant terhubung langsung ke database toko Anda untuk menyajikan data real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
