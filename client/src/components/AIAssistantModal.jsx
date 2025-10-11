import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const modalRootId = 'modal-root';

export function AIAssistantModal({ open, onClose, onSubmit, task }) {
  useEffect(() => {
    let root = document.getElementById(modalRootId);
    if (!root) {
      root = document.createElement('div');
      root.id = modalRootId;
      document.body.appendChild(root);
    }
  }, []);

  if (!open || !task) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get('prompt');
    onSubmit({ prompt });
  };

  const modalContent = (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__container" onClick={(event) => event.stopPropagation()}>
        <div className="modal__panel">
          <header>
            <h2 className="modal__title">Ask the assistant about “{task.title}”</h2>
            <p className="modal__subtitle">Provide extra details or constraints so the AI can tailor its guidance.</p>
          </header>
          <form className="modal__form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="assistant-prompt">
              Prompt
            </label>
            <textarea
              id="assistant-prompt"
              name="prompt"
              required
              rows={5}
              className="field-input"
              placeholder="Ask for help rewriting the task, breaking it down, estimating time, etc."
            />
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Send prompt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById(modalRootId));
}
