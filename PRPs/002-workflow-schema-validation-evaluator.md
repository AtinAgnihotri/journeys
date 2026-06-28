# PRP 002: Workflow Schema Validation And Evaluator

## Goal

Implement the actual core package behavior: validation, JSON parsing,
serialization, condition evaluation, edge evaluation, and graph inspection.

## Context To Read First

- `docs/02-workflow-json-schema.md`
- `docs/03-evaluation-engine.md`
- `docs/01-architecture.md`

## Files To Create Or Update

Suggested:

```text
packages/core/src/types.ts
packages/core/src/validation.ts
packages/core/src/evaluate.ts
packages/core/src/json.ts
packages/core/src/graph.ts
packages/core/src/equality.ts
packages/core/src/index.ts
packages/core/tests/validation.test.ts
packages/core/tests/evaluate.test.ts
packages/core/tests/graph.test.ts
```

## Subagent Guidance

The lead agent must stabilize `packages/core/src/types.ts` first. After that,
parallelize:

- Validation subagent: `validation.ts` and `validation.test.ts`.
- Evaluator subagent: `evaluate.ts`, `equality.ts`, and `evaluate.test.ts`.
- Graph helper subagent: `graph.ts` and `graph.test.ts`.
- Runtime state subagent: `runtime-state.ts` and `runtime-state.test.ts`.
- API integration subagent: `index.ts`, package exports, and docs drift check.

The lead agent must merge result types and public exports. No subagent should
change operator names, schema version, or JSON shape without lead approval.

## Public API

Export:

```ts
validateWorkflow
assertValidWorkflow
parseWorkflowJson
serializeWorkflow
evaluateCondition
evaluateConditionGroup
evaluateNext
createWorkflowState
inspectWorkflowState
advanceWorkflow
getOutgoingEdges
getIncomingEdges
getPossibleNextNodes
getReachableNodeIds
findUnreachableNodes
findDeadEnds
```

## Validation Requirements

Return:

```ts
type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};
```

Use stable issue codes from `docs/02-workflow-json-schema.md`.

Validation must check:

- top-level object
- `schemaVersion === "1.0"`
- required `id`, `name`, and `startNodeId`
- `nodes` is object
- node key equals node ID
- start node exists
- `edges` is object if present; default absent edges to empty in helper logic
- every edge has ID, from, to, when
- `from` and `to` exist
- edge appears under `edges[edge.from]`
- duplicate edge IDs
- priority is finite number if present
- condition groups are valid
- comparison condition operators are valid
- required values are present for value-taking operators
- values are absent or ignored for no-value operators
- condition nesting depth is bounded

## Evaluation Requirements

Implement exactly the algorithm in `docs/03-evaluation-engine.md`.

Important:

- no `eval`
- no `new Function`
- no string expression parser
- no implicit string-to-number coercion
- deterministic priority order
- type mismatches return failed condition results, not thrown errors
- do not add runtime dependencies unless the maintainer explicitly approves the
  dependency and documents why local TypeScript code is worse
- preserve the package-manager age gate for all installs

## Runtime State Requirements

Implement runtime state helpers from `docs/02-workflow-json-schema.md` and
`docs/03-evaluation-engine.md`.

Required behavior:

- `createWorkflowState(workflow)` starts at `workflow.startNodeId`.
- `createWorkflowState(workflow, initialNodeId)` starts at the provided node ID.
- runtime state includes `currentNodeId`, optional `previousNodeId`, and
  `history`.
- `inspectWorkflowState` returns current node, previous node, and possible next
  candidates.
- possible next candidates are sorted with the same priority rules as
  `evaluateNext`.
- when context is supplied, possible next candidates include condition results
  and `wouldMatch`.
- `advanceWorkflow` calls `evaluateNext` from `state.currentNodeId`.
- matched evaluation returns a new state with updated current node, previous
  node, and appended history record.
- no-match or invalid-current-node evaluation returns the original state with
  status `not_advanced`.
- helpers must not mutate the input state.

## Deep Equality

Implement JSON deep equality:

- primitives use `Object.is`, except `NaN` is not valid JSON and should not
  appear in workflow values
- arrays compare length and item order
- objects compare keys independent of insertion order

## Operator Tests

Add tests for:

- `eq`
- `neq`
- `gt`
- `gte`
- `lt`
- `lte`
- `contains`
- `not_contains`
- `starts_with`
- `ends_with`
- `in`
- `not_in`
- `exists`
- `not_exists`
- `is_null`
- `is_not_null`

## Evaluation Tests

Add tests for:

- invalid current node
- no outgoing edges
- no matching edge
- create workflow runtime state
- inspect current and previous node
- inspect possible next nodes with and without context
- advance workflow state on match
- preserve state on no match
- preserve state on invalid current node
- prove runtime state updates are immutable
- first matching edge
- priority ordering
- equal priority keeps array order
- `always: true` fallback
- nested `all`
- nested `any`
- nested `not`
- context field exists with `null`
- context field missing
- context field present but `undefined`

## Graph Helper Tests

Add tests for:

- outgoing edges
- incoming edges
- reachable nodes
- unreachable nodes
- dead ends

## Pseudocode For Validation Traversal

```ts
function validateWorkflow(input) {
  const issues = [];

  if (!isPlainObject(input)) {
    issue("workflow.not_object", []);
    return { valid: false, issues };
  }

  validateTopLevel(input, issues);
  validateNodes(input.nodes, issues);
  validateEdges(input.edges, input.nodes, issues);
  validateConditionGroups(input.edges, issues);
  validateGraphWarnings(input, issues);

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}
```

## Acceptance Criteria

- All core tests pass.
- Docs schema examples validate.
- Invalid examples in docs fail with expected issue codes.
- `evaluateNext` returns the documented result shapes.
- The core package has no browser DOM or framework dependency.
- changes are committed in logical chunks. Prefer separate commits for
  validation, evaluator/runtime state, graph helpers, and public API wiring when
  these streams are implemented independently.
