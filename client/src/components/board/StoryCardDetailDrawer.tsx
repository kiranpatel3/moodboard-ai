import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, X } from 'lucide-react';
import type { Card } from '../../store/boardSlice';
import {
  getCardBodyClass,
  getCardLayoutVariant,
  getCardMetaClass,
  getCardTagClass,
  getCardTitleClass,
  getCardTypeSurfaceClass,
} from '../../utils/cardLayout';
import TypeBadge from '../ui/TypeBadge';

interface StoryCardDetailDrawerProps {
  card: Card | null;
  onClose: () => void;
}

export default function StoryCardDetailDrawer({
  card,
  onClose,
}: StoryCardDetailDrawerProps) {
  const layoutVariant = card ? getCardLayoutVariant(card) : 'standard';

  return (
    <Dialog.Root open={Boolean(card)} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {card && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.article
                layoutId={`story-card-${card.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  layout: { type: 'spring', stiffness: 380, damping: 34 },
                  opacity: { duration: 0.2 },
                }}
                className={`fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-xl border-[1.5px] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(88vh,36rem)] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl ${getCardTypeSurfaceClass(card.type)}`}
              >
                <div className="sticky top-0 z-10 flex items-center justify-end border-b border-[#00000010] p-3 backdrop-blur-sm sm:rounded-t-xl">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close story card"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-[inherit] bg-white/30 ${getCardMetaClass(card.type)} transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-6 pt-4">
                  <Dialog.Title className="sr-only">{card.title}</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Full narrative for {card.title}
                  </Dialog.Description>

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <TypeBadge type={card.type} />
                    <span
                      className={`text-xs font-medium uppercase tracking-widest ${getCardMetaClass(card.type)}`}
                    >
                      {card.id.slice(0, 6)}
                    </span>
                  </div>

                  <h3 className={`mb-4 ${getCardTitleClass(layoutVariant, card.type)}`}>
                    {card.title}
                  </h3>

                  <p className={getCardBodyClass(card.type, true)}>{card.content}</p>

                  {card.tags.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <li
                          key={tag}
                          className={`inline-flex items-center gap-1 ${getCardTagClass(card.type)}`}
                        >
                          <Hash className="h-3 w-3 opacity-60" aria-hidden="true" />
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.article>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
