import React, { useMemo } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { DayColumn, Task } from '../state/TaskContext';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  day: DayColumn;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
}

function formatMinutes(minutes: number): string {
  if (!minutes) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (remaining > 0) {
    parts.push(`${remaining}m`);
  }
  return parts.join(' ') || '0m';
}

const TaskColumn: React.FC<TaskColumnProps> = ({ day, tasks, onAddTask, onEditTask }) => {
  const totalMinutes = useMemo(
    () =>
      tasks.reduce((sum, task) => {
        const taskMinutes = task.timeEstimate ?? 0;
        const subtaskMinutes = task.subtasks.reduce(
          (subtaskSum, subtask) => subtaskSum + (subtask.timeEstimate ?? 0),
          0
        );
        return sum + taskMinutes + subtaskMinutes;
      }, 0),
    [tasks]
  );

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="task-column" aria-label={`${day.label} task column`}>
      <header className="task-column__header">
        <div>
          <h2>{day.label}</h2>
          <p className="task-column__meta">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} · {completedCount} done ·{' '}
            {formatMinutes(totalMinutes)} total
          </p>
        </div>
        <button type="button" className="task-column__add" onClick={onAddTask}>
          + Add Task
        </button>
      </header>
      <Droppable droppableId={day.id}>
        {(provided, snapshot) => (
          <div
            className={`task-column__list ${snapshot.isDraggingOver ? 'task-column__list--over' : ''}`}
            ref={(element) => provided.innerRef(element)}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <div
                    ref={(element) => draggableProvided.innerRef(element)}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                    className={`task-column__card-wrapper ${
                      draggableSnapshot.isDragging ? 'task-column__card-wrapper--dragging' : ''
                    }`}
                  >
                    <TaskCard task={task} onEdit={() => onEditTask(task.id)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <p className="task-column__empty">No tasks yet. Click “Add Task” to create one.</p>
            )}
          </div>
        )}
      </Droppable>
    </section>
  );
};

export default TaskColumn;
