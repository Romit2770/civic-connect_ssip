import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Shield,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Trees,
  Truck,
  Car,
  Camera,
  PlusCircle,
  LayoutGrid,
  ArrowRight,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import ComplaintMap from '../../components/common/ComplaintMap';
import { ComplaintCategory } from '../../types';

const CIVIC_BACKGROUND_IMAGES = [
  {
    src: '/assets/civic/sanitation-waste.jpg',
    titleKey: 'home.ticker5',
    defaultTitle: 'Solid Waste Management',
    alt: 'Municipal solid waste management and sanitation workers',
  },
  {
    src: '/assets/civic/clean-city.jpg',
    titleKey: 'home.subBadge',
    defaultTitle: 'Clean Smart Cities',
    alt: 'Clean urban street infrastructure and civic services',
  },
  {
    src: '/assets/civic/road-repair.jpg',
    titleKey: 'home.aboutCard2Title',
    defaultTitle: 'Road & Asphalt Remediation',
    alt: 'Municipal road maintenance and asphalt remediation',
  },
  {
    src: '/assets/civic/field-inspection.jpg',
    titleKey: 'home.onSiteTitle',
    defaultTitle: 'On-Site Verification',
    alt: 'Municipal field officer on-site inspection with citizens',
  },
  {
    src: '/assets/civic/citizen-reporting.jpg',
    titleKey: 'home.ticker2',
    defaultTitle: 'Citizen Mobile Reporting',
    alt: 'Citizen reporting civic grievance on smartphone',
  },
  {
    src: '/assets/civic/pothole-road.jpg',
    titleKey: 'home.aboutCard1Title',
    defaultTitle: 'Civic Asset Management',
    alt: 'Urban road condition and municipal maintenance',
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mapComplaints, setMapComplaints] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [currentBg, setCurrentBg] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [trackId, setTrackId] = useState('');

  // Background rotation timer (every 6 seconds)
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentBg((prev) => (prev + 1) % CIVIC_BACKGROUND_IMAGES.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  useEffect(() => {
    async function loadData() {
      try {
        const mapRes = await apiClient.get('/map/complaints').catch(() => null);
        if (mapRes?.data?.success) {
          setMapComplaints(mapRes.data.data?.features || []);
        }
      } catch (e) {
        // Handled silently
      }
    }
    loadData();
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackId.trim())}`);
    } else {
      navigate('/track');
    }
  };

  const tickerItems = [
    {
      icon: CheckCircle2,
      text: t('home.ticker1'),
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: ShieldCheck,
      text: t('home.ticker2'),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Shield,
      text: t('home.ticker3'),
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      icon: Search,
      text: t('home.ticker4'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Clock,
      text: t('home.ticker5'),
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: MapPin,
      text: t('home.ticker6'),
      color: 'text-teal-600',
      bg: 'bg-cyan-50',
    },
  ];

  const categories: Array<{ key: ComplaintCategory; icon: any; color: string }> = [
    { key: 'pothole', icon: Hammer, color: 'from-amber-600 to-amber-800' },
    { key: 'garbage', icon: Trash2, color: 'from-emerald-600 to-emerald-800' },
    { key: 'streetlight', icon: Lightbulb, color: 'from-yellow-500 to-amber-600' },
    { key: 'water', icon: Droplets, color: 'from-blue-600 to-cyan-700' },
    { key: 'drainage', icon: Waves, color: 'from-indigo-600 to-indigo-800' },
    { key: 'road_damage', icon: Car, color: 'from-slate-700 to-slate-900' },
    { key: 'fallen_tree', icon: Trees, color: 'from-green-600 to-emerald-800' },
    { key: 'illegal_dumping', icon: Truck, color: 'from-rose-600 to-rose-800' },
  ];

  return (
    <div className="space-y-12 pb-16 bg-[#F8FAFC]">
      {/* 1. HERO SECTION WITH AUTHENTIC CIVIC BACKGROUND & LEFT CARD */}
      <section
        className="relative min-h-[580px] sm:min-h-[620px] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden flex items-center bg-[#071a2e]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="CivicConnect Hero"
      >
        {/* National Tricolor Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 z-30 flex">
          <div className="bg-[#FF9933] flex-1" />
          <div className="bg-white flex-1" />
          <div className="bg-[#138808] flex-1" />
        </div>

        {/* Real-Life Photographic Background Rotation */}
        {CIVIC_BACKGROUND_IMAGES.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ transition: 'opacity 1s ease-in-out, transform 7s ease' }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* High-Contrast Government Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071728]/95 via-[#071728]/80 to-transparent z-10" />

        {/* Hero Content Left Card */}
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <div className="max-w-2xl bg-[#0b1b2f]/92 sm:bg-[#0b1b2f]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-md space-y-5">
            {/* National Grievance Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-[#081829]/95 border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-inner text-xs">
              <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Award size={12} className="text-amber-400" />
              </span>
              <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] sm:text-xs">
                {t('home.badge')}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs">
                {t('home.subBadge')}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white leading-[1.18] tracking-tight">
              {t('home.heroTitle1')}
              <br />
              <span className="text-[#34d399]">{t('home.heroTitle2')}</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t('home.heroSubtitle')}
            </p>

            {/* 3 Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/report"
                className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <PlusCircle size={16} />
                <span>{t('home.ctaReport')}</span>
              </Link>

              <Link
                to="/track"
                className="px-5 py-2.5 bg-[#1e293b]/90 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Search size={15} />
                <span>{t('home.ctaTrack')}</span>
              </Link>

              <a
                href="#categories"
                className="px-5 py-2.5 bg-[#1e293b]/90 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <LayoutGrid size={15} />
                <span>{t('home.ctaServices')}</span>
              </a>
            </div>

            {/* Quick Track Grievance Status Bar */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold mb-2">
                <Search size={13} className="text-cyan-400" />
                <span>{t('home.quickTrackLabel')}</span>
              </div>
              <form
                onSubmit={handleQuickTrack}
                className="flex items-center bg-[#071322] border border-slate-700/80 rounded-xl p-1.5 focus-within:border-cyan-500 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder={t('home.quickTrackPlaceholder')}
                  className="bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm px-3 py-1.5 flex-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  {t('home.trackStatusBtn')}
                </button>
              </form>
            </div>

            {/* Bottom 3 Assurance Badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-[11px] sm:text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>{t('home.badgeSla')}</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 flex items-center gap-1.5">
                <Camera size={14} className="text-cyan-400" />
                <span>{t('home.badgeAi')}</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                <span>{t('home.badgeGeo')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right Floating Carousel Controller Widget */}
        <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-3 bg-[#081829]/90 border border-slate-700/80 backdrop-blur-md rounded-full px-4 py-2 text-xs text-white shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {t(CIVIC_BACKGROUND_IMAGES[currentBg].titleKey, {
              defaultValue: CIVIC_BACKGROUND_IMAGES[currentBg].defaultTitle,
            })}
          </span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            {CIVIC_BACKGROUND_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBg(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentBg ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-500 hover:bg-slate-400'
                }`}
                aria-label={`Switch to slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 ml-1 text-slate-300">
            <button
              onClick={() => setCurrentBg((prev) => (prev === 0 ? CIVIC_BACKGROUND_IMAGES.length - 1 : prev - 1))}
              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentBg((prev) => (prev + 1) % CIVIC_BACKGROUND_IMAGES.length)}
              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL FEATURE TICKER / RIBBON BAR (CONTINUOUS ROLLING) */}
      <section className="bg-white border-y border-slate-200 py-3 shadow-2xs overflow-hidden">
        <div className="w-full overflow-hidden">
          <div className="animate-continuous-ticker flex gap-3">
            {[...tickerItems, ...tickerItems].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-shadow whitespace-nowrap flex-shrink-0"
                >
                  <div className={`p-1.5 rounded-lg ${item.bg}`}>
                    <Icon size={16} className={item.color} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ABOUT CIVICCONNECT SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Text & 2x2 Feature Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full border-2 border-teal-600" />
                <span>{t('home.aboutTag')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f2b48] tracking-tight mt-3">
                {t('home.aboutTitle')}
              </h2>
              <p className="text-slate-700 text-sm sm:text-[15px] font-medium leading-relaxed mt-4">
                {t('home.aboutP1')}
              </p>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-2.5">
                {t('home.aboutP2')}
              </p>
            </div>

            {/* 2x2 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Card 1: 2. AI Triage */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex-shrink-0 mt-0.5">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0f2b48]">{t('home.aboutCard1Title')}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {t('home.aboutCard1Desc')}
                  </p>
                </div>
              </div>

              {/* Card 2: 4. Field Remediation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0f2b48]">{t('home.aboutCard2Title')}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {t('home.aboutCard2Desc')}
                  </p>
                </div>
              </div>

              {/* Card 3: 3. Department Assignment */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0f2b48]">{t('home.aboutCard3Title')}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {t('home.aboutCard3Desc')}
                  </p>
                </div>
              </div>

              {/* Card 4: 6. Citizen Verification */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0f2b48]">{t('home.aboutCard4Title')}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {t('home.aboutCard4Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image with Floating Overlay Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100">
              <img
                src="/assets/civic/field-inspection.jpg"
                alt="Municipal engineers verifying civic resolution on site with citizen"
                className="w-full h-[400px] object-cover object-center"
              />
              {/* Floating Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-lg flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0f2b48]">{t('home.onSiteTitle')}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('home.onSiteSub')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CIVIC GRIEVANCE CATEGORIES */}
      <section id="categories" className="gov-container space-y-8 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('home.categoriesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('home.categoriesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.key}
                to={`/report?category=${c.key}`}
                className="gov-card p-5 bg-white border border-slate-200 hover:border-teal-500 rounded-2xl flex flex-col items-center text-center gap-3 transition-all hover:shadow-md group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-teal-50 text-teal-800 flex items-center justify-center transition-colors border border-slate-100">
                  <Icon size={24} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
                    {t(`categories.${c.key}`)}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{t('home.fileGrievance')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. GIS CITY MAP PREVIEW */}
      <section className="gov-container space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('home.mapTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('home.mapSubtitle')}
            </p>
          </div>
          <Link
            to="/map"
            className="gov-button-primary text-xs py-2 px-4 flex items-center gap-1.5 rounded-xl bg-[#0a2540] hover:bg-[#12395b]"
          >
            <span>{t('home.ctaMap')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm overflow-hidden h-[380px]">
          <ComplaintMap
            complaints={mapComplaints}
            center={[23.0225, 72.5714]}
            zoom={12}
            height="100%"
          />
        </div>
      </section>

      {/* 6. CITIZEN FAQ ACCORDION */}
      <section id="faq" className="gov-container space-y-6 max-w-3xl scroll-mt-20">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t('home.faqTitle')}
          </h2>
          <p className="text-xs text-slate-600">
            {t('home.faqSubtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {[
            { q: t('home.faq1Q'), a: t('home.faq1A') },
            { q: t('home.faq2Q'), a: t('home.faq2A') },
            { q: t('home.faq3Q'), a: t('home.faq3A') },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-teal-800' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
