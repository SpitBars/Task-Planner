import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from '../utils/uuid';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  timeEstimate: number | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dayId: string;
  order: number;
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  timeEstimate: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayColumn {
  id: string;
  label: string;
}

const STORAGE_KEY = 'task-planner-state-v1';

interface TaskState {
  days: DayColumn[];
  tasks: Task[];
  tags: Tag[];
}

export type TaskInput = Omit<
  Task,
  'id' | 'order' | 'createdAt' | 'updatedAt'
> & {
  id?: string;
  order?: number;
};

interface DragLocation {
  droppableId: string;
  index: number;
}

export interface DragResult {
  draggableId: string;
  source: DragLocation;
  destination: DragLocation | null;
}

interface TaskContextValue extends TaskState {
  addTask: (input: TaskInput) => string;
  updateTask: (id: string, updates: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  updateSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  handleDragEnd: (result: DragResult) => void;
  addTag: (tag: Omit<Tag, 'id'>) => string;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  getTasksByDay: (dayId: string) => Task[];
}

const defaultDays: DayColumn[] = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

const defaultState: TaskState = {
  days: defaultDays,
  tasks: [],
  tags: []
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

function loadState(): TaskState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as TaskState;
    const mergedDays = defaultDays.map((day) =>
      parsed.days.find((stored) => stored.id === day.id) ?? day
    );

    return {
      days: mergedDays,
      tasks: (parsed.tasks ?? []).map((task) => ({
        ...task,
        subtasks: (task.subtasks ?? []).map((subtask) => ({
          ...subtask,
          timeEstimate: subtask.timeEstimate ?? null
        }))
      })),
      tags: parsed.tags ?? []
    };
  } catch (error) {
    console.warn('Failed to load planner state', error);
    return defaultState;
  }
}

function normalizeOrder(tasks: Task[], dayId: string): Task[] {
  const dayTasks = tasks
    .filter((task) => task.dayId === dayId)
    .sort((a, b) => a.order - b.order);

  return tasks.map((task) => {
    if (task.dayId !== dayId) {
      return task;
    }

    const newIndex = dayTasks.findIndex((candidate) => candidate.id === task.id);
    return {
      ...task,
      order: newIndex === -1 ? task.order : newIndex
    };
  });
}

function reorderWithinDay(tasks: Task[], dayId: string, start: number, finish: number): Task[] {
  const current = tasks
    .filter((task) => task.dayId === dayId)
    .sort((a, b) => a.order - b.order);

  const [moved] = current.splice(start, 1);
  current.splice(finish, 0, moved);

  const reorderedIds = new Map<string, number>();
  current.forEach((task, index) => {
    reorderedIds.set(task.id, index);
  });

  const movedId = moved?.id ?? null;
  const timestamp = new Date().toISOString();

  return tasks.map((task) => {
    if (task.dayId !== dayId) {
      return task;
    }

    const order = reorderedIds.get(task.id);
    if (order === undefined) {
      return task;
    }

    return {
      ...task,
      order,
      updatedAt: task.id === movedId ? timestamp : task.updatedAt
    };
  });
}

function moveTaskAcrossDays(
  tasks: Task[],
  taskId: string,
  source: DragLocation,
  destination: DragLocation
): Task[] {
  const movingTask = tasks.find((task) => task.id === taskId);
  if (!movingTask) {
    return tasks;
  }

  const sourceList = tasks
    .filter((task) => task.dayId === source.droppableId)
    .sort((a, b) => a.order - b.order);
  const destinationList = tasks
    .filter((task) => task.dayId === destination.droppableId)
    .sort((a, b) => a.order - b.order);

  const [removed] = sourceList.splice(source.index, 1);
  const timestamp = new Date().toISOString();
  const nextTask = {
    ...removed,
    dayId: destination.droppableId,
    updatedAt: timestamp
  };

  destinationList.splice(destination.index, 0, nextTask);

  const updatedSource = sourceList.map((task, index) => ({
    ...task,
    order: index
  }));

  const updatedDestination = destinationList.map((task, index) => ({
    ...task,
    order: index,
    updatedAt: task.id === nextTask.id ? timestamp : task.updatedAt
  }));

  const updates = new Map<string, Task>();
  [...updatedSource, ...updatedDestination].forEach((task) => {
    updates.set(task.id, task);
  });

  return tasks.map((task) => updates.get(task.id) ?? task);
}

