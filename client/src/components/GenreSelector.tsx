import { motion } from 'framer-motion';
import {
  Compass,
  Flame,
  Heart,
  Sparkles,
  Sun,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { generateStarterDeck } from '../store/boardSlice';
import { cardHoverLift } from '../utils/cardLayout';
import { NOTEBOOK_LOADING_MESSAGE } from './board/StoryBreadcrumb';

interface GenreOption {
  name: string;
  description: string;
  icon: LucideIcon;
  surface: string;
  iconBg: string;
  iconColor: string;
}

const genres: GenreOption[] = [
  {
    name: 'Wholesome',
    description: 'Warm-hearted tales of kindness, community, and everyday magic.',
    icon: Sun,
    surface: 'bg-amber-50/40 border-amber-200/60',
    iconBg: 'border-amber-200/40 bg-white/70',
    iconColor: 'text-amber-700',
  },
  {
    name: 'Rom-Com',
    description: 'Meet-cutes, witty banter, and love stories with a happy glow.',
    icon: Heart,
    surface: 'bg-rose-50/40 border-rose-200/60',
    iconBg: 'border-rose-200/40 bg-white/70',
    iconColor: 'text-rose-600',
  },
  {
    name: 'Fantasy',
    description: 'Enchanted realms, ancient magic, and heroes on epic quests.',
    icon: Wand2,
    surface: 'bg-indigo-50/40 border-indigo-200/60',
    iconBg: 'border-indigo-200/40 bg-white/70',
    iconColor: 'text-indigo-600',
  },
  {
    name: 'Mystery',
    description: 'Hidden clues, sharp twists, and secrets waiting to be unraveled.',
    icon: Compass,
    surface: 'bg-indigo-50/40 border-indigo-200/60',
    iconBg: 'border-indigo-200/40 bg-white/70',
    iconColor: 'text-indigo-700',
  },
  {
    name: 'Inspirational',
    description: 'Uplifting journeys of growth, courage, and second chances.',
    icon: Flame,
    surface: 'bg-amber-50/40 border-amber-200/60',
    iconBg: 'border-amber-200/40 bg-white/70',
    iconColor: 'text-amber-700',
  },
];

function GenreSelectorSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Generating starter deck"
      className="min-h-screen bg-[#FAF9F5]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-10 text-center text-xs font-medium tracking-[0.12em] text-slate-500">
          {NOTEBOOK_LOADING_MESSAGE}
        </p>

        <div className="mb-10 space-y-4 text-center">
          <div className="mx-auto h-8 w-72 animate-pulse rounded-lg bg-slate-200/80" />
          <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-slate-200/80" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-slate-200/80" />
              <div className="mb-3 h-6 w-40 animate-pulse rounded bg-slate-200/80" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200/80" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GenreSelector() {
  const dispatch = useAppDispatch();
  const isGeneratingStarterDeck = useAppSelector(
    (state) => state.board.isGeneratingStarterDeck,
  );
  const starterDeckError = useAppSelector((state) => state.board.starterDeckError);

  const handleSelectGenre = (genre: string) => {
    if (isGeneratingStarterDeck) {
      return;
    }

    dispatch(generateStarterDeck(genre));
  };

  if (isGeneratingStarterDeck) {
    return <GenreSelectorSkeleton />;
  }

  return (
    <section
      aria-label="Choose a story genre"
      className="min-h-screen bg-[#FAF9F5]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Story Engine
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Choose Your Genre
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600">
            Pick a narrative world and we&apos;ll generate character archetypes,
            plot hooks, and settings that share cohesive story threads.
          </p>
        </header>

        {starterDeckError && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700"
          >
            {starterDeckError}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre, index) => {
            const Icon = genre.icon;

            return (
              <motion.button
                key={genre.name}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.25 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectGenre(genre.name)}
                className={`rounded-2xl border p-6 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${cardHoverLift} ${genre.surface}`}
              >
                <div
                  className={`mb-4 inline-flex rounded-xl border p-3 ${genre.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${genre.iconColor}`} aria-hidden="true" />
                </div>

                <h2 className="text-pretty text-xl font-bold tracking-tight text-slate-800">
                  {genre.name}
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600">
                  {genre.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
