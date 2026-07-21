"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, MessageSquare, Plus, Wrench, ChevronDown, ChevronUp, Loader2, Sparkles, TrendingUp, Leaf, Trophy } from "lucide-react";
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
  title: string | null;
  created_at: string;
  updated_at: string;
  business_id?: string | null;
}

// Custom function to parse message markdown and post-process mermaid code blocks
const parseMessageContent = (content: string) => {
  if (!content) return "";
  
  let parsedHtml = marked.parse(content) as string;
  
  const parser = new RegExp('<pre><code class="(?:language|lang)-mermaid">([\\s\\S]*?)<\\/code><\\/pre>', 'g');
  parsedHtml = parsedHtml.replace(parser, (_, p1) => {
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
          <Wrench className="w-3.5 h-3.5 text-[#0F3D2E]" />
          <span className="text-[11px]">Tool Call: <span className="font-mono text-[#0F3D2E] bg-emerald-50 px-1.5 py-0.5 rounded">{toolCall.tool_name}</span></span>
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
    <div className="mt-2 ml-12">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none group"
      >
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
          isOpen ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50 group-hover:border-slate-400"
        }`}>
          {isOpen 
            ? <ChevronUp className="w-2 h-2 text-[#0F3D2E]" />
            : <ChevronDown className="w-2 h-2 text-slate-400" />
          }
        </div>
        <span className={`transition-colors ${isOpen ? "text-[#0F3D2E] font-medium" : ""}`}>
          {isOpen ? "Sembunyikan" : "Lihat"} proses berpikir
          {totalTools > 0 && (
            <span className="ml-1.5 bg-emerald-50 text-[#0F3D2E] border border-emerald-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              {totalTools} tool call{totalTools > 1 ? "s" : ""}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 backdrop-blur-sm overflow-hidden shadow-sm">
          {thinkingMsgs.map((msg, idx) => (
            <div key={msg.id} className={`p-3 space-y-2 ${idx > 0 ? "border-t border-slate-200/60" : ""}`}>
              {msg.content && (
                <p className="text-[11px] italic text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              )}
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

export default function EnterpriseChatPage() {
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  const [mermaidInitialized, setMermaidInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Initialize mermaid in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("mermaid").then((m) => {
        m.default.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
        });
        setMermaidInitialized(true);
      }).catch(err => console.warn("Failed to load mermaid:", err));
    }
  }, []);

  // Run mermaid compiler when messages or mermaid init state updates
  useEffect(() => {
    if (mermaidInitialized && typeof window !== "undefined") {
      setTimeout(() => {
        import("mermaid").then((m) => {
          m.default.run({
            querySelector: ".mermaid-diagram",
          }).catch(err => console.warn("Mermaid execution error:", err));
        });
      }, 200);
    }
  }, [messages, mermaidInitialized]);

  // Load Conversations List
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await apiClient.get<ChatSession[]>("/chat/conversations");
      setConversations(data || []);
      if (data && data.length > 0 && !activeConversationId) {
        // Find first valid non-empty conversation
        const valid = data.find(c => c.title !== null && c.title !== "" && c.title !== "New Conversation");
        if (valid) {
          setActiveConversationId(valid.id);
        }
      }
    } catch (err) {
      console.warn("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter valid conversations for sidebar display
  const validConversations = useMemo(() => {
    return conversations.filter(
      c => c.title !== null && c.title !== "" && c.title !== "New Conversation"
    );
  }, [conversations]);

  // Load Messages for Active Conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const rawMsgs = await apiClient.get<any[]>(`/chat/conversations/${activeConversationId}/messages`);
        const formatted: ChatMessage[] = (rawMsgs || [])
          .filter((m: any) => m.role !== "system")
          .map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content || "",
            timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tool_calls: m.tool_calls || []
          }));
        setMessages(formatted);
      } catch (err) {
        console.warn("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [activeConversationId]);

  // Start New Conversation (UX matching Merchant: if active chat is already blank, do NOT create duplicate)
  const handleNewChat = () => {
    if (messages.length === 0 && !activeConversationId) {
      return; // already on blank chat
    }
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
  };

  // Send Message
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || sending) return;

    setSending(true);

    let targetConvId = activeConversationId;
    
    // Lazy create conversation on first message send
    if (!targetConvId) {
      try {
        const newConv = await apiClient.post<ChatSession>("/chat/conversations", {
          title: null
        });
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
      } catch (err) {
        alert("Gagal membuat sesi percakapan baru");
        setSending(false);
        return;
      }
    }

    const userMsgObj: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsgObj]);
    if (!customPrompt) setInput("");

    try {
      const updatedRawMsgs = await apiClient.post<any[]>(
        `/chat/conversations/${targetConvId}/messages?user_message=${encodeURIComponent(textToSend)}`,
        {}
      );

      const formatted: ChatMessage[] = (updatedRawMsgs || [])
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content || "",
          timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tool_calls: m.tool_calls || []
        }));

      setMessages(formatted);
      
      // Update sidebar list title
      const updatedList = await apiClient.get<ChatSession[]>("/chat/conversations");
      setConversations(updatedList);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Maaf, terjadi kesalahan: ${err.message || "Gagal mendapatkan respon AI."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // Group messages into conversational blocks (separate intermediate thinking steps from final answer)
  const renderMessageBlocks = useMemo(() => {
    const blocks: Array<{
      id: string;
      role: string;
      finalMsg?: ChatMessage;
      thinkingMsgs: ChatMessage[];
    }> = [];

    let currentThinking: ChatMessage[] = [];

    messages.forEach((msg) => {
      if (msg.role === "user") {
        if (currentThinking.length > 0) {
          blocks.push({
            id: currentThinking[0].id,
            role: "assistant",
            thinkingMsgs: currentThinking,
          });
          currentThinking = [];
        }
        blocks.push({
          id: msg.id,
          role: "user",
          finalMsg: msg,
          thinkingMsgs: [],
        });
      } else {
        const isToolOnly = msg.tool_calls && msg.tool_calls.length > 0;
        const isIntermediate = isToolOnly || (msg.content && msg.content.length < 100 && !msg.content.includes("###") && !msg.content.includes("\n"));

        if (isIntermediate && messages[messages.length - 1].id !== msg.id) {
          currentThinking.push(msg);
        } else {
          blocks.push({
            id: msg.id,
            role: "assistant",
            finalMsg: msg,
            thinkingMsgs: currentThinking,
          });
          currentThinking = [];
        }
      }
    });

    if (currentThinking.length > 0) {
      blocks.push({
        id: currentThinking[0].id,
        role: "assistant",
        thinkingMsgs: currentThinking,
      });
    }

    return blocks;
  }, [messages]);

  const quickPrompts = [
    {
      icon: TrendingUp,
      title: "Perbandingan Omset & Emisi",
      prompt: "Bandingkan omset dan akumulasi reduksi karbon CO2e seluruh cabang bisnis saya bulan ini."
    },
    {
      icon: Leaf,
      title: "Ringkasan Laporan SDG",
      prompt: "Sajikan ringkasan pencapaian dampak lingkungan dan keberlanjutan SDG perusahaan."
    },
    {
      icon: Trophy,
      title: "Cabang Performa Terbaik",
      prompt: "Cabang manakah yang memiliki performa terbaik dan jumlah penyelamatan pangan terbanyak?"
    },
    {
      icon: Sparkles,
      title: "Rekomendasi Strategis HQ",
      prompt: "Berikan rekomendasi strategis untuk meningkatkan efisiensi stok dan mengurangi limbah kadaluarsa di semua cabang."
    }
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] w-full overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Sidebar History (Left Pane) */}
      <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-slate-200">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-[#0F3D2E] hover:bg-[#1A5C44] text-white flex items-center gap-2 justify-start h-11 px-4 rounded-xl transition-colors cursor-pointer font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Percakapan Baru</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center p-6 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : validConversations.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8">Belum ada riwayat percakapan.</div>
          ) : (
            validConversations.map(session => {
              const isActive = session.id === activeConversationId;
              return (
                <button 
                  key={session.id} 
                  onClick={() => setActiveConversationId(session.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-3 group text-slate-700 cursor-pointer ${
                    isActive ? "bg-slate-200/80 font-bold text-[#0F3D2E]" : "hover:bg-slate-200/50"
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0F3D2E]" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="text-sm truncate flex-1">{session.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area (Right Pane) */}
      <div className="flex-1 flex flex-col bg-white relative min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#0F3D2E]" />
            </div>
            <span className="font-bold text-slate-800">RESURVA Enterprise AI</span>
          </div>
          <Button onClick={handleNewChat} variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat pesan...
            </div>
          ) : messages.length === 0 ? (
            /* Welcome / Quick Prompts Empty State */
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto space-y-8 my-auto px-4">
              <div className="w-16 h-16 rounded-3xl bg-[#EDD099]/30 border border-[#EDD099] flex items-center justify-center text-[#0F3D2E] shadow-sm">
                <Bot className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">RESURVA Enterprise AI Assistant</h3>
                <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                  Asisten kecerdasan buatan tingkat makro untuk menganalisis performa kemitraan, perbandingan omset antar cabang, reduksi karbon CO₂e, dan keberlanjutan SDG.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {quickPrompts.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(qp.prompt)}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0F3D2E] mb-1">
                        <Icon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span>{qp.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{qp.prompt}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            renderMessageBlocks.map((block) => {
              if (block.role === "user" && block.finalMsg) {
                return (
                  <div key={block.id} className="flex gap-4 justify-end">
                    <div className="max-w-[85%] md:max-w-[75%] bg-slate-900 text-white rounded-2xl rounded-tr-sm p-4 md:p-5 shadow-sm">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{block.finalMsg.content}</p>
                      <span className="text-[11px] mt-2 block text-slate-400 text-right">
                        {block.finalMsg.timestamp}
                      </span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 mt-1">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={block.id} className="space-y-2">
                  {block.finalMsg && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 mt-1">
                        <Bot className="w-5 h-5 text-[#0F3D2E]" />
                      </div>
                      <div className="max-w-[85%] md:max-w-[75%] bg-slate-50 border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-sm p-4 md:p-6 shadow-sm">
                        <div 
                          className="prose prose-slate max-w-none text-[15px] leading-relaxed markdown-content"
                          dangerouslySetInnerHTML={{ __html: parseMessageContent(block.finalMsg.content) }}
                        />

                        <span className="text-[11px] mt-3 block text-slate-400">
                          {block.finalMsg.timestamp}
                        </span>
                      </div>
                    </div>
                  )}

                  {block.thinkingMsgs.length > 0 && (
                    <ThinkingDropdown thinkingMsgs={block.thinkingMsgs} />
                  )}
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex gap-4 justify-start items-center text-slate-400 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <Bot className="w-5 h-5 text-[#0F3D2E]" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F3D2E]" />
                <span>RESURVA Enterprise AI sedang menganalisis data makro seluruh cabang...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-4xl mx-auto relative flex items-end gap-2">
            <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all overflow-hidden flex items-end min-h-[56px] shadow-sm">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tanyakan sesuatu ke RESURVA Enterprise AI (misal: analisis omset & reduksi emisi seluruh cabang)..."
                className="w-full bg-transparent border-0 focus:outline-none resize-none py-4 px-5 text-[15px] max-h-32 text-slate-700 placeholder:text-slate-400"
                rows={1}
                style={{ minHeight: "56px" }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim() || sending}
              className="h-14 w-14 shrink-0 rounded-2xl bg-[#0F3D2E] hover:bg-[#1A5C44] text-white disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-3 hidden md:block">
            AI dapat membuat kesalahan. Harap periksa kembali informasi penting terkait laporan SDG dan data Mitra.
          </p>
        </div>
      </div>

      <style jsx global>{`
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
          background: #0F3D2E;
          color: #ffffff;
          font-weight: 700;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 2px solid #0b2e22;
        }

        .markdown-content td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .markdown-content tr:hover {
          background-color: #f8fafc;
        }
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .mermaid-diagram {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: center;
        }
        .mermaid-diagram svg {
          max-width: 100%;
          height: auto;
          margin: 0 auto;
        }
      `}</style>

    </div>
  );
}
