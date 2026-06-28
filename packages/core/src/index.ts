export type {
  AdvanceWorkflowInput,
  AdvanceWorkflowResult,
  Condition,
  ConditionGroup,
  ConditionGroupResult,
  ConditionIssue,
  ConditionNode,
  ConditionOptions,
  ConditionResult,
  EvaluateNextInput,
  EvaluateNextResult,
  InspectWorkflowStateInput,
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  Operator,
  ParseWorkflowResult,
  ValidationIssue,
  ValidationResult,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNextCandidate,
  WorkflowNode,
  WorkflowRuntimeState,
  WorkflowStateSnapshot,
  WorkflowTransitionRecord,
} from "./types";

import type {
  AdvanceWorkflowInput,
  AdvanceWorkflowResult,
  Condition,
  ConditionGroup,
  ConditionGroupResult,
  ConditionResult,
  EvaluateNextInput,
  EvaluateNextResult,
  InspectWorkflowStateInput,
  ParseWorkflowResult,
  ValidationResult,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNextCandidate,
  WorkflowNode,
  WorkflowRuntimeState,
  WorkflowStateSnapshot,
} from "./types";

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented yet. See PRP 002.`);
}

export function validateWorkflow(_workflow: unknown): ValidationResult {
  return notImplemented("validateWorkflow");
}

export function assertValidWorkflow(
  _workflow: unknown
): asserts _workflow is WorkflowDefinition {
  notImplemented("assertValidWorkflow");
}

export function parseWorkflowJson(_json: string): ParseWorkflowResult {
  return notImplemented("parseWorkflowJson");
}

export function serializeWorkflow(_workflow: WorkflowDefinition): string {
  return notImplemented("serializeWorkflow");
}

export function evaluateCondition(
  _condition: Condition,
  _context: WorkflowContext
): ConditionResult {
  return notImplemented("evaluateCondition");
}

export function evaluateConditionGroup(
  _group: ConditionGroup,
  _context: WorkflowContext
): ConditionGroupResult {
  return notImplemented("evaluateConditionGroup");
}

export function evaluateNext(
  _workflow: WorkflowDefinition,
  _input: EvaluateNextInput
): EvaluateNextResult {
  return notImplemented("evaluateNext");
}

export function createWorkflowState(
  _workflow: WorkflowDefinition,
  _initialNodeId?: string
): WorkflowRuntimeState {
  return notImplemented("createWorkflowState");
}

export function inspectWorkflowState(
  _workflow: WorkflowDefinition,
  _input: InspectWorkflowStateInput
): WorkflowStateSnapshot {
  return notImplemented("inspectWorkflowState");
}

export function advanceWorkflow(
  _workflow: WorkflowDefinition,
  _input: AdvanceWorkflowInput
): AdvanceWorkflowResult {
  return notImplemented("advanceWorkflow");
}

export function getOutgoingEdges(
  _workflow: WorkflowDefinition,
  _nodeId: string
): WorkflowEdge[] {
  return notImplemented("getOutgoingEdges");
}

export function getIncomingEdges(
  _workflow: WorkflowDefinition,
  _nodeId: string
): WorkflowEdge[] {
  return notImplemented("getIncomingEdges");
}

export function getPossibleNextNodes(
  _workflow: WorkflowDefinition,
  _stateOrNodeId: WorkflowRuntimeState | string,
  _context?: WorkflowContext
): WorkflowNextCandidate[] {
  return notImplemented("getPossibleNextNodes");
}

export function getReachableNodeIds(
  _workflow: WorkflowDefinition,
  _startNodeId?: string
): Set<string> {
  return notImplemented("getReachableNodeIds");
}

export function findUnreachableNodes(
  _workflow: WorkflowDefinition
): WorkflowNode[] {
  return notImplemented("findUnreachableNodes");
}

export function findDeadEnds(_workflow: WorkflowDefinition): WorkflowNode[] {
  return notImplemented("findDeadEnds");
}
