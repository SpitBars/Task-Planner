import { MagnifyingGlassIcon, BellAlertIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import DayColumn from '../components/DayColumn.jsx';
import AgendaPanel from '../components/AgendaPanel.jsx';
import { agenda, days, inbox } from '../data/sampleData.js';

const DashboardPage = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-6 py-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Weekly Summary</p>
            <h1 className="text-3xl font-semibold text-slate-900">Week 34 planning</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search tasks"
                className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-600 shadow-sm focus:border-brand focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand hover:text-brand"
              aria-label="Notifications"
            >
              <BellAlertIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-brand"></span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand hover:text-brand"
            >
              This week
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden px-4 py-6 lg:px-6 xl:flex-row">
        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 gap-5 overflow-x-auto pb-4">
            {days.map((day) => (
              <DayColumn key={day.name} day={day} />
            ))}
          </div>
        </section>

        <AgendaPanel agenda={agenda} inbox={inbox} />
      </div>
    </div>
  );
};

export default DashboardPage;
