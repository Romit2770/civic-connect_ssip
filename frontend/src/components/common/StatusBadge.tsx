import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Wrench,
  FileCheck2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'submitted':
        return {
          icon: Send,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'acknowledged':
        return {
          icon: Clock,
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dot: 'bg-cyan-500',
        };
      case 'routed':
      case 'assigned':
        return {
          icon: UserCheck,
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'in_progress':
        return {
          icon: Wrench,
          bg: 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse',
          dot: 'bg-amber-500',
        };
      case 'resolution_submitted':
      case 'verification_pending':
        return {
          icon: FileCheck2,
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'resolved':
      case 'closed':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
        };
      case 'reopened':
        return {
          icon: RotateCcw,
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      case 'rejected':
        return {
          icon: XCircle,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${config.bg} ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon size={isSm ? 11 : 13} />
      <span>{t(`status.${status}`)}</span>
    </span>
  );
}
