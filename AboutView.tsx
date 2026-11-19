import React, { useEffect, useState } from 'react';
import { Download, Lock, PhoneCall, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import type { Language } from '../types';
import { ShieldLogo } from './ShieldLogo';

interface AboutViewProps {
  language: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const a = t.about;
  const [exportAvailable, setExportAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { exportAvailable?: boolean } | null) => {
        if (active && data?.exportAvailable) {
          setExportAvailable(true);
        }
      })
      .catch(() => {
        // Static hosting (e.g. GitHub Pages)
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-[#0B172B] border border-cyan-500/15 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShieldLogo size={52} className="shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
                {a.title}
              </h1>
              <p className="mt-1 text-sm text-cyan-300">{a.subtitle}</p>
            </div>
          </div>

          {exportAvailable && (
            <a
              href="/api/export-zip"
              download="ai-cyber-guardian-github-pages.zip"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download GitHub Pages ZIP</span>
            </a>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <h2 className="text-base sm:text-lg font-semibold text-slate-100">
            {a.missionTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {a.missionBody}
          </p>
        </div>
      </section>

      {/* Hybrid Architecture */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {a.howItWorksPoints.map((point, idx) => (
          <div
            key={idx}
            className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5"
          >
            <div className="text-xs font-mono text-cyan-300 tabular-nums">
              0{idx + 1}.
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-100">
              {point.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {point.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Privacy & Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 text-cyan-300 mb-4">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">
              {a.privacyTitle}
            </h2>
          </div>
          <ul className="space-y-3">
            {a.privacyPoints.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 text-cyan-300 mb-2">
            <PhoneCall className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">
              {a.helplinesTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            {a.helplinesSubtitle}
          </p>
          <div className="space-y-3">
            {a.helplines.map((line, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#071122] border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100">
                    {line.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {line.scope}
                  </div>
                </div>
                <a
                  href={`tel:${line.number}`}
                  dir="ltr"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 font-mono text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors"
                >
                  {line.number}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
