import type { Card, CardType } from '../store/boardSlice';

export const LONG_PLOT_CHAR_THRESHOLD = 140;

export type CardLayoutVariant = 'compact' | 'standard' | 'wide';

const storyCardTokens = {
  character: {
    surface: 'bg-[#FCE7E7] border-[#F1C1C1] text-[#7A3E3E]',
    title: 'text-[#7A3E3E]',
    body: 'text-[#7A3E3E]/85',
    meta: 'text-[#7A3E3E]/55',
    tag: 'border-[#F1C1C1] bg-[#FFF5F5] text-[#7A3E3E]',
    selectedRing: 'ring-[#F1C1C1]',
  },
  setting: {
    surface: 'bg-[#E2F0EC] border-[#B9DAD0] text-[#345B50]',
    title: 'text-[#345B50]',
    body: 'text-[#345B50]/85',
    meta: 'text-[#345B50]/55',
    tag: 'border-[#B9DAD0] bg-[#F2F8F6] text-[#345B50]',
    selectedRing: 'ring-[#B9DAD0]',
  },
  plot: {
    surface: 'bg-[#FCF1D9] border-[#EAD2A1] text-[#63512B]',
    title: 'text-[#63512B]',
    body: 'text-[#63512B]/85',
    meta: 'text-[#63512B]/55',
    tag: 'border-[#EAD2A1] bg-[#FFFAF0] text-[#63512B]',
    selectedRing: 'ring-[#EAD2A1]',
  },
} as const satisfies Record<
  CardType,
  {
    surface: string;
    title: string;
    body: string;
    meta: string;
    tag: string;
    selectedRing: string;
  }
>;

export const storyCardShellClass = 'rounded-xl border-[1.5px]';

export const cardHoverLift =
  'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

export function getCardLayoutVariant(card: Card): CardLayoutVariant {
  if (card.type === 'setting') {
    return 'compact';
  }

  if (card.type === 'plot' && card.content.length >= LONG_PLOT_CHAR_THRESHOLD) {
    return 'wide';
  }

  return 'standard';
}

export function getCardGridClass(card: Card): string {
  if (getCardLayoutVariant(card) === 'wide') {
    return 'md:col-span-2';
  }

  return '';
}

export function getCardTypeSurfaceClass(type: CardType): string {
  return `${storyCardShellClass} ${storyCardTokens[type].surface}`;
}

export function getCardSelectedRingClass(type: CardType): string {
  return storyCardTokens[type].selectedRing;
}

export function getCardMetaClass(type: CardType): string {
  return storyCardTokens[type].meta;
}

export function getCardTagClass(type: CardType): string {
  return `rounded-lg border px-2.5 py-1 text-xs ${storyCardTokens[type].tag}`;
}

const variantShellStyles: Record<CardLayoutVariant, string> = {
  compact: 'flex aspect-square w-full flex-col justify-between p-6',
  standard: 'p-6',
  wide: 'p-6 md:p-8',
};

export function getCardSurfaceClass(card: Card): string {
  const variant = getCardLayoutVariant(card);

  return `${getCardTypeSurfaceClass(card.type)} ${variantShellStyles[variant]}`;
}

export function getCardTitleClass(variant: CardLayoutVariant, type: CardType): string {
  const sizeClass =
    variant === 'compact'
      ? 'text-base'
      : variant === 'wide'
        ? 'text-xl md:text-2xl'
        : 'text-lg';

  return `text-pretty font-bold tracking-tight ${sizeClass} ${storyCardTokens[type].title}`;
}

export function getCardBodyClass(
  type: CardType,
  expanded = false,
): string {
  const base = `text-pretty text-sm leading-relaxed ${storyCardTokens[type].body}`;

  if (expanded) {
    return base;
  }

  return `${base} line-clamp-3 text-ellipsis`;
}
