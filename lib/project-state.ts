/** Shared state for an active builder project */

import type { ProtocolBase } from "./protocols/types";

export interface ProjectState {
  projectName: string;
  selectedBase: ProtocolBase | null;
  parameters: Record<string, string | number | boolean>;
  frontendCode: string | null;
}

export const initialProjectState: ProjectState = {
  projectName: "",
  selectedBase: null,
  parameters: {},
  frontendCode: null,
};

/**
 * Parse shipdev-config JSON blocks from AI message text.
 * Returns the parsed config action or null if none found.
 */
export function parseConfigFromMessage(
  text: string,
): { action: string; baseId?: string; projectName?: string; parameters?: Record<string, unknown> } | null {
  const match = text.match(/```shipdev-config\s*\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * Parse shipdev-frontend HTML blocks from AI message text.
 * Returns the raw HTML string or null if none found.
 */
export function parseFrontendFromMessage(text: string): string | null {
  const match = text.match(/```shipdev-frontend\s*\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : null;
}
