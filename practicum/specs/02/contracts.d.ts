import type {
  BootstrapStateResult,
  RecoverPendingApprovalsResult,
  SDKErrorMessage,
  SDKMessage,
  SDKResultMessage,
  SessionDeviceStatus,
} from "@letta-ai/letta-agent-sdk";

/**
 * Read-only, exact-static Scenario 2 contract.
 *
 * The imports above are intentionally type-only and come only from the exact
 * root export ledger for @letta-ai/letta-agent-sdk 0.8.9. They are compatibility
 * witnesses, not runtime values and not permission to execute the scenario.
 */

declare namespace LmbPracticumV1StreamRecovery {
  type Namespace = "lmb.practicum.v1.stream_recovery";
  type ScenarioId = "SCN-SESSION-RECOVERY";
  type SubmissionDirectory = "submission/SCN-SESSION-RECOVERY";
  type Sequence = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type Role = "user" | "assistant";
  type QueueDisposition =
    | "active-turn-queue"
    | "durable-enqueue-candidate"
    | "reject-or-defer";
  type TranscriptStatus = "provisional" | "reconciled" | "conflict";
  type Provenance =
    | "local-input"
    | "synthetic-stream"
    | "canonical-history";

  interface RootSdkTypeWitnesses {
    readonly bootstrapStateResult?: BootstrapStateResult;
    readonly recoverPendingApprovalsResult?: RecoverPendingApprovalsResult;
    readonly sdkErrorMessage?: SDKErrorMessage;
    readonly sdkMessage?: SDKMessage;
    readonly sdkResultMessage?: SDKResultMessage;
    readonly sessionDeviceStatus?: SessionDeviceStatus;
  }

  interface ScenarioInput {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly scenarioId: ScenarioId;
    readonly submissionDirectory: SubmissionDirectory;
    readonly namespace: Namespace;
    readonly fixtureAuthority: "project-method-only";
    readonly executionAuthorized: false;
    readonly scoringAuthorized: false;
    readonly normalization: {
      readonly unicode: "NFC";
      readonly lineEndings: "LF";
      readonly jsonObjectKeys: "lexicographic-code-point-order";
      readonly jsonlRepresentation: "ordered-array-in-artifact-bundle";
      readonly recordOrder: "ascending-sequence";
      readonly transcriptOrder: readonly ["canonicalOrdinal", "firstObservedSequence", "entryId"];
      readonly fragmentDeduplicationKey: readonly ["turnKey", "fragmentId"];
      readonly historyDeduplicationKey: "messageId";
      readonly unorderedStringArrays: "ascending-lexicographic-code-point-order";
    };
    readonly recoveryPolicy: {
      readonly maximumAttempts: 2;
      readonly blindResendAllowed: false;
      readonly pendingApprovalBlocksContinuation: true;
      readonly terminalStopReasonWhenInsufficient: "evidence-insufficient-at-recovery-bound";
    };
    readonly protectedPerturbations: {
      readonly minimumCount: 2;
      readonly valuesIncluded: false;
      readonly learnerAccess: "none";
      readonly insertionPoints: readonly {
        readonly id: "PP-S02-A" | "PP-S02-B";
        readonly afterSequence: 4 | 6;
        readonly beforeSequence: 5 | 7;
        readonly custodian: "independent-evaluator";
        readonly disclosure: "withheld";
      }[];
      readonly custody: {
        readonly contentOwner: "assessment-administrator";
        readonly insertionAuthority: "independent-evaluator";
        readonly integrityReviewer: "independent-integrity-reviewer";
        readonly learnerVisibleCopyMayContainValues: false;
        readonly answerArtifactsMayContainValues: false;
      };
    };
    readonly events: readonly InputEvent[];
  }

  interface InputArrived {
    readonly sequence: 1 | 10;
    readonly kind: `${Namespace}.queue.input_arrived`;
    readonly inputId: "input-001" | "input-002";
    readonly turnKey: "turn-001" | "turn-002";
    readonly text:
      | "Summarize the recovery checklist."
      | "Then list the stop conditions.";
  }

  interface FragmentObserved {
    readonly sequence: 2 | 3 | 4;
    readonly kind: `${Namespace}.stream.fragment_observed`;
    readonly turnKey: "turn-001";
    readonly fragmentId: "fragment-001" | "fragment-002";
    readonly provisionalMessageId: "provisional-assistant-001";
    readonly ordinal: 1 | 2;
    readonly text: "First, preserve " | "the turn identity.";
  }

  interface TransportDisconnected {
    readonly sequence: 5;
    readonly kind: `${Namespace}.transport.disconnected`;
    readonly turnKey: "turn-001";
    readonly terminalOutcomeObserved: false;
    readonly transportState: "unknown";
  }

  interface BootstrapSnapshot {
    readonly sequence: 6;
    readonly kind: `${Namespace}.bootstrap.snapshot`;
    readonly snapshotId: "bootstrap-001";
    readonly turnKey: "turn-001";
    readonly turnState: "active";
    readonly hasPendingApproval: true;
    readonly device: {
      readonly isOnline: true;
      readonly isProcessing: true;
    };
  }

  interface HistoryMessageObserved {
    readonly sequence: 7 | 8;
    readonly kind: `${Namespace}.history.message_observed`;
    readonly snapshotId: "history-001";
    readonly messageId: "message-user-001" | "message-assistant-001";
    readonly turnKey: "turn-001";
    readonly role: Role;
    readonly canonicalOrdinal: 1 | 2;
    readonly text:
      | "Summarize the recovery checklist."
      | "First, preserve the canonical turn identity.";
  }

