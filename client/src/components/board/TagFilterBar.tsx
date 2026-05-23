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
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !hasActiveFilters
              ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
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
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
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
