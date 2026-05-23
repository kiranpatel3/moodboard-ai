import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import type { Card } from '../../store/boardSlice';
import TypeBadge from '../ui/TypeBadge';

interface BoardCardProps {
  card: Card;
}

export default function BoardCard({ card }: BoardCardProps) {
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
      className="group overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-colors hover:border-zinc-700/80 hover:bg-zinc-900"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <TypeBadge type={card.type} />
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
          {card.id.slice(0, 6)}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-snug text-zinc-100">
        {card.title}
      </h3>

      <p className="text-sm leading-relaxed text-zinc-400">{card.content}</p>

      {card.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-xs text-zinc-400"
            >
              <Hash className="h-3 w-3 text-zinc-600" aria-hidden="true" />
              {tag}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}
