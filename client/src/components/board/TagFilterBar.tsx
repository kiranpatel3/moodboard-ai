import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TagFilterBarProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export default function TagFilterBar({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: TagFilterBarProps) {
  const hasActiveFilters = selectedTags.length > 0;

  return (
    <LayoutGroup>
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          layout
          type="button"
          onClick={onClearTags}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
            !hasActiveFilters
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          All
        </motion.button>

        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <motion.button
              key={tag}
              layout
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </motion.button>
          );
        })}

        <AnimatePresence initial={false}>
          {hasActiveFilters && (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={onClearTags}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
