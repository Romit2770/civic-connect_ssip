import React from 'react';
import { LucideIcon, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="gov-card p-10 text-center bg-white border border-slate-200 rounded-xl space-y-3">
      <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link to={actionHref} className="gov-button-primary text-xs py-2 px-4 shadow-sm inline-flex">
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="gov-button-primary text-xs py-2 px-4 shadow-sm">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
