import { NavLink } from 'react-router-dom';
import { moduleDefinitions } from '../data/modules';
import '../styles/navigation.css';

const Navigation = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar__header">
        <h1>Task Planner</h1>
        <p>Structure your day and week with purpose.</p>
      </div>
      <div className="sidebar__section">
        <h2>Daily rituals</h2>
        <ul>
          {moduleDefinitions
            .filter((module) => module.slug.startsWith('daily'))
            .map((module) => (
              <li key={module.slug}>
                <NavLink
                  to={`/${module.slug}`}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {module.title}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
      <div className="sidebar__section">
        <h2>Weekly cadence</h2>
        <ul>
          {moduleDefinitions
            .filter((module) => module.slug.startsWith('weekly'))
            .map((module) => (
              <li key={module.slug}>
                <NavLink
                  to={`/${module.slug}`}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {module.title}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
