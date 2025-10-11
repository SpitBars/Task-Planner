import { modulePrompts } from '../data/modules';
import { TaskModule } from '../types';
import '../styles/prompt-list.css';

interface PromptListProps {
  module: TaskModule;
}

const PromptList = ({ module }: PromptListProps) => {
  const prompts = modulePrompts[module];

  return (
    <div className="section-card prompt-list">
      <h3>Guided prompts</h3>
      <ul>
        {prompts.map((prompt) => (
          <li key={prompt.title}>
            <strong>{prompt.title}</strong>
            <p>{prompt.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromptList;
