import { JsonRpcProvider, getAddress } from "ethers";
import type {
  ProtocolDefinition,
  ProtocolReport,
  ContractScanResult,
  AttackScenario,
  ContractRole,
  ImpactCategory,
  Severity,
} from "./types";

// EIP-1967 storage slots
const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

// Function selectors
const PAUSE_SELECTORS = ["8456cb59", "3f4ba83a", "5c975abb"];
const OWNERSHIP_SELECTORS = ["f2fde38b", "715018a6"];
const ACCESS_CONTROL_SELECTORS = ["2f2ff15d", "d547741f", "91d14854"];
const TIMELOCK_SELECTORS = ["0e18b681", "61461954", "d45c4435"];

function bytecodeHas(bytecode: string, selector: string): boolean {
  return bytecode.includes(selector);
}

function slotToAddress(slotValue: string): string | null {
  if (!slotValue || slotValue === "0x" + "0".repeat(64)) return null;
  const addr = "0x" + slotValue.slice(26);
  if (addr === "0x" + "0".repeat(40)) return null;
  try {
    return getAddress(addr);
  } catch {
    return null;
  }
}

async function scanContract(
  contract: ContractRole,
  provider: JsonRpcProvider
): Promise<ContractScanResult> {
  const address = contract.address;
  const bytecode = await provider.getCode(address);
  const isContract = bytecode !== "0x" && bytecode.length > 2;

  if (!isContract) {
    return {
      address,
      name: contract.name,
      description: contract.description,
      impacts: contract.impacts,
      holdsUserFunds: contract.holdsUserFunds,
      holdsTreasury: contract.holdsTreasury,
      isContract: false,
      bytecodeSize: 0,
      isProxy: false,
      implementationAddress: null,
      adminAddress: null,
      adminIsContract: false,
      hasPauseability: false,
      hasOwnership: false,
      hasAccessControl: false,
      hasRenounced: false,
      riskLevel: "unknown",
    };
  }

  // Check proxy slots
  const [implSlotRaw, adminSlotRaw] = await Promise.all([
    provider.getStorage(address, IMPLEMENTATION_SLOT),
    provider.getStorage(address, ADMIN_SLOT),
  ]);

  const implAddress = slotToAddress(implSlotRaw);
  const adminAddress = slotToAddress(adminSlotRaw);
  const isProxy = implAddress !== null;

  // Get implementation bytecode for deeper analysis
  let analysisBytecode = bytecode;
  if (implAddress) {
    const implCode = await provider.getCode(implAddress);
    if (implCode.length > 2) analysisBytecode = implCode;
  }

  // Check admin type
  let adminIsContract = false;
  if (adminAddress) {
    const adminCode = await provider.getCode(adminAddress);
    adminIsContract = adminCode !== "0x" && adminCode.length > 2;
  }

  // Detect function patterns
  const bc = analysisBytecode.slice(2); // strip 0x
  const hasPauseability = PAUSE_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasOwnership = OWNERSHIP_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasAccessControl = ACCESS_CONTROL_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasRenounced = bytecodeHas(bc, "715018a6"); // renounceOwnership
  const hasTimelockPatterns = TIMELOCK_SELECTORS.some((s) => bytecodeHas(bc, s));

  // Classify risk level
  let riskLevel: ContractScanResult["riskLevel"];
  if (!isProxy && !hasOwnership && !hasAccessControl) {
    riskLevel = "immutable";
  } else if (isProxy && adminAddress && !adminIsContract) {
    riskLevel = "upgradeable-eoa";
  } else if (isProxy && adminIsContract) {
    riskLevel = hasTimelockPatterns ? "governed" : "upgradeable-governed";
  } else if (hasOwnership || hasAccessControl) {
    riskLevel = "governed";
  } else {
    riskLevel = "unknown";
  }

  return {
    address,
    name: contract.name,
    description: contract.description,
    impacts: contract.impacts,
    holdsUserFunds: contract.holdsUserFunds,
    holdsTreasury: contract.holdsTreasury,
    isContract: true,
    bytecodeSize: (bytecode.length - 2) / 2,
    isProxy,
    implementationAddress: implAddress,
    adminAddress,
    adminIsContract,
    hasPauseability,
    hasOwnership,
    hasAccessControl,
    hasRenounced,
    riskLevel,
  };
}

