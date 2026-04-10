export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type CheckStatus = "pass" | "fail" | "warn" | "unknown";

/** What a compromised contract could affect */
export type ImpactCategory =
  | "user-funds"      // Attacker can drain/redirect user deposits
  | "treasury"        // Attacker can drain protocol treasury
  | "token-logic"     // Attacker can change how the token works (mint, transfer rules)
  | "protocol-halt"   // Attacker can permanently halt the protocol
  | "fee-extraction"  // Attacker can redirect/inflate protocol fees
  | "governance"      // Attacker can take over governance
  | "oracle"          // Attacker can manipulate price feeds
  | "none";           // Immutable, no admin control

export interface SignerInfo {
  address: string;
  ensName: string | null;
  label: string | null; // Etherscan-style label if known
}

export interface MultisigInfo {
  type: "safe" | "multisig" | "unknown-contract" | "eoa";
  threshold: number | null;
  signerCount: number | null;
  signers: SignerInfo[];
}

export interface TimelockInfo {
  detected: boolean;
  minDelay: number | null; // seconds
  formatted: string | null; // "48 hours", "7 days"
}

export interface ContractRole {
  name: string;
  address: string;
  description: string;
  impacts: ImpactCategory[];
  holdsUserFunds: boolean;
  holdsTreasury: boolean;
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  chain: string;
  website: string;
  description: string;
  tvl?: string;
  defillamaSlug?: string; // For live TVL lookup
  contracts: ContractRole[];
}

export interface ContractScanResult {
  address: string;
  name: string;
  description: string;
  impacts: ImpactCategory[];
  holdsUserFunds: boolean;
  holdsTreasury: boolean;
  isContract: boolean;
  bytecodeSize: number;
  /** Proxy detection */
  isProxy: boolean;
  implementationAddress: string | null;
  adminAddress: string | null;
  adminIsContract: boolean;
  /** Admin details */
  adminInfo: MultisigInfo | null;
  timelockInfo: TimelockInfo | null;
  /** Function patterns detected */
  hasPauseability: boolean;
  hasOwnership: boolean;
  hasAccessControl: boolean;
  hasRenounced: boolean;
  /** Risk classification for this contract */
  riskLevel: "immutable" | "governed" | "upgradeable-governed" | "upgradeable-eoa" | "unknown";
}

export interface AttackScenario {
  id: string;
  title: string;
  severity: Severity;
  vector: string;
  affectedContracts: string[];
  capability: string;
  userImpact: string;
  impactCategories: ImpactCategory[];
  hasTimelock: boolean;
  timelockDuration?: string;
}

export interface SealCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface SealCompliance {
  score: number; // 0-100
  checks: SealCheck[];
}

export interface ProtocolReport {
  protocol: ProtocolDefinition;
  timestamp: number;
  overallRiskScore: number;
  liveTvl: number | null; // USD from DeFiLlama
  contracts: ContractScanResult[];
  attackScenarios: AttackScenario[];
  sealCompliance: SealCompliance;
  summary: {
    totalContracts: number;
    immutableContracts: number;
    upgradeableContracts: number;
    uniqueAdmins: number;
    userFundsAtRisk: boolean;
    treasuryAtRisk: boolean;
    hasTimelock: boolean;
    maxTimelockDelay: string | null;
  };
}
