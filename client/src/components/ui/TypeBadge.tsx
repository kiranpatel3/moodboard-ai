import type { CardType } from '../../store/boardSlice';

const typeStyles: Record<
  CardType,
  { label: string; className: string; dotClassName: string }
> = {
  character: {
    label: 'Character',
    className: 'border-violet-200 bg-violet-50 text-violet-800',
    dotClassName: 'bg-violet-600',
  },
  setting: {
    label: 'Setting',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    dotClassName: 'bg-cyan-600',
  },
  plot: {
    label: 'Plot',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    dotClassName: 'bg-amber-600',
  },
};

interface TypeBadgeProps {
  type: CardType;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const style = typeStyles[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dotClassName}`} />
      {style.label}
    </span>
  );
}
