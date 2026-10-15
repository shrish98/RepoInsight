import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { Maximize2, X } from 'lucide-react';
import { layerOf, LAYER_STYLES } from '../utils/layers';

mermaid.initialize({
  startOnLoad: false,
  // The diagram source is model output, so keep Mermaid from running any embedded HTML or click handlers.
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    fontFamily: '"Mona Sans", ui-sans-serif, sans-serif',
    fontSize: '14px',
    primaryColor: '#ffffff',
    primaryTextColor: '#1f2328',
    primaryBorderColor: '#d1d9e0',
    lineColor: '#818b98',
    secondaryColor: '#f6f8fa',
    tertiaryColor: '#eff2f5',
    edgeLabelBackground: '#f6f8fa',
  },
  themeCSS: `
    .node rect, .node polygon { rx: 8px; ry: 8px; }
    .nodeLabel { font-weight: 600; }
    .edgeLabel { font-family: "JetBrains Mono", monospace; font-size: 11px; color: #59636e; }
  `,
});

// Give each box the tint of the layer its label names (frontend, API, jobs, services, data),
// matching the stack chips. Boxes that don't match anything keep the plain style.
const NODE_DEF = /\b([A-Za-z_]\w*)\s*(?:\[\[|\[\(|\(\(|\(\[|\[|\(|\{\{|\{)\s*"?([^"[\](){}\n|]+)/g;

function tintByLayer(chart) {
  if (!/^(graph|flowchart)\b/.test(chart)) return chart;
  const byLayer = {};
  for (const [, id, label] of chart.matchAll(NODE_DEF)) {
    const layer = layerOf(label);
    if (layer !== 'none') (byLayer[layer] ??= new Set()).add(id);
  }
  const lines = Object.entries(byLayer).flatMap(([layer, ids]) => [
    `  classDef layer_${layer} ${LAYER_STYLES[layer]}`,
    `  class ${[...ids].join(',')} layer_${layer}`,
  ]);
  return lines.length ? `${chart}\n${lines.join('\n')}` : chart;
}

const sanitizeMermaidChart = (chartText) => {
  if (!chartText || typeof chartText !== 'string') return '';

  let clean = chartText
    .replace(/^```mermaid/i, '')
    .replace(/^```/g, '')
    .replace(/```$/g, '')
    .trim();

  if (!clean.startsWith('graph') && !clean.startsWith('flowchart') && !clean.startsWith('sequenceDiagram')) {
    clean = `graph TD\n${clean}`;
  }

  // Models often write edge labels as `-->|label|> B`; the trailing ">" is a syntax error.
  clean = clean.replace(/\|([^|\n]*)\|>/g, '|$1|');

  // Quote bare labels; the model sometimes puts parentheses or slashes in them, which breaks parsing.
  clean = clean.replace(/([A-Za-z0-9_]+)\[([^"\n]+?)\]/g, (match, nodeId, label) => {
    if (label.startsWith('"') && label.endsWith('"')) return match;
    return `${nodeId}["${label.replace(/"/g, "'")}"]`;
  });

  return tintByLayer(clean);
};

const FALLBACK_DIAGRAM = tintByLayer(`graph TD
  Client["User interface"] --> Router["Routing and middleware"]
  Router --> Auth["Auth"]
  Router --> Services["Core services"]
  Services --> DB[("Database and external APIs")]`);

// Mermaid breaks when two renders overlap (e.g. the inline and full-screen copies, or React
// StrictMode running effects twice), so every render goes through one queue with a unique id.
let renderQueue = Promise.resolve();
let renderCount = 0;

function render(node, chart) {
  renderQueue = renderQueue.then(async () => {
    for (const code of [sanitizeMermaidChart(chart) || FALLBACK_DIAGRAM, FALLBACK_DIAGRAM]) {
      try {
        const { svg } = await mermaid.render(`repo-diagram-${++renderCount}`, code);
        if (node.isConnected) node.innerHTML = svg;
        return;
      } catch (err) {
        console.warn('Mermaid could not render this diagram, trying the fallback.', err);
      }
    }
  });
}

export default function MermaidDiagram({ chart }) {
  const inlineRef = useRef(null);
  const modalRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (inlineRef.current) render(inlineRef.current, chart);
  }, [chart]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    if (modalRef.current) render(modalRef.current, chart);
    const onKey = (e) => e.key === 'Escape' && setIsFullscreen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, chart]);

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-line bg-subtle">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink-2 shadow-[0_1px_0_rgb(31_35_40/0.04)] hover:text-ink"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Expand
        </button>
        <div className="max-h-[340px] overflow-auto p-4 pt-10">
          <div ref={inlineRef} className="flex justify-center [&>svg]:h-auto [&>svg]:max-w-full" />
        </div>
      </div>

      {isFullscreen &&
        createPortal(
          <div className="pop fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Architecture diagram">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
              <p className="text-base font-bold">Architecture</p>
              <button type="button" onClick={() => setIsFullscreen(false)} className="btn-secondary px-3 py-1.5" autoFocus>
                <X className="h-4 w-4" /> Close
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-subtle p-6">
              <div ref={modalRef} className="flex min-h-full items-center justify-center [&>svg]:h-auto [&>svg]:max-w-full" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
