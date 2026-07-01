import { useMemo } from "react";
import {
  deleteEdge,
  findEdge,
  updateEdge,
} from "../lib/workflowMutations";
import { useBuilder } from "../state/BuilderContext";
import { ConditionGroupEditor } from "./ConditionGroupEditor";

type EdgeInspectorProps = {
  edgeId: string;
};

export function EdgeInspector({ edgeId }: EdgeInspectorProps) {
  const { state, dispatch } = useBuilder();
  const located = useMemo(
    () => findEdge(state.workflow, edgeId),
    [edgeId, state.workflow]
  );

  if (!located) {
    return <p className="inspector-empty">Edge not found.</p>;
  }

  const { edge } = located;

  return (
    <div>
      <h2>Edge inspector</h2>
      <p className="helper-text">
        {edge.from} → {edge.to}
      </p>
      <div className="field">
        <label htmlFor={`edge-label-${edge.id}`}>Label</label>
        <input
          id={`edge-label-${edge.id}`}
          value={edge.label ?? ""}
          onChange={(event) =>
            dispatch({
              type: "update_workflow",
              workflow: updateEdge(state.workflow, edge.id, {
                label: event.target.value || undefined,
              }),
            })
          }
        />
      </div>
      <div className="field">
        <label htmlFor={`edge-priority-${edge.id}`}>Priority</label>
        <input
          id={`edge-priority-${edge.id}`}
          type="number"
          value={edge.priority ?? 0}
          onChange={(event) => {
            const priority = Number(event.target.value);
            dispatch({
              type: "update_workflow",
              workflow: updateEdge(state.workflow, edge.id, {
                priority: Number.isFinite(priority) ? priority : 0,
              }),
            });
          }}
        />
      </div>
      <ConditionGroupEditor
        group={edge.when}
        onChange={(when) =>
          dispatch({
            type: "update_workflow",
            workflow: updateEdge(state.workflow, edge.id, { when }),
          })
        }
      />
      <button
        type="button"
        className="button button--danger"
        onClick={() => {
          dispatch({
            type: "update_workflow",
            workflow: deleteEdge(state.workflow, edge.id),
          });
          dispatch({ type: "set_selected", selected: null });
        }}
      >
        Delete edge
      </button>
    </div>
  );
}
