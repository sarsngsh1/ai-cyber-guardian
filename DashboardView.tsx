import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Link2,
  Lock,
  MessageSquareWarning,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserX,
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import type { ActiveView, Language, SessionScanItem } from '../types';
import { ShieldLogo } from './ShieldLogo';

interface DashboardViewProps {
  language: Language;
  scans: SessionScanItem[];
  onNavigate: (view: ActiveView) => void;
  onOpenScan: (item: SessionScanItem) => void;
  onClearSession: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  scans,
  onNavigate,
  onOpenScan,
  onClearSession,
}) => {
  const t = TRANSLATIONS[language];
  const d = t.dashboard;

  const totalCount = scans.length;
  const highCount = scans.filter((s) => s.riskLevel === 'High').length;
  const mediumCount = scans.filter((s) => s.riskLevel === 'Medium').length;
  const lowCount = scans.filter((s) => s.riskLevel === 'Low').length;

  const toolCards: {
    id: 'scam' | 'link' | 'cyberbullying';
    Icon: React.FC<{ className?: string }>;
    title: string;
    subtitle: string;
  }[] = [
    {
      id: 'scam',
      Icon: MessageSquareWarning,
      title: t.tools.scam.title,
      subtitle: t.tools.scam.subtitle,
    },
    {
      id: 'link',
      Icon: Link2,
      title: t.tools.link.title,
      subtitle: t.tools.link.subtitle,
    },
    {
      id: 'cyberbullying',
      Icon: UserX,
      title: t.tools.cyberbullying.title,
      subtitle: t.tools.cyberbullying.subtitle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1E3A] via-[#0A162B] to-[#071122] border border-cyan-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <ShieldLogo size={44} className="shrink-0" />
              <div className="text-xs sm:text-sm text-cyan-300 font-medium">
                {t.brandSubtitle}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-50 tracking-tight text-balance leading-tight">
              {d.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {d.heroDesc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('scam')}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquareWarning className="w-4 h-4 shrink-0" />
                <span>{d.primaryCta}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('link')}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-100 font-medium text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>{d.secondaryCta}</span>
              </button>
            </div>
          </div>

          {/* Privacy Assurance Box */}
          <div className="lg:max-w-xs w-full p-5 rounded-xl bg-[#071122]/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5 text-cyan-300">
              <Lock className="w-5 h-5 shrink-0" />
              <h2 className="text-sm font-semibold">{d.privacyCardTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {d.privacyCardDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Session Metrics */}
      <section className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">
              {d.sessionTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{d.sessionSubtitle}</p>
          </div>

          {totalCount > 0 && (
            <button
              type="button"
              onClick={onClearSession}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{d.clearSession}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#071122] border border-slate-800/90">
            <div className="text-xs text-slate-400">{d.statTotal}</div>
            <div className="mt-1.5 text-2xl font-bold text-cyan-300 tabular-nums">
              {totalCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#071122] border border-slate-800/90">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{d.statHigh}</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-rose-300 tabular-nums">
              {highCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#071122] border border-slate-800/90">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{d.statMedium}</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-amber-300 tabular-nums">
              {mediumCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#071122] border border-slate-800/90">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{d.statLow}</span>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-emerald-300 tabular-nums">
              {lowCount}
            </div>
          </div>
        </div>
      </section>

      {/* Protection Tools Grid */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-3.5">
          {d.toolsHeading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toolCards.map(({ id, Icon, title, subtitle }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="text-start p-5 rounded-2xl bg-[#0B172B] hover:bg-[#0F203B] border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between gap-4 cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-3.5 text-base font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  {subtitle}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300">
                <span>{d.openTool}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Session Checks */}
      <section className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-3.5">
          {d.recentHeading}
        </h2>

        {scans.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#071122] border border-slate-800/80 text-center space-y-3">
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {d.recentEmpty}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('scam')}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-sm font-medium transition-colors cursor-pointer"
            >
              {d.recentEmptyAction}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {scans.map((item) => {
              const riskColor =
                item.riskLevel === 'High'
                  ? 'text-rose-300'
                  : item.riskLevel === 'Medium'
                    ? 'text-amber-300'
                    : 'text-emerald-300';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenScan(item)}
                  className="w-full min-h-[56px] py-3.5 px-2 hover:bg-slate-800/40 rounded-lg text-start flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{t.nav[item.tool]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.timestamp}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-200 truncate">
                      {item.preview}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold whitespace-nowrap shrink-0 ${riskColor}`}>
                    {t.analyzer.riskLevels[item.riskLevel]}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