export const TaskProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<TaskState>(() => loadState());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getTasksByDay = useCallback(
    (dayId: string) =>
      state.tasks
        .filter((task) => task.dayId === dayId)
        .sort((a, b) => a.order - b.order),
    [state.tasks]
  );

  const addTask = useCallback(
    (input: TaskInput) => {
      const dayTasks = getTasksByDay(input.dayId);
      const now = new Date().toISOString();
      const newTask: Task = {
        id: input.id ?? uuid(),
        title: input.title,
        description: input.description,
        dayId: input.dayId,
        order: input.order ?? dayTasks.length,
        tags: input.tags ?? [],
        subtasks: (input.subtasks ?? []).map((subtask) => ({
          ...subtask,
          id: subtask.id ?? uuid(),
          completed: subtask.completed ?? false,
          timeEstimate: subtask.timeEstimate ?? null
        })),
        completed: input.completed ?? false,
        timeEstimate: input.timeEstimate ?? null,
        createdAt: now,
        updatedAt: now
      };

      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));

      return newTask.id;
    },
    [getTasksByDay]
  );

  const updateTask = useCallback((id: string, updates: TaskInput) => {
    setState((prev) => {
      const currentTask = prev.tasks.find((task) => task.id === id);
      if (!currentTask) {
        return prev;
      }

      const nextDayId = updates.dayId ?? currentTask.dayId;
      const hasDayChanged = nextDayId !== currentTask.dayId;
      const nextOrder = updates.order ??
        (hasDayChanged
          ? prev.tasks.filter((task) => task.dayId === nextDayId && task.id !== id).length
          : currentTask.order);

      const nextSubtasks = updates.subtasks
        ? updates.subtasks.map((subtask) => ({
            ...subtask,
            id: subtask.id ?? uuid(),
            completed: subtask.completed ?? false,
            timeEstimate: subtask.timeEstimate ?? null
          }))
        : currentTask.subtasks;

      const updatedTasks = prev.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              dayId: nextDayId,
              order: nextOrder,
              subtasks: nextSubtasks,
              updatedAt: new Date().toISOString()
            }
          : task
      );

      if (hasDayChanged) {
        const normalized = normalizeOrder(
          normalizeOrder(updatedTasks, currentTask.dayId),
          nextDayId
        );
        return {
          ...prev,
          tasks: normalized
        };
      }

      return {
        ...prev,
        tasks: normalizeOrder(updatedTasks, nextDayId)
      };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id)
    }));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    }));
  }, []);

  const toggleSubtaskCompletion = useCallback((taskId: string, subtaskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
          updatedAt: new Date().toISOString()
        };
      })
    }));
  }, []);

  const updateSubtasks = useCallback((taskId: string, subtasks: Subtask[]) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: subtasks.map((subtask) => ({
                ...subtask,
                id: subtask.id ?? uuid(),
                completed: subtask.completed ?? false,
                timeEstimate: subtask.timeEstimate ?? null
              })),
              updatedAt: new Date().toISOString()
            }
          : task
      )
    }));
  }, []);

  const handleDragEnd = useCallback(
    (result: DragResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) {
        return;
      }

      setState((prev) => {
        if (source.droppableId === destination.droppableId) {
          const reordered = reorderWithinDay(
            prev.tasks,
            source.droppableId,
            source.index,
            destination.index
          );
          return {
            ...prev,
            tasks: reordered
          };
        }

        const moved = moveTaskAcrossDays(prev.tasks, draggableId, source, destination);
        return {
          ...prev,
          tasks: moved
        };
      });
    },
    []
  );

  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: uuid() };
    setState((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    return newTag.id;
  }, []);

  const updateTag = useCallback((id: string, updates: Partial<Omit<Tag, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
      tasks: prev.tasks.map((task) =>
        task.tags.includes(id)
          ? { ...task, tags: [...new Set(task.tags)] }
          : task
      )
    }));
  }, []);

  const deleteTag = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.id !== id),
      tasks: prev.tasks.map((task) => ({
        ...task,
        tags: task.tags.filter((tagId) => tagId !== id)
      }))
    }));
  }, []);

  const value = useMemo<TaskContextValue>(
    () => ({
      ...state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      toggleSubtaskCompletion,
      updateSubtasks,
      handleDragEnd,
      addTag,
      updateTag,
      deleteTag,
      getTasksByDay
    }),
    [
      state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      toggleSubtaskCompletion,
      updateSubtasks,
      handleDragEnd,
      addTag,
      updateTag,
      deleteTag,
      getTasksByDay
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
