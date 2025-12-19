import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { Database } from '../lib/supabase';

type SwotItem = Database['public']['Tables']['swot_items']['Row'];

interface SortableSwotItemProps {
    item: SwotItem;
    onDelete: (id: string) => void;
}

export function SortableSwotItem({ item, onDelete }: SortableSwotItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 group hover:shadow-md transition-all flex items-start justify-between gap-2",
                isDragging && "shadow-xl ring-2 ring-blue-500/50 opacity-80 rotate-2"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            <p className="text-gray-700 text-sm flex-1 leading-relaxed">{item.content}</p>
            <button
                onClick={() => onDelete(item.id)}
                className="text-gray-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-md"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
