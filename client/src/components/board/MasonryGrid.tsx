import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Card } from '../../store/boardSlice';
import { useWorkbenchDrop } from '../../hooks/useWorkbenchDrop';
import BoardCard from './BoardCard';

interface MasonryGridProps {
  cards: Card[];
  selectedCardIds?: string[];
  onSelectCard?: (cardId: string) => void;
}

const dragTransition = { type: 'spring' as const, stiffness: 420, damping: 28 };

export default function MasonryGrid({
  cards,
  selectedCardIds = [],
  onSelectCard,
}: MasonryGridProps) {
  const { handleCardDragEnd } = useWorkbenchDrop();

  return (
    <LayoutGroup>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              dragTransition={dragTransition}
              whileDrag={{ zIndex: 50, scale: 1.03, cursor: 'grabbing' }}
              onDragEnd={(_, info) => handleCardDragEnd(card, info)}
              className="relative mb-4 break-inside-avoid cursor-grab active:cursor-grabbing"
            >
              <BoardCard
                card={card}
                isSelected={selectedCardIds.includes(card.id)}
                onSelect={onSelectCard}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
