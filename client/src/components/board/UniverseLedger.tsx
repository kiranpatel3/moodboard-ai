import { AnimatePresence, motion } from 'framer-motion';
import { BookMarked, ChevronRight, Link2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Connection, StoryCard } from '../../store/boardSlice';
import { useAppSelector } from '../../store/hooks';
import StreamingText from './StreamingText';
import { NOTEBOOK_LOADING_MESSAGE } from './StoryBreadcrumb';

function RelationSkeleton() {
  return (
    <div aria-busy="true" className="space-y-2.5">
      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200/80" />
    </div>
  );
}

function cardTitleById(cards: StoryCard[], id: string): string {
  return cards.find((card) => card.id === id)?.title ?? 'Unknown card';
}

function LedgerEntry({
  connection,
  cards,
  shouldStream,
}: {
  connection: Connection;
  cards: StoryCard[];
  shouldStream: boolean;
}) {
  const fromTitle = cardTitleById(cards, connection.fromId);
  const toTitle = cardTitleById(cards, connection.toId);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-start gap-2">
        <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {fromTitle}
          <span className="mx-1.5 font-normal text-slate-400">↔</span>
          {toTitle}
        </p>
      </div>

      {shouldStream ? (
        <StreamingText
          streamKey={connection.id}
          text={connection.description}
          className="text-sm leading-relaxed text-slate-700"
        />
      ) : (
        <p className="text-sm leading-relaxed text-slate-700">{connection.description}</p>
      )}

      {connection.suggestedTags && connection.suggestedTags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {connection.suggestedTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-indigo-100 bg-indigo-50/60 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}

function LedgerPanel({ className }: { className?: string }) {
  const cards = useAppSelector((state) => state.board.cards);
  const connections = useAppSelector((state) => state.board.connections);
  const isGeneratingRelation = useAppSelector(
    (state) => state.board.isGeneratingRelation,
  );
  const relationError = useAppSelector((state) => state.board.relationError);

  const prevConnectionCount = useRef(connections.length);
  const [streamingConnectionId, setStreamingConnectionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (connections.length > prevConnectionCount.current) {
      const newest = connections[connections.length - 1];
      setStreamingConnectionId(newest.id);
    }

    prevConnectionCount.current = connections.length;
  }, [connections]);

  const orderedConnections = useMemo(
    () => [...connections].reverse(),
    [connections],
  );

  return (
    <div className={className}>
      <div className="mb-4 flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-indigo-600" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            Universe Ledger
          </h2>
          <p className="text-xs text-slate-500">Your growing narrative map</p>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-atomic="false"
        className="max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pr-1"
      >
        {isGeneratingRelation && (
          <article className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-slate-600">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              {NOTEBOOK_LOADING_MESSAGE}
            </div>
            <RelationSkeleton />
          </article>
        )}

        {relationError && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {relationError}
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {orderedConnections.map((connection) => (
            <LedgerEntry
              key={connection.id}
              connection={connection}
              cards={cards}
              shouldStream={connection.id === streamingConnectionId}
            />
          ))}
        </AnimatePresence>

        {!isGeneratingRelation && connections.length === 0 && !relationError && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm leading-relaxed text-slate-500">
            Connect two cards in the workbench. New relationships stream here as your
            universe expands.
          </p>
        )}
      </div>
    </div>
  );
}

export default function UniverseLedger() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const connections = useAppSelector((state) => state.board.connections);
  const isGeneratingRelation = useAppSelector(
    (state) => state.board.isGeneratingRelation,
  );

  const prevConnectionCount = useRef(connections.length);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isGeneratingRelation) {
      setMobileOpen(true);
    }
  }, [isGeneratingRelation]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevConnectionCount.current = connections.length;
      return;
    }

    if (connections.length > prevConnectionCount.current) {
      setMobileOpen(true);
    }

    prevConnectionCount.current = connections.length;
  }, [connections.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 xl:hidden"
        aria-expanded={mobileOpen}
        aria-controls="universe-ledger-drawer"
      >
        <BookMarked className="h-4 w-4" aria-hidden="true" />
        Universe Ledger
        {connections.length > 0 && (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
            {connections.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close universe ledger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] xl:hidden"
            />
            <motion.aside
              id="universe-ledger-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col border-l border-slate-200 bg-white p-5 shadow-2xl xl:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mb-4 inline-flex items-center gap-1 self-end text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
              <LedgerPanel className="min-h-0 flex-1" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        aria-label="Universe ledger"
        className="hidden h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:block"
      >
        <LedgerPanel />
      </aside>
    </>
  );
}
