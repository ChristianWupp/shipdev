export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type CheckStatus = "pass" | "fail" | "warn" | "unknown";

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  severity: Severity;
  detail: string;
}

export interface SecurityReport {
  address: string;
  chain: string;
  timestamp: number;
  overallScore: number; // 0-100
  isContract: boolean;
  checks: {
    multisig: CheckResult;
    privilegedRoles: CheckResult;
    proxy: CheckResult;
    upgradeability: CheckResult;
    auditHistory: CheckResult;
    killSwitch: CheckResult;
    sealCompliance: CheckResult;
  };
  metadata: {
    bytecodeSize: number;
    hasSourceCode: boolean;
    implementationAddress: string | null;
    adminAddress: string | null;
  };
}

export interface ScanRequest {
  address: string;
  chain?: string;
}
