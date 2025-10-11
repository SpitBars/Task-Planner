import React from 'react';
import { Tag } from '../state/TaskContext';

interface TagChipProps {
  tag: Tag;
  onClick?: () => void;
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const toRGBA = (color: string, alpha: number) => {
  if (!color) {
    return `rgba(99, 102, 241, ${alpha})`;
  }

  const hex = color.replace('#', '');
  if (hex.length !== 3 && hex.length !== 6) {
    return `rgba(99, 102, 241, ${alpha})`;
  }

  const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TagChip: React.FC<TagChipProps> = ({ tag, onClick, active = false, removable, onRemove }) => {
  const background = toRGBA(tag.color, active ? 0.25 : 0.18);
  const border = toRGBA(tag.color, 0.35);

  return (
    <span
      className={`tag-chip ${active ? 'tag-chip--active' : ''}`}
      style={{
        '--chip-color': tag.color,
        background,
        borderColor: border
      } as React.CSSProperties}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && onClick) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <span className="tag-chip__color" aria-hidden />
      <span className="tag-chip__label">{tag.name}</span>
      {removable && (
        <button
          type="button"
          className="tag-chip__remove"
          aria-label={`Remove ${tag.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagChip;
