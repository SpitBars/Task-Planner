import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useTaskContext } from '../state/TaskContext';
import TaskColumn from './TaskColumn';

interface TaskBoardProps {
  onAddTask: (dayId: string) => void;
  onEditTask: (taskId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onAddTask, onEditTask }) => {
  const { days, handleDragEnd, getTasksByDay } = useTaskContext();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="task-board">
        {days.map((day) => (
          <TaskColumn
            key={day.id}
            day={day}
            tasks={getTasksByDay(day.id)}
            onAddTask={() => onAddTask(day.id)}
            onEditTask={onEditTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
