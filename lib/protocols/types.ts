/** Core types for the protocol library */

export type ProtocolCategory = "dex" | "lending" | "perpetuals" | "staking" | "stableswap" | "vault";

export type Chain =
  | "hyperevm-testnet"
  | "hyperevm"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "optimism";

export type AuditStatus = "audited" | "config-change" | "unaudited";

export interface AuditReference {
  auditor: string;
  date: string;
  reportUrl?: string;
}

export interface ParameterDef {
  key: string;
  label: string;
  description: string;
  type: "number" | "percentage" | "string" | "boolean" | "address" | "select";
  default: string | number | boolean;
  options?: string[]; // for select type
  min?: number;
  max?: number;
  group: "core" | "token" | "admin" | "nest";
}

export interface ContractArtifact {
  name: string;
  description: string;
  auditStatus: AuditStatus;
  /** ABI as JSON-compatible array */
  abi: readonly Record<string, unknown>[];
  /** Compiled bytecode hex string */
  bytecode: string;
}

export interface PrivilegedRole {
  role: string;
  description: string;
  defaultHolder: "owner" | "multisig" | "none" | "timelock";
  riskLevel: "low" | "medium" | "high";
  capabilities: string[];
}

export interface EmergencyControl {
  name: string;
  description: string;
  enabled: boolean;
  controlledBy: string;
}

export interface SecurityProfile {
  baseScore: number;
  privilegedRoles: PrivilegedRole[];
  emergencyControls: EmergencyControl[];
  upgradeability: "immutable" | "proxy" | "proxy-with-timelock";
  upgradeDescription: string;
}

export interface ProtocolBase {
  id: string;
  name: string;
  version: string;
  description: string;
  category: ProtocolCategory;
  supportedChains: Chain[];
  audits: AuditReference[];
  parameters: ParameterDef[];
  contracts: ContractArtifact[];
  security: SecurityProfile;
  /** Source protocol this is forked from */
  upstream: string;
  /** URL to original source */
  upstreamUrl: string;
}
