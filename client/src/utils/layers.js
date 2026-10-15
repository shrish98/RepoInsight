// Which layer of a codebase a name belongs to, so a diagram box gets a tint that means something.
// Checked in order; the first match wins.
const RULES = [
  ['jobs', /queue|bull|worker|\bjobs?\b|cron|schedul|kafka|rabbit|celery|\btasks?\b/],
  ['data', /mongo|postgres|mysql|sqlite|redis|database|\bdb\b|prisma|mongoose|dynamo|elastic|vector|storage|\bs3\b|cache|supabase database|firestore/],
  ['services', /openai|groq|gemini|\bllm\b|langchain|langgraph|\bai\b|agent|stripe|email|smtp|github api|external|third[- ]party|\bauth\b|auth0|clerk|oauth|firebase|supabase|firecrawl|webhook/],
  ['api', /\bapi\b|express|server|backend|route|controller|middleware|fastapi|django|flask|nest|graphql|\brest\b|node|handler|service/],
  ['frontend', /react|next|vue|svelte|angular|client|frontend|\bui\b|page|browser|tailwind|vite|component|dashboard|\buser\b|html|css|view/],
];

export function layerOf(name = '') {
  const text = name.toLowerCase();
  const hit = RULES.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : 'none';
}

// Same tints as index.css, for Mermaid's classDef lines.
export const LAYER_STYLES = {
  frontend: 'fill:#ddf4ff,stroke:#54aeff,color:#0a3069',
  api: 'fill:#efedff,stroke:#a39afb,color:#4537d9',
  jobs: 'fill:#fff1e5,stroke:#ffb77c,color:#953800',
  services: 'fill:#ffebe9,stroke:#ff8182,color:#82071e',
  data: 'fill:#dafbe1,stroke:#6fdd8b,color:#116329',
};
