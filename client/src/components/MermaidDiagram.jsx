import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { Maximize2, X } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    primaryColor: '#6366f1',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#818cf8',
    lineColor: '#38bdf8',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b'
  }
});

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

  // Quote unquoted node labels: e.g. NodeA[Label Text] -> NodeA["Label Text"]
  clean = clean.replace(/([A-Za-z0-9_]+)\[([^"\n]+?)\]/g, (match, nodeId, label) => {
    if (label.startsWith('"') && label.endsWith('"')) {
      return match;
    }
    const safeLabel = label.replace(/"/g, "'");
    return `${nodeId}["${safeLabel}"]`;
  });

  return clean;
};

const DEFAULT_FALLBACK_DIAGRAM = `graph TD
  Client["User Interface / Web Client"] --> Router["App Routing & Middleware"]
  Router --> Auth["Auth & Session Controller"]
  Router --> Services["Core Application Services"]
  Services --> DB[("Database & External APIs")]`;

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const modalContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render Inline Diagram
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    const renderInline = async () => {
      const targetCode = sanitizeMermaidChart(chart) || DEFAULT_FALLBACK_DIAGRAM;
      try {
        if (containerRef.current) {
          containerRef.current.removeAttribute('data-processed');
          containerRef.current.innerHTML = targetCode;
          await mermaid.run({ nodes: [containerRef.current] });
        }
      } catch (err) {
        console.warn('Primary Mermaid run warning, falling back:', err);
        try {
          if (containerRef.current && isMounted) {
            containerRef.current.removeAttribute('data-processed');
            containerRef.current.innerHTML = DEFAULT_FALLBACK_DIAGRAM;
            await mermaid.run({ nodes: [containerRef.current] });
          }
        } catch (fallbackErr) {
          console.error("Fallback mermaid run error:", fallbackErr);
        }
      }
    };

    renderInline();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Render Fullscreen Modal Diagram when expanded
  useEffect(() => {
    if (isFullscreen && modalContainerRef.current) {
      const renderModalChart = async () => {
        const targetCode = sanitizeMermaidChart(chart) || DEFAULT_FALLBACK_DIAGRAM;
        try {
          modalContainerRef.current.removeAttribute('data-processed');
          modalContainerRef.current.innerHTML = targetCode;
          await mermaid.run({ nodes: [modalContainerRef.current] });
        } catch (err) {
          if (modalContainerRef.current) {
            modalContainerRef.current.removeAttribute('data-processed');
            modalContainerRef.current.innerHTML = DEFAULT_FALLBACK_DIAGRAM;
            await mermaid.run({ nodes: [modalContainerRef.current] });
          }
        }
      };
      renderModalChart();
    }
  }, [isFullscreen, chart]);

  return (
    <>
      {/* Inline Container */}
      <div className="relative group w-full bg-slate-900/80 rounded-2xl p-6 border border-white/10 overflow-x-auto min-h-[160px] flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10 transition-colors z-10 opacity-80 group-hover:opacity-100 flex items-center gap-1.5 text-xs shadow-md"
          title="Expand Fullscreen"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Expand</span>
        </button>

        <div 
          ref={containerRef} 
          className="mermaid w-full flex justify-center items-center font-mono text-sm [&>svg]:max-w-full [&>svg]:h-auto"
        />
      </div>

      {/* Fullscreen Portal Modal */}
      {isFullscreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl p-4 md:p-10 flex items-center justify-center overflow-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl bg-slate-900 border border-indigo-500/40 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[600px] my-auto">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all z-10 flex items-center gap-2 font-semibold text-xs"
            >
              <X className="w-4 h-4" /> Close Fullscreen
            </button>

            <div className="w-full text-center mb-4">
              <h3 className="text-lg font-bold text-white">System Architecture Flowchart</h3>
              <p className="text-xs text-slate-400">Interactive component & data flow diagram</p>
            </div>

            <div className="w-full flex justify-center items-center overflow-auto p-4 bg-slate-950/50 rounded-2xl border border-white/5 min-h-[400px]">
              <div 
                ref={modalContainerRef}
                className="mermaid w-full flex justify-center items-center font-mono text-sm [&>svg]:max-w-full [&>svg]:max-h-[75vh] [&>svg]:h-auto"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
