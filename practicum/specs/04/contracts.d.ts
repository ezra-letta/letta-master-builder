// exact-static: these are type-only imports from the exact root SDK export ledger.
// They bind compilation to @letta-ai/letta-agent-sdk@0.8.9 but make no runtime claim.
import type {
  AgentFreeQueryOptions,
  Computer,
  ComputerSelector,
  SandboxUploadedFile,
} from "@letta-ai/letta-agent-sdk";

export type ScenarioId = "SCN-SUPERVISED-IMPROVEMENT";
export type ProjectKind =
  | "lmb.practicum.v1.topology.constraints"
  | "lmb.practicum.v1.workspace.expiry_observation"
  | "lmb.practicum.v1.controller.lease_observation"
  | "lmb.practicum.v1.controller.version_precondition"
  | "lmb.practicum.v1.supervision.signal"
  | "lmb.practicum.v1.improvement.transition";
export type ControllerId = "controller-a" | "controller-b";
export type Lane = "node-local" | "cloud-managed";
export type SupervisorAction = "continue" | "pause" | "intervene" | "stop";
export type ImprovementState =
  | "proposal"
  | "independent-evaluation"
  | "promotion"
  | "rejection"
  | "monitoring"
  | "retained"
  | "rollback";

// exact-static: useful projections only; SDK shapes do not define project behavior.
export type ExactStaticTopologyReferences = {
  queryOptions?: Pick<AgentFreeQueryOptions, "cwd" | "computer" | "sandbox">;
  computer?: Pick<Computer, "id" | "status" | "name">;
  computerSelector?: ComputerSelector;
  uploadedFile?: Pick<SandboxUploadedFile, "name" | "path" | "size">;
};

export interface TopologyDecisionArtifact {
  scenario_id: ScenarioId;
  selected_lane: Lane;
  constraints: string[];
  rationale: string[];
  rejected_alternatives: Array<{ lane: Lane; reasons: string[] }>;
  unknowns: string[];
  no_parity_inference: true;
  workspace_expiry_disposition: "fixture-only";
  non_claims: string[];
}

export interface OperationLedgerEntry {
  sequence: number;
  tick: number;
  controller_id: ControllerId;
  work_key: string;
  observed_version: number;
  expected_version: number;
  authoritative_version: number;
  cas_result: "won" | "stale" | "contended" | "duplicate" | "already-completed";
  lease_state: "active" | "lost" | "expired";
  budget_limit: number;
  budget_consumed: number;
  budget_remaining: number;
  supervisor_authority: "active" | "revoked";
  effect_dispatched: boolean;
  authoritative_completion: boolean;
  terminal_state: "completed" | "stale" | "paused" | "stopped" | "duplicate";
}

export interface OperationLedgerArtifact {
  scenario_id: ScenarioId;
  ordering_rule: "tick-kind-controller-id-record-id";
  cas_rule: "expected-version-equals-authoritative-version-lowest-controller-id-wins";
  entries: OperationLedgerEntry[];
  authoritative_owners: Array<{
    work_key: string;
    version: number;
    controller_id: ControllerId;
  }>;
  non_claims: string[];
}

export interface SupervisionReportArtifact {
  scenario_id: ScenarioId;
  signals: Array<{
    signal_id: string;
    tick: number;
    controller_id: ControllerId;
    action: SupervisorAction;
    reason: string;
  }>;
  interventions: Array<{
    tick: number;
    controller_id: ControllerId;
    action: "pause" | "intervene" | "stop";
    reason: string;
  }>;
  checkpoints: Array<{
    checkpoint_id: string;
    tick: number;
    controller_id: ControllerId;
    work_key: string;
    authoritative_version: number;
    last_completed_sequence: number;
    pending_effects: number;
  }>;
  stop_reasons: string[];
  later_effect_dispatch_blocked: true;
  incident_chronology: string[];
  non_claims: string[];
}

export interface ImprovementRecordArtifact {
  scenario_id: ScenarioId;
  proposal: {
    proposal_id: string;
    proposer_id: string;
    candidate_version: string;
    baseline_version: string;
    claim: string;
  };
  evaluator: {
    evaluator_id: string;
    distinct_from_proposer: true;
    independently_responsible: true;
  };
  frozen_evaluation: {
    evaluation_id: string;
    frozen_case_digest: `sha256:${string}`;
    gates: Array<{ gate_id: string; passed: boolean }>;
    all_mandatory_gates_passed: boolean;
  };
  transitions: Array<{
    sequence: number;
    tick: number;
    from: ImprovementState;
    to: ImprovementState;
    reason: string;
    authority_id: string;
  }>;
  promotion_decision: "promote" | "reject";
  rejection_rationale: string[];
  rollback_target: string;
  monitoring: {
    metric: string;
    operator: "less-than-or-equal";
    threshold: number;
    observations: Array<{ tick: number; value: number; certainty: "certain" | "uncertain" }>;
    terminal_decision: "retained" | "rollback" | "safe-stop";
  };
  insufficient_evidence: Array<"assistant-text" | "reflection" | "dreaming" | "commit" | "turn-success">;
  self_promotion: false;
  non_claims: string[];
}

