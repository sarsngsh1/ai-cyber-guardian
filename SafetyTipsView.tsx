import React, { useState } from 'react';
import { CheckSquare, ShieldCheck, Square } from 'lucide-react';
import { SAFETY_TIPS } from '../data/samplesAndTips';
import { TRANSLATIONS } from '../data/translations';
import type { Language } from '../types';

interface SafetyTipsViewProps {
  language: Language;
}

type TipFilter = 'all' | 'scam' | 'links' | 'bullying' | 'portals';

export const SafetyTipsView: React.FC<SafetyTipsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [filter, setFilter] = useState<TipFilter>('all');
  const [checkedItems, setCheckedItems] = useState<number[]>([0, 1]);

  const filteredTips =
    filter === 'all'
      ? SAFETY_TIPS
      : SAFETY_TIPS.filter((tip) => tip.category === filter);

  function toggleChecklist(idx: number) {
    setCheckedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  }

  const filterButtons: { key: TipFilter; label: string }[] = [
    { key: 'all', label: t.tips.categories.all },
    { key: 'scam', label: t.tips.categories.scam },
    { key: 'links', label: t.tips.categories.links },
    { key: 'bullying', label: t.tips.categories.bullying },
    { key: 'portals', label: t.tips.categories.portals },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-[#0B172B] border border-cyan-500/15 rounded-2xl p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight text-balance">
          {t.tips.title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-300 leading-relaxed">
          {t.tips.subtitle}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {filterButtons.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'bg-[#071122] text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => (
          <article
            key={tip.id}
            className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="text-xs text-cyan-300 font-medium">
                {t.tips.categories[tip.category]}
              </div>
              <h2 className="mt-1.5 text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                {tip.title[language]}
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {tip.detail[language]}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs sm:text-sm text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{tip.action[language]}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Interactive Student Safety Self-Check */}
      <section className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">
              {t.tips.checklistTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t.tips.checklistSubtitle}
            </p>
          </div>
          <div className="text-sm font-semibold text-cyan-300 tabular-nums">
            {checkedItems.length} / {t.tips.checklistItems.length} {t.tips.checklistScore}
          </div>
        </div>

        <div className="space-y-2.5">
          {t.tips.checklistItems.map((item, idx) => {
            const checked = checkedItems.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleChecklist(idx)}
                className={`w-full min-h-[48px] p-3.5 rounded-xl border text-start flex items-center gap-3 transition-colors cursor-pointer ${
                  checked
                    ? 'bg-emerald-950/30 border-emerald-500/35 text-slate-100'
                    : 'bg-[#071122] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span className="text-sm leading-relaxed">{item}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
