import { InboxArrowDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const AgendaPanel = ({ agenda, inbox }) => {
  return (
    <aside className="flex w-full flex-col gap-6 xl:w-[22rem]">
      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Agenda</p>
            <h2 className="text-xl font-semibold text-slate-900">Upcoming</h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-brand hover:text-brand"
          >
            View all
          </button>
        </div>

        <ul className="mt-5 space-y-4">
          {agenda.map((item) => (
            <li key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand">{item.time}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
                <button type="button" className="text-slate-400 transition hover:text-brand">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-sidebar p-6 text-slate-100 shadow-xl">
        <div className="flex items-center gap-3">
          <InboxArrowDownIcon className="h-6 w-6" />
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Inbox</p>
            <h2 className="text-lg font-semibold text-white">Latest updates</h2>
          </div>
        </div>

        <ul className="mt-5 space-y-4">
          {inbox.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">
              <item.icon className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-xs text-slate-400">{item.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default AgendaPanel;
