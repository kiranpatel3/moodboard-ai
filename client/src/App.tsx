import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAppSelector } from './store/hooks';
import type { AvailableOptions } from './store/boardSlice';
import BoardDashboard from './components/board/BoardDashboard';
import GenreSelector from './components/GenreSelector';
import NavBar from './components/NavBar';
import OptionCuration from './components/OptionCuration';

type WizardStep = 'genre' | 'curation' | 'canvas';

function hasAvailableOptions(options: AvailableOptions): boolean {
  return (
    options.characters.length > 0 ||
    options.plots.length > 0 ||
    options.settings.length > 0
  );
}

function resolveWizardStep(
  cardsCount: number,
  options: AvailableOptions,
  isEditingCuration: boolean,
): WizardStep {
  if (isEditingCuration && hasAvailableOptions(options)) {
    return 'curation';
  }

  if (cardsCount > 0) {
    return 'canvas';
  }

  if (hasAvailableOptions(options)) {
    return 'curation';
  }

  return 'genre';
}

const stepTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export default function App() {
  const cards = useAppSelector((state) => state.board.cards);
  const availableOptions = useAppSelector((state) => state.board.availableOptions);
  const isEditingCuration = useAppSelector((state) => state.board.isEditingCuration);
  const isGeneratingStarterDeck = useAppSelector(
    (state) => state.board.isGeneratingStarterDeck,
  );

  const wizardStep = useMemo(
    () => resolveWizardStep(cards.length, availableOptions, isEditingCuration),
    [cards.length, availableOptions, isEditingCuration],
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800">
      <NavBar />
      <main className="relative min-h-screen pt-20">
        <AnimatePresence mode="wait">
          {(wizardStep === 'genre' || isGeneratingStarterDeck) && (
            <motion.div
              key="wizard-genre"
              className="min-h-screen w-full"
              {...stepTransition}
            >
              <GenreSelector />
            </motion.div>
          )}

          {wizardStep === 'curation' && !isGeneratingStarterDeck && (
            <motion.div
              key="wizard-curation"
              className="min-h-screen w-full"
              {...stepTransition}
            >
              <OptionCuration />
            </motion.div>
          )}

          {wizardStep === 'canvas' && (
            <motion.div
              key="wizard-canvas"
              className="min-h-screen w-full"
              {...stepTransition}
            >
              <BoardDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
