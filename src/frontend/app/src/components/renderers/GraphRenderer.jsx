import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export function GraphRenderer({ data }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 400
      });
    }
  }, []);

  let graphDataObj = data;
  if (typeof data === 'string') {
    graphDataObj = {
      metadata: { graph_type: "Raw Output", description: "Failed to generate structured graph data." },
      nodes: [{ id: "n1", label: "Raw Output", group: 1 }],
      edges: []
    };
  }

  if (!graphDataObj || !graphDataObj.nodes || !graphDataObj.edges) return <div className="text-red-400">Invalid Graph Data</div>;

  const graphData = {
    nodes: graphDataObj.nodes.map(n => ({ id: n.id, name: n.label, group: n.group || 1 })),
    links: graphDataObj.edges.map(e => ({ source: e.source, target: e.target, name: e.label, value: e.weight || 1 }))
  };

  return (
    <div className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2e2e2e] bg-[#161616]">
        <h3 className="text-[#f0ece8] font-bold text-sm">General Graph: {graphDataObj.metadata?.graph_type || 'Network'}</h3>
        {graphDataObj.metadata?.description && <p className="text-[11px] text-neutral-400 mt-1">{graphDataObj.metadata.description}</p>}
      </div>
      <div ref={containerRef} className="w-full h-[400px]">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="group"
          linkColor={() => '#444'}
          linkDirectionalArrowLength={graphDataObj.metadata?.directed ? 3.5 : 0}
          linkDirectionalArrowRelPos={1}
          linkWidth={link => Math.max(1, link.value * 0.5)}
          backgroundColor="#1e1e1e"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);
            
            node.__bckgDimensions = bckgDimensions;
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
          }}
        />
      </div>
    </div>
  );
}
