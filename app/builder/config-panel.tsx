"use client";

import type { ProjectState } from "@/lib/project-state";
import type { ParameterDef } from "@/lib/protocols/types";

interface ConfigPanelProps {
  project: ProjectState;
  onParameterChange: (key: string, value: string | number | boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const groupLabels: Record<string, string> = {
  core: "Core Parameters",
  token: "Governance Token",
  admin: "Admin & Security",
};

function ParameterRow({
  param,
  value,
  onChange,
}: {
  param: ParameterDef;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}) {
  const currentValue = value ?? param.default;

  return (
    <div className="flex justify-between items-center py-[10px] border-b border-[#1a1a1e]">
      <div>
        <div className="text-[13px] text-text-secondary">{param.label}</div>
        <div className="text-[10px] text-text-muted mt-[2px]">
          {param.description}
        </div>
      </div>
      <div className="shrink-0 ml-4">
        {param.type === "boolean" ? (
          <button
            onClick={() => onChange(!currentValue)}
            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
              currentValue ? "bg-accent" : "bg-surface-elevated border border-border"
            }`}
          >
            <div
              className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform ${
                currentValue ? "right-[2px]" : "left-[2px]"
              }`}
            />
          </button>
        ) : param.type === "select" ? (
          <select
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[6px] text-[13px] text-text-primary appearance-none cursor-pointer outline-none"
          >
            {param.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : param.type === "address" ? (
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0x..."
            className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[6px] text-[13px] text-text-primary font-mono w-[160px] text-right outline-none focus:border-accent"
          />
        ) : param.type === "percentage" ? (
          <input
            type="text"
            value={`${currentValue}%`}
            onChange={(e) => {
              const num = parseFloat(e.target.value.replace("%", ""));
              if (!isNaN(num)) onChange(num);
            }}
            className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[6px] text-[13px] text-accent font-mono font-semibold w-[120px] text-right outline-none focus:border-accent"
          />
        ) : param.type === "number" ? (
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => {
              const num = parseFloat(e.target.value.replace(/,/g, ""));
              if (!isNaN(num)) onChange(num);
            }}
            className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[6px] text-[13px] text-accent font-mono font-semibold w-[120px] text-right outline-none focus:border-accent"
          />
        ) : (
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[6px] text-[13px] text-text-primary w-[120px] text-right outline-none focus:border-accent"
          />
        )}
      </div>
    </div>
  );
}

const tabs = [
  { id: "configuration", label: "Configuration" },
  { id: "dna", label: "Protocol DNA" },
  { id: "frontend", label: "Frontend" },
  { id: "contracts", label: "Contracts" },
];

function TabBar({
  activeTab,
  onTabChange,
  hasFrontend,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasFrontend: boolean;
}) {
  return (
    <div className="flex border-b border-border bg-bg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-[10px] text-[12px] cursor-pointer transition-colors ${
            activeTab === tab.id
              ? "text-text-primary border-b-2 border-accent font-medium"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {tab.label}
          {tab.id === "frontend" && hasFrontend && (
            <span className="ml-1.5 w-[5px] h-[5px] rounded-full bg-accent inline-block" />
          )}
        </button>
      ))}
    </div>
  );
}

function FrontendPreview({ code }: { code: string | null }) {
  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[15px] text-text-muted mb-2">
            No frontend preview yet
          </div>
          <div className="text-[12px] text-text-muted max-w-[300px]">
            Ask the AI to generate a frontend preview, or say &quot;show me what it looks like&quot; after configuring your protocol.
          </div>
        </div>
      </div>
    );
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#000;color:#fafafa;font-family:system-ui,-apple-system,sans-serif;}</style></head><body>${code}</body></html>`;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border">
        <span className="text-[10px] uppercase tracking-[1px] text-accent font-semibold">
          Live Preview
        </span>
        <span className="text-[10px] text-text-muted">
          Generated from your configuration
        </span>
      </div>
      <div className="flex-1 p-4">
        <div className="w-full h-full border border-border rounded-[10px] overflow-hidden">
          <iframe
            srcDoc={html}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Frontend preview"
          />
        </div>
      </div>
    </div>
  );
}

export function ConfigPanel({ project, onParameterChange, activeTab, onTabChange }: ConfigPanelProps) {
  const base = project.selectedBase;

  if (!base) {
    return (
      <div className="flex flex-col h-full">
        <TabBar activeTab={activeTab} onTabChange={onTabChange} hasFrontend={!!project.frontendCode} />
        {activeTab === "frontend" ? (
          <FrontendPreview code={project.frontendCode} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[15px] text-text-muted mb-2">
                No protocol selected
              </div>
              <div className="text-[12px] text-text-muted">
                Describe what you want in the chat to get started.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const paramsByGroup = base.parameters.reduce(
    (acc, param) => {
      if (!acc[param.group]) acc[param.group] = [];
      acc[param.group].push(param);
      return acc;
    },
    {} as Record<string, ParameterDef[]>,
  );

  return (
    <div className="flex flex-col h-full">
      <TabBar activeTab={activeTab} onTabChange={onTabChange} hasFrontend={!!project.frontendCode} />

      {activeTab === "frontend" ? (
        <FrontendPreview code={project.frontendCode} />
      ) : activeTab === "configuration" ? (
        <div className="flex-1 overflow-y-auto p-5">
          {/* Fork header */}
          <div className="flex items-center gap-3 mb-5">
            <div>
              <div className="text-[18px] font-bold text-text-primary">
                {project.projectName || "Untitled"}{" "}
                <span className="text-[13px] text-text-muted font-normal">
                  on HyperEVM
                </span>
              </div>
              <div className="text-[12px] text-text-muted mt-1">
                Based on {base.name}{" "}
                <span className="inline-flex items-center gap-1 bg-[#34d39918] text-success px-2 py-[2px] rounded-full text-[10px] font-medium ml-1">
                  &#x2713; Audited by{" "}
                  {base.audits.map((a) => a.auditor).join(" + ")}
                </span>
              </div>
            </div>
          </div>

          {/* Parameter groups */}
          {["core", "token", "admin"].map(
            (group) =>
              paramsByGroup[group] && (
                <div key={group} className="mb-6">
                  <div className="text-[11px] uppercase tracking-[1px] text-text-muted font-semibold mb-2">
                    {groupLabels[group]}
                  </div>
                  {paramsByGroup[group].map((param) => (
                    <ParameterRow
                      key={param.key}
                      param={param}
                      value={project.parameters[param.key]}
                      onChange={(val) => onParameterChange(param.key, val)}
                    />
                  ))}
                </div>
              ),
          )}

          {/* AI warning for EOA */}
          {project.parameters.owner &&
            typeof project.parameters.owner === "string" &&
            project.parameters.owner.startsWith("0x") &&
            project.parameters.upgradeability !== "proxy-with-timelock" && (
              <div className="bg-[#fbbf2410] border border-[#fbbf2430] rounded-[8px] p-3 mt-2">
                <div className="text-[12px] text-warning font-semibold mb-1">
                  Recommendation
                </div>
                <div className="text-[12px] text-text-secondary leading-[1.5]">
                  Before mainnet: change Owner to a multi-sig (3/5 recommended).
                  Single wallet ownership is the #1 attack vector for protocol
                  exploits.
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[15px] text-text-muted mb-2">
              Coming soon
            </div>
            <div className="text-[12px] text-text-muted">
              {activeTab === "dna" ? "Protocol DNA analysis" : "Contract artifacts"} will appear here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
