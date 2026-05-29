import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import type { Card } from '../../store/boardSlice';
import TypeBadge from '../ui/TypeBadge';

interface BoardCardProps {
  card: Card;
  isSelected?: boolean;
  onSelect?: (cardId: string) => void;
}

export default function BoardCard({
  card,
  isSelected = false,
  onSelect,
}: BoardCardProps) {
  const isSelectable = Boolean(onSelect);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      onClick={isSelectable ? () => onSelect?.(card.id) : undefined}
      onKeyDown={
        isSelectable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(card.id);
              }
            }
          : undefined
      }
      tabIndex={isSelectable ? 0 : undefined}
      role={isSelectable ? 'button' : undefined}
      aria-pressed={isSelectable ? isSelected : undefined}
      aria-label={
        isSelectable
          ? `${card.title}. ${isSelected ? 'Selected' : 'Not selected'}. Press to toggle selection.`
          : undefined
      }
      className={`group overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all ${
        isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-400/30 ring-offset-2 ring-offset-slate-50'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      } ${isSelectable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <TypeBadge type={card.type} />
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
          {card.id.slice(0, 6)}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-700">
        {card.title}
      </h3>

      <p className="text-sm leading-relaxed text-slate-600">{card.content}</p>

      {card.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
            >
              <Hash className="h-3 w-3 text-slate-500" aria-hidden="true" />
              {tag}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}
