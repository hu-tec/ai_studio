import type { GovLevel } from '../types';
import { GOV_LEVELS } from '../constants';

interface Props {
  level: GovLevel;
  axis?: string;
  compact?: boolean;
}

export function RuleBadge({ level, axis, compact }: Props) {
  const cfg = GOV_LEVELS.find((l) => l.code === level)!;
  return (
    <span
      className="inline-flex items-center gap-1 rounded border text-[10px] leading-tight px-1.5 py-0.5 font-medium whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      {axis && !compact && <span className="opacity-70">{axis}</span>}
      <span>{cfg.label}</span>
    </span>
  );
}
