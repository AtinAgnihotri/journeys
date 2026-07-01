import { buildPossibleNextCandidates } from "./runtime-state.js";
import type {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNextCandidate,
  WorkflowNode,
  WorkflowContext,
  WorkflowRuntimeState,
} from "./types.js";
import { sortEdges } from "./utils.js";

export function getOutgoingEdges(
  workflow: WorkflowDefinition,
  nodeId: string
): WorkflowEdge[] {
  return sortEdges(workflow.edges[nodeId] ?? []);
}

export function getIncomingEdges(
  workflow: WorkflowDefinition,
  nodeId: string
): WorkflowEdge[] {
  const incoming: WorkflowEdge[] = [];

  for (const edgeList of Object.values(workflow.edges)) {
    for (const edge of edgeList) {
      if (edge.to === nodeId) {
        incoming.push(edge);
      }
    }
  }

  return sortEdges(incoming);
}

export function getPossibleNextNodes(
  workflow: WorkflowDefinition,
  stateOrNodeId: WorkflowRuntimeState | string,
  context?: WorkflowContext
): WorkflowNextCandidate[] {
  const nodeId =
    typeof stateOrNodeId === "string"
      ? stateOrNodeId
      : stateOrNodeId.currentNodeId;

  return buildPossibleNextCandidates(workflow, nodeId, context);
}

export function getReachableNodeIds(
  workflow: WorkflowDefinition,
  startNodeId: string = workflow.startNodeId
): Set<string> {
  const reachable = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (nodeId === undefined || reachable.has(nodeId)) {
      continue;
    }

    if (!workflow.nodes[nodeId]) {
      continue;
    }

    reachable.add(nodeId);

    for (const edge of workflow.edges[nodeId] ?? []) {
      queue.push(edge.to);
    }
  }

  return reachable;
}

export function findUnreachableNodes(
  workflow: WorkflowDefinition
): WorkflowNode[] {
  const reachable = getReachableNodeIds(workflow);

  return Object.values(workflow.nodes).filter((node) => !reachable.has(node.id));
}

export function findDeadEnds(workflow: WorkflowDefinition): WorkflowNode[] {
  return Object.values(workflow.nodes).filter((node) => {
    const outgoing = workflow.edges[node.id] ?? [];
    return outgoing.length === 0 && node.type !== "terminal";
  });
}
