import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import SubtaskEditor from './SubtaskEditor';
import TagChip from './TagChip';
import { Subtask, useTaskContext } from '../state/TaskContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  defaultDayId: string;
  onManageTags: () => void;
}

type SubtaskDraft = Subtask;

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  defaultDayId,
  onManageTags
}) => {
  const { days, tags, tasks, addTask, updateTask } = useTaskContext();
  const existingTask = useMemo(() => tasks.find((task) => task.id === taskId), [tasks, taskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayId, setDayId] = useState(defaultDayId);
  const [timeEstimate, setTimeEstimate] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setDayId(existingTask.dayId);
      setTimeEstimate(existingTask.timeEstimate ?? null);
      setSelectedTags(existingTask.tags);
      setSubtasks(existingTask.subtasks.map((subtask) => ({ ...subtask })));
      setCompleted(existingTask.completed);
    } else {
      setTitle('');
      setDescription('');
      setDayId(defaultDayId);
      setTimeEstimate(null);
      setSelectedTags([]);
      setSubtasks([]);
      setCompleted(false);
    }
  }, [isOpen, existingTask, defaultDayId]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const sanitizedSubtasks = subtasks
      .filter((subtask) => subtask.title.trim().length > 0)
      .map((subtask) => ({
        ...subtask,
        title: subtask.title.trim(),
        timeEstimate: subtask.timeEstimate ?? null
      }));

    if (existingTask) {
      updateTask(existingTask.id, {
        title: trimmedTitle,
        description,
        dayId,
        timeEstimate,
        tags: selectedTags,
        subtasks: sanitizedSubtasks,
        completed
      });
    } else {
      addTask({
        title: trimmedTitle,
        description,
        dayId,
        timeEstimate,
        tags: selectedTags,
        subtasks: sanitizedSubtasks,
        completed
      });
    }

    onClose();
  };

  return (
    <Modal
      title={existingTask ? 'Edit Task' : 'New Task'}
      isOpen={isOpen}
      onClose={onClose}
      width="wide"
      footer={
        <div className="task-modal__footer">
          <button type="button" className="task-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="task-form" className="task-modal__save" disabled={!title.trim()}>
            {existingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      }
    >
      <form id="task-form" className="task-form" onSubmit={handleSubmit}>
        <div className="task-form__grid">
          <label className="task-form__field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Write a clear task name"
            />
          </label>
          <label className="task-form__field">
            <span>Day</span>
            <select value={dayId} onChange={(event) => setDayId(event.target.value)}>
              {days.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label className="task-form__field">
            <span>Time Estimate (minutes)</span>
            <input
              type="number"
              min={0}
              value={timeEstimate ?? ''}
              onChange={(event) =>
                setTimeEstimate(event.target.value ? Number(event.target.value) : null)
              }
              placeholder="e.g. 90"
            />
          </label>
          <label className="task-form__checkbox">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => setCompleted((value) => !value)}
            />
            <span>Mark as completed</span>
          </label>
        </div>
        <label className="task-form__field">
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add notes, resources, or context"
          />
        </label>
        <div className="task-form__tags">
          <div className="task-form__tags-header">
            <h3>Tags</h3>
            <button type="button" onClick={onManageTags} className="task-form__manage-tags">
              Manage Tags
            </button>
          </div>
          <div className="task-form__tag-list">
            {tags.length === 0 && <p className="task-form__tags-empty">No tags yet.</p>}
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                active={selectedTags.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        </div>
        <SubtaskEditor value={subtasks} onChange={setSubtasks} />
      </form>
    </Modal>
  );
};

export default TaskModal;
