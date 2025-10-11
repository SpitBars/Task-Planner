import { moduleChecklists } from '../data/modules';
import { useTasks } from '../context/TaskContext';
import { TaskModule } from '../types';
import '../styles/checklist-panel.css';

interface ChecklistPanelProps {
  module: TaskModule;
}

const ChecklistPanel = ({ module }: ChecklistPanelProps) => {
  const items = moduleChecklists[module];
  const { checklist, setChecklistItem } = useTasks();
  const state = checklist[module] ?? {};

  return (
    <div className="section-card checklist-panel">
      <h3>Checklist</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(state[item.id])}
                onChange={(event) => setChecklistItem(module, item.id, event.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistPanel;
