import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Check, Hash, Sparkles, Swords, MapPin, BookOpen } from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearCurationFocus,
  commitSelectedOptions,
  toggleOptionSelection,
  type StoryCard,
} from '../store/boardSlice';
import SelectionHeader from './SelectionHeader';
import { cardHoverLift, getCardBodyClass, getCardSelectedRingClass, getCardTagClass, getCardTitleClass, getCardTypeSurfaceClass } from '../utils/cardLayout';

interface OptionSectionProps {
  title: string;
  icon: ReactNode;
  iconClass: string;
  sectionId: string;
  options: StoryCard[];
  selectedOptionIds: string[];
  onToggle: (id: string) => void;
}

function OptionCard({
  card,
  isSelected,
  onToggle,
}: {
  card: StoryCard;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onToggle(card.id)}
      aria-pressed={isSelected}
      aria-label={`${card.title}. ${isSelected ? 'Selected' : 'Not selected'}.`}
      animate={{ scale: isSelected ? 1.01 : 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F5] ${cardHoverLift} ${getCardTypeSurfaceClass(card.type)} p-6 ${
        isSelected
          ? `ring-2 ring-offset-2 ring-offset-[#FAF9F5] ${getCardSelectedRingClass(card.type)}`
          : ''
      }`}
    >
      {isSelected && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#345B50] text-white"
          aria-hidden="true"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}

      <h3 className={`pr-8 ${getCardTitleClass('compact', card.type)}`}>
        {card.title}
      </h3>
      <p className={`mt-2 line-clamp-4 ${getCardBodyClass(card.type)}`}>
        {card.content}
      </p>

      {card.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <li key={tag} className={`inline-flex items-center gap-1 ${getCardTagClass(card.type)}`}>
              <Hash className="h-3 w-3 opacity-60" aria-hidden="true" />
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
  iconClass,
  sectionId,
  options,
  selectedOptionIds,
  onToggle,
}: OptionSectionProps) {
  return (
    <section id={sectionId} aria-label={title} className="scroll-mt-40 space-y-4">
      <div className="flex items-center gap-2">
        <span className={iconClass} aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
          {title}
        </h2>
        <span className="ml-auto text-xs text-slate-500">
          {options.filter((option) => selectedOptionIds.includes(option.id)).length}{' '}
          selected
        </span>
      </div>

      <LayoutGroup>
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {options.map((option) => (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <OptionCard
                  card={option}
                  isSelected={selectedOptionIds.includes(option.id)}
                  onToggle={onToggle}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}

export default function OptionCuration() {
  const dispatch = useAppDispatch();
  const availableOptions = useAppSelector((state) => state.board.availableOptions);
  const selectedOptionIds = useAppSelector((state) => state.board.selectedOptionIds);
  const curationFocus = useAppSelector((state) => state.board.curationFocus);
  const isEditingCuration = useAppSelector((state) => state.board.isEditingCuration);

  useEffect(() => {
    if (!curationFocus) {
      return;
    }

    const sectionId = `curation-${curationFocus}`;
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    dispatch(clearCurationFocus());
  }, [curationFocus, dispatch]);

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
    <div className="min-h-screen scroll-pt-36 bg-[#FAF9F5]">
      <SelectionHeader />

      <main className="mx-auto max-w-7xl px-6 pb-32 pt-10 sm:pt-12">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Curation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            {isEditingCuration ? 'Modify Your Starter Deck' : 'Curate Your Starter Deck'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            {isEditingCuration
              ? 'Swap any category below. Your other choices stay in place until you re-assemble.'
              : 'Choose at least one character, one plot hook, and one setting to assemble your moodboard canvas.'}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <OptionSection
            title="Choose Characters"
            sectionId="curation-character"
            icon={<Swords className="h-4 w-4" />}
            iconClass="text-[#7A3E3E]"
            options={availableOptions.characters}
            selectedOptionIds={selectedOptionIds}
            onToggle={handleToggle}
          />
          <OptionSection
            title="Choose Plot Hooks"
            sectionId="curation-plot"
            icon={<BookOpen className="h-4 w-4" />}
            iconClass="text-[#63512B]"
            options={availableOptions.plots}
            selectedOptionIds={selectedOptionIds}
            onToggle={handleToggle}
          />
          <OptionSection
            title="Choose Settings"
            sectionId="curation-setting"
            icon={<MapPin className="h-4 w-4" />}
            iconClass="text-[#345B50]"
            options={availableOptions.settings}
            selectedOptionIds={selectedOptionIds}
            onToggle={handleToggle}
          />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-6 py-4 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            {!selectionByCategory.hasCharacterSelected && 'Select a character · '}
            {!selectionByCategory.hasPlotSelected && 'Select a plot hook · '}
            {!selectionByCategory.hasSettingSelected && 'Select a setting'}
            {selectionByCategory.canAssemble &&
              (isEditingCuration ? 'Ready to update your moodboard.' : 'Ready to assemble your moodboard.')}
          </p>

          <motion.button
            type="button"
            onClick={handleAssemble}
            disabled={!selectionByCategory.canAssemble}
            whileHover={selectionByCategory.canAssemble ? { scale: 1.02 } : undefined}
            whileTap={selectionByCategory.canAssemble ? { scale: 0.98 } : undefined}
            className="inline-flex w-full min-w-[16rem] items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isEditingCuration ? 'Update Moodboard' : 'Assemble My Moodboard'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
