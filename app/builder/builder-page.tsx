"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { useState, useCallback } from "react";
import { ChatPanel } from "./chat-panel";
import { ConfigPanel } from "./config-panel";
import { SecurityPanel } from "./security-panel";
import { DeployModal } from "./deploy-modal";
import { WalletButton } from "../wallet-button";
import {
  type ProjectState,
  initialProjectState,
  parseConfigFromMessage,
  parseFrontendFromMessage,
} from "@/lib/project-state";
import { getProtocol } from "@/lib/protocols";

export function BuilderPage() {
  const [project, setProject] = useState<ProjectState>(initialProjectState);
  const [input, setInput] = useState("");
  const [showDeploy, setShowDeploy] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("configuration");

  const { messages, sendMessage, status } = useChat({
    onFinish: ({ message }) => {
      const text = message.parts
        ?.filter((p) => p.type === "text")
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("");
      if (!text) return;

      // Parse frontend preview code
      const frontendCode = parseFrontendFromMessage(text);
      if (frontendCode) {
        setProject((prev) => ({ ...prev, frontendCode }));
        setActiveTab("frontend");
      }

      const config = parseConfigFromMessage(text);
      if (!config) return;

      if (config.action === "select-base" && config.baseId) {
        const base = getProtocol(config.baseId);
        if (base) {
          const defaults: Record<string, string | number | boolean> = {};
          for (const param of base.parameters) {
            defaults[param.key] = param.default;
          }
          setProject((prev) => ({
            projectName: (config.projectName as string) || "Untitled",
            selectedBase: base,
            parameters: {
              ...defaults,
              ...(config.parameters as Record<string, string | number | boolean>),
            },
            frontendCode: prev.frontendCode,
          }));
        }
      } else if (config.action === "update-params" && config.parameters) {
        setProject((prev) => ({
          ...prev,
          parameters: {
            ...prev.parameters,
            ...(config.parameters as Record<string, string | number | boolean>),
          },
        }));
      } else if (config.action === "deploy") {
        setShowDeploy(true);
      }
    },
  });

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }, [input, sendMessage]);

  const handleParameterChange = useCallback(
    (key: string, value: string | number | boolean) => {
      setProject((prev) => ({
        ...prev,
        parameters: { ...prev.parameters, [key]: value },
      }));
    },
    [],
  );

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Topbar */}
      <nav className="flex items-center justify-between px-4 py-[10px] border-b border-border bg-bg">
        <Link href="/" className="text-[16px] font-bold tracking-[-0.5px]">
          ship<span className="text-accent">dev</span>
        </Link>
        <div className="flex items-center gap-2">
          {project.projectName && (
            <div className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[5px] text-[12px] text-text-primary font-semibold">
              {project.projectName}
            </div>
          )}
          <div className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[5px] text-[12px] text-text-primary font-semibold flex items-center gap-[5px]">
            <span className="w-[6px] h-[6px] rounded-full bg-success" />
            HyperEVM Testnet
          </div>
          <WalletButton />
          <button
            onClick={() => setShowDeploy(true)}
            disabled={!project.selectedBase}
            className="bg-accent text-black rounded-[6px] px-4 py-[5px] text-[12px] font-semibold cursor-pointer hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Deploy to Testnet
          </button>
        </div>
      </nav>

      {/* Workspace */}
      <div className="flex h-[calc(100vh-49px)]">
        <div className="w-[340px] shrink-0">
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            status={status}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ConfigPanel
            project={project}
            onParameterChange={handleParameterChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        <div className="w-[280px] shrink-0">
          <SecurityPanel project={project} />
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeploy && project.selectedBase && (
        <DeployModal
          project={project}
          onClose={() => setShowDeploy(false)}
        />
      )}
    </div>
  );
}
