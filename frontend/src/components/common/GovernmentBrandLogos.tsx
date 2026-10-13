import React from 'react';

// Authentic Vector State Emblem of India (Ashoka Lion Capital)
export function NationalEmblem({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
    >
      {/* Three Lions Silhouette in Terracotta/Gold */}
      <path
        d="M50 15 C45 8 35 12 35 22 C35 28 39 34 43 38 C39 42 36 48 37 55 C37 60 41 64 45 66 C42 68 40 72 41 76 L50 78 L59 76 C60 72 58 68 55 66 C59 64 63 60 63 55 C64 48 61 42 57 38 C61 34 65 28 65 22 C65 12 55 8 50 15 Z"
        fill="#b45309"
      />
      {/* Left Lion Mane & Profile */}
      <path
        d="M32 26 C26 22 18 28 20 38 C22 45 28 50 32 54 C30 58 28 64 30 70 L40 76 L38 68 C34 64 32 58 33 52 C29 48 26 42 27 36 C28 32 30 28 32 26 Z"
        fill="#92400e"
      />
      {/* Right Lion Mane & Profile */}
      <path
        d="M68 26 C74 22 82 28 80 38 C78 45 72 50 68 54 C70 58 72 64 70 70 L60 76 L62 68 C66 64 68 58 67 52 C71 48 74 42 73 36 C72 32 70 28 68 26 Z"
        fill="#92400e"
      />
      {/* Center Lion Face Details */}
      <circle cx="46" cy="30" r="1.5" fill="#fef3c7" />
      <circle cx="54" cy="30" r="1.5" fill="#fef3c7" />
      <path d="M48 35 Q50 37 52 35" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 42 Q50 46 56 42" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" />
      {/* Abacus Pedestal */}
      <rect x="22" y="78" width="56" height="12" rx="2" fill="#78350f" />
      {/* Ashoka Chakra in Center of Base */}
      <circle cx="50" cy="84" r="4.5" stroke="#000080" strokeWidth="1" fill="#ffffff" />
      <line x1="50" y1="79.5" x2="50" y2="88.5" stroke="#000080" strokeWidth="0.8" />
      <line x1="45.5" y1="84" x2="54.5" y2="84" stroke="#000080" strokeWidth="0.8" />
      <line x1="47" y1="80.8" x2="53" y2="87.2" stroke="#000080" strokeWidth="0.6" />
      <line x1="53" y1="80.8" x2="47" y2="87.2" stroke="#000080" strokeWidth="0.6" />
      {/* Bull and Horse Accents */}
      <circle cx="32" cy="84" r="2" fill="#d97706" />
      <circle cx="68" cy="84" r="2" fill="#d97706" />
      {/* Bell-shaped Lotus Base */}
      <path
        d="M26 90 Q50 94 74 90 L76 100 Q50 104 24 100 Z"
        fill="#b45309"
      />
      {/* Satyameva Jayate Banner */}
      <text
        x="50"
        y="114"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="bold"
        fill="#78350f"
        fontFamily="serif"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

// Authentic Swachh Bharat Mission Glasses & Motto
export function SwachhBharatLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} title="Swachh Bharat Mission">
      {/* Gandhi Glasses SVG */}
      <svg viewBox="0 0 130 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
        {/* Left Lens */}
        <circle cx="32" cy="25" r="20" stroke="#006837" strokeWidth="3.5" fill="#ffffff" />
        <text
          x="32"
          y="29"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#006837"
          fontFamily="sans-serif"
        >
          स्वच्छ
        </text>
        {/* Right Lens */}
        <circle cx="98" cy="25" r="20" stroke="#006837" strokeWidth="3.5" fill="#ffffff" />
        <text
          x="98"
          y="29"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#006837"
          fontFamily="sans-serif"
        >
          भारत
        </text>
        {/* Bridge between lenses */}
        <path d="M52 23 Q65 14 78 23" stroke="#006837" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Left Temple Bar */}
        <path d="M12 25 L2 21" stroke="#006837" strokeWidth="3" strokeLinecap="round" />
        {/* Right Temple Bar */}
        <path d="M118 25 L128 21" stroke="#006837" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {/* Slogan */}
      <div className="flex flex-col text-left">
        <span className="text-[#006837] font-extrabold text-[12px] leading-tight tracking-tight">
          एक कदम स्वच्छता की ओर
        </span>
        <span className="text-slate-500 font-medium text-[10px] tracking-wide">
          Swachh Bharat Mission
        </span>
      </div>
    </div>
  );
}

// Digital India Brand Logo
export function DigitalIndiaLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} title="Digital India">
      <div className="w-8 h-8 rounded-full border-2 border-[#ff9933] border-r-[#138808] flex items-center justify-center p-0.5 shadow-2xs">
        <span className="font-extrabold text-xs text-[#0a2540] tracking-tighter">
          DI
        </span>
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-extrabold text-xs text-[#0a2540]">Digital</span>
          <span className="font-extrabold text-xs text-[#1e40af]">India</span>
        </div>
        <span className="text-[9px] text-slate-500 font-medium tracking-tight mt-0.5">
          Power To Empower
        </span>
      </div>
    </div>
  );
}
