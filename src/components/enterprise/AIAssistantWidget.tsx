"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Halo HQ! Saya Asisten AI. Ada yang bisa saya bantu terkait data performa cabang hari ini?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Ini adalah jawaban AI (mock). Fitur ini sedang dalam tahap pengembangan dan segera akan terhubung dengan database live." }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 h-[28rem] flex flex-col shadow-2xl border-slate-200 mb-4 rounded-xl overflow-hidden animate-in slide-in-from-bottom-4">
          <CardHeader className="bg-emerald-700 text-white p-3 flex flex-row items-center justify-between rounded-none shadow-sm z-10">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-3 bg-white border-t border-slate-200 shadow-sm z-10">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input 
                placeholder="Tanya sesuatu..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-sm bg-slate-50 focus-visible:ring-emerald-500 rounded-full"
              />
              <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-10 w-10 shrink-0 shadow-md transition-transform active:scale-95">
                <Send className="h-4 w-4 ml-[-2px]" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
