import React, { useMemo } from 'react';
import { Subtask, Task, useTaskContext } from '../state/TaskContext';
import TagChip from './TagChip';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) {
    return '0m';
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (remaining > 0) {
    parts.push(`${remaining}m`);
  }
  return parts.join(' ') || '0m';
}

function totalSubtaskMinutes(subtasks: Subtask[]): number {
  return subtasks.reduce((sum, subtask) => sum + (subtask.timeEstimate ?? 0), 0);
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { tags, toggleTaskCompletion, deleteTask, toggleSubtaskCompletion } = useTaskContext();
  const activeTags = useMemo(
    () => tags.filter((tag) => task.tags.includes(tag.id)),
    [tags, task.tags]
  );
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
  const subtasksMinutes = totalSubtaskMinutes(task.subtasks);

  return (
    <article className={`task-card ${task.completed ? 'task-card--completed' : ''}`}>
      <header className="task-card__header">
        <label className="task-card__title">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task.id)}
            aria-label={`Toggle completion for ${task.title}`}
          />
          <span>{task.title}</span>
        </label>
        <div className="task-card__actions">
          <button type="button" onClick={onEdit} aria-label={`Edit ${task.title}`}>
            Edit
          </button>
          <button
            type="button"
            className="task-card__delete"
            onClick={() => deleteTask(task.id)}
            aria-label={`Delete ${task.title}`}
          >
            Delete
          </button>
        </div>
      </header>
      {task.description && <p className="task-card__description">{task.description}</p>}
      {activeTags.length > 0 && (
        <div className="task-card__tags">
          {activeTags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <div className="task-card__meta">
        <span>
          Task Time: <strong>{formatMinutes(task.timeEstimate)}</strong>
        </span>
        {task.subtasks.length > 0 && (
          <span>
            Subtasks: <strong>{completedSubtasks}</strong> / {task.subtasks.length}
          </span>
        )}
        {(task.timeEstimate ?? 0) + subtasksMinutes > 0 && (
          <span>
            Total: <strong>{formatMinutes((task.timeEstimate ?? 0) + subtasksMinutes)}</strong>
          </span>
        )}
      </div>
      {task.subtasks.length > 0 && (
        <ul className="task-card__subtasks">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id}>
              <label>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                  aria-label={`Toggle subtask ${subtask.title}`}
                />
                <span className={subtask.completed ? 'task-card__subtask--done' : ''}>
                  {subtask.title}
                </span>
              </label>
              {subtask.timeEstimate != null && subtask.timeEstimate > 0 && (
                <span className="task-card__subtask-time">{formatMinutes(subtask.timeEstimate)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

export default TaskCard;
