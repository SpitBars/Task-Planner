import React from 'react';
import Modal from './Modal';
import { useTaskContext } from '../state/TaskContext';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fallbackColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose }) => {
  const { tags, addTag, updateTag, deleteTag } = useTaskContext();

  const handleAddTag = () => {
    const nextColor = fallbackColors[tags.length % fallbackColors.length];
    const newId = addTag({ name: 'New tag', color: nextColor });
    requestAnimationFrame(() => {
      const input = document.getElementById(`tag-name-${newId}`) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  };

  return (
    <Modal
      title="Manage Tags"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="tag-modal__footer">
          <button type="button" className="tag-modal__add" onClick={handleAddTag}>
            + Add Tag
          </button>
          <button type="button" className="tag-modal__close" onClick={onClose}>
            Done
          </button>
        </div>
      }
      width="narrow"
    >
      <div className="tag-modal__body">
        {tags.length === 0 && <p className="tag-modal__empty">No tags yet. Create one to get started.</p>}
        {tags.map((tag) => (
          <div key={tag.id} className="tag-modal__row">
            <label className="tag-modal__field">
              <span>Name</span>
              <input
                id={`tag-name-${tag.id}`}
                type="text"
                value={tag.name}
                onChange={(event) => updateTag(tag.id, { name: event.target.value })}
              />
            </label>
            <label className="tag-modal__field tag-modal__field--color">
              <span>Color</span>
              <input
                type="color"
                value={tag.color}
                onChange={(event) => updateTag(tag.id, { color: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="tag-modal__delete"
              onClick={() => deleteTag(tag.id)}
              aria-label={`Delete tag ${tag.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default TagModal;
