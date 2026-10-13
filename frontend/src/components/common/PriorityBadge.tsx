import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { ComplaintPriority } from '../../types';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const { t } = useTranslation();

  const getConfig = () => {
    switch (priority) {
      case 'critical':
        return {
          icon: Flame,
          bg: 'bg-red-50 text-red-800 border-red-300 font-extrabold',
          color: 'text-red-700',
        };
      case 'high':
        return {
          icon: ArrowUp,
          bg: 'bg-orange-50 text-orange-900 border-orange-200 font-bold',
          color: 'text-orange-700',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
          color: 'text-amber-700',
        };
      case 'low':
      default:
        return {
          icon: ArrowDown,
          bg: 'bg-slate-50 text-slate-700 border-slate-200 font-medium',
          color: 'text-slate-500',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${config.bg} ${
        isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      <Icon size={isSm ? 11 : 13} className={config.color} />
      <span>{t(`priority.${priority}`)}</span>
    </span>
  );
}
