import { useBuilder } from "../state/BuilderContext";
import { EdgeInspector } from "./EdgeInspector";
import { NodeInspector, useAddNodeAction } from "./NodeInspector";

export function InspectorPanel() {
  const { state } = useBuilder();
  const onAddNode = useAddNodeAction();

  if (!state.selected) {
    return (
      <aside className="inspector-panel">
        <h2>Inspector</h2>
        <p className="inspector-empty">Select a node or edge on the canvas.</p>
        <div className="inline-actions">
          <button type="button" className="button button--primary" onClick={onAddNode}>
            Add node
          </button>
        </div>
      </aside>
    );
  }

  if (state.selected.type === "node") {
    const node = state.workflow.nodes[state.selected.id];
    if (!node) {
      return (
        <aside className="inspector-panel">
          <p className="inspector-empty">Selected node no longer exists.</p>
        </aside>
      );
    }

    return (
      <aside className="inspector-panel">
        <NodeInspector node={node} />
      </aside>
    );
  }

  return (
    <aside className="inspector-panel">
      <EdgeInspector edgeId={state.selected.id} />
    </aside>
  );
}
