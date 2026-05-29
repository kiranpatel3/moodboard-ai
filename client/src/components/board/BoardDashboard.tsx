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
      <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
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
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
          Moodboard
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Story Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Select two cards, then connect them with AI to generate a narrative
              relationship. Tag filters still reflow the board smoothly.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400">
            <LayoutGrid className="h-4 w-4 text-zinc-500" aria-hidden="true" />
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
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
              <p className="text-sm text-zinc-400">
                No cards match the selected tags.
              </p>
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="mt-4 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <aside
          aria-label="Connection workspace"
          className="h-fit rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur-sm xl:sticky xl:top-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              Connection
            </h2>
          </div>

          <p className="mb-4 text-xs text-zinc-500">
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
            className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-indigo-100 transition-colors hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isGeneratingRelation ? 'Connecting…' : 'Connect with AI'}
          </button>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-h-[8rem] rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4"
          >
            {isGeneratingRelation ? (
              <RelationTextSkeleton />
            ) : relationError ? (
              <p className="text-sm leading-relaxed text-rose-300">{relationError}</p>
            ) : activeConnection ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-zinc-300">
                  {activeConnection.description}
                </p>
                {activeConnection.suggestedTags &&
                  activeConnection.suggestedTags.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {activeConnection.suggestedTags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400"
                        >
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-zinc-500">
                Generated narrative links appear here once AI analysis completes.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
