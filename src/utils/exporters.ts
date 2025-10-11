import { Task, TaskModule, TaskStatus } from '../types';

const csvHeader = ['id', 'module', 'title', 'description', 'dueDate', 'status', 'highlighted'];

const downloadBlob = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: string | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const safe = String(value).replace(/"/g, '""');
  return `"${safe}"`;
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        const peek = line[i + 1];
        if (peek === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const validateModule = (value: string): TaskModule => {
  const modules: TaskModule[] = [
    'daily-planning',
    'daily-shutdown',
    'daily-highlights',
    'weekly-planning',
    'weekly-review'
  ];
  if (!modules.includes(value as TaskModule)) {
    throw new Error(`Unsupported module value: ${value}`);
  }
  return value as TaskModule;
};

const validateStatus = (value: string): TaskStatus => {
  const statuses: TaskStatus[] = ['not-started', 'in-progress', 'done'];
  if (!statuses.includes(value as TaskStatus)) {
    throw new Error(`Unsupported status value: ${value}`);
  }
  return value as TaskStatus;
};

const sanitizeTask = (task: Partial<Task>): Task => {
  if (!task.id) {
    throw new Error('Task is missing an id.');
  }
  if (!task.module) {
    throw new Error('Task is missing a module.');
  }
  if (!task.title) {
    throw new Error('Task is missing a title.');
  }
  return {
    id: String(task.id),
    module: validateModule(String(task.module)),
    title: String(task.title),
    description: task.description ? String(task.description) : undefined,
    dueDate: task.dueDate ? String(task.dueDate) : undefined,
    status: task.status ? validateStatus(String(task.status)) : 'not-started',
    highlighted: Boolean(task.highlighted)
  };
};

export const downloadJson = (tasks: Task[]) => {
  const content = JSON.stringify(tasks, null, 2);
  downloadBlob('tasks-export.json', content, 'application/json');
};

export const downloadCsv = (tasks: Task[]) => {
  const rows = tasks.map((task) =>
    [
      task.id,
      task.module,
      task.title,
      task.description ?? '',
      task.dueDate ?? '',
      task.status,
      task.highlighted ? 'true' : 'false'
    ]
      .map(escapeCsvValue)
      .join(',')
  );
  const csv = [csvHeader.join(','), ...rows].join('\n');
  downloadBlob('tasks-export.csv', csv, 'text/csv');
};

export const parseJsonToTasks = (payload: string): Task[] => {
  const data = JSON.parse(payload);
  if (!Array.isArray(data)) {
    throw new Error('JSON payload must be an array of tasks.');
  }
  return data.map((item) => sanitizeTask(item));
};

export const parseCsvToTasks = (payload: string): Task[] => {
  const [headerLine, ...lines] = payload.trim().split(/\r?\n/);
  if (!headerLine) {
    return [];
  }
  const headers = parseCsvLine(headerLine);
  const missingHeaders = csvHeader.filter((value) => !headers.includes(value));
  if (missingHeaders.length) {
    throw new Error(`CSV header missing fields: ${missingHeaders.join(', ')}`);
  }

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = parseCsvLine(line);
      const record = headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = cells[index] ?? '';
        return acc;
      }, {});
      return sanitizeTask({
        id: record.id,
        module: record.module,
        title: record.title,
        description: record.description || undefined,
        dueDate: record.dueDate || undefined,
        status: record.status,
        highlighted: record.highlighted === 'true'
      });
    });
};
