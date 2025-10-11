import { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskModule, TaskStatus } from '../types';
import '../styles/task-list.css';

interface TaskListProps {
  module: TaskModule;
}

const statusLabels: Record<TaskStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done'
};

const TaskList = ({ module }: TaskListProps) => {
  const { tasks, toggleStatus, removeTask, toggleHighlight } = useTasks();

  const scopedTasks = useMemo(() => tasks.filter((task) => task.module === module), [module, tasks]);

  if (!scopedTasks.length) {
    return (
      <div className="section-card task-list">
        <p className="empty-state">No tasks yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="section-card task-list">
      <ul>
        {scopedTasks.map((task) => (
          <li key={task.id} className={task.highlighted ? 'highlighted' : undefined}>
            <div className="task-list__header">
              <div>
                <h4>{task.title}</h4>
                {task.description && <p>{task.description}</p>}
              </div>
              <button className="ghost" onClick={() => removeTask(task.id)}>
                Remove
              </button>
            </div>
            <div className="task-list__footer">
              <div className="meta">
                <label>
                  <span>Status</span>
                  <select
                    value={task.status}
                    onChange={(event) => toggleStatus(task.id, event.target.value as TaskStatus)}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {task.dueDate && <span className="due">Due {task.dueDate}</span>}
              </div>
              <label className="highlight-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(task.highlighted)}
                  onChange={() => toggleHighlight(task.id)}
                />
                <span>Highlight</span>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
