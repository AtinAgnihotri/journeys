import { useBuilder } from "../state/BuilderContext";
import { copyWorkflowJson } from "../lib/export";

type JsonExportDialogProps = {
  onClose: () => void;
};

export function JsonExportDialog({ onClose }: JsonExportDialogProps) {
  const { state } = useBuilder();
  const jsonText = copyWorkflowJson(state.workflow);

  const onDownload = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${state.workflow.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-json-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="export-json-title">Export workflow JSON</h2>
        <div className="field">
          <label htmlFor="export-json-text">Formatted JSON</label>
          <textarea id="export-json-text" readOnly value={jsonText} />
        </div>
        <p className="helper-text">
          Export uses the core serializer and validates before formatting.
        </p>
        <div className="dialog__actions">
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="button button--primary" onClick={onDownload}>
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}
