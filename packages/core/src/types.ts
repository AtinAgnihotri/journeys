export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type WorkflowDefinition = {
  schemaVersion: "1.0";
  id: string;
  name: string;
  description?: string;
  startNodeId: string;
  nodes: Record<string, WorkflowNode>;
  edges: Record<string, WorkflowEdge[]>;
  metadata?: JsonObject;
};

export type WorkflowNode = {
  id: string;
  label: string;
  type?: string;
  description?: string;
  data?: JsonObject;
  metadata?: JsonObject;
};

export type WorkflowEdge = {
  id: string;
  from: string;
  to: string;
  priority?: number;
  label?: string;
  when: ConditionGroup;
  metadata?: JsonObject;
};

export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "exists"
  | "not_exists"
  | "is_null"
  | "is_not_null";

export type ConditionOptions = JsonObject;

export type Condition = {
  field: string;
  operator: Operator;
  value?: JsonValue;
  options?: ConditionOptions;
};

export type ConditionGroup =
  | { always: true }
  | { all: ConditionNode[] }
  | { any: ConditionNode[] }
  | { not: ConditionNode };

export type ConditionNode = Condition | ConditionGroup;

export type WorkflowContext = Record<string, unknown>;

export type ValidationIssue = {
  code: string;
  path: Array<string | number>;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type ConditionIssue = {
  code: string;
  message: string;
};

export type ConditionResult = {
  matched: boolean;
  condition: Condition;
  actual: unknown;
  reason?: string;
  issue?: ConditionIssue;
};

export type ConditionGroupResult = {
  matched: boolean;
  details: Array<ConditionResult | ConditionGroupResult>;
  issue?: ConditionIssue;
};

export type EvaluateNextInput = {
  currentNodeId: string;
  context: WorkflowContext;
};

export type EvaluateNextResult =
  | {
      status: "matched";
      currentNode: WorkflowNode;
      nextNode: WorkflowNode;
      edge: WorkflowEdge;
      conditionResult: ConditionGroupResult;
    }
  | {
      status: "no_match";
      currentNode: WorkflowNode;
      evaluatedEdges: Array<{
        edge: WorkflowEdge;
        conditionResult: ConditionGroupResult;
      }>;
    }
  | {
      status: "invalid_current_node";
      currentNodeId: string;
    };

export type WorkflowRuntimeState = {
  currentNodeId: string;
  previousNodeId?: string;
  history: WorkflowTransitionRecord[];
};

export type WorkflowTransitionRecord = {
  fromNodeId: string;
  toNodeId: string;
  edgeId: string;
  contextSnapshot?: JsonObject;
  metadata?: JsonObject;
};

export type InspectWorkflowStateInput = {
  state: WorkflowRuntimeState;
  context?: WorkflowContext;
};

export type WorkflowStateSnapshot = {
  state: WorkflowRuntimeState;
  currentNode?: WorkflowNode;
  previousNode?: WorkflowNode;
  possibleNext: WorkflowNextCandidate[];
};

export type WorkflowNextCandidate = {
  edge: WorkflowEdge;
  node: WorkflowNode;
  priority: number;
  conditionResult?: ConditionGroupResult;
  wouldMatch?: boolean;
};

export type AdvanceWorkflowInput = {
  state: WorkflowRuntimeState;
  context: WorkflowContext;
  recordContextSnapshot?: boolean;
  metadata?: JsonObject;
};

export type AdvanceWorkflowResult =
  | {
      status: "advanced";
      state: WorkflowRuntimeState;
      evaluation: Extract<EvaluateNextResult, { status: "matched" }>;
    }
  | {
      status: "not_advanced";
      state: WorkflowRuntimeState;
      evaluation: Exclude<EvaluateNextResult, { status: "matched" }>;
    };

export type ParseWorkflowResult =
  | {
      ok: true;
      workflow: WorkflowDefinition;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };
