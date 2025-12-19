import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Database } from '../lib/supabase';
import { SortableSwotItem } from './SortableSwotItem';
import { cn } from '../lib/utils';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

type SwotItem = Database['public']['Tables']['swot_items']['Row'];

type SwotMatrixProps = {
  items: SwotItem[];
  onAddItem: (category: SwotItem['category'], content: string) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (items: SwotItem[]) => void;
};

type CategoryConfig = {
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
};

const categories: Record<SwotItem['category'], CategoryConfig> = {
  strength: {
    title: 'Forces (Strengths)',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50/50 dark:bg-green-900/10',
    borderColor: 'border-green-200/60 dark:border-green-800/40',
    icon: '💪',
    description: 'Atouts internes, ressources et avantages concurrentiels qui font la force du projet.',
  },
  weakness: {
    title: 'Faiblesses (Weaknesses)',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50/50 dark:bg-red-900/10',
    borderColor: 'border-red-200/60 dark:border-red-800/40',
    icon: '⚠️',
    description: 'Limitations internes, manques ou obstacles qui freinent votre performance actuelle.',
  },
  opportunity: {
    title: 'Opportunités (Opportunities)',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50/50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200/60 dark:border-blue-800/40',
    icon: '🎯',
    description: 'Facteurs externes favorables que vous pouvez exploiter pour croître ou s\'améliorer.',
  },
  threat: {
    title: 'Menaces (Threats)',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50/50 dark:bg-orange-900/10',
    borderColor: 'border-orange-200/60 dark:border-orange-800/40',
    icon: '⚡',
    description: 'Risques externes ou obstacles potentiels qui pourraient nuire à votre réussite.',
  },
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

function CategoryCard({
  category,
  items,
  onAddItem,
  onDeleteItem,
}: {
  category: SwotItem['category'];
  items: SwotItem[];
  onAddItem: (content: string) => void;
  onDeleteItem: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const config = categories[category];

  const handleAdd = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      variants={itemAnim}
      className={cn(
        "glass-panel rounded-xl p-6 flex flex-col h-full border-t-4 transition-all duration-300 hover:shadow-2xl",
        config.borderColor
      )}
    >
      <h3 className={cn("text-xl font-bold mb-6 flex items-center gap-3", config.color)}>
        <span className="text-3xl filter drop-shadow-sm">{config.icon}</span>
        {config.title}
        <span className="ml-auto text-sm font-normal opacity-60 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-gray-800 dark:text-gray-200">
          {items.length}
        </span>
      </h3>

      <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 italic leading-relaxed">
        {config.description}
      </p>

      <div className="flex-1 space-y-3 mb-4 min-h-[100px]">
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableSwotItem
              key={item.id}
              item={item}
              onDelete={onDeleteItem}
            />
          ))}
        </SortableContext>
        {items.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-400 dark:text-slate-500 italic text-sm border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
            Aucun élément
          </div>
        )}
      </div>

      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-100 dark:border-slate-700"
        >
          <textarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Décrivez l'élément..."
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none dark:text-white"
            rows={3}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewItem('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="glass-button flex items-center justify-center gap-2 w-full py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium group"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm">Ajouter un élément</span>
        </button>
      )}
    </motion.div>
  );
}

export default function SwotMatrix({ items, onAddItem, onDeleteItem, onReorderItems }: SwotMatrixProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemsByCategory = (category: SwotItem['category']) =>
    items.filter((item) => item.category === category);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // ... (existing implementation)
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        // If moving to a different category, update category
        const activeItem = items[oldIndex];
        const overItem = items[newIndex];

        if (activeItem.category !== overItem.category) {
          // If we support cross-category dragging
          const newItems = [...items];
          newItems[oldIndex] = { ...activeItem, category: overItem.category };
          onReorderItems(arrayMove(newItems, oldIndex, newIndex));
        } else {
          onReorderItems(arrayMove(items, oldIndex, newIndex));
        }
      }
    }
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <CategoryCard
          category="strength"
          items={getItemsByCategory('strength')}
          onAddItem={(content) => onAddItem('strength', content)}
          onDeleteItem={onDeleteItem}
        />
        <CategoryCard
          category="weakness"
          items={getItemsByCategory('weakness')}
          onAddItem={(content) => onAddItem('weakness', content)}
          onDeleteItem={onDeleteItem}
        />
        <CategoryCard
          category="opportunity"
          items={getItemsByCategory('opportunity')}
          onAddItem={(content) => onAddItem('opportunity', content)}
          onDeleteItem={onDeleteItem}
        />
        <CategoryCard
          category="threat"
          items={getItemsByCategory('threat')}
          onAddItem={(content) => onAddItem('threat', content)}
          onDeleteItem={onDeleteItem}
        />
      </motion.div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem ? (
            <div className="opacity-80 rotate-2">
              <SortableSwotItem item={activeItem} onDelete={() => { }} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
