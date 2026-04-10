import { JsonRpcProvider, Contract, getAddress } from "ethers";
import type {
  ProtocolDefinition,
  ProtocolReport,
  ContractScanResult,
  AttackScenario,
  ContractRole,
  ImpactCategory,
  Severity,
  MultisigInfo,
  SignerInfo,
  TimelockInfo,
  SealCompliance,
  SealCheck,
  CheckStatus,
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

// Gnosis Safe ABI (minimal)
const SAFE_ABI = [
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
];

// Timelock ABI (OpenZeppelin style)
const TIMELOCK_ABI = [
  "function getMinDelay() view returns (uint256)",
  "function delay() view returns (uint256)",
];

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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  return `${Math.round(seconds / 86400)} days`;
}

/** Resolve ENS name for an address */
async function resolveEns(
  address: string,
  provider: JsonRpcProvider
): Promise<string | null> {
  try {
    return await provider.lookupAddress(address);
  } catch {
    return null;
  }
}

/** Query Gnosis Safe for owners and threshold */
async function resolveSafe(
  address: string,
  provider: JsonRpcProvider
): Promise<MultisigInfo> {
  try {
    const safe = new Contract(address, SAFE_ABI, provider);
    const [owners, threshold] = await Promise.all([
      safe.getOwners(),
      safe.getThreshold(),
    ]);

    const signers: SignerInfo[] = await Promise.all(
      (owners as string[]).map(async (addr: string) => {
        const ensName = await resolveEns(addr, provider);
        return { address: getAddress(addr), ensName, label: null };
      })
    );

    return {
      type: "safe",
      threshold: Number(threshold),
      signerCount: signers.length,
      signers,
    };
  } catch {
    // Not a Safe — try generic multisig or just report as unknown contract
    return { type: "unknown-contract", threshold: null, signerCount: null, signers: [] };
  }
}

/** Try to read timelock delay */
async function resolveTimelock(
  address: string,
  provider: JsonRpcProvider
): Promise<TimelockInfo> {
  try {
    const tl = new Contract(address, TIMELOCK_ABI, provider);
    // Try getMinDelay first (OZ TimelockController), then delay() (Compound-style)
    let delay: bigint | null = null;
    try {
      delay = await tl.getMinDelay();
    } catch {
      try {
        delay = await tl.delay();
      } catch {
        // no delay function
      }
    }

    if (delay !== null && delay > 0n) {
      const seconds = Number(delay);
      return { detected: true, minDelay: seconds, formatted: formatDuration(seconds) };
    }
    return { detected: false, minDelay: null, formatted: null };
  } catch {
    return { detected: false, minDelay: null, formatted: null };
  }
}

/** Fetch live TVL from DeFiLlama */
async function fetchTvl(slug: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.llama.fi/tvl/${slug}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const tvl = await res.json();
    return typeof tvl === "number" ? tvl : null;
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
      adminInfo: null,
      timelockInfo: null,
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

  let analysisBytecode = bytecode;
  if (implAddress) {
    const implCode = await provider.getCode(implAddress);
    if (implCode.length > 2) analysisBytecode = implCode;
  }

  // Check admin type and resolve details
  let adminIsContract = false;
  let adminInfo: MultisigInfo | null = null;
  let timelockInfo: TimelockInfo | null = null;

  if (adminAddress) {
    const adminCode = await provider.getCode(adminAddress);
    adminIsContract = adminCode !== "0x" && adminCode.length > 2;

    if (adminIsContract) {
      // Try to resolve as Safe + check for timelock
      const [safeInfo, tlInfo] = await Promise.all([
        resolveSafe(adminAddress, provider),
        resolveTimelock(adminAddress, provider),
      ]);
      adminInfo = safeInfo;
      timelockInfo = tlInfo;
    } else {
      adminInfo = { type: "eoa", threshold: null, signerCount: null, signers: [] };
    }
  }

  // Detect function patterns
  const bc = analysisBytecode.slice(2);
  const hasPauseability = PAUSE_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasOwnership = OWNERSHIP_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasAccessControl = ACCESS_CONTROL_SELECTORS.some((s) => bytecodeHas(bc, s));
  const hasRenounced = bytecodeHas(bc, "715018a6");
  const hasTimelockPatterns = TIMELOCK_SELECTORS.some((s) => bytecodeHas(bc, s));

  // Classify risk level
  let riskLevel: ContractScanResult["riskLevel"];
  if (!isProxy && !hasOwnership && !hasAccessControl) {
    riskLevel = "immutable";
  } else if (isProxy && adminAddress && !adminIsContract) {
    riskLevel = "upgradeable-eoa";
  } else if (isProxy && adminIsContract) {
    riskLevel = (hasTimelockPatterns || timelockInfo?.detected) ? "governed" : "upgradeable-governed";
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
    adminInfo,
    timelockInfo,
    hasPauseability,
    hasOwnership,
    hasAccessControl,
    hasRenounced,
    riskLevel,
  };
}

