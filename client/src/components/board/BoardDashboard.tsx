import { useMemo, useState } from 'react';
import { LayoutGrid, Link2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { generateCardRelation } from '../../store/boardSlice';
import MasonryGrid from './MasonryGrid';
import TagFilterBar from './TagFilterBar';

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

function RelationTextSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Generating narrative relation"
      className="min-h-[8rem] space-y-3"
    >
      <div className="h-3 w-full animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200/80" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200/80" />
    </div>
  );
}

export default function BoardDashboard() {
  const dispatch = useAppDispatch();
  const cards = useAppSelector((state) => state.board.cards);
  const connections = useAppSelector((state) => state.board.connections);
  const isGeneratingRelation = useAppSelector(
    (state) => state.board.isGeneratingRelation,
  );
  const relationError = useAppSelector((state) => state.board.relationError);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const allTags = useMemo(() => collectTags(cards), [cards]);
  const filteredCards = useMemo(
    () => filterCardsByTags(cards, selectedTags),
    [cards, selectedTags],
  );

  const selectedCards = useMemo(
    () =>
      selectedCardIds
        .map((id) => cards.find((card) => card.id === id))
        .filter((card): card is NonNullable<typeof card> => Boolean(card)),
    [cards, selectedCardIds],
  );

  const activeConnection = useMemo(() => {
    if (selectedCardIds.length !== 2) {
      return null;
    }

    const [cardAId, cardBId] = selectedCardIds;

    return (
      connections.find(
        (connection) =>
          (connection.fromId === cardAId && connection.toId === cardBId) ||
          (connection.fromId === cardBId && connection.toId === cardAId),
      ) ?? null
    );
  }, [connections, selectedCardIds]);

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

  const handleConnectWithAi = () => {
    if (selectedCardIds.length !== 2 || isGeneratingRelation) {
      return;
    }

    dispatch(
      generateCardRelation({
        cardAId: selectedCardIds[0],
        cardBId: selectedCardIds[1],
      }),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Moodboard
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
                Story Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Select two cards, then connect them with AI to generate a narrative
                relationship. Tag filters still reflow the board smoothly.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <LayoutGrid className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {filteredCards.length} of {cards.length} cards
            </div>
          </div>
        </header>

        <section aria-label="Tag filters" className="mb-8">
          <TagFilterBar
            tags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={() => setSelectedTags([])}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-label="Moodboard cards">
            {filteredCards.length > 0 ? (
              <MasonryGrid
                cards={filteredCards}
                selectedCardIds={selectedCardIds}
                onSelectCard={handleSelectCard}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  No cards match the selected tags.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="mt-4 text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <aside
            aria-label="Connection workspace"
            className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
                Connection
              </h2>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              {selectedCards.length === 0 &&
                'Select two cards from the board to begin.'}
              {selectedCards.length === 1 &&
                `Selected: ${selectedCards[0].title}. Choose one more card.`}
              {selectedCards.length === 2 &&
                `Linking ${selectedCards[0].title} ↔ ${selectedCards[1].title}`}
            </p>

            <button
              type="button"
              onClick={handleConnectWithAi}
              disabled={selectedCardIds.length !== 2 || isGeneratingRelation}
              className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isGeneratingRelation ? 'Connecting…' : 'Connect with AI'}
            </button>

            <div
              aria-live="polite"
              aria-atomic="true"
              className="min-h-[8rem] rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              {isGeneratingRelation ? (
                <RelationTextSkeleton />
              ) : relationError ? (
                <p className="text-sm leading-relaxed text-rose-700">{relationError}</p>
              ) : activeConnection ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {activeConnection.description}
                  </p>
                  {activeConnection.suggestedTags &&
                    activeConnection.suggestedTags.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {activeConnection.suggestedTags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
                          >
                            #{tag}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">
                  Generated narrative links appear here once AI analysis completes.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
