import { ChangeEvent } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskModule } from '../types';
import '../styles/summary-panel.css';

interface SummaryPanelProps {
  module: TaskModule;
}

const SummaryPanel = ({ module }: SummaryPanelProps) => {
  const { summariesByModule, summaries, setSummary } = useTasks();
  const summary = summariesByModule[module];

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(module, event.target.value);
  };

  return (
    <div className="summary-panel section-card">
      <div className="summary-panel__stats">
        <div>
          <span className="label">Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div>
          <span className="label">Completed</span>
          <strong>{summary.completed}</strong>
        </div>
        <div>
          <span className="label">In progress</span>
          <strong>{summary.inProgress}</strong>
        </div>
        <div>
          <span className="label">Highlights</span>
          <strong>{summary.highlightCount}</strong>
        </div>
        <div>
          <span className="label">Completion</span>
          <strong>{summary.completionRate}%</strong>
        </div>
      </div>
      <label className="input-group">
        <span>Summary notes</span>
        <textarea
          rows={4}
          value={summaries[module] ?? ''}
          onChange={handleChange}
          placeholder="Capture outcomes, insights, or anything you want to remember."
        />
      </label>
    </div>
  );
};

export default SummaryPanel;