function generateAttackScenarios(
  protocol: ProtocolDefinition,
  scans: ContractScanResult[],
  liveTvl: number | null
): AttackScenario[] {
  const scenarios: AttackScenario[] = [];
  let id = 0;

  const tvlStr = liveTvl ? `$${(liveTvl / 1e9).toFixed(1)}B` : null;

  // Group contracts by admin
  const adminGroups = new Map<string, ContractScanResult[]>();
  for (const scan of scans) {
    if (scan.adminAddress) {
      const key = scan.adminAddress;
      if (!adminGroups.has(key)) adminGroups.set(key, []);
      adminGroups.get(key)!.push(scan);
    }
  }

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
    if (userFundsAtRisk) impactParts.push(`drain user deposits${tvlStr ? ` (up to ${tvlStr} TVL)` : ""}`);
    if (treasuryAtRisk) impactParts.push("steal protocol treasury");
    if (allImpacts.has("token-logic")) impactParts.push("manipulate token behavior (mint, transfer rules)");
    if (allImpacts.has("protocol-halt")) impactParts.push("permanently halt the protocol");
    if (allImpacts.has("fee-extraction")) impactParts.push("redirect protocol fees");
    if (allImpacts.has("oracle")) impactParts.push("manipulate price feeds to trigger mass liquidations");

    if (impactParts.length === 0) continue;

    // Get admin details for richer description
    const adminInfo = controlled[0]?.adminInfo;
    const timelockInfo = controlled[0]?.timelockInfo;
    let vectorDetail: string;

    if (isEOA) {
      vectorDetail = `Single private key (EOA) controls ${controlled.length} contract(s). Social engineering, malware, or insider threat could expose this key. No multisig protection.`;
    } else if (adminInfo?.type === "safe" && adminInfo.threshold && adminInfo.signerCount) {
      vectorDetail = `${adminInfo.threshold}-of-${adminInfo.signerCount} Gnosis Safe controls ${controlled.length} contract(s). Requires compromising ${adminInfo.threshold} signers simultaneously.`;
      if (timelockInfo?.detected && timelockInfo.formatted) {
        vectorDetail += ` Changes are delayed by ${timelockInfo.formatted} timelock.`;
      }
    } else {
      vectorDetail = `Contract at ${adminAddr.slice(0, 10)}... controls ${controlled.length} contract(s). Requires compromising this contract's admin.`;
    }

    const severity: Severity = userFundsAtRisk
      ? (isEOA ? "critical" : adminInfo?.type === "safe" && (adminInfo.threshold ?? 0) >= 3 ? "medium" : "high")
      : treasuryAtRisk ? "high" : "medium";

    let title: string;
    if (isEOA) {
      title = `Private key leak: EOA admin`;
    } else if (adminInfo?.type === "safe") {
      title = `Multisig compromise: ${adminInfo.threshold}-of-${adminInfo.signerCount} Safe`;
    } else {
      title = `Admin contract compromise`;
    }

    scenarios.push({
      id: `attack-${++id}`,
      title,
      severity,
      vector: vectorDetail,
      affectedContracts: affectedNames,
      capability: `Attacker could upgrade or reconfigure: ${affectedNames.join(", ")}`,
      userImpact: impactParts.length > 0 ? `Attacker could: ${impactParts.join("; ")}` : "Limited direct impact",
      impactCategories: Array.from(allImpacts),
      hasTimelock: timelockInfo?.detected ?? false,
      timelockDuration: timelockInfo?.formatted ?? undefined,
    });
  }

  // Proxy holding user funds
  for (const scan of scans) {
    if (scan.isProxy && scan.holdsUserFunds) {
      const adminDetail = scan.adminInfo?.type === "safe"
        ? `Requires ${scan.adminInfo.threshold}-of-${scan.adminInfo.signerCount} signers`
        : scan.adminIsContract
          ? "Admin is a contract"
          : "Admin is a single EOA — one key controls everything";

      scenarios.push({
        id: `attack-${++id}`,
        title: `Proxy upgrade: ${scan.name} holds user funds`,
        severity: scan.adminInfo?.type === "eoa" ? "critical" : "high",
        vector: `${scan.name} is an upgradeable proxy${tvlStr ? ` securing ${tvlStr}` : ""}. The implementation can be swapped to drain all deposited funds. ${adminDetail}.`,
        affectedContracts: [scan.name],
        capability: `Replace implementation at ${scan.implementationAddress?.slice(0, 10)}... with a malicious contract`,
        userImpact: `All user funds deposited in this contract could be drained in a single transaction after upgrade`,
        impactCategories: ["user-funds"],
        hasTimelock: scan.timelockInfo?.detected ?? false,
        timelockDuration: scan.timelockInfo?.formatted ?? undefined,
      });
    }
  }

  // Pausable contracts
  for (const scan of scans) {
    if (scan.hasPauseability && (scan.holdsUserFunds || scan.impacts.includes("user-funds"))) {
      scenarios.push({
        id: `attack-${++id}`,
        title: `Emergency pause: ${scan.name}`,
        severity: "medium",
        vector: `${scan.name} has pause functionality. A privileged account can halt operations.`,
        affectedContracts: [scan.name],
        capability: "Pause contract operations, blocking user withdrawals",
        userImpact: "Users cannot withdraw funds while paused. Funds are not stolen but temporarily inaccessible.",
        impactCategories: ["protocol-halt"],
        hasTimelock: false,
      });
    }
  }

  const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  scenarios.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return scenarios;
}

function sealCheck(id: string, label: string, status: CheckStatus, detail: string): SealCheck {
  return { id, label, status, detail };
}

function computeSealCompliance(scans: ContractScanResult[]): SealCompliance {
  const checks: SealCheck[] = [];

  // 1. Multisig on all upgradeable contracts
  const upgradeableScans = scans.filter((s) => s.isProxy);
  const allHaveMultisig = upgradeableScans.every(
    (s) => s.adminInfo?.type === "safe" || (s.adminIsContract && s.adminInfo?.type !== "eoa")
  );
  const anyEOA = upgradeableScans.some((s) => s.adminInfo?.type === "eoa" || !s.adminIsContract);

  if (upgradeableScans.length === 0) {
    checks.push(sealCheck("multisig", "Multisig Admin", "pass", "No upgradeable contracts — no admin key risk."));
  } else if (anyEOA) {
    checks.push(sealCheck("multisig", "Multisig Admin", "fail", "One or more upgradeable contracts are controlled by an EOA, not a multisig."));
  } else if (allHaveMultisig) {
    checks.push(sealCheck("multisig", "Multisig Admin", "pass", "All upgradeable contracts are controlled by multisig or governance contracts."));
  } else {
    checks.push(sealCheck("multisig", "Multisig Admin", "warn", "Some admin contracts could not be verified as multisigs."));
  }

  // 2. Threshold adequacy (SEAL recommends 3+ signers, threshold > 50%)
  const safes = scans.filter((s) => s.adminInfo?.type === "safe");
  if (safes.length > 0) {
    const allAdequate = safes.every((s) => {
      const t = s.adminInfo!.threshold ?? 0;
      const n = s.adminInfo!.signerCount ?? 0;
      return t >= 3 && n >= 5 && t > n / 2;
    });
    const anyWeak = safes.some((s) => {
      const t = s.adminInfo!.threshold ?? 0;
      const n = s.adminInfo!.signerCount ?? 0;
      return t < 2 || n < 3;
    });

    if (allAdequate) {
      checks.push(sealCheck("threshold", "Signer Threshold", "pass",
        `All Safes meet SEAL recommended threshold (3+ signers, >50% threshold).`));
    } else if (anyWeak) {
      checks.push(sealCheck("threshold", "Signer Threshold", "fail",
        "One or more Safes have insufficient threshold (SEAL recommends 3+ of 5+ signers)."));
    } else {
      checks.push(sealCheck("threshold", "Signer Threshold", "warn",
        "Signer thresholds partially meet SEAL recommendations."));
    }
  } else if (upgradeableScans.length > 0) {
    checks.push(sealCheck("threshold", "Signer Threshold", "unknown",
      "No Gnosis Safe detected on admin addresses — cannot verify signer threshold."));
  } else {
    checks.push(sealCheck("threshold", "Signer Threshold", "pass",
      "No upgradeable contracts — threshold check not applicable."));
  }

  // 3. Timelock on upgrades
  const timelocked = scans.filter((s) => s.timelockInfo?.detected);
  if (upgradeableScans.length === 0) {
    checks.push(sealCheck("timelock", "Upgrade Timelock", "pass", "No upgradeable contracts — timelock not needed."));
  } else if (timelocked.length === upgradeableScans.length) {
    const maxDelay = Math.max(...timelocked.map((s) => s.timelockInfo!.minDelay ?? 0));
    checks.push(sealCheck("timelock", "Upgrade Timelock", "pass",
      `All upgradeable contracts have timelocks (max delay: ${formatDuration(maxDelay)}).`));
  } else if (timelocked.length > 0) {
    checks.push(sealCheck("timelock", "Upgrade Timelock", "warn",
      `${timelocked.length} of ${upgradeableScans.length} upgradeable contracts have timelocks.`));
  } else {
    checks.push(sealCheck("timelock", "Upgrade Timelock", "fail",
      "No timelocks detected on upgradeable contracts. Upgrades can happen instantly."));
  }

  // 4. Pausability (emergency controls)
  const pausable = scans.filter((s) => s.hasPauseability);
  if (pausable.length > 0) {
    checks.push(sealCheck("emergency", "Emergency Controls", "pass",
      `${pausable.length} contract(s) have pause functionality for emergency response.`));
  } else {
    checks.push(sealCheck("emergency", "Emergency Controls", "warn",
      "No pause functionality detected. Protocol cannot be halted during an active exploit."));
  }

  // 5. Immutability ratio
  const immutable = scans.filter((s) => s.riskLevel === "immutable");
  const ratio = immutable.length / scans.length;
  if (ratio === 1) {
    checks.push(sealCheck("immutability", "Contract Immutability", "pass",
      "All contracts are immutable. No admin keys can change behavior."));
  } else if (ratio >= 0.5) {
    checks.push(sealCheck("immutability", "Contract Immutability", "warn",
      `${immutable.length} of ${scans.length} contracts are immutable. ${scans.length - immutable.length} can be changed by admins.`));
  } else {
    checks.push(sealCheck("immutability", "Contract Immutability", "fail",
      `Only ${immutable.length} of ${scans.length} contracts are immutable. Most can be changed by admins.`));
  }

  // Score
  const statusScore: Record<CheckStatus, number> = { pass: 100, warn: 50, unknown: 30, fail: 0 };
  const score = Math.round(checks.reduce((sum, c) => sum + statusScore[c.status], 0) / checks.length);

  return { score, checks };
}

