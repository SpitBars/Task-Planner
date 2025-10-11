import TaskCard from './TaskCard.jsx';

const DayColumn = ({ day }) => {
  return (
    <section className="flex w-full min-w-[18rem] flex-col gap-4 rounded-3xl bg-surface p-4 md:w-[22rem]">
      <header className="rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">{day.name}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{day.date}</h2>
          </div>
          <span className="rounded-full bg-brand.light px-3 py-1 text-xs font-semibold text-brand">
            Focus
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">{day.focus}</p>
      </header>

      <div className="flex flex-1 flex-col gap-4">
        {day.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-sm text-slate-400"
          data-dropzone="true"
        >
          <span className="font-semibold text-slate-500">Drag task here</span>
          <span className="text-xs text-slate-400">Drop to reschedule or add new work</span>
        </div>
      </div>
    </section>
  );
};

export default DayColumn;
