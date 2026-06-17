import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Card } from '../../store/boardSlice';
import { useWorkbenchDrop } from '../../hooks/useWorkbenchDrop';
import { getCardGridClass } from '../../utils/cardLayout';
import BoardCard from './BoardCard';

const DRAG_CLICK_THRESHOLD_PX = 8;

interface MasonryGridProps {
  cards: Card[];
  expandedCardId?: string | null;
  onOpenCard?: (card: Card) => void;
}

export default function MasonryGrid({
  cards,
  expandedCardId = null,
  onOpenCard,
}: MasonryGridProps) {
  const { handleCardDragEnd } = useWorkbenchDrop();
  const dragDistanceRef = useRef(0);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              whileDrag={{ zIndex: 50, scale: 1.03, cursor: 'grabbing' }}
              onDragStart={() => {
                dragDistanceRef.current = 0;
              }}
              onDrag={(_, info) => {
                dragDistanceRef.current = Math.hypot(info.offset.x, info.offset.y);
              }}
              onDragEnd={(_, info) => {
                const wasDrag = dragDistanceRef.current >= DRAG_CLICK_THRESHOLD_PX;
                dragDistanceRef.current = 0;

                if (wasDrag) {
                  handleCardDragEnd(card, info);
                  return;
                }

                onOpenCard?.(card);
              }}
              className={`relative h-full cursor-grab active:cursor-grabbing ${getCardGridClass(card)}`}
            >
              <BoardCard card={card} isExpanded={expandedCardId === card.id} />
            </motion.div>
          ))}
        </AnimatePresence>
    </div>
  );
}
