import type {
  AgentRepositoriesClient,
  AgentSkill,
  AgentsClient,
  ConversationsClient,
  CreateAgentOptions,
  SkillItem,
  SkillSource,
} from "@letta-ai/letta-agent-sdk";

/**
 * Exact-package static imports from the root export ledger in
 * capabilities/sdk-exports.yml. They label package-derived public shapes only;
 * they are not runtime evidence and must not be emitted as runtime imports.
 */
export interface ExactRootSdkImports {
  readonly AgentRepositoriesClient: AgentRepositoriesClient;
  readonly AgentSkill: AgentSkill;
  readonly AgentsClient: AgentsClient;
  readonly ConversationsClient: ConversationsClient;
  readonly CreateAgentOptions: CreateAgentOptions;
  readonly SkillItem: SkillItem;
  readonly SkillSource: SkillSource;
}

export type ProvenanceLabel =
  | "package-derived-public-shape"
  | "documented-behavior-fixture"
  | "project-method-only";

export type EffectState =
  | "accepted"
  | "ambiguous"
  | "created"
  | "failed"
  | "recorded"
  | "rejected"
  | "uncertain";

export interface ScenarioInput {
  readonly scenarioId: "SCN-PROVISIONING";
  readonly namespace: "lmb.practicum.v1.provisioning";
  readonly submissionDirectory: "submission/SCN-PROVISIONING";
  readonly executionAuthorized: false;
  readonly scoringAuthorized: false;
  readonly protectedPerturbations: ProtectedPerturbations;
  readonly fixtureId: "lmb.practicum.v1.provisioning.base";
  readonly normalization: NormalizationContract;
  readonly bounds: ScenarioBounds;
  readonly intents: ProvisioningIntents;
  readonly controllerState: InitialControllerState;
  readonly records: readonly SyntheticInputRecord[];
}

export interface ProtectedPerturbations {
  readonly valuesIncluded: false;
  readonly custodian: "identified-independent-evaluator";
  readonly slots: readonly {
    readonly id: "PP-S01-A" | "PP-S01-B";
    readonly insertionPoint: "after-canonical-identity-before-controller-store-outcome" | "adjacent-to-authoritative-match-array";
  }[];
}

export interface NormalizationContract {
  readonly recordOrder: "sequence-ascending";
  readonly setLikeArrays: "unicode-code-point-ascending";
  readonly objectKeys: "unicode-code-point-ascending";
  readonly timestamps: "fixed-fixture-values-only";
}

export interface ScenarioBounds {
  readonly maxRecords: 7;
  readonly maxAuthoritativeMatchesPerLookup: 3;
  readonly maxCleanupCandidates: 4;
  readonly maxTraceEntries: 32;
}

export interface ProvisioningIntents {
  readonly agent: AgentIntent;
  readonly conversation: ConversationIntent;
  readonly skill: SkillIntent;
  readonly repositoryAttachment: RepositoryAttachmentIntent;
}

export interface AgentIntent {
  readonly operationKey: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
}

export interface ConversationIntent {
  readonly operationKey: string;
  readonly name: string;
}

export interface SkillIntent {
  readonly operationKey: string;
  readonly name: string;
  readonly manifestPath: string;
  readonly supportFilePaths: readonly string[];
}

export interface RepositoryAttachmentIntent {
  readonly operationKey: string;
  readonly repositoryId: string;
  readonly repositoryName: string;
  readonly permission: "read";
}

export interface InitialControllerState {
  readonly agentId: null;
  readonly conversationId: null;
  readonly ownedOperationKeys: readonly string[];
}

export type SyntheticInputRecord =
  | AgentObservation
  | ConversationObservation
  | SkillComponentOutcome
  | RepositoryAttachmentOutcome
  | ControllerStoreWriteOutcome;

export interface SyntheticRecordBase {
  readonly sequence: number;
  readonly provenance: ProvenanceLabel;
  readonly operationKey: string;
}

export interface AgentObservation extends SyntheticRecordBase {
  readonly kind: "lmb.practicum.v1.provisioning.agent_observation";
  readonly provenance: "package-derived-public-shape";
  readonly outcome: "created";
  readonly canonicalAgentId: string;
  readonly authoritativeMatches: readonly string[];
}

export interface ConversationObservation extends SyntheticRecordBase {
  readonly kind: "lmb.practicum.v1.provisioning.conversation_observation";
  readonly provenance: "package-derived-public-shape";
  readonly outcome: "created";
  readonly canonicalAgentId: string;
  readonly canonicalConversationId: string;
  readonly authoritativeMatches: readonly string[];
}

export interface SkillComponentOutcome extends SyntheticRecordBase {
  readonly kind: "lmb.practicum.v1.provisioning.skill_component_outcome";
  readonly provenance: "documented-behavior-fixture";
  readonly component: "manifest" | "support-file";
  readonly componentPath: string;
  readonly outcome: "accepted" | "rejected";
  readonly reasonCode?: string;
}

