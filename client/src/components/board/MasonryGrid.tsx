import { AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Card } from '../../store/boardSlice';
import BoardCard from './BoardCard';

interface MasonryGridProps {
  cards: Card[];
}

export default function MasonryGrid({ cards }: MasonryGridProps) {
  return (
    <LayoutGroup>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <div key={card.id} className="mb-4 break-inside-avoid">
              <BoardCard card={card} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
