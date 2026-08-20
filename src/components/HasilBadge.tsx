import React from 'react';
import type { KategoriTriage, PrioritasTriage } from '../lib/types';
import { TRIAGE_METADATA } from '../lib/triage-algorithm';
import { AlertTriangle, Clock, CheckCircle2, XCircle, HeartPulse } from 'lucide-react';

interface HasilBadgeProps {
  kategori: KategoriTriage;
  prioritas?: PrioritasTriage;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showDescription?: boolean;
  className?: string;
}

export const HasilBadge: React.FC<HasilBadgeProps> = ({
  kategori,
  prioritas,
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  const meta = TRIAGE_METADATA[kategori] || TRIAGE_METADATA.hijau;
  const pVal = prioritas ?? meta.prioritas;

  const getIcon = () => {
    switch (kategori) {
      case 'merah':
        return <AlertTriangle className={size === 'hero' ? 'w-10 h-10 animate-bounce' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />;
      case 'kuning':
        return <Clock className={size === 'hero' ? 'w-10 h-10' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />;
      case 'hijau':
        return <CheckCircle2 className={size === 'hero' ? 'w-10 h-10' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />;
      case 'hitam':
        return <XCircle className={size === 'hero' ? 'w-10 h-10' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />;
    }
  };

  const getStyleClasses = () => {
    switch (kategori) {
      case 'merah':
        return {
          pill: 'bg-red-500 text-white shadow-red-200',
          heroBg: 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl shadow-red-500/20 border-red-400/40',
          badgeText: 'text-red-700 bg-red-50 border-red-200',
          glow: 'triage-glow-merah',
          border: 'border-red-500',
        };
      case 'kuning':
        return {
          pill: 'bg-amber-500 text-white shadow-amber-200',
          heroBg: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-xl shadow-amber-500/20 border-amber-300/40',
          badgeText: 'text-amber-800 bg-amber-50 border-amber-200',
          glow: 'triage-glow-kuning',
          border: 'border-amber-500',
        };
      case 'hijau':
        return {
          pill: 'bg-emerald-600 text-white shadow-emerald-200',
          heroBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20 border-emerald-400/40',
          badgeText: 'text-emerald-800 bg-emerald-50 border-emerald-200',
          glow: 'triage-glow-hijau',
          border: 'border-emerald-500',
        };
      case 'hitam':
        return {
          pill: 'bg-slate-900 text-white shadow-slate-200',
          heroBg: 'bg-gradient-to-br from-slate-800 to-gray-900 text-white shadow-xl shadow-slate-900/30 border-slate-700',
          badgeText: 'text-slate-900 bg-slate-100 border-slate-300',
          glow: 'triage-glow-hitam',
          border: 'border-slate-800',
        };
    }
  };

  const style = getStyleClasses();

  if (size === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 ${style.heroBg} border ${className}`}>
        {/* Ambient pulse circle */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-white/20 border border-white/30 backdrop-blur-sm">
                  Prioritas {pVal}
                </span>
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold">TC-START TRIAGE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                {meta.label}
              </h2>
            </div>
          </div>
        </div>

        {showDescription && (
          <div className="mt-4 pt-4 border-t border-white/15 text-sm sm:text-base text-white/90 leading-relaxed">
            <p className="font-semibold">{meta.kriteriaKunci}</p>
          </div>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl font-bold border ${style.badgeText} ${className}`}>
        <span className={`w-3.5 h-3.5 rounded-full ${style.pill}`} />
        <span className="text-sm uppercase tracking-wider font-extrabold">P{pVal}</span>
        <span className="text-base">{meta.label}</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badgeText} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${style.pill}`} />
        <span>P{pVal} — {kategori.toUpperCase()}</span>
      </span>
    );
  }

  // Default 'md'
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${style.badgeText} ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${style.pill}`} />
      <span>Prioritas {pVal}</span>
      <span className="font-semibold">| {meta.label}</span>
    </div>
  );
};
