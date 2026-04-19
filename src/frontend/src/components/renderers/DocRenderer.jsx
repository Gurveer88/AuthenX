export function DocRenderer({ data }) {
  if (!data) return <div className="text-red-400">Invalid Document Data</div>;

  let docData = data;
  if (typeof data === 'string') {
    docData = {
      title: "Generated Content",
      metadata: { author: "Raw Text Fallback" },
      content: [
        { type: "code_block", code: data }
      ]
    };
  }

  if (!docData.content) return <div className="text-red-400">Invalid Document Data</div>;

  const renderBlock = (block, idx) => {
    switch (block.type) {
      case 'header':
      case 'heading':
        const HTag = `h${Math.min(block.level || 2, 6)}`;
        const sizeClasses = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg', h4: 'text-base', h5: 'text-sm', h6: 'text-xs' };
        return <HTag key={idx} className={`${sizeClasses[HTag]} font-bold text-[#f0ece8] mt-6 mb-3`}>{block.text}</HTag>;
      
      case 'paragraph':
        return <p key={idx} className="text-[#d0ccc8] text-[13px] leading-relaxed mb-4">{block.text}</p>;
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        const listClass = block.ordered ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={idx} className={`${listClass} pl-5 text-[#d0ccc8] text-[13px] leading-relaxed mb-4 space-y-1`}>
            {block.items?.map((item, i) => <li key={i}>{item}</li>)}
          </ListTag>
        );
      
      case 'code_block':
        return (
          <div key={idx} className="mb-4 rounded-md overflow-hidden border border-[#333]">
            {block.language && <div className="bg-[#1a1a1a] px-3 py-1 text-[10px] text-neutral-500 uppercase tracking-wider">{block.language}</div>}
            <pre className="bg-[#111] p-3 text-[12px] text-[#A6ACCD] overflow-x-auto">
              <code>{block.code}</code>
            </pre>
          </div>
        );
      
      case 'table':
        return (
          <div key={idx} className="overflow-x-auto mb-4 border border-[#333] rounded-lg">
            <table className="w-full text-left text-[12px] text-[#d0ccc8]">
              <thead className="bg-[#1a1a1a] text-neutral-400 border-b border-[#333]">
                <tr>
                  {block.headers?.map((h, i) => <th key={i} className="px-3 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows?.map((row, i) => (
                  <tr key={i} className="border-b border-[#333] last:border-0 hover:bg-[#1f1f1f]">
                    {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-8 max-w-3xl mx-auto shadow-lg">
      <h1 className="text-3xl font-extrabold text-[#f0ece8] mb-2">{docData.title}</h1>
      <div className="flex gap-4 text-[11px] text-[#E8715A] font-medium tracking-wide uppercase mb-8 border-b border-[#333] pb-4">
        <span>{docData.metadata?.author || "AuthenX"}</span>
        <span>•</span>
        <span>{docData.metadata?.date || new Date().toLocaleDateString()}</span>
      </div>
      
      <div className="prose prose-invert max-w-none">
        {docData.content.map(renderBlock)}
      </div>

      {((docData.citations && docData.citations.length > 0) || (docData.metadata?.citations && docData.metadata.citations.length > 0)) && (
        <div className="mt-12 pt-4 border-t border-[#333]">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">References</h4>
          <ul className="text-[11px] text-neutral-500 space-y-1">
            {(docData.citations || docData.metadata?.citations || []).map((cit, i) => (
              <li key={i}>
                [{i+1}] {typeof cit === 'string' ? cit : <a href={cit.url} target="_blank" rel="noreferrer" className="hover:text-[#E8715A]">{cit.text}</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
