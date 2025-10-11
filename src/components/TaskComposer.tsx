import { FormEvent, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskModule, TaskStatus } from '../types';
import '../styles/task-composer.css';

interface TaskComposerProps {
  module: TaskModule;
}

const TaskComposer = ({ module }: TaskComposerProps) => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not-started');
  const [highlighted, setHighlighted] = useState(module === 'daily-highlights');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    addTask({
      module,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      status,
      highlighted
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('not-started');
    setHighlighted(module === 'daily-highlights');
  };

  return (
    <form className="task-composer section-card" onSubmit={handleSubmit}>
      <div className="task-composer__header">
        <h3>Create a task</h3>
        <button type="submit" className="primary">Add task</button>
      </div>
      <label className="input-group">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you want to accomplish?"
          required
        />
      </label>
      <label className="input-group">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add optional context, links, or success criteria"
          rows={3}
        />
      </label>
      <div className="task-composer__row">
        <label className="input-group">
          <span>Due date</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label className="input-group">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={highlighted}
            onChange={(event) => setHighlighted(event.target.checked)}
          />
          <span>Mark as highlight</span>
        </label>
      </div>
    </form>
  );
};

export default TaskComposer;
