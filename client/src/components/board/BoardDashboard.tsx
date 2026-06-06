import { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import AIWorkbench from '../AIWorkbench';
import GenesisSummaryBanner from './GenesisSummaryBanner';
import MasonryGrid from './MasonryGrid';
import TagFilterBar from './TagFilterBar';
import UniverseLedger from './UniverseLedger';

function collectTags(cards: { tags: string[] }[]): string[] {
  return [...new Set(cards.flatMap((card) => card.tags))].sort();
}

function filterCardsByTags<T extends { tags: string[] }>(
  cards: T[],
  selectedTags: string[],
): T[] {
  if (selectedTags.length === 0) {
    return cards;
  }

  return cards.filter((card) =>
    selectedTags.some((tag) => card.tags.includes(tag)),
  );
}

export default function BoardDashboard() {
  const cards = useAppSelector((state) => state.board.cards);
  const workbenchSlotA = useAppSelector((state) => state.board.workbenchSlotA);
  const workbenchSlotB = useAppSelector((state) => state.board.workbenchSlotB);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const allTags = useMemo(() => collectTags(cards), [cards]);
  const filteredMasonryCards = useMemo(
    () => filterCardsByTags(cards, selectedTags),
    [cards, selectedTags],
  );

  const slottedCardIds = useMemo(
    () =>
      new Set(
        [workbenchSlotA?.id, workbenchSlotB?.id].filter(
          (id): id is string => Boolean(id),
        ),
      ),
    [workbenchSlotA, workbenchSlotB],
  );

  const draggableMasonryCards = useMemo(
    () => filteredMasonryCards.filter((card) => !slottedCardIds.has(card.id)),
    [filteredMasonryCards, slottedCardIds],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCardIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }

      if (current.length >= 2) {
        return [current[1], cardId];
      }

      return [...current, cardId];
    });
  };

  const hasMasonryContent = cards.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/20">
      <GenesisSummaryBanner />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <section aria-label="Tag filters" className="min-w-0 flex-1">
            <TagFilterBar
              tags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={() => setSelectedTags([])}
            />
          </section>

          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <LayoutGrid className="h-4 w-4 text-slate-500" aria-hidden="true" />
            {draggableMasonryCards.length + slottedCardIds.size} of {cards.length}{' '}
            cards visible
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-label="Interactive canvas" className="min-w-0">
            <div className="relative mx-auto mb-10 max-w-3xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-100/50 via-white to-rose-100/50 blur-xl"
              />
              <div className="relative">
                <AIWorkbench />
              </div>
            </div>

            {hasMasonryContent ? (
              <MasonryGrid
                cards={draggableMasonryCards}
                selectedCardIds={selectedCardIds}
                onSelectCard={handleSelectCard}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  {selectedTags.length > 0
                    ? 'No cards match the selected tags.'
                    : 'Your foundational choices will appear here once assembled.'}
                </p>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="mt-4 text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {hasMasonryContent && draggableMasonryCards.length === 0 && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  {selectedTags.length > 0
                    ? 'No cards match the selected tags.'
                    : slottedCardIds.size > 0
                      ? 'Cards in the workbench are hidden from the grid until the connection is forged.'
                      : 'Drag cards into the workbench to connect them.'}
                </p>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="mt-4 text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </section>

          <UniverseLedger />
        </div>
      </div>
    </div>
  );
}
