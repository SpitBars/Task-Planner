import { NavLink, Outlet } from 'react-router-dom';
import { Bars3CenterLeftIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { navigation, quickActions } from '../data/sampleData.js';
import LogoMark from '../components/LogoMark.jsx';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-sidebar text-slate-100 shadow-2xl lg:min-h-screen lg:w-64">
          <div className="flex items-center justify-between px-6 py-5 lg:py-6">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-sm uppercase tracking-widest text-slate-400">Task Planner</p>
                <p className="text-lg font-semibold text-white">Product Ops</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
              aria-label="Open navigation"
            >
              <Bars3CenterLeftIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="px-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                        isActive ? 'bg-white text-sidebar shadow-lg' : 'text-slate-300 hover:bg-white/10'
                      ].join(' ')
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 space-y-3 px-6 pb-10">
            <p className="text-xs uppercase tracking-widest text-slate-500">Quick actions</p>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm font-medium text-slate-200 backdrop-blur transition hover:bg-white/15"
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-5 w-5" />
                    {action.name}
                  </span>
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
