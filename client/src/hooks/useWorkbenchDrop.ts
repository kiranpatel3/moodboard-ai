import type { PanInfo } from 'framer-motion';
import { placeInSlotA, placeInSlotB, type StoryCard } from '../store/boardSlice';
import { useAppDispatch } from '../store/hooks';
import { getWorkbenchDropTarget } from '../utils/workbenchDrop';

export function useWorkbenchDrop() {
  const dispatch = useAppDispatch();

  const handleCardDragEnd = (card: StoryCard, info: PanInfo) => {
    const target = getWorkbenchDropTarget(info.point);

    if (target === 'A') {
      dispatch(placeInSlotA(card));
      return;
    }

    if (target === 'B') {
      dispatch(placeInSlotB(card));
    }
  };

  return { handleCardDragEnd };
}
