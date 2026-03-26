import React from 'react';
import { motion } from 'motion/react';
import { Check, Edit2, Trash2, Plus, GripVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PolicyItemProps {
  id: string;
  text: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
  mode: 'view' | 'edit' | 'add' | 'delete';
  onUpdate?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
  emoji?: string;
}

export const PolicyItem: React.FC<PolicyItemProps> = ({
  id,
  text,
  isChecked,
  onToggle,
  mode,
  onUpdate,
  onDelete,
  emoji = "📄"
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(text);

  return (
    <motion.div
      layout
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-all",
        isChecked ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100 shadow-sm",
        mode === 'delete' && "hover:border-red-300 hover:bg-red-50"
      )}
    >
      {mode === 'edit' && (
        <div className="pt-1 cursor-grab active:cursor-grabbing text-slate-400">
          <GripVertical size={16} />
        </div>
      )}

      <div className="flex-shrink-0 pt-0.5">
        {mode === 'view' ? (
          <button
            onClick={() => onToggle(id)}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              isChecked
                ? "bg-slate-800 border-slate-800 text-white"
                : "bg-white border-slate-300 hover:border-slate-400"
            )}
          >
            {isChecked && <Check size={14} strokeWidth={3} />}
          </button>
        ) : (
          <span className="text-lg">{emoji}</span>
        )}
      </div>

      <div className="flex-grow min-w-0">
        {mode === 'edit' ? (
          <textarea
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              onUpdate?.(id, e.target.value);
            }}
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none"
            rows={2}
          />
        ) : (
          <p className={cn(
            "text-sm leading-relaxed break-keep",
            isChecked ? "text-slate-400 line-through" : "text-slate-700"
          )}>
            {text}
          </p>
        )}
      </div>

      {mode === 'delete' && (
        <button
          onClick={() => onDelete?.(id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      )}
    </motion.div>
  );
};
