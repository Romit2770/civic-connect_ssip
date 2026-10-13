import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Wrench,
  FileCheck2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';

interface ComplaintTimelineProps {
  status: ComplaintStatus;
  statusHistory?: Array<{
    _id: string;
    fromStatus: ComplaintStatus | null;
    toStatus: ComplaintStatus;
    changedBy: {
      _id: string;
      name: string;
      role: string;
    };
    note?: string;
    evidencePhoto?: string;
    createdAt: string;
  }>;
}

const LIFECYCLE_STEPS: Array<{ key: ComplaintStatus; label: string; icon: any }> = [
  { key: 'submitted', label: 'status.submitted', icon: Send },
  { key: 'acknowledged', label: 'status.acknowledged', icon: Clock },
  { key: 'assigned', label: 'status.assigned', icon: UserCheck },
  { key: 'in_progress', label: 'status.in_progress', icon: Wrench },
  { key: 'verification_pending', label: 'status.verification_pending', icon: FileCheck2 },
  { key: 'resolved', label: 'status.resolved', icon: CheckCircle2 },
];

export default function ComplaintTimeline({ status, statusHistory = [] }: ComplaintTimelineProps) {
  const { t } = useTranslation();

  const getStepIndex = (st: ComplaintStatus): number => {
    if (st === 'submitted') return 0;
    if (st === 'acknowledged') return 1;
    if (st === 'routed' || st === 'assigned') return 2;
    if (st === 'in_progress') return 3;
    if (st === 'resolution_submitted' || st === 'verification_pending') return 4;
    if (st === 'resolved' || st === 'closed') return 5;
    if (st === 'reopened') return 3; // back to in_progress stage
    return 0;
  };

  const currentIndex = getStepIndex(status);
  const isReopened = status === 'reopened';

  return (
    <div className="gov-card p-5 sm:p-6 bg-white border border-slate-200">
      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
        <span>{t('detail.timelineTitle')}</span>
        {isReopened && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <RotateCcw size={12} /> {t('status.reopened')}
          </span>
        )}
      </h3>

      {/* Stepper Progress Bar */}
      <div className="relative flex items-center justify-between mb-8 overflow-x-auto pb-2">
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 z-0" />
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-blue-700 transition-all duration-500 z-0"
          style={{ width: `${Math.min(100, (currentIndex / (LIFECYCLE_STEPS.length - 1)) * 100)}%` }}
        />

        {LIFECYCLE_STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex flex-col items-center text-center z-10 min-w-[70px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1.5 font-semibold leading-tight ${
                  isDone ? 'text-blue-950 font-bold' : 'text-slate-400'
                }`}
              >
                {t(step.label)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Status Logs */}
      {statusHistory.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Official Progression Log
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {statusHistory.map((item) => (
              <div key={item._id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 capitalize">
                      {t(`status.${item.toStatus}`)}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      by {item.changedBy?.name || 'System Desk'} ({item.changedBy?.role?.replace('_', ' ') || 'Staff'})
                    </span>
                  </div>
                  {item.note && <p className="text-slate-600 mt-0.5 text-xs">{item.note}</p>}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(item.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
