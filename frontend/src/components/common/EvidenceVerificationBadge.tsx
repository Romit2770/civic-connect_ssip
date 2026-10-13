import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { VerificationStatus } from '../../types';

interface EvidenceVerificationBadgeProps {
  status?: VerificationStatus;
  riskScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export default function EvidenceVerificationBadge({
  status = 'PASS',
  riskScore,
  size = 'md',
  showScore = false,
}: EvidenceVerificationBadgeProps) {
  let bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let Icon = ShieldCheck;
  let label = 'Verified / Low Risk';

  if (status === 'REVIEW') {
    bg = 'bg-amber-50 text-amber-900 border-amber-300';
    Icon = AlertTriangle;
    label = 'Additional Review Required';
  } else if (status === 'HIGH_RISK') {
    bg = 'bg-rose-50 text-rose-900 border-rose-300';
    Icon = ShieldAlert;
    label = 'High Verification Risk';
  } else if (status === 'UNAVAILABLE') {
    bg = 'bg-slate-50 text-slate-700 border-slate-300';
    Icon = Clock;
    label = 'Verification Pending';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold tracking-wide ${bg} ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{label}</span>
      {showScore && typeof riskScore === 'number' && (
        <span className="font-mono text-[10px] bg-white/80 px-1 py-0.2 rounded ml-1 border border-current/20">
          Risk: {riskScore}/100
        </span>
      )}
    </span>
  );
}
