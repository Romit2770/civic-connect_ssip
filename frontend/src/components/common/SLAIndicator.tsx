import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertCircle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { SLAState } from '../../types';

interface SLAIndicatorProps {
  slaState: SLAState;
  deadline?: string;
  size?: 'sm' | 'md';
}

export default function SLAIndicator({ slaState, deadline, size = 'md' }: SLAIndicatorProps) {
  const { t } = useTranslation();

  const getConfig = () => {
    switch (slaState) {
      case 'escalated':
        return {
          icon: AlertOctagon,
          bg: 'bg-red-950 text-red-100 border-red-800',
          textColor: 'text-red-200',
          label: t('sla.escalated'),
        };
      case 'breached':
        return {
          icon: AlertCircle,
          bg: 'bg-red-100 text-red-900 border-red-300',
          textColor: 'text-red-700',
          label: t('sla.breached'),
        };
      case 'due_soon':
        return {
          icon: Clock,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          textColor: 'text-amber-700',
          label: t('sla.due_soon'),
        };
      case 'within_sla':
      default:
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          textColor: 'text-emerald-700',
          label: t('sla.within_sla'),
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-md border ${config.bg} ${
          isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
        }`}
      >
        <Icon size={isSm ? 11 : 13} />
        <span>{config.label}</span>
      </span>
      {deadline && (
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Due: {new Date(deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
