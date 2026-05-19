import OpenAI from 'openai';
import { z } from 'zod';
import type { IBrief } from '../models/Brief.js';
import type { Plan } from '../models/User.js';
import type { ProposalContent } from '../types/index.js';

export interface GenerateOptions {
  plan?: Plan;
}
import { applyTimelineRules, buildTimelineFromBrief } from './timelineBuilder.js';

const proposalSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  scope: z.array(
    z.object({
      phase: z.string(),
      items: z.array(z.string()),
    })
  ),
  timeline: z.array(
    z.object({
      week: z.string(),
      milestone: z.string(),
    })
  ),
  deliverables: z.array(z.string()),
  pricing: z.object({
    recommendedTotal: z.number(),
    currency: z.string(),
    breakdown: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
      })
    ),
    paymentTerms: z.string(),
  }),
  assumptions: z.array(z.string()),
  nextSteps: z.array(z.string()),
  validUntil: z.string(),
});

const SYSTEM_PROMPT = `You are a senior freelance proposal writer. Generate professional, client-ready proposals.
Return ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "title": "string",
  "executiveSummary": "2-3 sentences",
  "scope": [{ "phase": "string", "items": ["string"] }],
  "timeline": [{ "week": "string", "milestone": "string" }],
  "deliverables": ["string"],
  "pricing": {
    "recommendedTotal": number,
    "currency": "USD",
    "breakdown": [{ "label": "string", "amount": number }],
    "paymentTerms": "string"
  },
  "assumptions": ["string"],
  "nextSteps": ["string"],
  "validUntil": "30 days from issue date"
}
Align pricing with the stated budget range. Be specific and professional.

TIMELINE RULES (critical):
- The client's "Timeline" field is the TOTAL project length (e.g. "7 weeks") — do NOT paste that string as a milestone.
- Each timeline row has:
  - "week": the period label only (e.g. "Week 1", "Weeks 2–5", "Week 7") — use "Week" or "Weeks", not "Final" alone.
  - "milestone": what happens in that period (actions/deliverables), e.g. "Discovery & wireframes".
- Spread work across the full duration. For a 7-week project use ~3 rows, e.g. Week 1 / Weeks 2–6 / Week 7.
- Never put only a duration (e.g. "7 weeks") in "milestone".`;

const PRO_SYSTEM_EXTRA = `

PRO QUALITY (apply fully):
- Write a richer executive summary (4–5 sentences) with outcomes and ROI framing.
- Include at least 4 scope phases with 3–4 concrete items each.
- Pricing breakdown must have at least 4 line items that sum to recommendedTotal.
- Add 4–5 assumptions and 4–5 next steps.
- Tone: premium agency — confident, specific, no filler.`;

function getSystemPrompt(plan?: Plan): string {
  return plan === 'pro' ? `${SYSTEM_PROMPT}${PRO_SYSTEM_EXTRA}` : SYSTEM_PROMPT;
}

function buildUserPrompt(brief: IBrief, plan?: Plan): string {
  return `Create a proposal from this client brief:

Client: ${brief.clientName}
Project: ${brief.projectTitle}
Industry: ${brief.industry}
Project Type: ${brief.projectType}
Budget Range: ${brief.budgetRange}
Timeline: ${brief.timeline}
Deliverables requested: ${brief.deliverables}
Goals: ${brief.goals}
Constraints: ${brief.constraints || 'None'}
Client Website: ${brief.clientWebsite || 'Not provided'}
Additional Notes: ${brief.additionalNotes || 'None'}${
    plan === 'pro'
      ? '\n\nDeliver a premium, client-winning proposal with detailed scope and professional payment terms.'
      : ''
  }`;
}

