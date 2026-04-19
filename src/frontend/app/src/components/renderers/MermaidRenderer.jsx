import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

export function MermaidRenderer({ data }) {
  const containerRef = useRef(null);

  let mermaidData = data;
  if (typeof data === 'string') {
    mermaidData = {
      title: "Raw Output",
      description: "Failed to generate structured flowchart",
      mermaid: `graph TD\n  A[Raw Output Fallback] --> B[Failed to parse JSON]`
    };
  }

  useEffect(() => {
    if (mermaidData && mermaidData.mermaid && containerRef.current) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, mermaidData.mermaid)
        .then((result) => {
          containerRef.current.innerHTML = result.svg;
        })
        .catch((e) => {
          console.error("Mermaid parsing error", e);
          
          // Cleanup any stray error SVGs mermaid might have injected globally
          document.querySelectorAll('svg[id^="d3-error-"]').forEach(el => el.remove());
          
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-900/10">Failed to render Mermaid chart: ${e.message}</div>`;
          }
        });
    }
  }, [mermaidData]);

  if (!mermaidData || !mermaidData.mermaid) return <div className="text-red-400">Invalid Flowchart Data</div>;

  return (
    <div className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 flex flex-col items-center">
      <h3 className="text-[#f0ece8] font-bold text-lg mb-4">{mermaidData.title}</h3>
      <div ref={containerRef} className="w-full overflow-x-auto flex justify-center mermaid-wrapper"></div>
      {mermaidData.description && <p className="text-[12px] text-neutral-400 mt-4 text-center">{mermaidData.description}</p>}
    </div>
  );
}
