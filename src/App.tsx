import React, { useMemo, useState } from 'react';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import TagModal from './components/TagModal';
import { useTaskContext } from './state/TaskContext';

const App: React.FC = () => {
  const { tasks } = useTaskContext();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isTagModalOpen, setTagModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('monday');

  const totalCompleted = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const totalTime = useMemo(
    () =>
      tasks.reduce((sum, task) => {
        const taskTime = task.timeEstimate ?? 0;
        const subtaskTime = task.subtasks.reduce(
          (subSum, subtask) => subSum + (subtask.timeEstimate ?? 0),
          0
        );
        return sum + taskTime + subtaskTime;
      }, 0),
    [tasks]
  );

  const openTaskModalForDay = (dayId: string) => {
    setSelectedDay(dayId);
    setActiveTaskId(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (task) {
      setSelectedDay(task.dayId);
    }
    setActiveTaskId(taskId);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setActiveTaskId(null);
  };

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <h1>Task Planner</h1>
          <p>
            {tasks.length} total · {totalCompleted} completed · {totalTime} min tracked
          </p>
        </div>
        <div className="app-shell__actions">
          <button type="button" className="primary" onClick={() => openTaskModalForDay(selectedDay)}>
            New Task
          </button>
          <button type="button" onClick={() => setTagModalOpen(true)}>
            Manage Tags
          </button>
        </div>
      </header>
      <main>
        <TaskBoard onAddTask={openTaskModalForDay} onEditTask={handleEditTask} />
      </main>
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        taskId={activeTaskId}
        defaultDayId={selectedDay}
        onManageTags={() => setTagModalOpen(true)}
      />
      <TagModal isOpen={isTagModalOpen} onClose={() => setTagModalOpen(false)} />
    </div>
  );
};

export default App;
