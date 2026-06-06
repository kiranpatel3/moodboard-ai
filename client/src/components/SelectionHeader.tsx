import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  selectSelectedCardsData,
  selectSelectedGenre,
  type CardType,
  type StoryCard,
} from '../store/boardSlice';
import { useAppSelector } from '../store/hooks';

const pillStyles: Record<CardType, string> = {
  character: 'border-rose-200 bg-rose-50 text-rose-800',
  setting: 'border-blue-200 bg-blue-50 text-blue-800',
  plot: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const pillDotStyles: Record<CardType, string> = {
  character: 'bg-rose-500',
  setting: 'bg-blue-500',
  plot: 'bg-emerald-500',
};

function SelectionPill({ card }: { card: StoryCard }) {
  return (
    <motion.span
      layout
      layoutId={`selection-badge-${card.id}`}
      initial={{ opacity: 0, scale: 0.55, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.55, y: -6 }}
      transition={{ type: 'spring', stiffness: 520, damping: 26 }}
      title={card.title}
      className={`inline-flex max-w-[12rem] items-center gap-1.5 truncate rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${pillStyles[card.type]}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${pillDotStyles[card.type]}`}
        aria-hidden="true"
      />
      <span className="truncate">{card.title}</span>
    </motion.span>
  );
}

export default function SelectionHeader() {
  const selectedGenre = useAppSelector(selectSelectedGenre);
  const selectedCards = useAppSelector(selectSelectedCardsData);

  if (!selectedGenre) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-sm"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Current Universe
            </p>
            <p className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">
              {selectedGenre}
            </p>
          </div>
        </div>

        <LayoutGroup>
          <div
            aria-live="polite"
            aria-label="Selected story elements"
            className="flex min-h-[2rem] flex-wrap items-center gap-2"
          >
            <AnimatePresence mode="popLayout">
              {selectedCards.length > 0 ? (
                selectedCards.map((card) => (
                  <SelectionPill key={card.id} card={card} />
                ))
              ) : (
                <motion.p
                  key="empty-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-500"
                >
                  Pick characters, plots, and settings below…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>
    </header>
  );
}
