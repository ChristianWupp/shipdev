"use client";

import type { UIMessage } from "ai";
import { useRef, useEffect } from "react";
import { routeMessage, AGENTS } from "@/lib/agents";

interface ChatPanelProps {
  messages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  status: "submitted" | "streaming" | "ready" | "error";
}

/** Resolve which agent badge to show before an assistant message */
function getAgentForMessage(messages: UIMessage[], index: number) {
  // Walk backwards from this assistant message to find the preceding user message
  for (let i = index - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      const text =
        msg.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("") ?? "";
      const route = routeMessage(text);
      return AGENTS[route.primary];
    }
  }
  return AGENTS.protocol; // default
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

  // Figure out which agent is active for the loading indicator
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const activeAgent = lastUserMsg
    ? getAgentForMessage(
        messages,
        messages.findIndex((m) => m === lastUserMsg) + 1,
      )
    : AGENTS.protocol;

  return (
    <div className="flex flex-col h-full bg-bg border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[13px] font-semibold text-text-primary">
          ShipDev AI
        </span>
        <span className="text-[11px] text-text-muted">
          {messages.filter((m) => m.role === "user").length > 0
            ? `${messages.filter((m) => m.role === "user").length} messages`
            : ""}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[13px] text-text-muted mb-2">
              Describe what you want to build.
            </div>
            <div className="text-[11px] text-text-muted leading-[1.6] max-w-[240px] mx-auto">
              &quot;Build me a DEX on HyperEVM with 0.3% fees&quot;
              <br />
              &quot;Lending protocol with revenue-sharing tokenomics&quot;
              <br />
              &quot;Fork Compound with custom liquidation thresholds&quot;
            </div>
          </div>
        )}

        {messages.map((message, index) => (
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
                {(() => {
                  const agent = getAgentForMessage(messages, index);
                  return (
                    <div
                      className="w-6 h-6 rounded-[6px] bg-surface-elevated border border-border flex items-center justify-center text-[9px] text-accent font-bold shrink-0 mt-[2px]"
                      title={agent.name}
                    >
                      {agent.badge}
                    </div>
                  );
                })()}
                <div className="bg-surface border border-border rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[13px] text-text-secondary max-w-[85%] leading-[1.6] break-words">
                  {message.parts
                    ?.filter((p) => p.type === "text")
                    .map((p, i) => {
                      if (p.type !== "text") return null;
                      // Strip all code blocks, config blocks, frontend blocks, and raw HTML
                      const cleaned = p.text
                        .replace(/```shipdev-config[\s\S]*?```/g, "")
                        .replace(/```shipdev-frontend[\s\S]*?```/g, "")
                        .replace(/```[\s\S]*?```/g, "")
                        .replace(/<div[\s\S]*?<\/div>/gi, "")
                        .replace(/<style[\s\S]*?<\/style>/gi, "")
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
            <div
              className="w-6 h-6 rounded-[6px] bg-accent/20 border border-accent/30 flex items-center justify-center text-[9px] text-accent font-bold shrink-0"
              title={activeAgent.name}
            >
              {activeAgent.badge}
            </div>
            <div className="bg-surface border border-border rounded-[12px] rounded-bl-[4px] px-3 py-2">
              <div className="flex items-center gap-2">
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
                <span className="text-[10px] text-text-muted">
                  {activeAgent.name}
                </span>
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
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }
            }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) onSend();
              }
            }}
            placeholder="Describe what you want to build..."
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none resize-none"
            style={{ lineHeight: "1.5", maxHeight: "120px", overflowY: "auto" }}
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
