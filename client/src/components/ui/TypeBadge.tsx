import type { CardType } from '../../store/boardSlice';

const typeStyles: Record<
  CardType,
  { label: string; className: string; dotClassName: string }
> = {
  character: {
    label: 'Character',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    dotClassName: 'bg-violet-400',
  },
  setting: {
    label: 'Setting',
    className: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    dotClassName: 'bg-cyan-400',
  },
  plot: {
    label: 'Plot',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dotClassName: 'bg-amber-400',
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