  interface PendingApprovalObserved {
    readonly sequence: 9;
    readonly kind: `${Namespace}.approval.pending_observed`;
    readonly approvalId: "approval-001";
    readonly turnKey: "turn-001";
    readonly authorityState: "unresolved";
    readonly continuationAllowed: false;
  }

  type InputEvent =
    | InputArrived
    | FragmentObserved
    | TransportDisconnected
    | BootstrapSnapshot
    | HistoryMessageObserved
    | PendingApprovalObserved;

  interface TranscriptIdentity {
    readonly inputId: string | null;
    readonly provisionalMessageId: string | null;
    readonly canonicalMessageId: string | null;
    readonly turnKey: string;
  }

  interface TranscriptEntry {
    readonly entryId: string;
    readonly order: number;
    readonly role: Role;
    readonly text: string;
    readonly status: TranscriptStatus;
    readonly identity: TranscriptIdentity;
    readonly provenance: readonly Provenance[];
    readonly sourceSequences: readonly number[];
  }

  interface TranscriptConflict {
    readonly conflictId: string;
    readonly turnKey: string;
    readonly provisionalMessageId: string;
    readonly canonicalMessageId: string;
    readonly provisionalText: string;
    readonly canonicalText: string;
    readonly resolution: "canonical-history-retained";
  }

  interface TranscriptProjectionArtifact {
    readonly scenarioId: ScenarioId;
    readonly namespace: Namespace;
    readonly normalization: {
      readonly unicode: "NFC";
      readonly lineEndings: "LF";
      readonly entryOrder: readonly [
        "canonicalOrdinal",
        "firstObservedSequence",
        "entryId",
      ];
      readonly fragmentDeduplicationKey: readonly ["turnKey", "fragmentId"];
    };
    readonly entries: readonly TranscriptEntry[];
    readonly conflicts: readonly TranscriptConflict[];
    readonly duplicateFragmentIds: readonly string[];
  }

  interface QueueDecisionArtifact {
    readonly scenarioId: ScenarioId;
    readonly namespace: Namespace;
    readonly inputId: "input-002";
    readonly inputTurnKey: "turn-002";
    readonly unresolvedTurnKey: "turn-001";
    readonly disposition: QueueDisposition;
    readonly completed: false;
    readonly rationale: readonly string[];
    readonly durableEnqueuePerformed: false;
    readonly liveQueueMutationPerformed: false;
  }

  interface RecoveryAttempt {
    readonly attempt: 1 | 2;
    readonly evidenceConsulted: readonly (
      | "bootstrap-001"
      | "history-001"
      | "approval-001"
    )[];
    readonly resendPerformed: false;
    readonly outcome: "unresolved" | "blocked-pending-approval";
  }

  interface RecoveryPlanArtifact {
    readonly scenarioId: ScenarioId;
    readonly namespace: Namespace;
    readonly turnKey: "turn-001";
    readonly transportState: "unknown";
    readonly terminalOutcomeObserved: false;
    readonly bootstrapTurnState: "active";
    readonly pendingApproval: true;
    readonly autonomousContinuationAllowed: false;
    readonly blindResendAllowed: false;
    readonly maximumAttempts: 2;
    readonly attempts: readonly RecoveryAttempt[];
    readonly stopReason: "evidence-insufficient-at-recovery-bound";
    readonly checkpoint: {
      readonly lastInputSequence: 10;
      readonly uniqueFragmentIds: readonly string[];
      readonly canonicalMessageIds: readonly string[];
      readonly unresolvedApprovalIds: readonly string[];
    };
    readonly claimDenials: ClaimDenials;
  }

  interface ClaimDenials {
    readonly liveOrderingObserved: false;
    readonly replayObserved: false;
    readonly durabilityEstablished: false;
    readonly reconnectBehaviorObserved: false;
    readonly queueBehaviorObserved: false;
    readonly approvalRecoveryObserved: false;
    readonly accountAuthorizationEstablished: false;
    readonly runtimeReliabilityEstablished: false;
  }

  type TraceKind =
    | `${Namespace}.queue.input_recorded`
    | `${Namespace}.stream.fragment_accepted`
    | `${Namespace}.stream.fragment_duplicate_ignored`
    | `${Namespace}.transport.state_unknown`
    | `${Namespace}.bootstrap.consulted`
    | `${Namespace}.history.reconciled`
    | `${Namespace}.history.conflict_recorded`
    | `${Namespace}.approval.continuation_blocked`
    | `${Namespace}.queue.decision_recorded`
    | `${Namespace}.recovery.attempt_recorded`
    | `${Namespace}.recovery.stopped`
    | `${Namespace}.claims.denied`;

  interface ControllerTraceRecord {
    readonly sequence: number;
    readonly kind: TraceKind;
    readonly turnKey: string | null;
    readonly inputId: string | null;
    readonly detail: string;
  }

  interface ArtifactBundle {
    readonly "transcript-projection.json": TranscriptProjectionArtifact;
    readonly "queue-decision.json": QueueDecisionArtifact;
    readonly "recovery-plan.json": RecoveryPlanArtifact;
    readonly "controller-trace.jsonl": readonly ControllerTraceRecord[];
  }
}

export type Scenario2Namespace = LmbPracticumV1StreamRecovery.Namespace;
export type Scenario2InputEvent = LmbPracticumV1StreamRecovery.InputEvent;
export type Scenario2Input = LmbPracticumV1StreamRecovery.ScenarioInput;
export type Scenario2ArtifactBundle = LmbPracticumV1StreamRecovery.ArtifactBundle;
export type Scenario2RootSdkTypeWitnesses =
  LmbPracticumV1StreamRecovery.RootSdkTypeWitnesses;
