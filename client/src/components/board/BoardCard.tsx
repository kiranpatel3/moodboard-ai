import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import type { Card } from '../../store/boardSlice';
import {
  cardHoverLift,
  getCardBodyClass,
  getCardLayoutVariant,
  getCardMetaClass,
  getCardSurfaceClass,
  getCardTagClass,
  getCardTitleClass,
} from '../../utils/cardLayout';
import TypeBadge from '../ui/TypeBadge';

interface BoardCardProps {
  card: Card;
  isExpanded?: boolean;
}

export default function BoardCard({ card, isExpanded = false }: BoardCardProps) {
  const layoutVariant = getCardLayoutVariant(card);
  const isWide = layoutVariant === 'wide';

  return (
    <motion.article
      layout
      layoutId={isExpanded ? undefined : `story-card-${card.id}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.98 : 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className={`group h-full overflow-hidden ${cardHoverLift} ${getCardSurfaceClass(card)} cursor-pointer`}
    >
      <div
        className={
          isWide
            ? 'flex h-full flex-col gap-6 md:grid md:grid-cols-12 md:items-start'
            : 'flex h-full flex-col'
        }
      >
        <div className={isWide ? 'md:col-span-4' : undefined}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <TypeBadge type={card.type} />
            {layoutVariant !== 'compact' && (
              <span
                className={`text-xs font-medium uppercase tracking-widest ${getCardMetaClass(card.type)}`}
              >
                {card.id.slice(0, 6)}
              </span>
            )}
          </div>

          <h3 className={`${getCardTitleClass(layoutVariant, card.type)} ${isWide ? '' : 'mb-2'}`}>
            {card.title}
          </h3>
        </div>

        <div className={`flex flex-1 flex-col ${isWide ? 'md:col-span-8' : ''}`}>
          <p className={getCardBodyClass(card.type)}>{card.content}</p>

          {card.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2 line-clamp-2">
              {card.tags.map((tag) => (
                <li key={tag} className={`inline-flex items-center gap-1 ${getCardTagClass(card.type)}`}>
                  <Hash className="h-3 w-3 opacity-60" aria-hidden="true" />
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}
