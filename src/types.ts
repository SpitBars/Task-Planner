export type TaskModule =
  | 'daily-planning'
  | 'daily-shutdown'
  | 'daily-highlights'
  | 'weekly-planning'
  | 'weekly-review';

export type TaskStatus = 'not-started' | 'in-progress' | 'done';

export interface Task {
  id: string;
  module: TaskModule;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  highlighted?: boolean;
}

export interface TaskSummary {
  module: TaskModule;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  highlightCount: number;
}

export interface ModulePrompt {
  title: string;
  description: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ModuleDefinition {
  slug: TaskModule;
  title: string;
  description: string;
}

export interface ChecklistState {
  [module in TaskModule]: Record<string, boolean>;
}
