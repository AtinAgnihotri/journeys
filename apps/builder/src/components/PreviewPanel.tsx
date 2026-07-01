import { useMemo } from "react";
import {
  advancePreviewState,
  computePreview,
  resetPreviewState,
} from "../lib/preview";
import { useBuilder } from "../state/BuilderContext";

export function PreviewPanel() {
  const { state, dispatch } = useBuilder();
  const preview = useMemo(
    () =>
      computePreview(
        state.workflow,
        state.previewState,
        state.sampleContextJson
      ),
    [state.previewState, state.sampleContextJson, state.workflow]
  );

  return (
    <section className="panel" aria-label="Workflow preview">
      <h2>Preview</h2>
      <div className="field">
        <label htmlFor="sample-context-json">Sample context JSON</label>
        <textarea
          id="sample-context-json"
          value={state.sampleContextJson}
          onChange={(event) =>
            dispatch({ type: "set_sample_context", sampleContextJson: event.target.value })
          }
        />
      </div>
      <div className="inline-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            const result = advancePreviewState(
              state.workflow,
              state.previewState,
              state.sampleContextJson
            );
            if (result.ok) {
              dispatch({ type: "set_preview_state", previewState: result.previewState });
            }
          }}
        >
          Advance preview
        </button>
        <button
          type="button"
          className="button"
          onClick={() =>
            dispatch({
              type: "reset_preview",
              workflow: state.workflow,
            })
          }
        >
          Reset preview
        </button>
      </div>

      {preview.status === "invalid_context_json" ? (
        <p className="helper-text">Invalid context JSON: {preview.message}</p>
      ) : (
        <div className="preview-result">
          <p>
            Current node:{" "}
            <strong>{preview.snapshot.currentNode?.label ?? preview.snapshot.state.currentNodeId}</strong>
          </p>
          <p>
            Previous node:{" "}
            <strong>{preview.snapshot.previousNode?.label ?? "none"}</strong>
          </p>
          <p>
            Evaluation status: <strong>{preview.evaluation.status}</strong>
          </p>
          {preview.evaluation.status === "matched" ? (
            <p>
              Matched next node:{" "}
              <strong>{preview.evaluation.nextNode.label}</strong> via edge{" "}
              <strong>{preview.evaluation.edge.id}</strong>
            </p>
          ) : null}
          <div>
            <strong>Possible next nodes</strong>
            <ul>
              {preview.snapshot.possibleNext.map((candidate) => (
                <li key={candidate.edge.id}>
                  {candidate.node.label} (priority {candidate.priority}
                  {candidate.wouldMatch !== undefined
                    ? `, wouldMatch=${String(candidate.wouldMatch)}`
                    : ""}
                  )
                </li>
              ))}
            </ul>
          </div>
          <pre>{JSON.stringify(preview.evaluation, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

export { resetPreviewState };
