import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

type DragDirection = 'vertical' | 'horizontal';

interface DragLocation {
  droppableId: string;
  index: number;
}

export interface DropResult {
  draggableId: string;
  source: DragLocation;
  destination: DragLocation | null;
}

interface DragState {
  draggableId: string;
  source: DragLocation;
  size: { width: number; height: number };
}

interface DragContextValue {
  beginDrag: (state: DragState) => void;
  completeDrop: (destination: DragLocation | null) => void;
  dragStateRef: React.MutableRefObject<DragState | null>;
}

const DragContext = createContext<DragContextValue | null>(null);
const DroppableIdContext = createContext<string | null>(null);

export interface DragDropContextProps {
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}

export const DragDropContext: React.FC<DragDropContextProps> = ({ onDragEnd, children }) => {
  const dragStateRef = useRef<DragState | null>(null);
  const dropHandledRef = useRef(false);

  const beginDrag = useCallback((state: DragState) => {
    dragStateRef.current = state;
    dropHandledRef.current = false;
  }, []);

  const completeDrop = useCallback(
    (destination: DragLocation | null) => {
      const current = dragStateRef.current;
      if (!current) {
        return;
      }

      onDragEnd({
        draggableId: current.draggableId,
        source: current.source,
        destination
      });
      dragStateRef.current = null;
      dropHandledRef.current = true;
    },
    [onDragEnd]
  );

  useEffect(() => {
    const handleDragEnd = () => {
      const current = dragStateRef.current;
      if (!current) {
        return;
      }

      if (!dropHandledRef.current) {
        onDragEnd({
          draggableId: current.draggableId,
          source: current.source,
          destination: null
        });
      }

      dragStateRef.current = null;
      dropHandledRef.current = false;
    };

    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, [onDragEnd]);

  const value = useMemo<DragContextValue>(
    () => ({
      beginDrag,
      completeDrop,
      dragStateRef
    }),
    [beginDrag, completeDrop]
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
};

interface DroppableProvided {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: React.HTMLAttributes<HTMLElement> & {
    'data-rbd-droppable-id': string;
  };
  placeholder: React.ReactNode;
}

interface DroppableStateSnapshot {
  isDraggingOver: boolean;
}

interface DroppableProps {
  droppableId: string;
  direction?: DragDirection;
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
}

function computeVerticalIndex(
  container: HTMLElement,
  pointerOffset: { x: number; y: number },
  activeId: string | null
): number {
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('[data-rbd-draggable-id]')
  );

  if (items.length === 0) {
    return 0;
  }

  for (let index = 0; index < items.length; index += 1) {
    const element = items[index];
    if (element.dataset.rbdDraggableId === activeId) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (pointerOffset.y < midpoint) {
      return index;
    }
  }

  return items.length;
}

function computeHorizontalIndex(
  container: HTMLElement,
  pointerOffset: { x: number; y: number },
  activeId: string | null
): number {
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('[data-rbd-draggable-id]')
  );

  if (items.length === 0) {
    return 0;
  }

  for (let index = 0; index < items.length; index += 1) {
    const element = items[index];
    if (element.dataset.rbdDraggableId === activeId) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    if (pointerOffset.x < midpoint) {
      return index;
    }
  }

  return items.length;
}

export const Droppable: React.FC<DroppableProps> = ({
  droppableId,
  direction = 'vertical',
  children
}) => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('Droppable must be used within a DragDropContext');
  }
  const { dragStateRef, completeDrop } = context;
  const containerRef = useRef<HTMLElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const activeId = dragStateRef.current?.draggableId ?? null;
  const placeholderHeight = dragStateRef.current?.size.height ?? 12;

  const getIndexFromEvent = useCallback(
    (event: React.DragEvent) => {
      const container = containerRef.current;
      if (!container) {
        return 0;
      }
      const point = { x: event.clientX, y: event.clientY };
      if (direction === 'horizontal') {
        return computeHorizontalIndex(container, point, activeId);
      }
      return computeVerticalIndex(container, point, activeId);
    },
    [direction, activeId]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setIsDraggingOver(true);
      containerRef.current?.classList.add('rbd-droppable--dragging-over');
    },
    []
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsDraggingOver(false);
    containerRef.current?.classList.remove('rbd-droppable--dragging-over');
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const index = getIndexFromEvent(event);
      completeDrop({ droppableId, index });
      setIsDraggingOver(false);
      containerRef.current?.classList.remove('rbd-droppable--dragging-over');
    },
    [completeDrop, droppableId, getIndexFromEvent]
  );

  const provided: DroppableProvided = {
    innerRef: (element) => {
      containerRef.current = element;
    },
    droppableProps: {
      'data-rbd-droppable-id': droppableId,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onDragLeave: handleDragLeave
    },
    placeholder:
      isDraggingOver && activeId
        ? React.createElement('div', {
            className: 'rbd-placeholder',
            style: {
              height: placeholderHeight,
              border: '2px dashed var(--accent-color, #6366f1)',
              borderRadius: '12px',
              margin: direction === 'horizontal' ? '0 0.5rem' : '0.5rem 0'
            }
          })
        : null
  };

  return (
    <DroppableIdContext.Provider value={droppableId}>
      {children(provided, { isDraggingOver })}
    </DroppableIdContext.Provider>
  );
};

interface DraggableProvided {
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: React.HTMLAttributes<HTMLElement> & {
    draggable: true;
    'data-rbd-draggable-id': string;
  };
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
}

interface DraggableStateSnapshot {
  isDragging: boolean;
}

interface DraggableProps {
  draggableId: string;
  index: number;
  children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
}

export const Draggable: React.FC<DraggableProps> = ({
  draggableId,
  index,
  children
}) => {
  const context = useContext(DragContext);
  const droppableId = useContext(DroppableIdContext);
  if (!context) {
    throw new Error('Draggable must be used within a DragDropContext');
  }
  if (!droppableId) {
    throw new Error('Draggable must be nested within a Droppable');
  }

  const { beginDrag } = context;
  const elementRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (!elementRef.current) {
        return;
      }

      const rect = elementRef.current.getBoundingClientRect();
      beginDrag({
        draggableId,
        source: { droppableId, index },
        size: { width: rect.width, height: rect.height }
      });
      setIsDragging(true);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({ draggableId, droppableId, index })
      );
    },
    [beginDrag, draggableId, droppableId, index]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const provided: DraggableProvided = {
    innerRef: (element) => {
      setRef(element);
    },
    draggableProps: {
      ref: undefined,
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      'data-rbd-draggable-id': draggableId,
      'data-rbd-draggable-context-id': droppableId,
      'data-rbd-draggable-index': index,
      style: {
        opacity: isDragging ? 0.5 : 1
      }
    },
    dragHandleProps: {}
  };

  return <>{children(provided, { isDragging })}</>;
};
