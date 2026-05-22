"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/providers/useAuth";
import { useAskQuestionMutation } from "@/store/api/chatApi";

interface ChatAreaProps {
  isUploaded: boolean;
}

export default function ChatArea({ isUploaded }: ChatAreaProps) {
  const auth = useAuth();
  const userId = auth?.user?.id || "unknown-user";
  const [askQuestion, { isLoading: isResponding }] = useAskQuestionMutation();

  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "Let's discuss what you want? about this document" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || isResponding) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    try {
      const response = await askQuestion({ question: userMessage, userId }).unwrap();
      if (response.success && response.answer) {
        setMessages((prev) => [...prev, { role: "ai", content: response.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I couldn't get a proper answer from the document." }]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error: Failed to fetch a response from the document. Please try again." }
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
              Upload the file to start discussion on it
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 bg-background border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                AI
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Document Assistant</h2>
                <div className="flex items-center text-xs text-success">
                  <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
                  Active
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
                  className={`max-w-[75%] p-4 rounded-2xl ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-text border border-border rounded-bl-none shadow-sm"
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isResponding && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-4 rounded-2xl bg-secondary text-text border border-border rounded-bl-none shadow-sm flex items-center space-x-2">
                  <div className="flex space-x-1.5 py-1 px-0.5">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs text-secondary-foreground font-medium select-none ml-1">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask something about the document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 p-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl transition-colors"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
