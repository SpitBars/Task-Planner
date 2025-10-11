import React, { createContext, useContext, useMemo, useState } from 'react';
import { initialTasks } from '../data/initialTasks';
import { moduleChecklists } from '../data/modules';
import {
  ChecklistState,
  Task,
  TaskModule,
  TaskStatus,
  TaskSummary
} from '../types';
import {
  downloadCsv,
  downloadJson,
  parseCsvToTasks,
  parseJsonToTasks
} from '../utils/exporters';

export interface TaskContextValue {
  tasks: Task[];
  summaries: Record<TaskModule, string>;
  checklist: ChecklistState;
  summariesByModule: Record<TaskModule, TaskSummary>;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, update: Partial<Task>) => void;
  removeTask: (id: string) => void;
  toggleStatus: (id: string, next: TaskStatus) => void;
  toggleHighlight: (id: string) => void;
  setSummary: (module: TaskModule, text: string) => void;
  setChecklistItem: (module: TaskModule, itemId: string, checked: boolean) => void;
  exportTasksAsJson: () => void;
  exportTasksAsCsv: () => void;
  importFromJson: (payload: string) => void;
  importFromCsv: (payload: string) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const storageKey = 'task-planner/state/v1';

type PersistedState = {
  tasks: Task[];
  summaries: Record<TaskModule, string>;
  checklist: ChecklistState;
};

const defaultChecklist = (): ChecklistState => {
  const base: Partial<ChecklistState> = {};
  Object.entries(moduleChecklists).forEach(([module, items]) => {
    base[module as TaskModule] = items.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {});
  });
  return base as ChecklistState;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadState = (): PersistedState | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed;
  } catch (error) {
    console.warn('Failed to load task planner state', error);
    return null;
  }
};

const persistState = (state: PersistedState) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist task planner state', error);
  }
};

const computeSummary = (module: TaskModule, tasks: Task[]): TaskSummary => {
  const scoped = tasks.filter((task) => task.module === module);
  const total = scoped.length;
  const completed = scoped.filter((task) => task.status === 'done').length;
  const inProgress = scoped.filter((task) => task.status === 'in-progress').length;
  const notStarted = scoped.filter((task) => task.status === 'not-started').length;
  const highlightCount = scoped.filter((task) => task.highlighted).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    module,
    total,
    completed,
    inProgress,
    notStarted,
    completionRate,
    highlightCount
  };
};

const TaskProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const seedState = typeof window === 'undefined' ? null : loadState();

  const [tasks, setTasks] = useState<Task[]>(() => seedState?.tasks ?? initialTasks);
  const [summaries, setSummaries] = useState<Record<TaskModule, string>>(
    () =>
      seedState?.summaries ?? {
        'daily-planning': '',
        'daily-shutdown': '',
        'daily-highlights': '',
        'weekly-planning': '',
        'weekly-review': ''
      }
  );
  const [checklist, setChecklist] = useState<ChecklistState>(() => seedState?.checklist ?? defaultChecklist());

  const persist = (next: Partial<PersistedState>) => {
    if (typeof window === 'undefined') return;
    const snapshot: PersistedState = {
      tasks,
      summaries,
      checklist,
      ...next
    } as PersistedState;
    persistState(snapshot);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks((current) => {
      const next: Task[] = [
        ...current,
        {
          ...task,
          id: generateId()
        }
      ];
      persist({ tasks: next });
      return next;
    });
  };

  const updateTask = (id: string, update: Partial<Task>) => {
    setTasks((current) => {
      const next = current.map((task) => (task.id === id ? { ...task, ...update } : task));
      persist({ tasks: next });
      return next;
    });
  };

  const removeTask = (id: string) => {
    setTasks((current) => {
      const next = current.filter((task) => task.id !== id);
      persist({ tasks: next });
      return next;
    });
  };

  const toggleStatus = (id: string, nextStatus: TaskStatus) => {
    updateTask(id, { status: nextStatus });
  };

  const toggleHighlight = (id: string) => {
    setTasks((current) => {
      const next = current.map((task) =>
        task.id === id
          ? {
              ...task,
              highlighted: !task.highlighted
            }
          : task
      );
      persist({ tasks: next });
      return next;
    });
  };

  const setSummary = (module: TaskModule, text: string) => {
    setSummaries((current) => {
      const next = { ...current, [module]: text };
      persist({ summaries: next });
      return next;
    });
  };

  const setChecklistItem = (module: TaskModule, itemId: string, checked: boolean) => {
    setChecklist((current) => {
      const moduleState = current[module] ?? {};
      const nextModuleState = { ...moduleState, [itemId]: checked };
      const next = { ...current, [module]: nextModuleState };
      persist({ checklist: next });
      return next;
    });
  };

  const summariesByModule = useMemo(() => {
    const summaryEntries = (Object.keys(summaries) as TaskModule[]).map((module) => [
      module,
      computeSummary(module, tasks)
    ]);
    return Object.fromEntries(summaryEntries) as Record<TaskModule, TaskSummary>;
  }, [summaries, tasks]);

  const exportTasksAsJson = () => {
    downloadJson(tasks);
  };

  const exportTasksAsCsv = () => {
    downloadCsv(tasks);
  };

  const importFromJson = (payload: string) => {
    const imported = parseJsonToTasks(payload);
    setTasks(imported);
    persist({ tasks: imported });
  };

  const importFromCsv = (payload: string) => {
    const imported = parseCsvToTasks(payload);
    setTasks(imported);
    persist({ tasks: imported });
  };

  const value: TaskContextValue = {
    tasks,
    summaries,
    checklist,
    summariesByModule,
    addTask,
    updateTask,
    removeTask,
    toggleStatus,
    toggleHighlight,
    setSummary,
    setChecklistItem,
    exportTasksAsCsv,
    exportTasksAsJson,
    importFromCsv,
    importFromJson
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextValue => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used inside a TaskProvider');
  }
  return ctx;
};

export default TaskProvider;