function parseProposalJson(raw: string): ProposalContent {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const err = new Error('Invalid JSON from AI') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const result = proposalSchema.safeParse(parsed);
  if (!result.success) {
    const err = new Error('AI response did not match expected schema') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  return result.data;
}

/** 100% free — no API key. Good for testing UI. */
function generateMockProposal(brief: IBrief): ProposalContent {
  const total =
    brief.budgetRange.includes('15,000') ? 12000 : brief.budgetRange.includes('5,000') ? 3500 : 800;

  return {
    title: `${brief.projectTitle} — Proposal for ${brief.clientName}`,
    executiveSummary: `This proposal outlines how we will deliver ${brief.projectType} for ${brief.clientName}, focused on: ${brief.goals.slice(0, 120)}...`,
    scope: [
      {
        phase: 'Discovery',
        items: ['Kickoff call', 'Requirements review', 'Project plan'],
      },
      {
        phase: 'Execution',
        items: brief.deliverables.split('\n').filter(Boolean).slice(0, 4) || [
          'Core deliverables per brief',
        ],
      },
      {
        phase: 'Delivery',
        items: ['Final handoff', 'Revision round', 'Documentation'],
      },
    ],
    timeline: buildTimelineFromBrief(brief),
    deliverables: brief.deliverables
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6) || ['Project deliverables as specified in brief'],
    pricing: {
      recommendedTotal: total,
      currency: 'USD',
      breakdown: [
        { label: 'Discovery & planning', amount: Math.round(total * 0.25) },
        { label: 'Design & development', amount: Math.round(total * 0.55) },
        { label: 'QA & launch', amount: Math.round(total * 0.2) },
      ],
      paymentTerms: '50% upfront, 50% on delivery',
    },
    assumptions: [
      'Client provides feedback within 3 business days',
      brief.constraints || 'Standard revision policy applies',
    ],
    nextSteps: ['Approve proposal', 'Sign agreement', 'Schedule kickoff'],
    validUntil: '30 days from issue date',
  };
}

/** Free: https://aistudio.google.com/apikey (no credit card required) */
async function generateWithGemini(brief: IBrief, options?: GenerateOptions): Promise<ProposalContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey'
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }

  const isPro = options?.plan === 'pro';
  const model = isPro
    ? process.env.GEMINI_PRO_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    : process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${getSystemPrompt(options?.plan)}\n\n${buildUserPrompt(brief, options?.plan)}` }],
        },
      ],
      generationConfig: {
        temperature: isPro ? 0.35 : 0.4,
        maxOutputTokens: isPro ? 8192 : 4096,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Gemini API error: ${body.slice(0, 200)}`) as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    const err = new Error('Empty response from Gemini') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const content = parseProposalJson(raw);
  return applyTimelineRules(content, brief);
}

/** Free: https://console.groq.com/keys (no credit card for free tier) */
async function generateWithGroq(brief: IBrief, options?: GenerateOptions): Promise<ProposalContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys'
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const isPro = options?.plan === 'pro';
  const model = isPro
    ? process.env.GROQ_PRO_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    : process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const completion = await client.chat.completions.create({
    model,
    temperature: isPro ? 0.35 : 0.4,
    max_tokens: isPro ? 4000 : 2500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: getSystemPrompt(options?.plan) },
      { role: 'user', content: buildUserPrompt(brief, options?.plan) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    const err = new Error('Empty response from Groq') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const content = parseProposalJson(raw);
  return applyTimelineRules(content, brief);
}

function resolveProvider(): 'mock' | 'gemini' | 'groq' {
  const configured = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  if (configured === 'mock') return 'mock';
  if (configured === 'groq') return 'groq';
  if (configured === 'gemini') return 'gemini';

  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return 'mock';
}

export async function generateProposalContent(
  brief: IBrief,
  options?: GenerateOptions
): Promise<ProposalContent> {
  const provider = resolveProvider();

  try {
    switch (provider) {
      case 'mock':
        return generateMockProposal(brief);
      case 'groq':
        return generateWithGroq(brief, options);
      case 'gemini':
      default:
        return await generateWithGemini(brief, options);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const isQuota =
      message.includes('429') ||
      message.includes('quota') ||
      message.includes('RESOURCE_EXHAUSTED');

    if (provider === 'gemini' && isQuota) {
      console.warn('Gemini quota exceeded — using free template proposal instead.');
      return generateMockProposal(brief);
    }
    throw err;
  }
}
