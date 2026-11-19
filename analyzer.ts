import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AnalysisResult,
  Language,
  RiskLevel,
  ToolType,
} from '../src/types.ts';
import {
  detectSensitiveDataPattern,
  inspectUrlStructure,
  runRuleBasedAnalysis,
} from './fallbackEngine.ts';

function getLanguageName(language: Language): string {
  if (language === 'ur') return 'Urdu (اردو script)';
  if (language === 'sd') return 'Sindhi (سنڌي Arabic-Sindhi script)';
  return 'English';
}

function getToolContext(tool: ToolType): string {
  if (tool === 'link') {
    return 'Suspicious Website Link Checker: Analyze the submitted URL/domain for phishing, brand impersonation (HEC, BISP, Sindh scholarships, Easypaisa, JazzCash, banks, universities), HTTP vs HTTPS, deceptive subdomains, risky TLDs, URL shorteners, and credential harvesting.';
  }
  if (tool === 'cyberbullying') {
    return 'Cyberbullying Detector: Analyze the submitted message/comment for online harassment, intimidation, blackmail/extortion, doxxing, derogatory insults, threats of leaking private photos/videos, or self-harm encouragement targeting students.';
  }
  return 'AI Scam Message Detector: Analyze the submitted SMS, WhatsApp, or social media message for scams targeting students in Sindh, Pakistan (fake scholarships, BISP/Ehsaas grants, Easypaisa/JazzCash PIN scams, OTP theft, fake university fee alerts, lottery prizes, advance-fee fraud).';
}

function normalizeRiskLevel(val: string | undefined): RiskLevel {
  const clean = (val || '').trim().toLowerCase();
  if (clean === 'high') return 'High';
  if (clean === 'medium') return 'Medium';
  return 'Low';
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.length > 10);
}

export async function analyzeContent(
  tool: ToolType,
  input: string,
  language: Language,
): Promise<AnalysisResult> {
  const trimmed = input.trim();
  const containsSensitivePattern = detectSensitiveDataPattern(trimmed);
  const urlInspection =
    tool === 'link' || /https?:\/\/[^\s]+/i.test(trimmed)
      ? inspectUrlStructure(trimmed)
      : null;

  if (!isGeminiConfigured()) {
    const notice =
      language === 'ur'
        ? 'AI سروس دستیاب نہیں — آف لائن اصول پر مبنی حفاظتی انجن استعمال کیا گیا۔'
        : language === 'sd'
          ? 'AI سروس دستياب ناهي — رول بيسڊ حفاظتي انجڻ استعمال ڪئي وئي.'
          : 'Gemini AI key not active — analyzed locally with Rule-Based Protection Engine.';
    return runRuleBasedAnalysis(tool, trimmed, language, notice);
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const targetLang = getLanguageName(language);
  const toolContext = getToolContext(tool);

  const structuralHint =
    urlInspection?.valid && urlInspection.details
      ? `\nDeterministic URL Structure Signals:\n- Hostname: ${urlInspection.details.hostname}\n- Protocol: ${urlInspection.details.protocol} (HTTPS: ${urlInspection.details.isHttps})\n- TLD: ${urlInspection.details.tld} (Suspicious TLD: ${urlInspection.details.hasSuspiciousTld})\n- Official .edu.pk/.gov.pk: ${urlInspection.details.isOfficialPkDomain}\n- Shortener: ${urlInspection.details.isShortener}\n- IP Host: ${urlInspection.details.hasIpHost}\n- Flagged Keywords: ${urlInspection.details.flaggedKeywords.join(', ') || 'None'}\n`
      : '';

  const systemInstruction = `You are AI Cyber Guardian, part of the Sindh Student Protection System in Pakistan.
Your job is to protect school, college, and university students in Sindh from scams, phishing links, and cyberbullying.
Task: ${toolContext}
Strict rules:
1. Write "summary", every item in "reasons", and every item in "recommendations" strictly in ${targetLang}.
2. Keep explanations clear, respectful, practical, and easy for a student to read on an Android phone.
3. "riskLevel" MUST be exactly one of: "Low", "Medium", or "High".
4. Provide 2 to 4 concise, specific "reasons" explaining why the input is safe or suspicious.
5. Provide 2 to 4 actionable "recommendations" tailored to students in Sindh (mention official .edu.pk / .gov.pk verification, never sharing OTPs/MPINs/passwords, and when Medium/High risk mention FIA Cyber Crime Helpline 1991 or DRF Cyber Harassment Helpline 0800-39393 where relevant).
6. Never ask the user for passwords, PINs, OTPs, CNIC numbers, or personal data.`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini request timeout')), 14000);
    });

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze the following student submission:\n"""\n${trimmed}\n"""${structuralHint}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Exactly one of: Low, Medium, High',
              },
              summary: {
                type: Type.STRING,
                description: 'A single crisp sentence summarizing the verdict.',
              },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Why it is suspicious or safe (2-4 concise points).',
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable safety recommendations for students (2-4 points).',
              },
            },
            required: ['riskLevel', 'summary', 'reasons', 'recommendations'],
          },
        },
      }),
      timeoutPromise,
    ]);

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(rawText) as {
      riskLevel?: string;
      summary?: string;
      reasons?: string[];
      recommendations?: string[];
    };

    const riskLevel = normalizeRiskLevel(parsed.riskLevel);
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.filter((r) => typeof r === 'string' && r.trim().length > 0).slice(0, 5)
      : [];
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((r) => typeof r === 'string' && r.trim().length > 0).slice(0, 5)
      : [];

    if (!parsed.summary || reasons.length === 0 || recommendations.length === 0) {
      throw new Error('Incomplete structured output from Gemini');
    }

    return {
      tool,
      language,
      riskLevel,
      summary: parsed.summary.trim(),
      reasons,
      recommendations,
      engine: 'gemini',
      containsSensitivePattern,
      urlDetails: urlInspection?.valid ? urlInspection.details : undefined,
      analyzedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(
      'Gemini AI fallback activated:',
      err instanceof Error ? err.message : 'Unknown error',
    );
    const notice =
      language === 'ur'
        ? 'AI عارضی طور پر دستیاب نہیں — اصول پر مبنی حفاظتی انجن نے فوری تجزیہ فراہم کیا۔'
        : language === 'sd'
          ? 'AI عارضي طور دستياب ناهي — رول بيسڊ حفاظتي انجڻ ذريعي فوري تجزيو فراهم ڪيو ويو.'
          : 'AI service temporarily unavailable — Rule-Based Protection Engine provided instant analysis.';
    return runRuleBasedAnalysis(tool, trimmed, language, notice);
  }
}
