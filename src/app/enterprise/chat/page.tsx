"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, MessageSquare, Plus } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

const mockSessions: ChatSession[] = [
  { id: "s1", title: "Analisa performa mitra bulan ini", date: "Hari ini" },
  { id: "s2", title: "Rekomendasi optimasi limbah cabang Malang", date: "Hari ini" },
  { id: "s3", title: "Draft laporan SDG 2025", date: "Kemarin" },
  { id: "s4", title: "Cara menambahkan admin baru", date: "Kemarin" },
  { id: "s5", title: "Tren penjualan kategori Bakery", date: "7 Hari Lalu" },
];

export default function ChatAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "ai", content: "Halo! Saya adalah RESURVA AI Assistant. Ada yang bisa saya bantu hari ini terkait performa kemitraan atau laporan keberlanjutan?", timestamp: "09:00" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Terima kasih. Berdasarkan data yang saya analisis, saat ini performa mitra terpantau stabil. Ada pertanyaan spesifik yang ingin Anda bahas?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] w-full overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Sidebar History (Left Pane) */}
      <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-slate-200">
          <Button className="w-full bg-resurva-dark hover:bg-resurva-dark-light text-white flex items-center gap-2 justify-start h-11 px-4 rounded-xl transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Percakapan Baru</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Hari ini</h4>
            {mockSessions.filter(s => s.date === "Hari ini").map(session => (
              <button key={session.id} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-3 group text-slate-700">
                <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                <span className="text-sm truncate flex-1">{session.title}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Kemarin</h4>
            {mockSessions.filter(s => s.date === "Kemarin").map(session => (
              <button key={session.id} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-3 group text-slate-700">
                <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                <span className="text-sm truncate flex-1">{session.title}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">7 Hari Lalu</h4>
            {mockSessions.filter(s => s.date === "7 Hari Lalu").map(session => (
              <button key={session.id} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-3 group text-slate-700">
                <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700" />
                <span className="text-sm truncate flex-1">{session.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area (Right Pane) */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="font-bold text-slate-800">RESURVA AI</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 mt-1">
                  <Bot className="w-5 h-5 text-emerald-700" />
                </div>
              )}
              
              <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"} p-4 md:p-5 shadow-sm`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[11px] mt-2 block ${msg.role === "user" ? "text-slate-400 text-right" : "text-slate-500"}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 mt-1">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
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
                placeholder="Tanyakan sesuatu ke RESURVA AI..."
                className="w-full bg-transparent border-0 focus:outline-none resize-none py-4 px-5 text-[15px] max-h-32 text-slate-700 placeholder:text-slate-400"
                rows={1}
                style={{ minHeight: "56px" }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim()}
              className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5 ml-1" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-3 hidden md:block">
            AI dapat membuat kesalahan. Harap periksa kembali informasi penting terkait laporan SDG dan data Mitra.
          </p>
        </div>
      </div>
    </div>
  );
}
