// Which layer of a codebase a name belongs to, so a technology gets the same tint in the
// stack list and in the architecture diagram. Checked in order; the first match wins.
const RULES = [
  ['jobs', /queue|bull|worker|\bjobs?\b|cron|schedul|kafka|rabbit|celery|\btasks?\b/],
  ['data', /mongo|postgres|mysql|sqlite|redis|database|\bdb\b|prisma|mongoose|dynamo|elastic|vector|storage|\bs3\b|cache|supabase database|firestore/],
  ['services', /openai|groq|gemini|\bllm\b|langchain|langgraph|\bai\b|agent|stripe|email|smtp|github api|external|third[- ]party|\bauth\b|auth0|clerk|oauth|firebase|supabase|firecrawl|docker|aws|vercel|kubernetes|nginx|caddy|webhook/],
  ['api', /\bapi\b|express|server|backend|route|controller|middleware|fastapi|django|flask|nest|graphql|\brest\b|node|handler|service/],
  ['frontend', /react|next|vue|svelte|angular|client|frontend|\bui\b|page|browser|tailwind|vite|component|dashboard|\buser\b|html|css|view/],
];

export const LAYERS = ['frontend', 'api', 'jobs', 'services', 'data'];

export function layerOf(name = '') {
  const text = name.toLowerCase();
  const hit = RULES.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : 'none';
}

// Stable tint for a repository's initial in the sidebar.
export function layerForKey(key = '') {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return LAYERS[hash % LAYERS.length];
}

// Same tints as index.css, for Mermaid's classDef lines.
export const LAYER_STYLES = {
  frontend: 'fill:#e4ecfc,stroke:#3b6fd4,color:#24468f',
  api: 'fill:#ddf2e5,stroke:#2f8a5b,color:#1f5e3d',
  jobs: 'fill:#fff0c7,stroke:#c98a06,color:#7a5400',
  services: 'fill:#fde2d8,stroke:#d2603a,color:#8a3517',
  data: 'fill:#ece5f8,stroke:#7356b8,color:#4b3592',
};
