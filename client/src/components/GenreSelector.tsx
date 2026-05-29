import { motion } from 'framer-motion';
import {
  Cpu,
  Rocket,
  Skull,
  Sparkles,
  Swords,
  type LucideIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { generateStarterDeck } from '../store/boardSlice';

interface GenreOption {
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
}

const genres: GenreOption[] = [
  {
    name: 'Cyberpunk',
    description: 'Neon streets, corporate ghosts, and hacked identities.',
    icon: Cpu,
    gradient: 'from-cyan-500/20 via-violet-600/30 to-fuchsia-600/20',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    name: 'Space Opera',
    description: 'Galactic empires, ancient starlanes, and cosmic stakes.',
    icon: Rocket,
    gradient: 'from-indigo-500/25 via-blue-600/20 to-purple-700/25',
    glow: 'group-hover:shadow-indigo-500/25',
  },
  {
    name: 'Gothic Horror',
    description: 'Crumbling manors, buried secrets, and things that watch.',
    icon: Skull,
    gradient: 'from-rose-900/30 via-zinc-900/40 to-red-950/30',
    glow: 'group-hover:shadow-rose-900/30',
  },
  {
    name: 'High Fantasy',
    description: 'Ancient magic, epic quests, and kingdoms forged in myth.',
    icon: Swords,
    gradient: 'from-emerald-500/20 via-amber-500/15 to-teal-700/25',
    glow: 'group-hover:shadow-emerald-500/20',
  },
];

function GenreSelectorSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Generating starter deck"
      className="mx-auto max-w-5xl px-6 py-16"
    >
      <div className="mb-10 space-y-4 text-center">
        <div className="mx-auto h-8 w-72 animate-pulse rounded-lg bg-zinc-800" />
        <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-zinc-800/80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
          >
            <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-zinc-800" />
            <div className="mb-3 h-6 w-40 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800/80" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-800/80" />
          </div>
        ))}
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
      className="mx-auto max-w-5xl px-6 py-16"
    >
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
          Story Engine
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Choose Your Genre
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Pick a narrative world and we&apos;ll generate character archetypes,
          plot hooks, and settings that share cohesive story threads.
        </p>
      </header>

      {starterDeckError && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200"
        >
          {starterDeckError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {genres.map((genre, index) => {
          const Icon = genre.icon;

          return (
            <motion.button
              key={genre.name}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.25 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectGenre(genre.name)}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 text-left shadow-lg shadow-black/20 transition-shadow hover:border-zinc-700 ${genre.glow} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-80 transition-opacity group-hover:opacity-100`}
                aria-hidden="true"
              />

              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-zinc-100" aria-hidden="true" />
                </div>

                <h2 className="text-xl font-semibold text-zinc-50">{genre.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300/90">
                  {genre.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
