import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Eraser,
  Globe,
  Link2,
  Lock,
  MessageSquareWarning,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import { SAMPLE_MESSAGES } from '../data/samplesAndTips';
import { TRANSLATIONS } from '../data/translations';
import type { AnalysisResult, Language, ToolType } from '../types';
import { runRuleBasedAnalysis } from '../utils/ruleEngine';

interface AnalysisWorkspaceProps {
  tool: ToolType;
  language: Language;
  initialResult?: AnalysisResult | null;
  onResultRecorded: (inputPreview: string, result: AnalysisResult) => void;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  tool,
  language,
  initialResult = null,
  onResultRecorded,
}) => {
  const t = TRANSLATIONS[language];
  const toolCopy = t.tools[tool];
  const samples = SAMPLE_MESSAGES[tool];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setResult(initialResult);
    setError(null);
    setCopied(false);
  }, [tool, initialResult]);

  const ToolIcon =
    tool === 'link'
      ? Link2
      : tool === 'cyberbullying'
        ? UserX
        : MessageSquareWarning;

  async function executeAnalysis(textToAnalyze: string) {
    const trimmed = textToAnalyze.trim();
    if (!trimmed) {
      setError(t.analyzer.errorEmpty);
      return;
    }

    if (trimmed.length < 3) {
      setError(t.analyzer.errorEmpty);
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    const preview =
      trimmed.length > 72 ? `${trimmed.slice(0, 72)}...` : trimmed;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          input: trimmed,
          language,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('STATIC_HOST_FALLBACK');
      }

      const data = (await response.json()) as AnalysisResult & { error?: string };

      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setError(data.error);
          return;
        }
        throw new Error('STATIC_HOST_FALLBACK');
      }

      setResult(data);
      onResultRecorded(preview, data);
    } catch {
      const offlineNotice =
        language === 'ur'
          ? 'آف لائن اصول پر مبنی حفاظتی انجن نے فوری تجزیہ فراہم کیا۔'
          : language === 'sd'
            ? 'آف لائين رول بيسڊ حفاظتي انجڻ ذريعي فوري تجزيو فراهم ڪيو ويو.'
            : 'Analyzed locally in your browser using the Rule-Based Protection Engine.';
      const localResult = runRuleBasedAnalysis(
        tool,
        trimmed,
        language,
        offlineNotice,
      );
      setResult(localResult);
      onResultRecorded(preview, localResult);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void executeAnalysis(input);
  }

  function handleSampleSelect(sampleText: string) {
    setInput(sampleText);
    void executeAnalysis(sampleText);
  }

  function handleClear() {
    setInput('');
    setResult(null);
    setError(null);
    setCopied(false);
  }

  async function handleCopyAdvice() {
    if (!result) return;
    const text = [
      `${t.analyzer.riskLabel}: ${t.analyzer.riskLevels[result.riskLevel]}`,
      result.summary,
      '',
      `${t.analyzer.whySuspicious}:`,
      ...result.reasons.map((r) => `- ${r}`),
      '',
      `${t.analyzer.recommendations}:`,
      ...result.recommendations.map((r) => `- ${r}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const riskStyles =
    result?.riskLevel === 'High'
      ? {
          container: 'bg-rose-950/45 border-rose-500/40',
          badgeText: 'text-rose-300',
          iconColor: 'text-rose-400',
          Icon: ShieldAlert,
        }
      : result?.riskLevel === 'Medium'
        ? {
            container: 'bg-amber-950/45 border-amber-500/40',
            badgeText: 'text-amber-300',
            iconColor: 'text-amber-400',
            Icon: AlertTriangle,
          }
        : {
            container: 'bg-emerald-950/45 border-emerald-500/40',
            badgeText: 'text-emerald-300',
            iconColor: 'text-emerald-400',
            Icon: ShieldCheck,
          };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-[#0B172B] border border-cyan-500/15 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center shrink-0 text-cyan-300">
            <ToolIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight text-balance">
              {toolCopy.title}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {toolCopy.subtitle}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor={`input-${tool}`}
                className="text-sm font-medium text-slate-200"
              >
                {toolCopy.inputLabel}
              </label>
              <span className="text-xs text-slate-400 tabular-nums">
                {input.length} / 4000
              </span>
            </div>

            {tool === 'link' ? (
              <input
                id={`input-${tool}`}
                type="text"
                dir="ltr"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={toolCopy.placeholder}
                maxLength={4000}
                className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-[#060D1A] border border-slate-700/80 text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-colors"
              />
            ) : (
              <textarea
                id={`input-${tool}`}
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={toolCopy.placeholder}
                maxLength={4000}
                className="w-full min-h-[124px] px-4 py-3 rounded-xl bg-[#060D1A] border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-colors resize-y"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-60 text-slate-950 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{loading ? toolCopy.analyzingBtn : toolCopy.analyzeBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading && !input}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Eraser className="w-4 h-4 shrink-0" />
              <span>{t.analyzer.clearBtn}</span>
            </button>

            <div className="w-full sm:w-auto sm:ms-auto flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t.neverAskOtp}</span>
            </div>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Sample Test Messages */}
      <div className="bg-[#0B172B] border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
          <h2 className="text-sm font-semibold text-slate-100">
            {t.analyzer.sampleTitle}
          </h2>
          <p className="text-xs text-slate-400">{t.analyzer.pasteHint}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleSelect(sample.content[language])}
              disabled={loading}
              className="min-h-[48px] text-start p-3.5 rounded-xl bg-[#071122] hover:bg-[#0F203B] border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer group"
            >
              <span className="block text-sm font-medium text-cyan-300 group-hover:text-cyan-200">
                {sample.label[language]}
              </span>
              <span className="mt-1 block text-xs text-slate-400 line-clamp-2">
                {sample.content[language]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div
          aria-live="polite"
          className="bg-[#0B172B] border border-cyan-500/20 rounded-2xl p-6 space-y-4"
        >
          <div className="h-6 w-48 rounded-lg bg-slate-800 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-800/80 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-slate-800/80 animate-pulse" />
        </div>
      )}

      {/* Analysis Result Card */}
      {!loading && result && (
        <section
          aria-live="polite"
          className="bg-[#0B172B] border border-slate-800 rounded-2xl overflow-hidden"
        >
          {/* Risk Verdict Header */}
          <div className={`p-5 sm:p-6 border-b border-slate-800 ${riskStyles.container}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <riskStyles.Icon className={`w-7 h-7 shrink-0 ${riskStyles.iconColor}`} />
                <div>
                  <div className="text-xs text-slate-300">
                    {t.analyzer.riskLabel}
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold ${riskStyles.badgeText}`}>
                    {t.analyzer.riskLevels[result.riskLevel]}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span>
                  {result.engine === 'gemini'
                    ? t.analyzer.engineGemini
                    : t.analyzer.engineFallback}
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={handleCopyAdvice}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-700 text-slate-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.analyzer.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.analyzer.copyAdvice}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              {result.summary}
            </p>

            {result.fallbackNotice && (
              <p className="mt-2 text-xs text-slate-300/90">
                {result.fallbackNotice}
              </p>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Sensitive OTP / Password Warning */}
            {result.containsSensitivePattern && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/35 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">
                    {t.analyzer.sensitiveWarningTitle}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {t.analyzer.sensitiveWarningDesc}
                  </p>
                </div>
              </div>
            )}

            {/* URL Structure Breakdown */}
            {result.urlDetails && (
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t.analyzer.urlDetailsTitle}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#071122] border border-slate-800">
                  <div>
                    <div className="text-xs text-slate-400">{t.analyzer.urlProtocol}</div>
                    <div
                      dir="ltr"
                      className={`mt-1 text-sm font-mono font-semibold ${
                        result.urlDetails.isHttps ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {result.urlDetails.protocol}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">{t.analyzer.urlHost}</div>
                    <div
                      dir="ltr"
                      className="mt-1 text-sm font-mono text-slate-100 truncate"
                      title={result.urlDetails.hostname}
                    >
                      {result.urlDetails.hostname}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t.analyzer.urlTld}</div>
                    <div dir="ltr" className="mt-1 text-sm font-mono text-slate-100">
                      {result.urlDetails.tld}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t.analyzer.urlOfficial}</div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        result.urlDetails.isOfficialPkDomain
                          ? 'text-emerald-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {result.urlDetails.isOfficialPkDomain
                        ? t.analyzer.yes
                        : t.analyzer.no}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Why It Is Suspicious & Safety Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-cyan-300 mb-3">
                  {t.analyzer.whySuspicious}
                </h3>
                <ul className="space-y-2.5">
                  {result.reasons.map((reason, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
                      />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-emerald-300 mb-3">
                  {t.analyzer.recommendations}
                </h3>
                <ul className="space-y-2.5">
                  {result.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed"
                    >
                      <ShieldCheck
                        aria-hidden="true"
                        className="w-4 h-4 text-emerald-400 shrink-0 mt-1"
                      />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
