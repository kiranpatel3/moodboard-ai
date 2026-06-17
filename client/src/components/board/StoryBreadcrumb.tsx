import { Pencil } from 'lucide-react';
import type { CardType } from '../../store/boardSlice';

export interface StoryBreadcrumbData {
  genre: string;
  characters: string[];
  settings: string[];
  plots: string[];
}

const categoryConfig: Record<
  CardType,
  { icon: string; label: string; emptyLabel: string }
> = {
  character: { icon: '👤', label: 'Character', emptyLabel: 'Choose character' },
  plot: { icon: '🎬', label: 'Plot', emptyLabel: 'Choose plot' },
  setting: { icon: '📍', label: 'Setting', emptyLabel: 'Choose setting' },
};

function formatSegment(values: string[]): string | null {
  if (values.length === 0) {
    return null;
  }

  return values.join(' · ');
}

export function buildStoryBreadcrumbFromCards(
  genre: string,
  cards: { type: CardType; title: string }[],
): StoryBreadcrumbData {
  return {
    genre,
    characters: cards.filter((card) => card.type === 'character').map((card) => card.title),
    settings: cards.filter((card) => card.type === 'setting').map((card) => card.title),
    plots: cards.filter((card) => card.type === 'plot').map((card) => card.title),
  };
}

export function storyBreadcrumbFromFoundation(
  genre: string,
  foundation: {
    characters: { title: string }[];
    settings: { title: string }[];
    plots: { title: string }[];
  },
): StoryBreadcrumbData {
  return {
    genre,
    characters: foundation.characters.map((card) => card.title),
    settings: foundation.settings.map((card) => card.title),
    plots: foundation.plots.map((card) => card.title),
  };
}

interface StoryBreadcrumbProps {
  data: StoryBreadcrumbData;
  className?: string;
  interactive?: boolean;
  onEditCategory?: (type: CardType) => void;
}

function InteractiveSegment({
  type,
  values,
  onEditCategory,
}: {
  type: CardType;
  values: string[];
  onEditCategory?: (type: CardType) => void;
}) {
  const config = categoryConfig[type];
  const displayText = formatSegment(values) ?? config.emptyLabel;

  return (
    <>
      <span aria-hidden="true"> {'  •  '}</span>
      <button
        type="button"
        onClick={() => onEditCategory?.(type)}
        className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 normal-case tracking-normal text-slate-600 transition-colors hover:bg-slate-200/40 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F5]"
        aria-label={`Modify ${config.label.toLowerCase()}: ${displayText}`}
      >
        <span aria-hidden="true">{config.icon}</span>
        <span>{displayText}</span>
        <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-slate-400 transition-colors group-hover:text-slate-700">
          <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
          swap
        </span>
      </button>
    </>
  );
}

export default function StoryBreadcrumb({
  data,
  className = '',
  interactive = false,
  onEditCategory,
}: StoryBreadcrumbProps) {
  if (!interactive) {
    const characterLine = formatSegment(data.characters);
    const settingLine = formatSegment(data.settings);
    const plotLine = formatSegment(data.plots);

    return (
      <p
        className={`text-pretty text-xs font-medium tracking-[0.12em] text-slate-500 ${className}`}
      >
        <span aria-hidden="true">🌌 </span>
        <span className="uppercase">{data.genre}</span>
        {characterLine && (
          <>
            <span aria-hidden="true"> {'  •  '}👤 </span>
            <span className="normal-case tracking-normal text-slate-600">{characterLine}</span>
          </>
        )}
        {settingLine && (
          <>
            <span aria-hidden="true"> {'  •  '}📍 </span>
            <span className="normal-case tracking-normal text-slate-600">{settingLine}</span>
          </>
        )}
        {plotLine && (
          <>
            <span aria-hidden="true"> {'  •  '}🎬 </span>
            <span className="normal-case tracking-normal text-slate-600">{plotLine}</span>
          </>
        )}
      </p>
    );
  }

  return (
    <p
      className={`flex flex-wrap items-center text-pretty text-xs font-medium tracking-[0.12em] text-slate-500 ${className}`}
    >
      <span aria-hidden="true">🌌 </span>
      <span className="uppercase">{data.genre}</span>
      <InteractiveSegment
        type="character"
        values={data.characters}
        onEditCategory={onEditCategory}
      />
      <InteractiveSegment
        type="setting"
        values={data.settings}
        onEditCategory={onEditCategory}
      />
      <InteractiveSegment type="plot" values={data.plots} onEditCategory={onEditCategory} />
    </p>
  );
}

export const NOTEBOOK_LOADING_MESSAGE = 'Weaving raw ideas into ink...';
