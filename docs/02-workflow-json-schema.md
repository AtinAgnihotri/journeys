# Workflow JSON Schema

## Design Principles

- JSON is the source of truth.
- The schema must be readable in code review.
- A workflow must be valid without the builder UI.
- IDs should be stable strings.
- Edge conditions are structured JSON, not a DSL.
- The evaluator must not depend on object key iteration except where explicitly
  documented.

## Top-Level Shape

```ts
type WorkflowDefinition = {
  schemaVersion: "1.0";
  id: string;
  name: string;
  description?: string;
  startNodeId: string;
  nodes: Record<string, WorkflowNode>;
  edges: Record<string, WorkflowEdge[]>;
  metadata?: JsonObject;
};
```

Example:

```json
{
  "schemaVersion": "1.0",
  "id": "loan-journey",
  "name": "Loan Journey",
  "description": "Routes users based on LVR and address.",
  "startNodeId": "start",
  "nodes": {
    "start": { "id": "start", "label": "Start", "type": "start" },
    "low-lvr": { "id": "low-lvr", "label": "Low LVR Offer", "type": "screen" },
    "review": { "id": "review", "label": "Manual Review", "type": "screen" }
  },
  "edges": {
    "start": [
      {
        "id": "edge-1",
        "from": "start",
        "to": "low-lvr",
        "priority": 10,
        "when": {
          "all": [
            { "field": "loanValueRatio", "operator": "lt", "value": 70 }
          ]
        }
      },
      {
        "id": "edge-2",
        "from": "start",
        "to": "review",
        "priority": 20,
        "when": { "always": true }
      }
    ]
  }
}
```

## Nodes

```ts
type WorkflowNode = {
  id: string;
  label: string;
  type?: string;
  description?: string;
  data?: JsonObject;
  metadata?: JsonObject;
};
```

Node `type` is intentionally open. The core package should not prescribe domain
meaning. Suggested examples:

- `start`
- `screen`
- `decision`
- `terminal`
- `action`
- `content`

Validation rules:

- `id` must be non-empty.
- `label` must be non-empty.
- the key in `nodes` must equal `node.id`.
- `startNodeId` must exist in `nodes`.

## Edges

```ts
type WorkflowEdge = {
  id: string;
  from: string;
  to: string;
  priority?: number;
  label?: string;
  when: ConditionGroup;
  metadata?: JsonObject;
};
```

Validation rules:

- `id` must be non-empty.
- `from` must exist in `nodes`.
- `to` must exist in `nodes`.
- the edge must appear under `edges[edge.from]`.
- `priority` defaults to `0` if omitted.
- duplicate edge IDs should be validation errors.

## Conditions

There are two condition shapes:

1. a single comparison condition
2. a logical group

```ts
type ConditionGroup =
  | { always: true }
  | { all: ConditionNode[] }
  | { any: ConditionNode[] }
  | { not: ConditionNode };

type ConditionNode = Condition | ConditionGroup;
```

Comparison condition:

```ts
type Condition = {
  field: string;
  operator: Operator;
  value?: JsonValue;
  options?: ConditionOptions;
};
```

`field` is a key in the runtime context object. It can be any string that is safe
as a JSON key. For V1, treat it as a direct key, not a dot-path. This avoids
ambiguous escaping for keys that contain dots. If nested lookup is needed later,
add an explicit path array:

```json
{ "path": ["loanApplications", 0, "lvr"], "operator": "lt", "value": 70 }
```

Do not overload `field: "loanApplications.0.lvr"` in V1.

## JSON Base Types

```ts
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
```

The evaluator should only compare JSON-compatible values.

## Operators

Use lower-case operator names in JSON.

| Operator | Value Required | Valid Actual Types | Meaning |
| --- | --- | --- | --- |
| `eq` | yes | any JSON value | deep JSON equality |
| `neq` | yes | any JSON value | not deep JSON equality |
| `gt` | yes | number or string | actual > expected |
| `gte` | yes | number or string | actual >= expected |
| `lt` | yes | number or string | actual < expected |
| `lte` | yes | number or string | actual <= expected |
| `contains` | yes | string or array | string includes value, or array contains value |
| `not_contains` | yes | string or array | inverse of `contains` |
| `starts_with` | yes | string | string prefix check |
| `ends_with` | yes | string | string suffix check |
| `in` | yes | any JSON value | actual is one of expected array values |
| `not_in` | yes | any JSON value | actual is not one of expected array values |
| `exists` | no | any | context key exists and is not `undefined` |
| `not_exists` | no | any | context key is missing or `undefined` |
| `is_null` | no | any | actual is `null` |
| `is_not_null` | no | any | actual is not `null` and exists |

Omit regex from V1 unless there is a strong use case. Regex introduces security,
portability, and UX complexity. It can be added later as `matches` with explicit
limits and documentation.

## Operator Semantics

### Equality

Use deep JSON equality, not JavaScript reference equality.

```ts
eq({ a: 1 }, { a: 1 }) === true
eq([1, 2], [1, 2]) === true
```

Object key order should not matter.

