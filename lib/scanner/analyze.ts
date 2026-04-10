import { JsonRpcProvider, getAddress, isAddress } from "ethers";
import type {
  SecurityReport,
  CheckResult,
  CheckStatus,
  Severity,
} from "./types";

// Well-known storage slots (EIP-1967)
const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
const BEACON_SLOT =
  "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

// Known multi-sig bytecode signatures (Gnosis Safe)
const SAFE_SELECTORS = [
  "0x6a761202", // execTransaction
  "0xe009cfde", // removeOwner
  "0x0d582f13", // addOwnerWithThreshold
];

// Kill switch / pause selectors
const PAUSE_SELECTORS = [
  "0x8456cb59", // pause()
  "0x3f4ba83a", // unpause()
  "0x5c975abb", // paused()
];

// Privileged role selectors
const ROLE_SELECTORS = [
  "0xf2fde38b", // transferOwnership(address)
  "0x715018a6", // renounceOwnership()
  "0x2f2ff15d", // grantRole(bytes32,address)
  "0xd547741f", // revokeRole(bytes32,address)
  "0x91d14854", // hasRole(bytes32,address)
  "0x248a9ca3", // getRoleAdmin(bytes32)
];

// Known audit org addresses (SEAL, OpenZeppelin, etc.) — placeholder for real registry
const SEAL_REGISTRY: string[] = [];

function check(
  id: string,
  label: string,
  status: CheckStatus,
  severity: Severity,
  detail: string
): CheckResult {
  return { id, label, status, severity, detail };
}

function bytecodeHasSelector(bytecode: string, selector: string): boolean {
  // Strip 0x, selectors are pushed as 4-byte values in bytecode
  return bytecode.includes(selector.slice(2));
}

function bytecodeHasAnySelector(
  bytecode: string,
  selectors: string[]
): string[] {
  return selectors.filter((s) => bytecodeHasSelector(bytecode, s));
}

