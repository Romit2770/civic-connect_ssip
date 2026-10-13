import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KPIStatCardProps {
  title?: string;
  label?: string; // alias for title
  value: string | number;
  subtitle?: string;
  subValue?: string; // alias for subtitle
  icon?: LucideIcon;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate' | 'orange' | 'navy';
  trend?: string;
  badge?: string;
  badgeColor?: string;
  code?: string;
  footerNote?: string;
  valueColor?: string;
}

export default function KPIStatCard({
  title,
  label,
  value,
  subtitle,
  subValue,
  icon: Icon,
  variant = 'blue',
  trend,
  badge,
  badgeColor,
  code,
  footerNote,
  valueColor,
}: KPIStatCardProps) {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || subValue || '';

  const getColors = () => {
    switch (variant) {
      case 'green':
        return {
          topBorder: 'border-t-[#10b981]',
          value: valueColor || 'text-slate-900',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          iconColor: 'text-emerald-600',
        };
      case 'amber':
        return {
          topBorder: 'border-t-[#f59e0b]',
          value: valueColor || 'text-[#c2410c]',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          iconColor: 'text-amber-600',
        };
      case 'orange':
        return {
          topBorder: 'border-t-[#ea580c]',
          value: valueColor || 'text-[#c2410c]',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          iconColor: 'text-orange-600',
        };
      case 'purple':
        return {
          topBorder: 'border-t-[#6366f1]',
          value: valueColor || 'text-slate-900',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconColor: 'text-indigo-600',
        };
      case 'slate':
        return {
          topBorder: 'border-t-[#334155]',
          value: valueColor || 'text-slate-900',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
          iconColor: 'text-slate-600',
        };
      case 'red':
        return {
          topBorder: 'border-t-rose-600',
          value: valueColor || 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          iconColor: 'text-rose-600',
        };
      case 'navy':
        return {
          topBorder: 'border-t-[#133054]',
          value: valueColor || 'text-slate-900',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          iconColor: 'text-[#133054]',
        };
      case 'blue':
      default:
        return {
          topBorder: 'border-t-[#1e293b]',
          value: valueColor || 'text-slate-900',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          iconColor: 'text-blue-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`bg-white border border-slate-200/90 border-t-[3.5px] ${colors.topBorder} rounded-2xl shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col justify-between group min-h-[125px]`}
    >
      {/* Top Header: Code on left, Badge on right */}
      <div className="flex items-center justify-between gap-1.5">
        {code ? (
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {code}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {displayTitle}
          </span>
        )}

        {badge ? (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-tight border shrink-0 ${
              badgeColor || colors.badgeBg
            }`}
          >
            {badge}
          </span>
        ) : Icon ? (
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
            <Icon size={14} className={colors.iconColor} />
          </div>
        ) : trend ? (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
            {trend}
          </span>
        ) : null}
      </div>

      {/* Large Value Display */}
      <div className="mt-2 sm:mt-2.5">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight font-sans block ${colors.value}`}>
          {value}
        </span>
      </div>

      {/* Title / Metric Name */}
      <div className="mt-1">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight block leading-tight">
          {displayTitle}
        </span>
      </div>

      {/* Subtitle / Description */}
      {(displaySubtitle || footerNote) && (
        <div className="mt-0.5 text-[11px] text-slate-500 font-normal leading-normal truncate flex items-center justify-between gap-1">
          <span className="truncate">{displaySubtitle}</span>
          {footerNote && (
            <span className="text-[10px] font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
              {footerNote}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
