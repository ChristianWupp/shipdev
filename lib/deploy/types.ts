export type DeployStepStatus = "pending" | "in-progress" | "done" | "error";

export interface DeployStep {
  id: string;
  label: string;
  description: string;
  status: DeployStepStatus;
  txHash?: string;
  address?: string;
  error?: string;
}

export interface DeployResult {
  success: boolean;
  contracts: Record<string, { address: string; txHash: string }>;
  frontendUrl?: string;
  error?: string;
}

export const DEPLOY_STEPS: Omit<DeployStep, "status">[] = [
  {
    id: "compile",
    label: "Compile Contracts",
    description: "Compiling with solc and configured parameters",
  },
  {
    id: "factory",
    label: "Deploy Factory",
    description: "Core factory contract for creating pairs",
  },
  {
    id: "router",
    label: "Deploy Router",
    description: "Swap router and liquidity operations",
  },
  {
    id: "token",
    label: "Deploy Governance Token",
    description: "Governance token with configured supply and allocations",
  },
  {
    id: "frontend",
    label: "Generate Frontend",
    description: "Building branded DEX interface",
  },
];

/** Additional deploy steps when Nest integration is enabled */
export const NEST_DEPLOY_STEPS: Omit<DeployStep, "status">[] = [
  {
    id: "nest-pool",
    label: "Create Nest Pool",
    description: "Creating trading pool on Nest for instant liquidity",
  },
  {
    id: "nest-liquidity",
    label: "Seed Liquidity",
    description: "Adding initial liquidity to the Nest pool",
  },
  {
    id: "nest-bribe",
    label: "Deposit Bribes",
    description: "Depositing Egg Initiative bribes to attract veNEST votes",
  },
];
