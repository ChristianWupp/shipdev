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

export interface ContractRole {
  name: string;
  address: string;
  description: string;
  /** What this contract controls or holds */
  impacts: ImpactCategory[];
  /** Is this where user funds sit? */
  holdsUserFunds: boolean;
  /** Is this where treasury sits? */
  holdsTreasury: boolean;
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  chain: string;
  website: string;
  description: string;
  tvl?: string;
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
  /** What gets compromised (the admin key, multisig, etc.) */
  vector: string;
  /** Which contracts are affected */
  affectedContracts: string[];
  /** What the attacker can do */
  capability: string;
  /** Who loses money and how */
  userImpact: string;
  /** What category of impact */
  impactCategories: ImpactCategory[];
  /** Is there a timelock or other delay? */
  hasTimelock: boolean;
  timelockDuration?: string;
}

export interface ProtocolReport {
  protocol: ProtocolDefinition;
  timestamp: number;
  overallRiskScore: number; // 0-100 (100 = safest)
  contracts: ContractScanResult[];
  attackScenarios: AttackScenario[];
  summary: {
    totalContracts: number;
    immutableContracts: number;
    upgradeableContracts: number;
    uniqueAdmins: number;
    userFundsAtRisk: boolean;
    treasuryAtRisk: boolean;
    hasTimelock: boolean;
  };
}
