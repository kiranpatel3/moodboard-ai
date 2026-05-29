import { LayoutGroup, motion } from 'framer-motion';
import { Check, Hash, Sparkles, Swords, MapPin, BookOpen } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  commitSelectedOptions,
  toggleOptionSelection,
  type StoryCard,
} from '../store/boardSlice';

interface OptionSectionProps {
  title: string;
  icon: ReactNode;
  accentClass: string;
  options: StoryCard[];
  selectedOptionIds: string[];
  onToggle: (id: string) => void;
}

function OptionCard({
  card,
  isSelected,
  accentClass,
  onToggle,
}: {
  card: StoryCard;
  isSelected: boolean;
  accentClass: string;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onToggle(card.id)}
      aria-pressed={isSelected}
      aria-label={`${card.title}. ${isSelected ? 'Selected' : 'Not selected'}.`}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      whileHover={{ scale: isSelected ? 1.03 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        isSelected
          ? `${accentClass} ring-2 ring-offset-2 ring-offset-zinc-950`
          : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
      }`}
    >
      {isSelected && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-zinc-950 shadow-lg"
          aria-hidden="true"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}

      <h3 className="pr-8 text-base font-semibold leading-snug text-zinc-100">
        {card.title}
      </h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-400">
        {card.content}
      </p>

      {card.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-xs text-zinc-500"
            >
              <Hash className="h-3 w-3" aria-hidden="true" />
              {tag}
            </li>
          ))}
        </ul>
      )}
    </motion.button>
  );
}

function OptionSection({
  title,
  icon,
  accentClass,
  options,
  selectedOptionIds,
  onToggle,
}: OptionSectionProps) {
  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-indigo-400" aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
          {title}
        </h2>
        <span className="ml-auto text-xs text-zinc-600">
          {options.filter((option) => selectedOptionIds.includes(option.id)).length}{' '}
          selected
        </span>
      </div>

      <LayoutGroup>
        <div className="space-y-3">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              card={option}
              isSelected={selectedOptionIds.includes(option.id)}
              accentClass={accentClass}
              onToggle={onToggle}
            />
          ))}
        </div>
      </LayoutGroup>
    </section>
  );
}

export default function OptionCuration() {
  const dispatch = useAppDispatch();
  const availableOptions = useAppSelector((state) => state.board.availableOptions);
  const selectedOptionIds = useAppSelector((state) => state.board.selectedOptionIds);

  const selectionByCategory = useMemo(() => {
    const hasCharacterSelected = availableOptions.characters.some((option) =>
      selectedOptionIds.includes(option.id),
    );
    const hasPlotSelected = availableOptions.plots.some((option) =>
      selectedOptionIds.includes(option.id),
    );
    const hasSettingSelected = availableOptions.settings.some((option) =>
      selectedOptionIds.includes(option.id),
    );

    return {
      hasCharacterSelected,
      hasPlotSelected,
      hasSettingSelected,
      canAssemble:
        hasCharacterSelected && hasPlotSelected && hasSettingSelected,
    };
  }, [availableOptions, selectedOptionIds]);

  const handleToggle = (id: string) => {
    dispatch(toggleOptionSelection(id));
  };

  const handleAssemble = () => {
    if (!selectionByCategory.canAssemble) {
      return;
    }

    dispatch(commitSelectedOptions());
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-32 pt-12">
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
          Curation
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Curate Your Starter Deck
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Choose at least one character, one plot hook, and one setting to
          assemble your moodboard canvas.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <OptionSection
          title="Choose Characters"
          icon={<Swords className="h-4 w-4" />}
          accentClass="border-violet-400/60 bg-violet-500/10 ring-violet-400/50"
          options={availableOptions.characters}
          selectedOptionIds={selectedOptionIds}
          onToggle={handleToggle}
        />
        <OptionSection
          title="Choose Plot Hooks"
          icon={<BookOpen className="h-4 w-4" />}
          accentClass="border-amber-400/60 bg-amber-500/10 ring-amber-400/50"
          options={availableOptions.plots}
          selectedOptionIds={selectedOptionIds}
          onToggle={handleToggle}
        />
        <OptionSection
          title="Choose Settings"
          icon={<MapPin className="h-4 w-4" />}
          accentClass="border-cyan-400/60 bg-cyan-500/10 ring-cyan-400/50"
          options={availableOptions.settings}
          selectedOptionIds={selectedOptionIds}
          onToggle={handleToggle}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-zinc-500 sm:text-left">
            {!selectionByCategory.hasCharacterSelected && 'Select a character · '}
            {!selectionByCategory.hasPlotSelected && 'Select a plot hook · '}
            {!selectionByCategory.hasSettingSelected && 'Select a setting'}
            {selectionByCategory.canAssemble && 'Ready to assemble your moodboard.'}
          </p>

          <motion.button
            type="button"
            onClick={handleAssemble}
            disabled={!selectionByCategory.canAssemble}
            whileHover={selectionByCategory.canAssemble ? { scale: 1.02 } : undefined}
            whileTap={selectionByCategory.canAssemble ? { scale: 0.98 } : undefined}
            className="inline-flex w-full min-w-[16rem] items-center justify-center gap-2 rounded-xl border border-indigo-400/50 bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:shadow-none sm:w-auto"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Assemble My Moodboard
          </motion.button>
        </div>
      </div>
    </div>
  );
}
