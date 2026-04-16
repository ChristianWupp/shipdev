"use client";

import { useState } from "react";
import type { ProjectState } from "@/lib/project-state";
import type { ParameterDef } from "@/lib/protocols/types";
import type { ProtocolBase } from "@/lib/protocols/types";
import { protocolRegistry } from "@/lib/protocols";

interface ConfigPanelProps {
  project: ProjectState;
  onParameterChange: (key: string, value: string | number | boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const groupLabels: Record<string, string> = {
  core: "Core Parameters",
  token: "Governance Token",
  nest: "Nest Integration",
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

const groupOrder = ["core", "token", "nest", "admin"] as const;

function ConfigurationView({
  project,
  base,
  paramsByGroup,
  onParameterChange,
}: {
  project: ProjectState;
  base: ProtocolBase;
  paramsByGroup: Record<string, ParameterDef[]>;
  onParameterChange: (key: string, value: string | number | boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (group: string) =>
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Fork header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
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

        {/* Section nav pills */}
        <div className="flex gap-1 mb-4">
          {groupOrder.map(
            (group) =>
              paramsByGroup[group] && (
                <button
                  key={group}
                  onClick={() => {
                    // Uncollapse and scroll to section
                    setCollapsed((prev) => ({ ...prev, [group]: false }));
                    document
                      .getElementById(`config-${group}`)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3 py-[4px] text-[10px] uppercase tracking-[0.5px] text-text-muted bg-surface-elevated border border-border rounded-full hover:text-text-secondary hover:border-accent/20 transition-colors cursor-pointer"
                >
                  {groupLabels[group]}
                </button>
              ),
          )}
        </div>
      </div>

      {/* Collapsible parameter groups */}
      <div className="px-5 pb-5">
        {groupOrder.map(
          (group) =>
            paramsByGroup[group] && (
              <div
                key={group}
                id={`config-${group}`}
                className="mb-2 border border-border rounded-[8px] overflow-hidden"
              >
                <button
                  onClick={() => toggle(group)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  <span className="text-[11px] uppercase tracking-[1px] text-text-muted font-semibold">
                    {groupLabels[group]}
                  </span>
                  <span className="text-text-muted text-[12px]">
                    {collapsed[group] ? "+" : "−"}
                  </span>
                </button>
                {!collapsed[group] && (
                  <div className="px-4 pb-3">
                    {paramsByGroup[group].map((param) => (
                      <ParameterRow
                        key={param.key}
                        param={param}
                        value={project.parameters[param.key]}
                        onChange={(val) => onParameterChange(param.key, val)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ),
        )}

        {/* EOA warning */}
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
    </div>
  );
}

function ProtocolDNAView({ base, project }: { base: ProtocolBase; project: ProjectState }) {
  const changedParams = base.parameters.filter((p) => {
    const current = project.parameters[p.key];
    return current !== undefined && current !== p.default;
  });

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold mb-4">
        Fork Lineage
      </div>

      {/* Upstream info */}
      <div className="bg-surface border border-border rounded-[8px] p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[14px] text-text-primary font-semibold">
              {base.upstream}
            </div>
            <div className="text-[11px] text-text-muted mt-1">
              {base.description}
            </div>
          </div>
          <span className="text-[10px] text-text-muted bg-surface-elevated px-2 py-1 rounded">
            {base.version}
          </span>
        </div>
        {base.upstreamUrl && (
          <div className="text-[11px] font-mono text-accent">
            {base.upstreamUrl}
          </div>
        )}
      </div>

      {/* Contracts from this base */}
      <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-3 mt-6">
        Contracts ({base.contracts.length})
      </div>
      {base.contracts.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between py-2 border-b border-[#1a1a1e] text-[12px]"
        >
          <div>
            <span className="text-text-primary font-medium">{c.name}</span>
            <span className="text-text-muted ml-2">{c.description}</span>
          </div>
          <span
            className={
              c.auditStatus === "audited"
                ? "text-success text-[10px]"
                : c.auditStatus === "config-change"
                  ? "text-warning text-[10px]"
                  : "text-error text-[10px]"
            }
          >
            {c.auditStatus === "audited"
              ? "Base audited"
              : c.auditStatus === "config-change"
                ? "Config modified"
                : "Unaudited"}
          </span>
        </div>
      ))}

      {/* Changed parameters (diff from upstream defaults) */}
      <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-3 mt-6">
        Parameter Changes ({changedParams.length})
      </div>
      {changedParams.length === 0 ? (
        <div className="text-[12px] text-text-muted">
          All parameters at upstream defaults.
        </div>
      ) : (
        changedParams.map((p) => (
          <div
            key={p.key}
            className="flex items-center justify-between py-2 border-b border-[#1a1a1e] text-[12px]"
          >
            <span className="text-text-secondary">{p.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-text-muted font-mono line-through text-[10px]">
                {String(p.default)}
              </span>
              <span className="text-accent font-mono font-semibold">
                {String(project.parameters[p.key])}
              </span>
            </div>
          </div>
        ))
      )}

      {/* Audit history */}
      <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-3 mt-6">
        Audit History
      </div>
      {base.audits.map((a) => (
        <div
          key={a.auditor}
          className="flex items-center justify-between py-2 border-b border-[#1a1a1e] text-[12px]"
        >
          <span className="text-text-primary">{a.auditor}</span>
          <span className="text-text-muted">{a.date}</span>
        </div>
      ))}
    </div>
  );
}

function ContractsView({ base }: { base: ProtocolBase }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold mb-4">
        Contract Artifacts
      </div>
      <div className="space-y-2">
        {base.contracts.map((contract) => (
          <div
            key={contract.name}
            className="border border-border rounded-[8px] overflow-hidden"
          >
            <button
              onClick={() =>
                setExpanded(
                  expanded === contract.name ? null : contract.name,
                )
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-text-primary font-medium">
                  {contract.name}
                </span>
                <span
                  className={`text-[9px] px-2 py-[2px] rounded-full font-medium ${
                    contract.auditStatus === "audited"
                      ? "bg-[#34d39912] text-success"
                      : "bg-[#fbbf2412] text-warning"
                  }`}
                >
                  {contract.auditStatus === "audited"
                    ? "Audited"
                    : "Config change"}
                </span>
              </div>
              <span className="text-text-muted text-[11px]">
                {contract.abi.length} functions
              </span>
            </button>
            {expanded === contract.name && (
              <div className="px-4 pb-3 border-t border-border">
                <div className="text-[11px] text-text-muted mb-2 mt-2">
                  {contract.description}
                </div>
                <div className="bg-bg rounded-[6px] p-3 font-mono text-[10px] text-text-secondary leading-[1.8] max-h-[200px] overflow-y-auto">
                  {contract.abi.map((entry, i) => {
                    const e = entry as Record<string, unknown>;
                    const name = (e.name as string) || (e.type as string);
                    const inputs = (
                      e.inputs as { name: string; type: string }[]
                    )
                      ?.map((inp) => `${inp.type} ${inp.name}`)
                      .join(", ");
                    return (
                      <div key={i}>
                        <span className="text-accent">{e.type as string}</span>{" "}
                        {name && (
                          <span className="text-text-primary">{name}</span>
                        )}
                        {inputs && (
                          <span className="text-text-muted">({inputs})</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bytecode note */}
      <div className="mt-4 text-[11px] text-text-muted">
        Bytecode is compiled on deploy with your configured parameters via
        solc-js. No AI-generated Solidity.
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
          <div className="flex-1 overflow-y-auto p-5">
            <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold mb-4">
              Available Protocol Bases
            </div>
            <div className="space-y-2">
              {protocolRegistry.map((proto) => {
                const categoryLabel: Record<string, string> = {
                  dex: "DEX",
                  lending: "Lending",
                  perpetuals: "Perps",
                  staking: "Staking",
                  stableswap: "Stableswap",
                  vault: "Vault",
                  "prediction-market": "Prediction Market",
                };
                const truncated =
                  proto.description.length > 80
                    ? proto.description.slice(0, 80) + "..."
                    : proto.description;

                return (
                  <div
                    key={proto.id}
                    className="bg-surface border border-border rounded-[8px] p-4 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-text-primary font-medium">
                        {proto.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.5px] text-accent bg-accent/10 px-2 py-[2px] rounded-full font-medium">
                        {categoryLabel[proto.category] ?? proto.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted leading-[1.4] mb-3">
                      {truncated}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted">
                        {proto.audits.length} audit{proto.audits.length !== 1 ? "s" : ""}{" "}
                        <span className="text-success">
                          ({proto.audits.map((a) => a.auditor).join(", ")})
                        </span>
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Describe in chat to use this base →
                      </span>
                    </div>
                  </div>
                );
              })}
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
        <ConfigurationView
          project={project}
          base={base}
          paramsByGroup={paramsByGroup}
          onParameterChange={onParameterChange}
        />
      ) : activeTab === "dna" ? (
        <ProtocolDNAView base={base} project={project} />
      ) : activeTab === "contracts" ? (
        <ContractsView base={base} />
      ) : null}
    </div>
  );
}