export interface ControllerTraceRecord {
  sequence: number;
  tick: number;
  kind: ProjectKind;
  record_id: string;
  controller_id?: ControllerId;
  work_key?: string;
  version?: number;
  action?: string;
  decision?: string;
  reason?: string;
}

export interface Scenario04Input {
  kind: "lmb.practicum.v1.supervised_improvement.input";
  scenarioId: ScenarioId;
  namespace: "lmb.practicum.v1.supervised_improvement";
  submissionDirectory: `submission/${ScenarioId}`;
  specificationStatus: "ready-read-only";
  executionAuthorized: false;
  scoringAuthorized: false;
  clock: { basis: "synthetic-logical"; initial_tick: number };
  topology_constraints: {
    kind: "lmb.practicum.v1.topology.constraints";
    mission_id: string;
    primary_lane: Lane;
    candidate_lanes: Lane[];
    requirements: {
      source_locality: "local-project-directory";
      source_path: string;
      persistent_output_required: boolean;
      output_destination: `submission/${ScenarioId}`;
      file_movement_allowed: boolean;
      network_allowed: boolean;
      credentials_allowed: boolean;
      live_session_allowed: boolean;
      authority: "synthetic-controller-only";
    };
    facts: string[];
    unknowns: string[];
    no_parity_inference: true;
  };
  workspace_expiry: {
    kind: "lmb.practicum.v1.workspace.expiry_observation";
    workspace_id: string;
    lane: Lane;
    observed_tick: number;
    state: "expired";
    recoverable_files: boolean;
    scope: "this-synthetic-fixture-only";
  };
  work: {
    work_key: string;
    authoritative_version: number;
    completed_versions: number[];
    tie_break_rule: "lowest-controller-id";
  };
  controllers: Array<{
    controller_id: ControllerId;
    work_key: string;
    observed_version: number;
    claim_expected_version: number;
    observation_tick: number;
  }>;
  leases: Array<{
    kind: "lmb.practicum.v1.controller.lease_observation";
    controller_id: ControllerId;
    lease_id: string;
    tick: number;
    state: "active" | "lost";
    valid_through_tick: number;
  }>;
  budgets: Array<{
    controller_id: ControllerId;
    tick: number;
    limit: number;
    consumed: number;
    remaining: number;
  }>;
  signals: Array<{
    kind: "lmb.practicum.v1.supervision.signal";
    signal_id: string;
    tick: number;
    controller_id: ControllerId;
    action: SupervisorAction;
    reason: string;
  }>;
  candidate_improvement: {
    proposal_id: string;
    proposer_id: string;
    candidate_version: string;
    baseline_version: string;
    claim: string;
    rollback_target: string;
    self_promotion_allowed: false;
  };
  frozen_evaluation: {
    evaluation_id: string;
    evaluator_id: string;
    frozen_case_digest: `sha256:${string}`;
    proposer_is_evaluator: false;
    mandatory_gates: Array<{ gate_id: string; passed: boolean }>;
    decision: "promotion-eligible";
    evaluated_tick: number;
  };
  monitoring: {
    monitoring_id: string;
    candidate_version: string;
    baseline_version: string;
    metric: string;
    retention_threshold: {
      operator: "less-than-or-equal";
      value: number;
    };
    observations: Array<{
      tick: number;
      value: number;
      certainty: "certain" | "uncertain";
    }>;
    regression_action: "rollback";
    uncertain_action: "safe-stop";
  };
  determinism: {
    record_order: Array<
      | "topology"
      | "workspace-expiry"
      | "controller-observation"
      | "lease"
      | "budget"
      | "cas-decision"
      | "supervision"
      | "checkpoint"
      | "improvement"
      | "monitoring"
      | "terminal"
    >;
    sort_keys: string[];
    cas: {
      precondition: string;
      winner_if_multiple_valid: "lowest-controller-id";
      losers: string;
      authoritative_completion: string;
    };
  };
  protectedPerturbations: {
    minimum_count: number;
    insertion_points: Array<{
      slot_id: string;
      after_public_tick: number;
      before_public_tick: number;
    }>;
    values_in_public_specification: false;
    custody: {
      owner_role: "assessment-integrity-administrator";
      learner_access: "withheld";
      evaluator_access_before_authorized_scoring: "withheld";
      binding_method: "integrity-controlled-id-and-digest-annex";
    };
  };
  public_assertion_ids: string[];
}

export interface Scenario04ArtifactBundle {
  "topology-decision.json": TopologyDecisionArtifact;
  "operation-ledger.json": OperationLedgerArtifact;
  "supervision-report.json": SupervisionReportArtifact;
  "improvement-record.json": ImprovementRecordArtifact;
  "controller-trace.jsonl": ControllerTraceRecord[];
}
