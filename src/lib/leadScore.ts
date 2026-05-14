import { hasAnalyticsConsent } from "@/lib/consent";

export type LeadStage = "cold" | "warm" | "hot";

export type Touchpoint =
  | "view_home"
  | "view_pricing"
  | "view_solution"
  | "view_whatsapp_landing"
  | "lead_magnet_submit"
  | "booking_start"
  | "whatsapp_click"
  | "contact_submit";

type ScoreState = {
  score: number;
  stage: LeadStage;
  updatedAt: number;
  touches: Partial<Record<Touchpoint, number>>;
};

const SCORE_KEY = "bm_lead_score";

function getStorage() {
  return hasAnalyticsConsent() ? localStorage : sessionStorage;
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getWeight(tp: Touchpoint) {
  switch (tp) {
    case "view_home":
      return 1;
    case "view_solution":
      return 3;
    case "view_pricing":
      return 4;
    case "view_whatsapp_landing":
      return 5;
    case "lead_magnet_submit":
      return 6;
    case "booking_start":
      return 7;
    case "contact_submit":
      return 7;
    case "whatsapp_click":
      return 10;
    default:
      return 1;
  }
}

function stageFromScore(score: number): LeadStage {
  if (score >= 18) return "hot";
  if (score >= 8) return "warm";
  return "cold";
}

export function getLeadScore(): ScoreState {
  const storage = getStorage();
  const existing = safeJsonParse<ScoreState>(storage.getItem(SCORE_KEY));
  if (existing) return existing;
  const initial: ScoreState = { score: 0, stage: "cold", updatedAt: Date.now(), touches: {} };
  storage.setItem(SCORE_KEY, JSON.stringify(initial));
  return initial;
}

export function recordTouchpoint(tp: Touchpoint) {
  const storage = getStorage();
  const state = getLeadScore();
  const touches = { ...state.touches, [tp]: (state.touches[tp] ?? 0) + 1 };
  const score = state.score + getWeight(tp);
  const next: ScoreState = { score, stage: stageFromScore(score), updatedAt: Date.now(), touches };
  storage.setItem(SCORE_KEY, JSON.stringify(next));
  return next;
}

