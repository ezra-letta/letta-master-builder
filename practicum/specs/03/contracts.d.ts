import type {
  AgentTool,
  CanUseToolContext,
  CanUseToolResponse,
  CanUseToolResponseAllow,
  CanUseToolResponseDeny,
  McpServerConfig,
  McpServers,
  McpStdioServerConfig,
  PermissionMode,
} from "@letta-ai/letta-agent-sdk";

/** exact-static: root exports listed in capabilities/sdk-exports.yml for SDK 0.8.9. */
export type ExactStaticSdkImports = {
  agentTool: AgentTool<object, object>;
  canUseToolContext: CanUseToolContext;
  canUseToolResponse: CanUseToolResponse;
  canUseToolResponseAllow: CanUseToolResponseAllow;
  canUseToolResponseDeny: CanUseToolResponseDeny;
  mcpServerConfig: McpServerConfig;
  mcpServers: McpServers;
  mcpStdioServerConfig: McpStdioServerConfig;
  permissionMode: PermissionMode;
};

export type Sha256Digest = `sha256:${string}`;
export type IsoTimestamp = string;
export type ProjectKind = `lmb.practicum.v1.${string}`;

export interface Scenario03Input {
  scenarioId: "SCN-TOOLS-EFFECTS";
  specificationStatus: "ready-read-only";
  namespace: "lmb.practicum.v1.tool_effect";
  submissionDirectory: "submission/SCN-TOOLS-EFFECTS";
  executionAuthorized: false;
  scoringAuthorized: false;
  proposal: ToolProposal;
  permissionDecision: EditedPermissionDecision;
  mcpState: SyntheticMcpState;
  dispatchObservation: DispatchTimeoutObservation;
  receiptObservation: ReceiptObservation;
  authoritativeLookup: AuthoritativeLookup;
  digestContract: DigestContract;
  protectedPerturbations: readonly ProtectedPerturbation[];
  publicAssertions: readonly PublicAssertionId[];
}

export interface ToolProposal {
  kind: "lmb.practicum.v1.tool.proposed";
  proposalId: string;
  toolName: string;
  declaredPolicy: {
    locality: "client" | "server";
    effectClass: EffectClass;
    credentialCustody: "host-only";
    credentialReference: string;
  };
  requestedInput: SyntheticTicketInput;
  proposedInputDigest: Sha256Digest;
}

export interface EditedPermissionDecision {
  kind: "lmb.practicum.v1.permission.decision";
  decisionId: string;
  proposalId: string;
  behavior: "allow";
  editedInput: SyntheticTicketInput;
  authorizedInputDigest: Sha256Digest;
  validFrom: IsoTimestamp;
  expiresAt: IsoTimestamp;
  authorityState: "valid";
}

export interface SyntheticTicketInput {
  project: string;
  summary: string;
  labels: readonly string[];
  priority: "low" | "normal" | "high";
}

export type EffectClass =
  | "read-only"
  | "idempotent"
  | "compensatable"
  | "irreversible";

export interface SyntheticMcpState {
  kind: "lmb.practicum.v1.mcp.transport_state";
  serverName: string;
  transport: "stdio";
  lifecycle: readonly {
    sequence: number;
    state: "available" | "unavailable-before-dispatch" | "unavailable-after-dispatch";
    observedAt: IsoTimestamp;
  }[];
  resourceClose: {
    requested: boolean;
    state: "synthetically-closed" | "close-uncertain";
    observedAt: IsoTimestamp;
  };
}

export interface DispatchTimeoutObservation {
  kind: "lmb.practicum.v1.effect.dispatch_observation";
  requestKey: string;
  proposalId: string;
  authorizedInputDigest: Sha256Digest;
  dispatchedAt: IsoTimestamp;
  deadlineAt: IsoTimestamp;
  observation: "timeout-after-dispatch";
  abortObserved: boolean;
  effectState: "uncertain";
}

export interface SyntheticReceipt {
  externalEffectId: string;
  requestKey: string;
  status: "created";
}

