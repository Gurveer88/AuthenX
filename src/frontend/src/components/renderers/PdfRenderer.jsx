export function PdfRenderer({ data }) {
  if (!data) return <div className="text-red-400">Invalid PDF Data</div>;

  let pdfData = data;
  if (typeof data === 'string') {
    pdfData = {
      pages: [
        {
          page_number: 1,
          content: [{ type: "code_block", code: data }]
        }
      ]
    };
  }

  if (!pdfData.pages) return <div className="text-red-400">Invalid PDF Data</div>;

  const renderBlock = (block, idx) => {
    const alignClass = block.alignment === 'center' ? 'text-center' : block.alignment === 'right' ? 'text-right' : block.alignment === 'justify' ? 'text-justify' : 'text-left';
    
    switch (block.type) {
      case 'title':
        return <h1 key={idx} className={`font-bold text-black mb-6 ${alignClass}`} style={{ fontSize: `${block.font_size || 24}px` }}>{block.text}</h1>;
      
      case 'paragraph':
        return <p key={idx} className={`text-gray-800 mb-4 ${alignClass}`} style={{ fontSize: `${block.font_size || 12}px` }}>{block.text}</p>;
      
      case 'table':
        return (
          <table key={idx} className={`w-full mb-6 border-collapse text-[11px] text-gray-800 ${block.style === 'bordered' ? 'border border-gray-400' : ''}`}>
            <thead>
              <tr className={block.style === 'striped' ? 'bg-gray-200' : 'border-b-2 border-gray-400'}>
                {block.headers?.map((h, i) => <th key={i} className="p-2 text-left font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i} className={block.style === 'striped' && i % 2 === 1 ? 'bg-gray-100' : 'border-b border-gray-200'}>
                  {row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        const listClass = block.ordered ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={idx} className={`${listClass} pl-6 text-gray-800 mb-4 space-y-1`} style={{ fontSize: '12px' }}>
            {block.items?.map((item, i) => <li key={i}>{item}</li>)}
          </ListTag>
        );
      
      case 'divider':
        return <hr key={idx} className="my-6 border-t-2 border-gray-300" />;
        
      case 'image_placeholder':
        return (
          <div key={idx} className={`w-full flex ${alignClass === 'text-center' ? 'justify-center' : alignClass === 'text-right' ? 'justify-end' : 'justify-start'} mb-6`}>
            <div className="bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center p-4" style={{ width: block.width || '100%', height: block.height || 200, maxWidth: '100%' }}>
              <span className="text-gray-500 font-mono text-xs">{block.description || "Image Placeholder"}</span>
            </div>
          </div>
        );
        
      case 'code_block':
        return (
          <pre key={idx} className="bg-gray-100 p-4 rounded text-[10px] font-mono text-gray-800 mb-6 border border-gray-300 overflow-x-auto whitespace-pre-wrap">
            {block.code}
          </pre>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-[#141414] p-4 rounded-xl">
      <div className="flex gap-4">
        {pdfData.pages.map((page, i) => (
          <div key={i} className="shrink-0 bg-white shadow-2xl flex flex-col" style={{ width: '595px', minHeight: '842px', padding: '40px' }}>
            
            {/* Header */}
            {pdfData.header && (
              <div className="flex justify-between items-end border-b border-gray-300 pb-2 mb-8 text-[10px] text-gray-500 uppercase tracking-widest font-sans">
                <span>{pdfData.header.logo_placeholder || "LOGO"}</span>
                <span>{pdfData.header.text}</span>
              </div>
            )}
            
            {/* Body */}
            <div className="flex-1 font-serif">
              {page.content.map(renderBlock)}
            </div>
            
            {/* Footer */}
            {pdfData.footer && (
              <div className="flex justify-between items-start border-t border-gray-300 pt-2 mt-8 text-[10px] text-gray-500 font-sans">
                <span>{pdfData.footer.show_date ? new Date().toLocaleDateString() : ""}</span>
                <span>{pdfData.footer.text}</span>
                <span>Page {page.page_number}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
