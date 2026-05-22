"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, Bot } from "lucide-react";
import { useAskQuestionMutation } from "@/store/api/uploadApi";
import { UploadRecord } from "@/lib/uploadsStatus";

interface ChatAreaProps {
  isUploaded: boolean;
  activeFile?: UploadRecord;
}

export default function ChatArea({ isUploaded, activeFile }: ChatAreaProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "Hi! Upload a document and select it in the sidebar to start discussing." }
  ]);
  const [input, setInput] = useState("");
  const [askQuestion, { isLoading: isAiTyping }] = useAskQuestionMutation();

  // Watch for active file changes to reset or initialize chat thread
  const [lastFileId, setLastFileId] = useState<string | null>(null);

  if (activeFile && activeFile.id !== lastFileId) {
    setLastFileId(activeFile.id);
    setMessages([
      {
        role: "ai",
        content: `I have successfully loaded "${activeFile.originalName}". What would you like to discuss about this document?`,
      },
    ]);
  }

  const handleSend = async () => {
    if (!input.trim() || isAiTyping || !activeFile) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    try {
      const response = await askQuestion({
        question: userMessage,
        collectionId: activeFile.id,
      }).unwrap();

      if (response.success && response.answer) {
        setMessages((prev) => [...prev, { role: "ai", content: response.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "I encountered an issue searching this document. Please try again." },
        ]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsg = err?.data?.error || err?.message || "Failed to synthesize an answer.";
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Error: ${errMsg}. Make sure your local services (ChromaDB & Redis) are active and OpenRouter API key is configured.` },
      ]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors duration-200">
      {!isUploaded ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border shadow-xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Start Discussion</h1>
            <p className="text-text">
              Upload a file in the sidebar to start a discussion on it.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 bg-background border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Document Assistant</h2>
                <div className="flex items-center text-xs text-secondary-foreground truncate max-w-xs md:max-w-md">
                  {activeFile ? (
                    <span className="text-success font-medium flex items-center">
                      <span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5 animate-pulse"></span>
                      Chatting with: <span className="ml-1 underline truncate max-w-[120px] md:max-w-[200px]" title={activeFile.originalName}>{activeFile.originalName}</span>
                    </span>
                  ) : (
                    <span className="text-destructive font-medium flex items-center">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-1.5"></span>
                      No document selected in sidebar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-text border border-border rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Thinking / Loader Indicator */}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-text border border-border rounded-2xl rounded-bl-none p-4 max-w-[75%] shadow-sm flex items-center space-x-2 animate-pulse">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm font-medium">Searching document and generating answer...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={
                  !activeFile
                    ? "Select a processed file to start chatting..."
                    : isAiTyping
                    ? "Waiting for response..."
                    : `Ask a question about "${activeFile.originalName}"...`
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={!activeFile || isAiTyping}
                className="flex-1 p-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!activeFile || isAiTyping || !input.trim()}
                className="p-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiTyping ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
