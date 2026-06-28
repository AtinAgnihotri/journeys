import assert from "node:assert/strict";
import test from "node:test";
import { validateWorkflow } from "../dist/index.js";

test("@workflow-builder/core scaffold exports placeholder public APIs", () => {
  assert.throws(() => validateWorkflow({}), /validateWorkflow/);
});
