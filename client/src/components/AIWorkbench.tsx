import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { generateCardRelation } from '../store/boardSlice';
import type { StoryCard } from '../store/boardSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import TypeBadge from './ui/TypeBadge';
import { NOTEBOOK_LOADING_MESSAGE } from './board/StoryBreadcrumb';

const slotShellStyles = {
  A: {
    empty:
      'border-indigo-300 bg-indigo-50/70 shadow-[inset_0_0_24px_rgba(99,102,241,0.08)]',
    filled: 'border-indigo-300 bg-white shadow-md',
    pulse: 'bg-indigo-100/60',
    label: 'text-indigo-700',
  },
  B: {
    empty:
      'border-rose-300 bg-rose-50/70 shadow-[inset_0_0_24px_rgba(244,63,94,0.08)]',
    filled: 'border-rose-300 bg-white shadow-md',
    pulse: 'bg-rose-100/60',
    label: 'text-rose-700',
  },
} as const;

function MiniWorkbenchCard({ card }: { card: StoryCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 py-4 text-center"
    >
      <TypeBadge type={card.type} />
      <p className="line-clamp-2 text-pretty text-sm font-bold tracking-tight text-slate-800">
        {card.title}
      </p>
      <p className="line-clamp-3 text-pretty text-xs leading-relaxed text-slate-600">
        {card.content}
      </p>
    </motion.div>
  );
}

function WorkbenchSlot({
  slotLabel,
  slotKey,
  card,
}: {
  slotLabel: string;
  slotKey: 'A' | 'B';
  card: StoryCard | null;
}) {
  const styles = slotShellStyles[slotKey];

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <p className={`text-xs font-semibold uppercase tracking-widest ${styles.label}`}>
        {slotLabel}
      </p>
      <div
        id={slotKey === 'A' ? 'workbench-slot-a' : 'workbench-slot-b'}
        className={`relative flex h-44 w-full max-w-[11rem] items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-colors sm:h-48 sm:max-w-none sm:rounded-full ${
          card ? styles.filled : styles.empty
        }`}
      >
        {!card && (
          <motion.div
            aria-hidden="true"
            className={`absolute inset-3 rounded-2xl sm:rounded-full ${styles.pulse}`}
            animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.98, 1, 0.98] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {card ? (
          <MiniWorkbenchCard card={card} />
        ) : (
          <p className="relative z-10 px-4 text-center text-sm font-medium text-slate-500">
            Drop a Card
          </p>
        )}
      </div>
    </div>
  );
}

export default function AIWorkbench() {
  const dispatch = useAppDispatch();
  const workbenchSlotA = useAppSelector((state) => state.board.workbenchSlotA);
  const workbenchSlotB = useAppSelector((state) => state.board.workbenchSlotB);
  const isGeneratingRelation = useAppSelector(
    (state) => state.board.isGeneratingRelation,
  );

  const bothSlotsFilled = Boolean(workbenchSlotA && workbenchSlotB);

  const handleConnect = () => {
    if (!workbenchSlotA || !workbenchSlotB || isGeneratingRelation) {
      return;
    }

    dispatch(
      generateCardRelation({
        cardAId: workbenchSlotA.id,
        cardBId: workbenchSlotB.id,
      }),
    );
  };

  return (
    <section
      id="ai-blending-workbench"
      aria-label="AI blending workbench"
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm"
    >
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          Blending Workbench
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-800">
          Weave Connection
        </h2>
      </div>

      <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <WorkbenchSlot slotLabel="Slot A" slotKey="A" card={workbenchSlotA} />
        <div
          aria-hidden="true"
          className="hidden h-px w-8 bg-gradient-to-r from-indigo-300 to-rose-300 sm:block"
        />
        <div
          aria-hidden="true"
          className="h-8 w-px bg-gradient-to-b from-indigo-300 to-rose-300 sm:hidden"
        />
        <WorkbenchSlot slotLabel="Slot B" slotKey="B" card={workbenchSlotB} />
      </div>

      <motion.button
        type="button"
        onClick={handleConnect}
        disabled={!bothSlotsFilled || isGeneratingRelation}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E3A31] bg-[#1E3A31] px-5 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#152922] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A31] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F5] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {isGeneratingRelation ? (
          <span className="inline-flex items-center gap-2">
            <motion.span
              aria-hidden="true"
              className="inline-flex gap-1"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </motion.span>
            {NOTEBOOK_LOADING_MESSAGE}
          </span>
        ) : (
          <>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Weave Connection
          </>
        )}
      </motion.button>
    </section>
  );
}
