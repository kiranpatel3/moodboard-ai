import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addCard, type NewCard } from '../../store/boardSlice';
import DashboardSkeleton from '../skeletons/DashboardSkeleton';
import MasonryGrid from './MasonryGrid';
import TagFilterBar from './TagFilterBar';

const seedCards: NewCard[] = [
  {
    type: 'character',
    title: 'Mira Ashford',
    content:
      'A cartographer who maps emotional fault lines instead of terrain. She speaks in coordinates and keeps a ledger of every promise broken in the city.',
    tags: ['protagonist', 'mystery', 'urban'],
  },
  {
    type: 'setting',
    title: 'The Glass Quarter',
    content:
      'A district of mirrored towers where sunlight refracts into prismatic corridors. Residents trade memories for rent, stored in crystalline vaults beneath the streets.',
    tags: ['urban', 'sci-fi', 'noir'],
  },
  {
    type: 'plot',
    title: 'The Cartographer\'s Debt',
    content:
      'When Mira discovers her latest map predicts a death rather than a route, she must trace the connection back to the Quarter\'s founding architect — her missing mother.',
    tags: ['mystery', 'family', 'noir'],
  },
  {
    type: 'character',
    title: 'Sol Vance',
    content:
      'Memory broker and occasional ally. Wears vintage flight goggles indoors. Knows the price of every secret in the Quarter but refuses to sell his own.',
    tags: ['supporting', 'noir', 'urban'],
  },
  {
    type: 'setting',
    title: 'Underneath Station 7',
    content:
      'Abandoned transit hub converted into a black-market archive. Flickering holographic timetables still announce trains that never arrive.',
    tags: ['underground', 'mystery', 'sci-fi'],
  },
  {
    type: 'plot',
    title: 'Fracture Point',
    content:
      'Three storylines converge when the Glass Quarter\'s mirrors begin showing events that haven\'t happened yet — starting with Mira\'s own reflection acting independently.',
    tags: ['sci-fi', 'convergence', 'mystery'],
  },
];

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
  const dispatch = useAppDispatch();
  const cards = useAppSelector((state) => state.board.cards);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (cards.length === 0) {
        seedCards.forEach((card) => dispatch(addCard(card)));
      }
      setIsLoading(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [cards.length, dispatch]);

  const allTags = useMemo(() => collectTags(cards), [cards]);
  const filteredCards = useMemo(
    () => filterCardsByTags(cards, selectedTags),
    [cards, selectedTags],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

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
              Characters, settings, and plot threads — connected and filterable.
              Select tags to reflow the board with smooth layout transitions.
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

      {filteredCards.length > 0 ? (
        <MasonryGrid cards={filteredCards} />
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
    </div>
  );
}
