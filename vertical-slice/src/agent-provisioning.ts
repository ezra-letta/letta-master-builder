import type {
  CreateAgentOptions,
  LettaAgent,
  LettaAgentClient,
} from "@letta-ai/letta-agent-sdk";

const REQUEST_TAG_PREFIX = "lmb-provisioning:";

export interface ProvisioningStore {
  getAgentId(requestKey: string): Promise<string | undefined>;
  saveAgentId(requestKey: string, agentId: string): Promise<void>;
}

export interface ProvisionAgentInput {
  requestKey: string;
  name: string;
  description: string;
  tags?: string[];
}

export type ProvisionAgentResult =
  | { state: "already-recorded"; agentId: string }
  | { state: "reconciled"; agentId: string }
  | { state: "created"; agentId: string }
  | {
      state: "created-unrecorded";
      agentId: string;
      retryWithSameRequestKey: true;
      warning: string;
    }
  | {
      state: "reconciled-unrecorded";
      agentId: string;
      retryWithSameRequestKey: true;
      warning: string;
    };

function requestTag(requestKey: string): string {
  const normalized = requestKey.trim();
  if (!/^[A-Za-z0-9._-]{8,80}$/.test(normalized)) {
    throw new Error("requestKey must be 8-80 URL-safe characters");
  }
  return `${REQUEST_TAG_PREFIX}${normalized}`;
}

function oneTaggedAgent(agents: LettaAgent[], tag: string): LettaAgent | undefined {
  const matches = agents.filter((agent) => agent.tags?.includes(tag));
  if (matches.length > 1) {
    throw new Error(`ambiguous provisioning state: ${matches.length} agents carry ${tag}`);
  }
  return matches[0];
}

async function persistOrReport(
  store: ProvisioningStore,
  requestKey: string,
  agentId: string,
  successState: "created" | "reconciled",
): Promise<ProvisionAgentResult> {
  try {
    await store.saveAgentId(requestKey, agentId);
    return { state: successState, agentId };
  } catch {
    if (successState === "created") {
      return {
        state: "created-unrecorded",
        agentId,
        retryWithSameRequestKey: true,
        warning:
          "This invocation created the canonical agent, but controller persistence failed. Retry with the same requestKey so tag reconciliation can recover it; do not create blindly.",
      };
    }
    return {
      state: "reconciled-unrecorded",
      agentId,
      retryWithSameRequestKey: true,
      warning:
        "This invocation found an existing canonical agent, but controller persistence still failed. Retry with the same requestKey; do not claim a new creation.",
    };
  }
}

/**
 * Compile-checked project method for provisioning one persistent agent.
 *
 * This is not a live-runtime proof. The request tag is a controller-owned
 * reconciliation key, not a server-enforced uniqueness constraint.
 */
export async function provisionAgent(
  client: LettaAgentClient,
  store: ProvisioningStore,
  input: ProvisionAgentInput,
): Promise<ProvisionAgentResult> {
  const recorded = await store.getAgentId(input.requestKey);
  if (recorded) {
    await client.agents.retrieve(recorded);
    return { state: "already-recorded", agentId: recorded };
  }

  const tag = requestTag(input.requestKey);
  const existing = oneTaggedAgent(await client.agents.list({ tags: [tag] }), tag);
  if (existing) {
    return persistOrReport(store, input.requestKey, existing.id, "reconciled");
  }

  const createOptions: CreateAgentOptions = {
    name: input.name,
    description: input.description,
    memfs: true,
    tags: [...(input.tags ?? []), tag],
  };
  const agentId = await client.createAgent(createOptions);
  await client.agents.retrieve(agentId);
  return persistOrReport(store, input.requestKey, agentId, "created");
}
