import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import DataToolbar from './components/DataToolbar';
import ModuleView from './components/modules/ModuleView';
import TaskProvider from './context/TaskContext';
import { moduleDefinitions } from './data/modules';

const App = () => {
  return (
    <TaskProvider>
      <div className="app-shell">
        <Navigation />
        <main className="content">
          <DataToolbar />
          <Routes>
            <Route path="/" element={<Navigate to="/daily-planning" replace />} />
            {moduleDefinitions.map((module) => (
              <Route key={module.slug} path={`/${module.slug}`} element={<ModuleView {...module} />} />
            ))}
            <Route path="*" element={<Navigate to="/daily-planning" replace />} />
          </Routes>
        </main>
      </div>
    </TaskProvider>
  );
};

export default App;
