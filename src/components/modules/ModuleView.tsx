import ChecklistPanel from '../ChecklistPanel';
import PromptList from '../PromptList';
import SummaryPanel from '../SummaryPanel';
import TaskComposer from '../TaskComposer';
import TaskList from '../TaskList';
import '../../styles/module-view.css';
import { ModuleDefinition } from '../../types';

interface ModuleViewProps extends ModuleDefinition {}

const ModuleView = ({ slug, title, description }: ModuleViewProps) => {
  return (
    <div className="module-view">
      <header className="content__header">
        <div>
          <h2>{title}</h2>
          <p className="module-description">{description}</p>
        </div>
      </header>
      <SummaryPanel module={slug} />
      <TaskComposer module={slug} />
      <TaskList module={slug} />
      <div className="module-view__grid">
        <PromptList module={slug} />
        <ChecklistPanel module={slug} />
      </div>
    </div>
  );
};

export default ModuleView;