export async function analyzeContract(
  address: string,
  chainRpcUrl: string
): Promise<SecurityReport> {
  if (!isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  const normalizedAddress = getAddress(address);
  const provider = new JsonRpcProvider(chainRpcUrl);

  // Fetch bytecode
  const bytecode = await provider.getCode(normalizedAddress);
  const isContract = bytecode !== "0x" && bytecode.length > 2;

  if (!isContract) {
    return eoaReport(normalizedAddress);
  }

  // Parallel on-chain reads
  const [implSlotRaw, adminSlotRaw, beaconSlotRaw] = await Promise.all([
    provider.getStorage(normalizedAddress, IMPLEMENTATION_SLOT),
    provider.getStorage(normalizedAddress, ADMIN_SLOT),
    provider.getStorage(normalizedAddress, BEACON_SLOT),
  ]);

  const implAddress = slotToAddress(implSlotRaw);
  const adminAddress = slotToAddress(adminSlotRaw);
  const beaconAddress = slotToAddress(beaconSlotRaw);

  const isProxy = implAddress !== null || beaconAddress !== null;

  // If proxy, fetch implementation bytecode for deeper analysis
  let implBytecode = bytecode;
  if (implAddress) {
    implBytecode = await provider.getCode(implAddress);
  }

  // Analyze bytecode for function selectors
  const hasSafeSelectors = bytecodeHasAnySelector(bytecode, SAFE_SELECTORS);
  const hasPauseSelectors = bytecodeHasAnySelector(
    implBytecode,
    PAUSE_SELECTORS
  );
  const hasRoleSelectors = bytecodeHasAnySelector(
    implBytecode,
    ROLE_SELECTORS
  );

  // Check if admin is a contract (likely multi-sig)
  let adminIsContract = false;
  if (adminAddress) {
    const adminCode = await provider.getCode(adminAddress);
    adminIsContract = adminCode !== "0x" && adminCode.length > 2;
  }

  // Build checks
  const multisig = analyzeMultisig(
    hasSafeSelectors,
    adminAddress,
    adminIsContract
  );
  const privilegedRoles = analyzeRoles(hasRoleSelectors, implBytecode);
  const proxy = analyzeProxy(isProxy, implAddress, beaconAddress);
  const upgradeability = analyzeUpgradeability(
    isProxy,
    adminAddress,
    adminIsContract,
    implBytecode
  );
  const auditHistory = analyzeAuditHistory(normalizedAddress);
  const killSwitch = analyzeKillSwitch(hasPauseSelectors);
  const sealCompliance = analyzeSealCompliance(
    normalizedAddress,
    multisig,
    upgradeability,
    killSwitch
  );

  const checks = {
    multisig,
    privilegedRoles,
    proxy,
    upgradeability,
    auditHistory,
    killSwitch,
    sealCompliance,
  };

  const overallScore = computeScore(checks);

  return {
    address: normalizedAddress,
    chain: "ethereum",
    timestamp: Date.now(),
    overallScore,
    isContract: true,
    checks,
    metadata: {
      bytecodeSize: (bytecode.length - 2) / 2,
      hasSourceCode: false, // Would need Etherscan API
      implementationAddress: implAddress,
      adminAddress,
    },
  };
}

function slotToAddress(slotValue: string): string | null {
  if (!slotValue || slotValue === "0x" + "0".repeat(64)) return null;
  const addr = "0x" + slotValue.slice(26);
  if (addr === "0x" + "0".repeat(40)) return null;
  return getAddress(addr);
}

function analyzeMultisig(
  safeSelectors: string[],
  adminAddress: string | null,
  adminIsContract: boolean
): CheckResult {
  if (safeSelectors.length >= 2) {
    return check(
      "multisig",
      "Multi-Sig Status",
      "pass",
      "info",
      "Contract bytecode contains Gnosis Safe signatures (execTransaction, owner management)"
    );
  }
  if (adminAddress && adminIsContract) {
    return check(
      "multisig",
      "Multi-Sig Status",
      "pass",
      "info",
      `Admin (${adminAddress}) is a contract — likely a multi-sig or governance contract`
    );
  }
  if (adminAddress && !adminIsContract) {
    return check(
      "multisig",
      "Multi-Sig Status",
      "fail",
      "critical",
      `Admin (${adminAddress}) is an EOA — single point of failure, no multi-sig protection`
    );
  }
  return check(
    "multisig",
    "Multi-Sig Status",
    "unknown",
    "medium",
    "No admin slot detected. Ownership pattern unclear from bytecode alone"
  );
}

function analyzeRoles(
  roleSelectors: string[],
  bytecode: string
): CheckResult {
  const hasAccessControl = roleSelectors.some(
    (s) => s === "0x2f2ff15d" || s === "0x91d14854"
  );
  const hasOwnable = roleSelectors.some(
    (s) => s === "0xf2fde38b" || s === "0x715018a6"
  );
  const hasRenounce = roleSelectors.includes("0x715018a6");

  if (hasAccessControl) {
    return check(
      "privilegedRoles",
      "Privileged Roles",
      "warn",
      "medium",
      `AccessControl detected (grantRole/revokeRole). Multiple privileged roles may exist. Review role assignments on-chain.`
    );
  }
  if (hasOwnable && hasRenounce) {
    return check(
      "privilegedRoles",
      "Privileged Roles",
      "warn",
      "low",
      "Ownable pattern with renounceOwnership available. Single owner role — verify if ownership has been renounced."
    );
  }
  if (hasOwnable) {
    return check(
      "privilegedRoles",
      "Privileged Roles",
      "warn",
      "medium",
      "Ownable pattern detected (transferOwnership). Single privileged owner role exists."
    );
  }
  if (roleSelectors.length === 0) {
    return check(
      "privilegedRoles",
      "Privileged Roles",
      "pass",
      "info",
      "No standard ownership or role management selectors found in bytecode. May be immutable or use a non-standard pattern."
    );
  }
  return check(
    "privilegedRoles",
    "Privileged Roles",
    "unknown",
    "low",
    `Found ${roleSelectors.length} role-related selectors but pattern is unclear.`
  );
}

function analyzeProxy(
  isProxy: boolean,
  implAddress: string | null,
  beaconAddress: string | null
): CheckResult {
  if (beaconAddress) {
    return check(
      "proxy",
      "Proxy Pattern",
      "warn",
      "medium",
      `Beacon proxy detected. Beacon at ${beaconAddress}. All proxies sharing this beacon can be upgraded simultaneously.`
    );
  }
  if (implAddress) {
    return check(
      "proxy",
      "Proxy Pattern",
      "warn",
      "medium",
      `Transparent/UUPS proxy detected. Implementation at ${implAddress}. Contract logic can be changed by the admin.`
    );
  }
  return check(
    "proxy",
    "Proxy Pattern",
    "pass",
    "info",
    "No EIP-1967 proxy pattern detected. Contract appears to be non-upgradeable."
  );
}

function analyzeUpgradeability(
  isProxy: boolean,
  adminAddress: string | null,
  adminIsContract: boolean,
  implBytecode: string
): CheckResult {
  if (!isProxy) {
    return check(
      "upgradeability",
      "Upgradeability",
      "pass",
      "info",
      "Contract is not upgradeable. Logic is immutable once deployed."
    );
  }

  const hasTimelockPatterns =
    implBytecode.includes("54494d454c4f434b") || // "TIMELOCK" in hex
    bytecodeHasSelector(implBytecode, "0x0e18b681") || // queue
    bytecodeHasSelector(implBytecode, "0x61461954"); // executeTransaction

  if (adminIsContract && hasTimelockPatterns) {
    return check(
      "upgradeability",
      "Upgradeability",
      "warn",
      "low",
      "Upgradeable proxy with timelock-governed admin. Upgrades have a delay period."
    );
  }
  if (adminIsContract) {
    return check(
      "upgradeability",
      "Upgradeability",
      "warn",
      "medium",
      `Upgradeable proxy. Admin (${adminAddress}) is a contract (likely multi-sig/governance). No timelock detected.`
    );
  }
  if (adminAddress) {
    return check(
      "upgradeability",
      "Upgradeability",
      "fail",
      "critical",
      `Upgradeable proxy with EOA admin (${adminAddress}). Contract can be upgraded instantly by a single key holder.`
    );
  }
  return check(
    "upgradeability",
    "Upgradeability",
    "warn",
    "high",
    "Proxy detected but admin address could not be determined. Upgradeability risk unclear."
  );
}

function analyzeAuditHistory(_address: string): CheckResult {
  // In production, this would query audit registries, Etherscan verified status, etc.
  return check(
    "auditHistory",
    "Audit History",
    "unknown",
    "medium",
    "No on-chain audit registry available. Check Etherscan, Immunefi, or the project's documentation for audit reports."
  );
}

function analyzeKillSwitch(pauseSelectors: string[]): CheckResult {
  const hasPause = pauseSelectors.some((s) => s === "0x8456cb59");
  const hasUnpause = pauseSelectors.some((s) => s === "0x3f4ba83a");
  const hasPausedCheck = pauseSelectors.some((s) => s === "0x5c975abb");

  if (hasPause && hasUnpause) {
    return check(
      "killSwitch",
      "Kill Switch / Pause",
      "warn",
      "medium",
      "Pausable pattern detected (pause/unpause). A privileged account can halt contract operations. Verify who holds the pauser role."
    );
  }
  if (hasPause) {
    return check(
      "killSwitch",
      "Kill Switch / Pause",
      "fail",
      "high",
      "Pause function detected without unpause. Contract may be permanently freezable — potential kill switch."
    );
  }
  if (hasPausedCheck) {
    return check(
      "killSwitch",
      "Kill Switch / Pause",
      "warn",
      "low",
      "Contract checks paused() state but pause/unpause selectors not found in this contract. May be inherited or external."
    );
  }
  return check(
    "killSwitch",
    "Kill Switch / Pause",
    "pass",
    "info",
    "No pausable/kill switch pattern detected in bytecode."
  );
}

function analyzeSealCompliance(
  _address: string,
  multisig: CheckResult,
  upgradeability: CheckResult,
  killSwitch: CheckResult
): CheckResult {
  // SEAL org requires: multi-sig admin, timelock on upgrades, no unilateral kill switch
  const issues: string[] = [];
  if (multisig.status === "fail") issues.push("no multi-sig admin");
  if (upgradeability.status === "fail")
    issues.push("upgradeable by EOA without timelock");
  if (killSwitch.status === "fail") issues.push("potential kill switch");

  if (issues.length === 0 && multisig.status === "pass") {
    return check(
      "sealCompliance",
      "SEAL Org Compliance",
      "pass",
      "info",
      "Contract meets basic SEAL org security requirements: multi-sig governance, controlled upgradeability, no unilateral kill switch."
    );
  }
  if (issues.length > 0) {
    return check(
      "sealCompliance",
      "SEAL Org Compliance",
      "fail",
      "high",
      `Does not meet SEAL org requirements: ${issues.join(", ")}. Address these before seeking SEAL certification.`
    );
  }
  return check(
    "sealCompliance",
    "SEAL Org Compliance",
    "unknown",
    "medium",
    "Insufficient data to determine SEAL compliance. Manual review recommended."
  );
}

function computeScore(checks: SecurityReport["checks"]): number {
  const weights: Record<string, number> = {
    multisig: 20,
    privilegedRoles: 15,
    proxy: 10,
    upgradeability: 20,
    auditHistory: 15,
    killSwitch: 10,
    sealCompliance: 10,
  };

  const statusScore: Record<CheckStatus, number> = {
    pass: 1,
    warn: 0.6,
    unknown: 0.4,
    fail: 0,
  };

  let score = 0;
  for (const [key, result] of Object.entries(checks)) {
    const weight = weights[key] ?? 10;
    score += weight * statusScore[result.status];
  }

  return Math.round(score);
}

function eoaReport(address: string): SecurityReport {
  const eoaCheck = (id: string, label: string): CheckResult =>
    check(id, label, "fail", "critical", "Address is an EOA, not a contract.");

  return {
    address,
    chain: "ethereum",
    timestamp: Date.now(),
    overallScore: 0,
    isContract: false,
    checks: {
      multisig: eoaCheck("multisig", "Multi-Sig Status"),
      privilegedRoles: eoaCheck("privilegedRoles", "Privileged Roles"),
      proxy: eoaCheck("proxy", "Proxy Pattern"),
      upgradeability: eoaCheck("upgradeability", "Upgradeability"),
      auditHistory: eoaCheck("auditHistory", "Audit History"),
      killSwitch: eoaCheck("killSwitch", "Kill Switch / Pause"),
      sealCompliance: eoaCheck("sealCompliance", "SEAL Org Compliance"),
    },
    metadata: {
      bytecodeSize: 0,
      hasSourceCode: false,
      implementationAddress: null,
      adminAddress: null,
    },
  };
}
