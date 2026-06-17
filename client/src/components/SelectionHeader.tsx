import { useMemo } from 'react';
import {
  focusCurationCategory,
  openCurationEditor,
  selectGenesisFoundation,
  selectSelectedCardsData,
  selectSelectedGenre,
  stepBackInWizard,
  type CardType,
} from '../store/boardSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import StoryBreadcrumb, {
  buildStoryBreadcrumbFromCards,
  storyBreadcrumbFromFoundation,
  type StoryBreadcrumbData,
} from './board/StoryBreadcrumb';

interface SelectionHeaderProps {
  showCanvasActions?: boolean;
}

export default function SelectionHeader({ showCanvasActions = false }: SelectionHeaderProps) {
  const dispatch = useAppDispatch();
  const selectedGenre = useAppSelector(selectSelectedGenre);
  const selectedCards = useAppSelector(selectSelectedCardsData);
  const genesisFoundation = useAppSelector(selectGenesisFoundation);
  const isEditingCuration = useAppSelector((state) => state.board.isEditingCuration);
  const hasCurationOptions = useAppSelector((state) => {
    const { availableOptions } = state.board;
    return (
      availableOptions.characters.length > 0 ||
      availableOptions.plots.length > 0 ||
      availableOptions.settings.length > 0
    );
  });

  const breadcrumb = useMemo((): StoryBreadcrumbData | null => {
    if (!selectedGenre) {
      return null;
    }

    if (showCanvasActions && genesisFoundation) {
      return storyBreadcrumbFromFoundation(selectedGenre, genesisFoundation);
    }

    return buildStoryBreadcrumbFromCards(selectedGenre, selectedCards);
  }, [genesisFoundation, selectedCards, selectedGenre, showCanvasActions]);

  if (!breadcrumb) {
    return null;
  }

  const handleEditCategory = (type: CardType) => {
    if (showCanvasActions) {
      dispatch(openCurationEditor(type));
      return;
    }

    dispatch(focusCurationCategory(type));
  };

  const handleBackUp = () => {
    if (showCanvasActions) {
      dispatch(openCurationEditor(undefined));
      return;
    }

    dispatch(stepBackInWizard());
  };

  const backUpLabel = showCanvasActions || isEditingCuration ? 'Modify Deck' : '← Back-Up';

  return (
    <header className="sticky top-16 z-40 border-b border-slate-100 bg-[#FAF9F5]/90 p-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Story universe metadata" className="min-w-0 flex-1">
          <StoryBreadcrumb
            data={breadcrumb}
            interactive
            onEditCategory={handleEditCategory}
          />
        </nav>

        {(hasCurationOptions || showCanvasActions || isEditingCuration) && (
          <button
            type="button"
            onClick={handleBackUp}
            className="shrink-0 self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F5] sm:self-center"
          >
            {backUpLabel}
          </button>
        )}
      </div>
    </header>
  );
}
