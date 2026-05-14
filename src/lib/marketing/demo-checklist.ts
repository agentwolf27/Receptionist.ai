/**
 * Copy shown on the marketing site so visitors understand this is a demo / preview.
 * Adjust as the product moves toward production.
 */
export const DEMO_SITE_CHECKLIST = [
  {
    title: "Preview software, not a finished product",
    detail:
      "Features, pricing, and UX can change. Treat this as a working prototype you can explore — not a contractual service level.",
  },
  {
    title: "Do not use for real protected or sensitive data",
    detail:
      "Do not paste health, financial, or other regulated information you would not put in a generic web form. This environment is for testing flows only.",
  },
  {
    title: "Integrations are often mocked",
    detail:
      "SMS, email, calendar, and voice may use demo adapters unless you connect your own API keys. Confirmations you see may not reach a real phone or inbox.",
  },
  {
    title: "AI answers can be wrong",
    detail:
      "Always verify dates, prices, and policies with your business or a human before relying on anything the assistant says.",
  },
  {
    title: "Data may be reset",
    detail:
      "Demo databases and accounts can be cleared during development. Do not rely on this site as permanent storage.",
  },
] as const;

export const DEMO_HELP_WANTED = [
  "Vertical-specific hero photos or a short loop (5–15s) you license for the homepage background.",
  "Your logo (SVG or PNG) and brand hex colors for a tailored landing pass.",
  "One paragraph “who this is for” and a single sentence disclaimer your lawyer is comfortable with.",
] as const;