export async function analyzeProtocol(
  protocol: ProtocolDefinition,
  rpcUrl: string
): Promise<ProtocolReport> {
  const provider = new JsonRpcProvider(rpcUrl);

  // Fetch TVL and scan contracts in parallel
  const [liveTvl, ...scans] = await Promise.all([
    protocol.defillamaSlug ? fetchTvl(protocol.defillamaSlug) : Promise.resolve(null),
    ...protocol.contracts.map((c) => scanContract(c, provider)),
  ]);

  // Generate attack scenarios and SEAL compliance
  const attackScenarios = generateAttackScenarios(protocol, scans, liveTvl);
  const sealCompliance = computeSealCompliance(scans);

  // Summary
  const immutableContracts = scans.filter((s) => s.riskLevel === "immutable").length;
  const upgradeableContracts = scans.filter((s) =>
    s.riskLevel === "upgradeable-eoa" || s.riskLevel === "upgradeable-governed"
  ).length;
  const uniqueAdmins = new Set(scans.filter((s) => s.adminAddress).map((s) => s.adminAddress));
  const userFundsAtRisk = scans.some((s) => s.holdsUserFunds && s.riskLevel !== "immutable");
  const treasuryAtRisk = scans.some((s) => s.holdsTreasury && s.riskLevel !== "immutable");
  const timelocked = scans.filter((s) => s.timelockInfo?.detected);
  const hasTimelock = timelocked.length > 0;
  const maxDelay = timelocked.length > 0
    ? Math.max(...timelocked.map((s) => s.timelockInfo!.minDelay ?? 0))
    : null;

  // Overall risk score
  let score = 100;
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
    liveTvl,
    contracts: scans,
    attackScenarios,
    sealCompliance,
    summary: {
      totalContracts: scans.length,
      immutableContracts,
      upgradeableContracts,
      uniqueAdmins: uniqueAdmins.size,
      userFundsAtRisk,
      treasuryAtRisk,
      hasTimelock,
      maxTimelockDelay: maxDelay ? formatDuration(maxDelay) : null,
    },
  };
}