export interface ReceiptObservation {
  kind: "lmb.practicum.v1.effect.receipt_observed";
  requestKey: string;
  observedAt: IsoTimestamp;
  receipt: SyntheticReceipt;
  authority: "non-authoritative-receipt";
}

export interface AuthoritativeLookup {
  kind: "lmb.practicum.v1.effect.authoritative_lookup";
  requestKey: string;
  attempt: number;
  maximumAttempts: number;
  observedAt: IsoTimestamp;
  matches: readonly SyntheticReceipt[];
}

export interface DigestContract {
  algorithm: "sha256";
  representation: "utf8-json";
  canonicalization: string;
  proposedInputPath: "/proposal/requestedInput";
  authorizedInputPath: "/permissionDecision/editedInput";
  artifactDigestOrder: readonly [
    "tool-authority.json",
    "effect-ledger.json",
    "reconciliation-report.json",
    "controller-trace.jsonl",
  ];
}

export interface ProtectedPerturbation {
  id: `S03-P${string}`;
  insertionPoint: string;
  custodian: "authorized-evaluator";
  valueCustody: "withheld-from-read-only-specification";
}

export type PublicAssertionId =
  | "S03-C01"
  | "S03-C02"
  | "S03-C03"
  | "S03-C04"
  | "S03-C05"
  | "S03-C06"
  | "S03-C07"
  | "S03-C08"
  | "S03-N01"
  | "S03-N02"
  | "S03-N03"
  | "S03-N04"
  | "S03-N05"
  | "S03-N06";

export interface ToolAuthorityArtifact {
  scenarioId: "SCN-TOOLS-EFFECTS";
  proposalId: string;
  locality: "client" | "server";
  localityRationale: string;
  credentialHandling: {
    custody: "host-only";
    valuesPresent: false;
    modelVisible: false;
  };
  proposedInput: SyntheticTicketInput;
  authorizedInput: SyntheticTicketInput;
  proposedInputDigest: Sha256Digest;
  authorizedInputDigest: Sha256Digest;
  permission: {
    decision: "allow" | "deny" | "pending";
    validFrom: IsoTimestamp;
    expiresAt: IsoTimestamp;
    authorityState: "valid" | "expired" | "lost" | "ambiguous";
  };
}

export interface EffectLedgerArtifact {
  scenarioId: "SCN-TOOLS-EFFECTS";
  requestKey: string;
  effectClass: EffectClass;
  proposalId: string;
  authorizedInputDigest: Sha256Digest;
  dispatchState: "not-dispatched" | "dispatched" | "blocked";
  observationState: "none" | "timeout" | "aborted" | "receipt-observed";
  canonicalReceipt: SyntheticReceipt | null;
  verificationState: "not-attempted" | "zero-matches" | "one-match" | "multiple-matches";
  reconciliationState: "blocked" | "uncertain" | "confirmed" | "operator-review";
}

export interface ReconciliationReportArtifact {
  scenarioId: "SCN-TOOLS-EFFECTS";
  requestKey: string;
  lookup: {
    attempts: number;
    maximumAttempts: number;
    matches: readonly SyntheticReceipt[];
  };
  ambiguity: "none" | "zero-matches" | "multiple-matches";
  allowedNextAction:
    | "stop-confirmed"
    | "bounded-lookup"
    | "operator-review"
    | "separately-authorized-retry"
    | "separately-authorized-compensation";
  incidentSummary: string;
  nonClaims: readonly string[];
}

export interface ControllerTraceRecord {
  sequence: number;
  kind: ProjectKind;
  observedAt: IsoTimestamp;
  requestKey: string;
  phase:
    | "proposal"
    | "authorization"
    | "dispatch"
    | "observation"
    | "verification"
    | "reconciliation";
  redaction: {
    secretValuesPresent: false;
    credentialReferencesOnly: true;
  };
  data: Record<string, unknown>;
}

export interface ArtifactBundle {
  "tool-authority.json": ToolAuthorityArtifact;
  "effect-ledger.json": EffectLedgerArtifact;
  "reconciliation-report.json": ReconciliationReportArtifact;
  "controller-trace.jsonl": readonly ControllerTraceRecord[];
}