### Numeric And String Comparisons

For `gt`, `gte`, `lt`, and `lte`:

- if both values are numbers, compare numerically
- if both values are strings, compare lexicographically
- otherwise return a type mismatch condition result

Do not coerce strings to numbers.

### Contains

For strings:

```ts
"London, UK".includes("London")
```

For arrays, use deep JSON equality against array members:

```ts
contains(["a", { x: 1 }], { x: 1 }) === true
```

### Exists

The context is a JavaScript object at runtime, so `undefined` may appear even
though it is not valid JSON. Treat `undefined` as missing.

```ts
exists({ age: 0 }, "age") === true
exists({ age: null }, "age") === true
exists({ age: undefined }, "age") === false
exists({}, "age") === false
```

## Condition Result Shape

The evaluator should expose detailed results for debugging and UI preview:

```ts
type ConditionResult = {
  matched: boolean;
  condition: Condition;
  actual: unknown;
  reason?: string;
  issue?: {
    code: string;
    message: string;
  };
};
```

For groups:

```ts
type ConditionGroupResult = {
  matched: boolean;
  details: Array<ConditionResult | ConditionGroupResult>;
};
```

## Evaluation Result Shape

```ts
type EvaluateNextInput = {
  currentNodeId: string;
  context: WorkflowContext;
};

type EvaluateNextResult =
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
```

## Runtime State Shape

The workflow definition JSON is static. It should not store where a user or
session currently is. Runtime position should be represented separately so the
same workflow can be reused by many sessions, users, previews, or tests.

```ts
type WorkflowRuntimeState = {
  currentNodeId: string;
  previousNodeId?: string;
  history: WorkflowTransitionRecord[];
};

type WorkflowTransitionRecord = {
  fromNodeId: string;
  toNodeId: string;
  edgeId: string;
  contextSnapshot?: JsonObject;
  metadata?: JsonObject;
};
```

The core package should not automatically add timestamps because that makes
state updates less deterministic. Host apps can store timestamps in `metadata`
when they need audit trails.

## Runtime Inspection Shape

Apps often need to ask:

- where is the workflow now?
- where did it come from?
- what nodes could come next?
- which next node would currently match this context?

Expose this through an inspection result:

```ts
type InspectWorkflowStateInput = {
  state: WorkflowRuntimeState;
  context?: WorkflowContext;
};

type WorkflowStateSnapshot = {
  state: WorkflowRuntimeState;
  currentNode?: WorkflowNode;
  previousNode?: WorkflowNode;
  possibleNext: WorkflowNextCandidate[];
};

type WorkflowNextCandidate = {
  edge: WorkflowEdge;
  node: WorkflowNode;
  priority: number;
  conditionResult?: ConditionGroupResult;
  wouldMatch?: boolean;
};
```

If `context` is omitted, `possibleNext` should list structural outgoing edges
without condition results. If `context` is provided, each candidate should
include the evaluated condition result and `wouldMatch`.

## Runtime Advancement Shape

```ts
type AdvanceWorkflowInput = {
  state: WorkflowRuntimeState;
  context: WorkflowContext;
  recordContextSnapshot?: boolean;
  metadata?: JsonObject;
};

type AdvanceWorkflowResult =
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
```

`advanceWorkflow` should call `evaluateNext` using `state.currentNodeId`. If an
edge matches, it returns a new state:

```ts
{
  currentNodeId: result.nextNode.id,
  previousNodeId: result.currentNode.id,
  history: [
    ...state.history,
    {
      fromNodeId: result.currentNode.id,
      toNodeId: result.nextNode.id,
      edgeId: result.edge.id
    }
  ]
}
```

It must not mutate the input state.

## Validation Issue Codes

Use stable issue codes so tests and UI logic do not depend on exact wording.

Suggested V1 codes:

- `workflow.not_object`
- `workflow.unsupported_schema_version`
- `workflow.id_required`
- `workflow.name_required`
- `workflow.start_node_missing`
- `node.id_required`
- `node.key_mismatch`
- `node.duplicate_id`
- `edge.id_required`
- `edge.duplicate_id`
- `edge.from_missing`
- `edge.to_missing`
- `edge.key_mismatch`
- `edge.priority_invalid`
- `condition.invalid_group`
- `condition.field_required`
- `condition.operator_invalid`
- `condition.value_required`
- `condition.value_unexpected`
- `condition.nesting_too_deep`

## Invalid Examples

### Edge Stored Under Wrong Source

```json
{
  "edges": {
    "start": [
      { "id": "e1", "from": "other", "to": "end", "when": { "always": true } }
    ]
  }
}
```

This should produce `edge.key_mismatch`.

### Unsupported Expression DSL

```json
{
  "when": {
    "expression": "age >= 29"
  }
}
```

This should produce `condition.invalid_group`.

## Future Schema Extensions

Potential post-V1 additions:

- path arrays for nested context lookup
- reusable condition fragments
- node and edge layout metadata from the builder
- schema migrations
- custom operator registration for runtime-only workflows
- optional namespaced metadata for host apps

Avoid adding these until V1 is stable.
