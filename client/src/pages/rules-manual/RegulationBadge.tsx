import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  type: 'fixed' | 'semi' | 'optional';
  className?: string;
}

export function RegulationBadge({ type, className }: BadgeProps) {
  const styles = {
    fixed: 'bg-red-50 text-red-600 border-red-100',
    semi: 'bg-amber-50 text-amber-600 border-amber-100',
    optional: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const labels = {
    fixed: '규정 (고정)',
    semi: '준규정 (조건부)',
    optional: '선택규정 (자율)',
  };

  return (
    <span className={twMerge(
      'px-2 py-0.5 rounded text-xs font-medium border inline-flex items-center gap-1',
      styles[type],
      className
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        type === 'fixed' ? 'bg-red-500' : type === 'semi' ? 'bg-amber-500' : 'bg-emerald-500'
      )} />
      {labels[type]}
    </span>
  );
}