export interface RepositoryAttachmentOutcome extends SyntheticRecordBase {
  readonly kind: "lmb.practicum.v1.provisioning.repository_attachment_outcome";
  readonly provenance: "documented-behavior-fixture";
  readonly canonicalAgentId: string;
  readonly repositoryId: string;
  readonly attachmentOutcome: "recorded";
  readonly recompileOutcome: "failed";
  readonly reasonCode: string;
}

export interface ControllerStoreWriteOutcome extends SyntheticRecordBase {
  readonly kind: "lmb.practicum.v1.controller_store.write_outcome";
  readonly provenance: "project-method-only";
  readonly mappingKind: "agent" | "conversation";
  readonly canonicalId: string;
  readonly outcome: "failed";
  readonly reasonCode: string;
}

export interface ProvisioningResultArtifact {
  readonly scenarioId: "SCN-PROVISIONING";
  readonly namespace: "lmb.practicum.v1.provisioning";
  readonly runtimeClaim: false;
  readonly canonicalIdentities: {
    readonly agentId: string;
    readonly conversationId: string;
  };
  readonly effects: readonly EffectResult[];
  readonly controllerMappings: readonly ControllerMapping[];
  readonly assertions: AssertionResults;
}

export interface EffectResult {
  readonly order: number;
  readonly operationKey: string;
  readonly effect: "agent" | "conversation" | "repository-attachment" | "repository-recompile" | "skill-manifest" | "skill-support-file";
  readonly state: EffectState;
  readonly canonicalId: string | null;
  readonly provenance: ProvenanceLabel;
  readonly diagnostic: string;
}

export interface ControllerMapping {
  readonly order: number;
  readonly mappingKind: "agent" | "conversation";
  readonly canonicalId: string;
  readonly state: "failed";
  readonly reasonCode: string;
}

export interface ReconciliationReportArtifact {
  readonly scenarioId: "SCN-PROVISIONING";
  readonly runtimeClaim: false;
  readonly lookups: readonly ReconciliationLookup[];
  readonly ownership: readonly OwnershipEntry[];
  readonly allowedNextAction: "operator-disposition" | "retry-failed-sub-effect" | "stop";
  readonly stopReason: string | null;
  readonly assertions: AssertionResults;
}

export interface ReconciliationLookup {
  readonly order: number;
  readonly operationKey: string;
  readonly target: "agent" | "conversation" | "repository-attachment" | "skill-component";
  readonly candidateIds: readonly string[];
  readonly matchCount: number;
  readonly decision: "exactly-one" | "none" | "ambiguous";
  readonly retryPermitted: boolean;
  readonly prerequisite: string;
}

export interface OwnershipEntry {
  readonly order: number;
  readonly operationKey: string;
  readonly controllerOwnership: "intended" | "recorded" | "unrecorded";
  readonly syntheticAuthoritativeState: "exists" | "partial" | "unknown";
  readonly canonicalId: string | null;
}

export interface CleanupPlanArtifact {
  readonly scenarioId: "SCN-PROVISIONING";
  readonly runtimeClaim: false;
  readonly candidates: readonly CleanupCandidate[];
  readonly globalStopReasons: readonly string[];
  readonly assertions: AssertionResults;
}

export interface CleanupCandidate {
  readonly order: number;
  readonly operationKey: string;
  readonly targetKind: "agent" | "conversation" | "repository-attachment" | "skill-support-file";
  readonly canonicalId: string | null;
  readonly action: "delete" | "detach" | "retry-support-file" | "none";
  readonly ownershipCertain: boolean;
  readonly preconditions: readonly string[];
  readonly stopIf: readonly string[];
  readonly rationale: string;
}

export interface ControllerTraceEntry {
  readonly sequence: number;
  readonly kind: `lmb.practicum.v1.${string}`;
  readonly provenance: ProvenanceLabel;
  readonly operationKey: string;
  readonly state: string;
  readonly canonicalId: string | null;
  readonly diagnostic: string;
}

export interface AssertionResults {
  readonly critical: readonly AssertionResult[];
  readonly noncritical: readonly AssertionResult[];
}

export interface AssertionResult {
  readonly id: `S01-${"C" | "N"}${string}`;
  readonly passed: boolean;
  readonly evidence: readonly string[];
}

export interface ArtifactBundle {
  readonly "provisioning-result.json": ProvisioningResultArtifact;
  readonly "reconciliation-report.json": ReconciliationReportArtifact;
  readonly "cleanup-plan.json": CleanupPlanArtifact;
  readonly "controller-trace.jsonl": readonly ControllerTraceEntry[];
}
