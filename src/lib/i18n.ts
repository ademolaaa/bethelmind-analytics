export type Locale = "en" | "fr" | "yo" | "ha";

const STORAGE_KEY = "bm_locale";

const strings: Record<Locale, Record<string, string>> = {
  en: {
    chip: "Click-to-WhatsApp",
    title: "Chat on WhatsApp in under 30 seconds",
    subtitle: "Pick what you need, then continue to WhatsApp. We’ll respond with next steps and a clear quote range.",
    step_service: "1) What do you need?",
    step_timeline: "2) Timeline",
    step_budget: "3) Budget range",
    cta_continue: "Chat on WhatsApp",
    cta_prefer_call: "Prefer a free strategy call?",
    next_title: "What happens next",
    next_1: "We confirm scope and suggest the best package for your budget.",
    next_2: "If you’re a fit, we send a booking link (optional) and a clear quote range.",
    next_3: "You get fast delivery timelines and simple milestones.",
    no_whatsapp: "No WhatsApp?",
    alt_contact: "Use email or phone instead",
  },
  fr: {
    chip: "Cliquez vers WhatsApp",
    title: "Démarrez sur WhatsApp en moins de 30 secondes",
    subtitle: "Choisissez votre besoin, puis continuez sur WhatsApp. Nous répondrons avec les prochaines étapes et une fourchette claire.",
    step_service: "1) De quoi avez-vous besoin ?",
    step_timeline: "2) Délai",
    step_budget: "3) Budget",
    cta_continue: "Continuer sur WhatsApp",
    cta_prefer_call: "Préférez réserver un appel ?",
    next_title: "Et ensuite",
    next_1: "Nous confirmons le périmètre et proposons la meilleure offre selon votre budget.",
    next_2: "Si c’est un bon fit, nous envoyons un lien de réservation (optionnel) et une fourchette claire.",
    next_3: "Vous obtenez des délais rapides et des jalons simples.",
    no_whatsapp: "Pas WhatsApp ?",
    alt_contact: "Utiliser e-mail ou téléphone",
  },
  yo: {
    chip: "Tẹ̀ sí WhatsApp",
    title: "Bẹrẹ lórí WhatsApp nínú ìṣẹ́jú-aaya 30",
    subtitle: "Yan ohun tí o fẹ́, kí o sì tẹ̀sí WhatsApp. A ó dáhùn pẹ̀lú igbesẹ tó kàn àti ààlà owó tó ye.",
    step_service: "1) Kí ni o nílò?",
    step_timeline: "2) Àkókò",
    step_budget: "3) Ààlà owó",
    cta_continue: "Tẹ̀sí WhatsApp",
    cta_prefer_call: "Ṣé o fẹ́ ìpè dipo?",
    next_title: "Kí ló máa ṣẹlẹ̀ lẹ́yìn náà",
    next_1: "A ó ṣàyẹ̀wò iṣẹ́ tó yẹ kí a sì yàn package tó bá owó rẹ mu.",
    next_2: "Tí ó bá yẹ, a ó rán link ìpè àti ààlà owó kedere.",
    next_3: "O máa rí timeline tó yarayara àti milestones tó rọrùn.",
    no_whatsapp: "Kò sí WhatsApp?",
    alt_contact: "Lo email tàbí fóònù",
  },
  ha: {
    chip: "Danna zuwa WhatsApp",
    title: "Fara a WhatsApp cikin sakan 30",
    subtitle: "Zaɓi abin da kake so, sannan ka ci gaba zuwa WhatsApp. Za mu amsa da matakai na gaba da farashi a bayyane.",
    step_service: "1) Me kake bukata?",
    step_timeline: "2) Lokaci",
    step_budget: "3) Kasafin kudi",
    cta_continue: "Ci gaba a WhatsApp",
    cta_prefer_call: "Kana so ka yi booking call?",
    next_title: "Me zai biyo baya",
    next_1: "Za mu tabbatar da scope mu ba da shawarar package mafi dacewa.",
    next_2: "Idan ya dace, za mu aiko da booking link da farashi a bayyane.",
    next_3: "Za ka samu timelines masu sauri da milestones masu sauki.",
    no_whatsapp: "Ba ka da WhatsApp?",
    alt_contact: "Yi amfani da email ko waya",
  },
};

export function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
}

export function getLocaleFromSearch(search: string): Locale | null {
  const sp = new URLSearchParams(search);
  const lang = sp.get("lang");
  if (!lang) return null;
  const normalized = lang.toLowerCase();
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "yo") return "yo";
  if (normalized === "ha") return "ha";
  return null;
}

export function getPreferredLocale(search?: string): Locale {
  if (search) {
    const fromSearch = getLocaleFromSearch(search);
    if (fromSearch) {
      setLocale(fromSearch);
      return fromSearch;
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in strings) return stored;

  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  if (nav.startsWith("fr")) return "fr";
  return "en";
}

export function t(locale: Locale, key: string) {
  return strings[locale][key] ?? strings.en[key] ?? key;
}
