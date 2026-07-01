import assert from "node:assert/strict";
import test from "node:test";
import {
  findDeadEnds,
  findUnreachableNodes,
  getIncomingEdges,
  getOutgoingEdges,
  getPossibleNextNodes,
  getReachableNodeIds,
} from "../dist/index.js";
import { basicWorkflow, linearWorkflow } from "./fixtures.mjs";

test("getOutgoingEdges returns priority-sorted edges", () => {
  const edges = getOutgoingEdges(basicWorkflow, "start");
  assert.equal(edges.length, 2);
  assert.equal(edges[0].id, "low-lvr");
  assert.equal(edges[1].id, "fallback-review");
});

test("getIncomingEdges finds edges targeting a node", () => {
  const incoming = getIncomingEdges(basicWorkflow, "review");
  assert.equal(incoming.length, 1);
  assert.equal(incoming[0].id, "fallback-review");
});

test("getPossibleNextNodes mirrors inspect possible next behavior", () => {
  const structural = getPossibleNextNodes(basicWorkflow, "start");
  assert.equal(structural.length, 2);
  assert.equal(structural[0].wouldMatch, undefined);

  const evaluated = getPossibleNextNodes(basicWorkflow, "start", {
    loanValueRatio: 60,
  });
  assert.equal(evaluated[0].wouldMatch, true);
});

test("getReachableNodeIds traverses from start node", () => {
  const reachable = getReachableNodeIds(linearWorkflow);
  assert.deepEqual([...reachable].sort(), ["a", "b"]);
});

test("findUnreachableNodes returns nodes not reachable from start", () => {
  const unreachable = findUnreachableNodes(linearWorkflow);
  assert.equal(unreachable.length, 1);
  assert.equal(unreachable[0].id, "orphan");
});

test("findDeadEnds returns non-terminal nodes without outgoing edges", () => {
  const deadEnds = findDeadEnds(basicWorkflow);
  assert.ok(deadEnds.some((node) => node.id === "offer"));
  assert.ok(deadEnds.some((node) => node.id === "review"));
  assert.equal(deadEnds.some((node) => node.id === "start"), false);
});
