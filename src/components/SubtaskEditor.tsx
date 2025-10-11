import React, { useCallback } from 'react';
import { Subtask } from '../state/TaskContext';
import { uuid } from '../utils/uuid';

interface SubtaskEditorProps {
  value: Subtask[];
  onChange: (next: Subtask[]) => void;
}

const SubtaskEditor: React.FC<SubtaskEditorProps> = ({ value, onChange }) => {
  const updateSubtask = useCallback(
    (index: number, updates: Partial<Subtask>) => {
      onChange(
        value.map((subtask, currentIndex) =>
          currentIndex === index ? { ...subtask, ...updates } : subtask
        )
      );
    },
    [value, onChange]
  );

  const removeSubtask = useCallback(
    (index: number) => {
      onChange(value.filter((_, currentIndex) => currentIndex !== index));
    },
    [value, onChange]
  );

  const addSubtask = useCallback(() => {
    onChange([
      ...value,
      {
        id: uuid(),
        title: '',
        completed: false,
        timeEstimate: null
      }
    ]);
  }, [value, onChange]);

  return (
    <div className="subtask-editor">
      <div className="subtask-editor__header">
        <h3>Subtasks</h3>
        <button type="button" onClick={addSubtask} className="subtask-editor__add">
          + Add Subtask
        </button>
      </div>
      {value.length === 0 && <p className="subtask-editor__empty">No subtasks yet.</p>}
      {value.map((subtask, index) => (
        <div key={subtask.id} className="subtask-editor__row">
          <label className="subtask-editor__field">
            <span>Title</span>
            <input
              type="text"
              value={subtask.title}
              placeholder="Subtask title"
              onChange={(event) => updateSubtask(index, { title: event.target.value })}
            />
          </label>
          <label className="subtask-editor__field">
            <span>Time (min)</span>
            <input
              type="number"
              min={0}
              value={subtask.timeEstimate ?? ''}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === '') {
                  updateSubtask(index, { timeEstimate: null });
                  return;
                }
                const valueAsNumber = Number(raw);
                updateSubtask(index, {
                  timeEstimate: Number.isNaN(valueAsNumber) ? null : valueAsNumber
                });
              }}
            />
          </label>
          <label className="subtask-editor__checkbox">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => updateSubtask(index, { completed: !subtask.completed })}
            />
            <span>Done</span>
          </label>
          <button
            type="button"
            className="subtask-editor__remove"
            onClick={() => removeSubtask(index)}
            aria-label="Remove subtask"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubtaskEditor;
