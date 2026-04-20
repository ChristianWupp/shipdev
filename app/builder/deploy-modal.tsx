"use client";

import { useState, useCallback } from "react";
import { DEPLOY_STEPS, type DeployStep } from "@/lib/deploy";
import { deployProtocol } from "@/lib/deploy";
import type { DeployedContract } from "@/lib/deploy";
import type { ProjectState } from "@/lib/project-state";

interface DeployModalProps {
  project: ProjectState;
  onClose: () => void;
}

export function DeployModal({ project, onClose }: DeployModalProps) {
  const [steps, setSteps] = useState<DeployStep[]>(
    DEPLOY_STEPS.map((s) => ({ ...s, status: "pending" })),
  );
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState<DeployedContract[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = useCallback(async () => {
    setDeploying(true);
    setError(null);

    try {
      const results = await deployProtocol(project.parameters, (stepId, status, data) => {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status,
                  address: data?.address ?? s.address,
                  txHash: data?.txHash ?? s.txHash,
                  error: data?.error ?? s.error,
                }
              : s,
          ),
        );
      });
      setDeployed(results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeploying(false);
    }
  }, [project.parameters]);

  const allDone = steps.every((s) => s.status === "done");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={!deploying ? onClose : undefined}
      />
      <div className="relative bg-surface border border-border rounded-[12px] w-full max-w-[560px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="text-[16px] font-bold text-text-primary">
              Deploy {project.projectName || "Protocol"} to HyperEVM Testnet
            </div>
            <div className="text-[12px] text-text-muted mt-1">
              {project.selectedBase?.name} fork &middot;{" "}
              {project.selectedBase?.audits.map((a) => a.auditor).join(" + ")}
            </div>
          </div>
          {!deploying && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary text-[18px] cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-1">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex gap-3 py-3 border-b border-[#1a1a1e] last:border-0"
            >
              <div className="shrink-0 mt-[2px]">
                {step.status === "done" ? (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-[11px] text-black font-bold">
                    &#x2713;
                  </div>
                ) : step.status === "in-progress" ? (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[11px] text-black font-bold animate-pulse">
                    {i + 1}
                  </div>
                ) : step.status === "error" ? (
                  <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-[11px] text-black font-bold">
                    !
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-[11px] text-text-muted">
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text-primary">
                  {step.label}
                </div>
                <div className="text-[11px] text-text-muted mt-[2px]">
                  {step.description}
                </div>
                {step.address && (
                  <div className="text-[11px] font-mono text-accent mt-1">
                    {step.address}
                  </div>
                )}
                {step.error && (
                  <div className="text-[11px] text-error mt-1 break-all">
                    {step.error.length > 150
                      ? step.error.slice(0, 150) + "..."
                      : step.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {allDone && deployed && (
          <div className="mx-6 mb-4 p-3 bg-[#00d4ff12] border border-[#00d4ff30] rounded-[8px]">
            <div className="text-[12px] text-accent font-semibold mb-1">
              Deployment complete
            </div>
            <div className="text-[11px] text-text-secondary">
              {deployed.length} contracts deployed to HyperEVM Testnet
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          {!deploying && !allDone && (
            <>
              <button
                onClick={onClose}
                className="bg-surface-elevated border border-border rounded-[6px] px-4 py-2 text-[12px] text-text-muted hover:text-text-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                className="bg-accent text-black rounded-[6px] px-5 py-2 text-[12px] font-semibold cursor-pointer hover:bg-accent-hover"
              >
                Deploy &rarr;
              </button>
            </>
          )}
          {allDone && (
            <button
              onClick={onClose}
              className="bg-accent text-black rounded-[6px] px-5 py-2 text-[12px] font-semibold cursor-pointer hover:bg-accent-hover"
            >
              Done
            </button>
          )}
          {error && !deploying && (
            <button
              onClick={handleDeploy}
              className="bg-accent text-black rounded-[6px] px-5 py-2 text-[12px] font-semibold cursor-pointer hover:bg-accent-hover"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
