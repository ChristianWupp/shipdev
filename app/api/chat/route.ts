import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import {
  routeMessage,
  getAgentPrompt,
  getModelForTier,
  AGENTS,
  type UserTier,
  type AgentRole,
} from "@/lib/agents";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // TODO: resolve tier from user session / subscription
  // For now, default to "builder" (Sonnet) — the sweet spot
  const tier: UserTier = "builder";

  // Route the latest user message to the right agent
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const messageText =
    lastUserMessage?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("") ?? "";

  const route = routeMessage(messageText);
  const agent = AGENTS[route.primary];
  const systemPrompt = getAgentPrompt(route.primary);
  const model = getModelForTier(tier);

  // Prepend agent metadata as a custom header so the UI can show the badge
  const result = streamText({
    model: openrouter(model),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  // Stream the response with agent info in a custom header
  const response = result.toUIMessageStreamResponse();

  // Attach agent routing info so the client can display it
  response.headers.set("x-shipdev-agent", agent.role);
  response.headers.set("x-shipdev-agent-badge", agent.badge);
  response.headers.set("x-shipdev-agent-name", agent.name);
  response.headers.set("x-shipdev-tier", tier);
  if (route.secondary) {
    response.headers.set("x-shipdev-agent-secondary", route.secondary);
  }

  return response;
}
