import { useMemo } from 'react';
import {
  selectGenesisFoundation,
  selectSelectedGenre,
  type CardType,
  type StoryCard,
} from '../../store/boardSlice';
import { useAppSelector } from '../../store/hooks';

const trailLabelClass = 'text-xs font-semibold tracking-wide text-slate-500';

function titlesForType(cards: StoryCard[], type: CardType): string[] {
  return cards.filter((card) => card.type === type).map((card) => card.title);
}

function MetadataTag({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
      {label}
    </span>
  );
}

function TrailDivider() {
  return (
    <span aria-hidden="true" className="select-none text-slate-300">
      •
    </span>
  );
}

function TrailSegment({
  icon,
  label,
  values,
}: {
  icon: string;
  label: string;
  values: string[];
}) {
  if (values.length === 0) {
    return null;
  }

  return (
    <>
      <TrailDivider />
      <span className={`inline-flex flex-wrap items-center gap-1.5 ${trailLabelClass}`}>
        <span aria-hidden="true">{icon}</span>
        <span className="sr-only">{label}:</span>
        {values.map((value) => (
          <MetadataTag key={value} label={value} />
        ))}
      </span>
    </>
  );
}

export default function GenesisSummaryBanner() {
  const genesisFoundation = useAppSelector(selectGenesisFoundation);
  const selectedGenre = useAppSelector(selectSelectedGenre);
  const boardCards = useAppSelector((state) => state.board.cards);

  const summary = useMemo(() => {
    const genre = genesisFoundation?.genre ?? selectedGenre;

    if (!genre) {
      return null;
    }

    return {
      genre,
      characters: genesisFoundation
        ? genesisFoundation.characters.map((card) => card.title)
        : titlesForType(boardCards, 'character'),
      settings: genesisFoundation
        ? genesisFoundation.settings.map((card) => card.title)
        : titlesForType(boardCards, 'setting'),
      plots: genesisFoundation
        ? genesisFoundation.plots.map((card) => card.title)
        : titlesForType(boardCards, 'plot'),
    };
  }, [boardCards, genesisFoundation, selectedGenre]);

  if (!summary) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 p-3 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3">
        <nav
          aria-label="Story universe metadata"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 sm:justify-start"
        >
          <span className={`inline-flex items-center gap-1.5 ${trailLabelClass}`}>
            <span aria-hidden="true">🌌</span>
            <span className="sr-only">Genre:</span>
            <MetadataTag label={summary.genre} />
          </span>

          <TrailSegment icon="👤" label="Character" values={summary.characters} />
          <TrailSegment icon="📍" label="Setting" values={summary.settings} />
          <TrailSegment icon="🎬" label="Plot" values={summary.plots} />
        </nav>
      </div>
    </header>
  );
}
