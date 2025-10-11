import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const TaskCard = ({ task }) => {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{task.time}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{task.title}</h3>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-brand.light px-3 py-1 text-xs font-semibold text-brand">
          <ClockIcon className="h-4 w-4" />
          {task.duration}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {task.subtasks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircleIcon
                className={clsx('h-5 w-5', subtask.done ? 'text-brand' : 'text-slate-300')}
              />
              <span className={clsx(subtask.done && 'line-through text-slate-400')}>{subtask.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {task.assignees.map((initials) => (
            <span
              key={initials}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand.light text-xs font-semibold text-brand shadow-sm"
            >
              {initials}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-500 transition hover:border-brand hover:text-brand"
        >
          View
        </button>
      </div>
    </article>
  );
};

export default TaskCard;