function generateAttackScenarios(
  protocol: ProtocolDefinition,
  scans: ContractScanResult[]
): AttackScenario[] {
  const scenarios: AttackScenario[] = [];
  let id = 0;

  // Group contracts by admin
  const adminGroups = new Map<string, ContractScanResult[]>();
  for (const scan of scans) {
    if (scan.adminAddress) {
      const key = scan.adminAddress;
      if (!adminGroups.has(key)) adminGroups.set(key, []);
      adminGroups.get(key)!.push(scan);
    }
  }

  // Scenario: for each admin, what happens if that key is compromised?
  for (const [adminAddr, controlled] of adminGroups) {
    const isEOA = controlled.some((c) => !c.adminIsContract);
    const affectedNames = controlled.map((c) => c.name);
    const allImpacts = new Set<ImpactCategory>();
    let userFundsAtRisk = false;
    let treasuryAtRisk = false;

    for (const c of controlled) {
      for (const impact of c.impacts) allImpacts.add(impact);
      if (c.holdsUserFunds) userFundsAtRisk = true;
      if (c.holdsTreasury) treasuryAtRisk = true;
    }

    const impactParts: string[] = [];
    if (userFundsAtRisk) impactParts.push("drain user deposits");
    if (treasuryAtRisk) impactParts.push("steal protocol treasury");
    if (allImpacts.has("token-logic")) impactParts.push("manipulate token behavior (mint, transfer rules)");
    if (allImpacts.has("protocol-halt")) impactParts.push("permanently halt the protocol");
    if (allImpacts.has("fee-extraction")) impactParts.push("redirect protocol fees");
    if (allImpacts.has("oracle")) impactParts.push("manipulate price feeds to trigger mass liquidations");

    if (impactParts.length === 0) continue;

    const severity: Severity = userFundsAtRisk
      ? "critical"
      : treasuryAtRisk
        ? "high"
        : "medium";

    scenarios.push({
      id: `attack-${++id}`,
      title: isEOA
        ? `Private key leak: admin EOA (${adminAddr.slice(0, 8)}...)`
        : `Multisig compromise: admin contract (${adminAddr.slice(0, 8)}...)`,
      severity,
      vector: isEOA
        ? `Single private key controls ${controlled.length} contract(s). Social engineering, malware, or insider threat could expose this key.`
        : `Multisig at ${adminAddr.slice(0, 10)}... controls ${controlled.length} contract(s). Requires compromising multiple signers.`,
      affectedContracts: affectedNames,
      capability: `Attacker could upgrade or reconfigure: ${affectedNames.join(", ")}`,
      userImpact: impactParts.length > 0
        ? `Attacker could: ${impactParts.join("; ")}`
        : "Limited direct impact on user funds",
      impactCategories: Array.from(allImpacts),
      hasTimelock: controlled.some((c) => c.riskLevel === "governed"),
      timelockDuration: controlled.some((c) => c.riskLevel === "governed")
        ? "Unknown (check governance docs)"
        : undefined,
    });
  }

  // Scenario: upgradeable proxy holding user funds
  for (const scan of scans) {
    if (scan.isProxy && scan.holdsUserFunds) {
      scenarios.push({
        id: `attack-${++id}`,
        title: `Proxy upgrade: ${scan.name} holds user funds`,
        severity: "critical",
        vector: `${scan.name} is an upgradeable proxy. The implementation can be swapped to a malicious contract that drains all deposited funds.`,
        affectedContracts: [scan.name],
        capability: `Replace implementation at ${scan.implementationAddress?.slice(0, 10)}... with a contract containing a sweep function`,
        userImpact: "All user funds deposited in this contract could be drained in a single transaction after upgrade",
        impactCategories: ["user-funds"],
        hasTimelock: scan.riskLevel === "governed",
        timelockDuration: scan.riskLevel === "governed" ? "Check governance" : undefined,
      });
    }
  }

  // Scenario: pausable contracts
  for (const scan of scans) {
    if (scan.hasPauseability && (scan.holdsUserFunds || scan.impacts.includes("user-funds"))) {
      scenarios.push({
        id: `attack-${++id}`,
        title: `Emergency pause: ${scan.name} can be frozen`,
        severity: "medium",
        vector: `${scan.name} has pause functionality. A privileged account can halt operations, preventing withdrawals.`,
        affectedContracts: [scan.name],
        capability: "Pause contract operations, blocking user withdrawals and interactions",
        userImpact: "Users cannot withdraw funds while paused. Funds are not stolen but are temporarily inaccessible.",
        impactCategories: ["protocol-halt"],
        hasTimelock: false,
      });
    }
  }

  // Sort by severity
  const severityOrder: Record<Severity, number> = {
    critical: 0, high: 1, medium: 2, low: 3, info: 4,
  };
  scenarios.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return scenarios;
}

export async function analyzeProtocol(
  protocol: ProtocolDefinition,
  rpcUrl: string
): Promise<ProtocolReport> {
  const provider = new JsonRpcProvider(rpcUrl);

  // Scan all contracts in parallel
  const scans = await Promise.all(
    protocol.contracts.map((c) => scanContract(c, provider))
  );

  // Generate attack scenarios
  const attackScenarios = generateAttackScenarios(protocol, scans);

  // Compute summary
  const immutableContracts = scans.filter((s) => s.riskLevel === "immutable").length;
  const upgradeableContracts = scans.filter((s) =>
    s.riskLevel === "upgradeable-eoa" || s.riskLevel === "upgradeable-governed"
  ).length;

  const uniqueAdmins = new Set(scans.filter((s) => s.adminAddress).map((s) => s.adminAddress));

  const userFundsAtRisk = scans.some(
    (s) => s.holdsUserFunds && s.riskLevel !== "immutable"
  );
  const treasuryAtRisk = scans.some(
    (s) => s.holdsTreasury && s.riskLevel !== "immutable"
  );
  const hasTimelock = scans.some((s) => s.riskLevel === "governed");

  // Overall risk score
  let score = 100;
  // Deductions
  if (scans.some((s) => s.riskLevel === "upgradeable-eoa")) score -= 30;
  if (userFundsAtRisk) score -= 20;
  if (treasuryAtRisk) score -= 10;
  if (!hasTimelock && upgradeableContracts > 0) score -= 15;
  if (upgradeableContracts > scans.length / 2) score -= 10;
  for (const scenario of attackScenarios) {
    if (scenario.severity === "critical") score -= 5;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    protocol,
    timestamp: Date.now(),
    overallRiskScore: score,
    contracts: scans,
    attackScenarios,
    summary: {
      totalContracts: scans.length,
      immutableContracts,
      upgradeableContracts,
      uniqueAdmins: uniqueAdmins.size,
      userFundsAtRisk,
      treasuryAtRisk,
      hasTimelock,
    },
  };
}
