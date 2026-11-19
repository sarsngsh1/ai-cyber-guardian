/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Info,
  LayoutDashboard,
  Link2,
  Lock,
  MessageSquareWarning,
  UserX,
} from 'lucide-react';
import { AboutView } from './components/AboutView';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { DashboardView } from './components/DashboardView';
import { SafetyTipsView } from './components/SafetyTipsView';
import { ShieldLogo } from './components/ShieldLogo';
import { TRANSLATIONS } from './data/translations';
import type {
  ActiveView,
  AnalysisResult,
  Language,
  SessionScanItem,
  ToolType,
} from './types';

const LANGUAGE_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
  { code: 'sd', label: 'سنڌي', short: 'سنڌي' },
];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [scans, setScans] = useState<SessionScanItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'sd';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  function handleNavigate(view: ActiveView) {
    setSelectedResult(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleResultRecorded(preview: string, result: AnalysisResult) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: SessionScanItem = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      tool: result.tool,
      preview,
      riskLevel: result.riskLevel,
      engine: result.engine,
      timestamp,
      result,
    };

    setScans((prev) => [newItem, ...prev].slice(0, 12));
  }

  function handleOpenScan(item: SessionScanItem) {
    setSelectedResult(item.result);
    setActiveView(item.tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearSession() {
    setScans([]);
    setSelectedResult(null);
  }

  const navItems: {
    id: ActiveView;
    Icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'dashboard', Icon: LayoutDashboard },
    { id: 'scam', Icon: MessageSquareWarning },
    { id: 'link', Icon: Link2 },
    { id: 'cyberbullying', Icon: UserX },
    { id: 'tips', Icon: BookOpen },
    { id: 'about', Icon: Info },
  ];

  const mobileTabs = navItems.slice(0, 5);

  const isToolView = (v: ActiveView): v is ToolType =>
    v === 'scam' || v === 'link' || v === 'cyberbullying';

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#081224] border-e border-slate-800/90 sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <ShieldLogo size={36} className="shrink-0" />
          <div className="min-w-0">
            <div className="text-base font-bold text-slate-50 tracking-tight truncate">
              {t.brandName}
            </div>
            <div className="text-xs text-cyan-300/90 truncate">
              {t.brandSubtitle}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map(({ id, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{t.nav[id]}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Language Switcher & Privacy Note */}
        <div className="p-4 border-t border-slate-800/80 space-y-4">
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2">
              {t.languageLabel}
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#060D1A] border border-slate-800">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code)}
                    className={`min-h-[36px] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>{t.privacyBadge}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Compact Top App Bar (<= 48px) */}
        <header className="lg:hidden sticky top-0 z-30 h-12 px-3 bg-[#081224]/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-2 min-w-0 cursor-pointer"
          >
            <ShieldLogo size={26} className="shrink-0" />
            <span className="text-sm font-bold text-slate-50 truncate">
              {t.brandName}
            </span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center p-0.5 rounded-lg bg-[#060D1A] border border-slate-800"
              role="group"
              aria-label={t.languageLabel}
            >
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code)}
                    className={`min-h-[32px] px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {opt.short}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('about')}
              aria-label={t.nav.about}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                activeView === 'about'
                  ? 'text-cyan-300'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Context Top Bar */}
        <header className="hidden lg:flex h-16 px-8 border-b border-slate-800/80 bg-[#071020]/90 items-center justify-between gap-8">
          <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">{t.brandName}</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="text-slate-100 font-semibold">{t.nav[activeView]}</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t.privacyBanner}</span>
            </div>
            {activeView !== 'scam' && (
              <button
                type="button"
                onClick={() => handleNavigate('scam')}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.dashboard.primaryCta}
              </button>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-20 lg:pb-10">
          {activeView === 'dashboard' && (
            <DashboardView
              language={language}
              scans={scans}
              onNavigate={handleNavigate}
              onOpenScan={handleOpenScan}
              onClearSession={handleClearSession}
            />
          )}

          {isToolView(activeView) && (
            <AnalysisWorkspace
              tool={activeView}
              language={language}
              initialResult={
                selectedResult && selectedResult.tool === activeView
                  ? selectedResult
                  : null
              }
              onResultRecorded={handleResultRecorded}
            />
          )}

          {activeView === 'tips' && <SafetyTipsView language={language} />}

          {activeView === 'about' && <AboutView language={language} />}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar (56px height) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#081224]/95 backdrop-blur-md border-t border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {mobileTabs.map(({ id, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors cursor-pointer ${
                  active ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[11px] font-medium tracking-tight truncate max-w-full">
                  {t.navShort[id]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
