import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Shield, Phone, Mail, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GovernmentFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#071a2e] text-slate-300 text-xs border-t border-slate-700/60 mt-16">
      {/* Top Banner */}
      <div className="bg-[#051322] py-4 border-b border-slate-800">
        <div className="gov-container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="text-amber-400" size={24} />
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">
                Smart India Hackathon (SIH 2026) Prototype
              </p>
              <p className="text-[11px] text-slate-400">
                Problem Statement CHA-195: Crowdsourced Civic Issue Reporting and Resolution System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded border border-emerald-500/20">
            <Shield size={14} />
            <span>Encrypted & Verified Digital Redressal</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="gov-container py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About Platform */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <Building2 className="text-amber-400" size={20} />
            <span className="font-extrabold text-white text-base">{t('nav.brandName')}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t('footer.aboutText')}
          </p>
        </div>

        {/* Col 2: Citizen Services */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
            {t('footer.quickLinks')}
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li><Link to="/report?category=pothole" className="hover:text-white transition-colors">{t('categories.pothole')}</Link></li>
            <li><Link to="/report?category=garbage" className="hover:text-white transition-colors">{t('categories.garbage')}</Link></li>
            <li><Link to="/report?category=streetlight" className="hover:text-white transition-colors">{t('categories.streetlight')}</Link></li>
            <li><Link to="/report?category=water" className="hover:text-white transition-colors">{t('categories.water')}</Link></li>
            <li><Link to="/track" className="hover:text-white transition-colors">{t('nav.track')}</Link></li>
            <li><Link to="/map" className="hover:text-white transition-colors">{t('nav.cityMap')}</Link></li>
          </ul>
        </div>

        {/* Col 3: Nodal Departments */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
            {t('footer.municipalLinks')}
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>Public Works Department (PWD)</li>
            <li>Solid Waste Management & Sanitation</li>
            <li>Electrical & Street Lighting</li>
            <li>Water Supply & Distribution</li>
            <li>Drainage & Stormwater Sewerage</li>
            <li>Parks, Gardens & Horticulture</li>
          </ul>
        </div>

        {/* Col 4: 24x7 Citizen Helpline */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
            {t('footer.helplineTitle')}
          </h4>
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Phone size={16} className="text-amber-400" />
              <span>{t('footer.tollFree')}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <Mail size={14} className="text-blue-400" />
              <span>grievance@civicconnect.gov.in</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700">
              {t('footer.hours')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimers */}
      <div className="bg-[#030d17] py-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="gov-container flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
