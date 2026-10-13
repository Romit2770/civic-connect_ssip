import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Building2, User, ChevronRight } from 'lucide-react';
import { Complaint } from '../../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SLAIndicator from './SLAIndicator';

interface ComplaintCardProps {
  complaint: Complaint;
  adminView?: boolean;
}

export default function ComplaintCard({ complaint, adminView }: ComplaintCardProps) {
  const { t } = useTranslation();
  const detailLink = adminView
    ? `/admin/issues/${complaint.complaintNumber || complaint._id}`
    : `/issues/${complaint.complaintNumber || complaint._id}`;

  return (
    <div className="gov-card p-4 sm:p-5 hover:shadow-md transition-all border border-slate-200 bg-white space-y-3">
      {/* Header Row: ID, Category, Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
            {complaint.complaintNumber}
          </span>
          <span className="text-xs font-semibold text-slate-600 capitalize">
            {t(`categories.${complaint.category}`)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={complaint.priority} size="sm" />
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      {/* Main Title & Description */}
      <div>
        <Link to={detailLink} className="group">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      {/* Photo Thumbnail if present */}
      {complaint.resolutionEvidence?.photos && complaint.resolutionEvidence.photos.length > 0 ? (
        <div className="flex items-center gap-2 pt-1">
          <div className="relative">
            <img
              src={complaint.photos?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300'}
              alt="Before"
              className="w-16 h-12 rounded object-cover border border-slate-300"
            />
            <span className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded">
              Before
            </span>
          </div>
          <span className="text-slate-400 font-bold text-xs">→</span>
          <div className="relative">
            <img
              src={complaint.resolutionEvidence.photos[0]}
              alt="After"
              className="w-16 h-12 rounded object-cover border-2 border-emerald-500"
            />
            <span className="absolute bottom-0.5 left-0.5 bg-emerald-800 text-white text-[8px] font-bold px-1 rounded">
              After (Geotagged)
            </span>
          </div>
        </div>
      ) : complaint.photos && complaint.photos.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pt-1">
          {complaint.photos.slice(0, 3).map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt="Evidence"
              className="w-16 h-12 rounded object-cover border border-slate-200"
              loading="lazy"
            />
          ))}
        </div>
      ) : null}

      {/* Metadata Row: Location, Ward, SLA, Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          {complaint.wardId && (
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-slate-400" />
              <span>Ward {complaint.wardId.wardNumber} ({complaint.wardId.name})</span>
            </span>
          )}

          {complaint.location?.address && (
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin size={13} className="text-slate-400" />
              <span>{complaint.location.address}</span>
            </span>
          )}

          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-slate-400" />
            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SLAIndicator slaState={complaint.slaState} deadline={complaint.slaDeadline} size="sm" />

          <Link
            to={detailLink}
            className="inline-flex items-center gap-0.5 text-blue-700 hover:text-blue-900 font-bold hover:underline"
          >
            <span>{t('common.viewDetails')}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
