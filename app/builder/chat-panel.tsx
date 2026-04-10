"use client";

import type { UIMessage } from "ai";
import { useRef, useEffect } from "react";

interface ChatPanelProps {
  messages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

export function ChatPanel({
  messages,
  input,
  setInput,
  onSend,
  status,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full bg-bg border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[13px] font-semibold text-text-primary">
          AI Assistant
        </span>
        <span className="text-[11px] text-text-muted">
          {messages.filter((m) => m.role === "user").length} messages
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[13px] text-text-muted mb-2">
              Describe what you want to build.
            </div>
            <div className="text-[11px] text-text-muted">
              &quot;Build me a DEX on HyperEVM with 0.3% fees&quot;
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-accent text-black rounded-[12px] rounded-br-[4px] px-3 py-2 text-[13px] max-w-[85%] leading-[1.5] overflow-hidden break-words">
                  {message.parts
                    ?.filter((p) => p.type === "text")
                    .map((p, i) => (
                      <span key={i}>
                        {p.type === "text" ? p.text : null}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-[6px] bg-surface-elevated border border-border flex items-center justify-center text-[11px] text-accent font-bold shrink-0 mt-[2px]">
                  S
                </div>
                <div className="bg-surface border border-border rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[13px] text-text-secondary max-w-[85%] leading-[1.6] overflow-hidden break-words">
                  {message.parts
                    ?.filter((p) => p.type === "text")
                    .map((p, i) => {
                      if (p.type !== "text") return null;
                      // Strip shipdev-config, shipdev-frontend, and code blocks from display
                      const cleaned = p.text
                        .replace(/```shipdev-config[\s\S]*?```/g, "")
                        .replace(/```shipdev-frontend[\s\S]*?```/g, "")
                        .replace(/```(?:tsx?|jsx?|html)[\s\S]*?```/g, "")
                        .trim();
                      if (!cleaned) return null;
                      return (
                        <span
                          key={i}
                          className="whitespace-pre-wrap"
                          style={{ overflowWrap: "anywhere" }}
                          dangerouslySetInnerHTML={{
                            __html: cleaned
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="text-text-primary">$1</strong>',
                              )
                              .replace(
                                /•/g,
                                '<span class="text-accent">•</span>',
                              ),
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-surface-elevated border border-border flex items-center justify-center text-[11px] text-accent font-bold shrink-0">
              S
            </div>
            <div className="bg-surface border border-border rounded-[12px] rounded-bl-[4px] px-3 py-2">
              <div className="flex gap-1">
                <div className="w-[5px] h-[5px] bg-accent rounded-full animate-pulse" />
                <div
                  className="w-[5px] h-[5px] bg-accent rounded-full animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-[5px] h-[5px] bg-accent rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading) onSend();
          }}
          className="flex items-center gap-2 bg-surface-elevated border border-border rounded-[10px] px-3 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Adjust parameters, ask questions..."
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-accent text-black rounded-[6px] w-7 h-7 flex items-center justify-center text-[14px] font-bold disabled:opacity-30 cursor-pointer"
          >
            &uarr;
          </button>
        </form>
      </div>
    </div>
  );
}
