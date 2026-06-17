import type { CardType } from '../../store/boardSlice';

const typeStyles: Record<
  CardType,
  { label: string; className: string; dotClassName: string }
> = {
  character: {
    label: 'Character',
    className: 'border-[#F1C1C1] bg-[#FFF5F5] text-[#7A3E3E]',
    dotClassName: 'bg-[#7A3E3E]',
  },
  setting: {
    label: 'Setting',
    className: 'border-[#B9DAD0] bg-[#F2F8F6] text-[#345B50]',
    dotClassName: 'bg-[#345B50]',
  },
  plot: {
    label: 'Plot',
    className: 'border-[#EAD2A1] bg-[#FFFAF0] text-[#63512B]',
    dotClassName: 'bg-[#63512B]',
  },
};

interface TypeBadgeProps {
  type: CardType;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const style = typeStyles[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border-[1.5px] px-2.5 py-1 text-xs font-medium tracking-wide ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-sm ${style.dotClassName}`} />
      {style.label}
    </span>
  );
}
