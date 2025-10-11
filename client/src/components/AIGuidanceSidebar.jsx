import { LightBulbIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';

const sections = [
  {
    key: 'dailySuggestions',
    title: 'Daily Suggestions',
    icon: LightBulbIcon,
    description: 'AI powered focus ideas and quick wins for today.'
  },
  {
    key: 'smartSchedule',
    title: 'Smart Schedule',
    icon: ClockIcon,
    description: 'Structured plan that fits your focus blocks and deadlines.'
  },
  {
    key: 'recap',
    title: 'Daily Recap',
    icon: SparklesIcon,
    description: 'Celebrate wins and prepare the next steps for tomorrow.'
  },
];

export function AIGuidanceSidebar({ responses, loading, onRequest }) {
  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2 className="sidebar__title">AI Guidance</h2>
        <p className="sidebar__subtitle">Use the assistant to refine your plan and stay on track.</p>
      </header>
      <div className="sidebar__sections">
        {sections.map(({ key, title, icon: Icon, description }) => {
          const isLoading = loading?.[key];
          const response = responses?.[key];
          return (
            <section key={key} className="sidebar-section">
              <div className="sidebar-section__header">
                <span className="sidebar-section__icon">
                  <Icon aria-hidden className="sidebar-section__icon-svg" />
                </span>
                <div>
                  <h3 className="sidebar-section__title">{title}</h3>
                  <p className="sidebar-section__description">{description}</p>
                </div>
              </div>
              <div className="sidebar-section__body">
                {isLoading && <p className="sidebar-section__placeholder">Generating insights…</p>}
                {!isLoading && response && (
                  <article className="sidebar-section__content" dangerouslySetInnerHTML={{ __html: markdownToHtml(response) }} />
                )}
                {!isLoading && !response && (
                  <p className="sidebar-section__placeholder">No guidance yet. Provide context or request support.</p>
                )}
              </div>
              <div className="sidebar-section__actions">
                <button type="button" className="btn btn-secondary" disabled={isLoading} onClick={() => onRequest(key)}>
                  {isLoading ? 'Working…' : 'Refresh'}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function markdownToHtml(markdown = '') {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
    .replace(/^\s*[-*] (.*)$/gim, '<li>$1</li>')
    .replace(/\n{2,}/gim, '</p><p>')
    .replace(/\n/gim, '<br />')
    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    .replace(/<p><\/p>/gim, '');
}
