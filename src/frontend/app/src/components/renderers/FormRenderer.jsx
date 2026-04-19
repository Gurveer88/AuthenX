export function FormRenderer({ data }) {
  if (!data) return <div className="text-red-400">Invalid Form Data</div>;

  let formData = data;
  if (typeof data === 'string') {
    formData = {
      title: "Generated Content",
      description: "The AI produced raw text instead of a structured form.",
      questions: [
        { title: "Raw Output", type: "paragraph", description: data, required: false }
      ]
    };
  }

  if (!formData.questions) return <div className="text-red-400">Invalid Form Data</div>;

  return (
    <div className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden font-sans">
      <div className="bg-[#E8715A] h-2 w-full"></div>
      <div className="p-6 border-b border-[#2e2e2e] bg-[#222]">
        <h2 className="text-2xl font-bold text-[#f0ece8]">{formData.title}</h2>
        {formData.description && <p className="text-sm text-neutral-400 mt-2">{formData.description}</p>}
      </div>
      
      <div className="p-6 space-y-6">
        {formData.questions.map((q, i) => (
          <div key={q.id || i} className="bg-[#242424] border border-[#333] rounded-lg p-5">
            <label className="block text-[#f0ece8] font-medium mb-1">
              {q.title} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.description && <p className="text-xs text-neutral-500 mb-3">{q.description}</p>}
            
            <div className="mt-3 text-neutral-300">
              {q.type === 'short_answer' && (
                <input type="text" disabled className="w-full bg-[#1a1a1a] border-b border-[#444] p-2 text-sm text-neutral-500" placeholder="Short answer text" />
              )}
              {q.type === 'paragraph' && (
                <textarea disabled rows={3} className="w-full bg-[#1a1a1a] border-b border-[#444] p-2 text-sm text-neutral-500" placeholder="Long answer text" />
              )}
              {(q.type === 'multiple_choice' || q.type === 'checkbox') && q.options?.map((opt, j) => (
                <div key={j} className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 border-2 border-[#555] ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                  <span className="text-sm">{opt}</span>
                </div>
              ))}
              {q.type === 'dropdown' && (
                <div className="w-48 bg-[#1a1a1a] border border-[#444] p-2 rounded text-sm text-neutral-500 flex justify-between">
                  <span>Choose</span>
                  <span>▼</span>
                </div>
              )}
              {q.type === 'linear_scale' && (
                <div className="flex items-end gap-4 mt-2">
                  <span className="text-xs">{q.options?.min_label}</span>
                  <div className="flex gap-4">
                    {Array.from({length: (q.options?.max_value || 5) - (q.options?.min_value || 1) + 1}).map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-2">
                        <span className="text-xs">{j + (q.options?.min_value || 1)}</span>
                        <div className="w-4 h-4 rounded-full border-2 border-[#555]"></div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs">{q.options?.max_label}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-[#1a1a1a] border-t border-[#2e2e2e] flex justify-between items-center text-xs text-neutral-500">
        <span>Never submit passwords through Google Forms.</span>
        <button disabled className="bg-[#E8715A] text-white px-4 py-1.5 rounded opacity-50 font-medium">Submit</button>
      </div>
    </div>
  );
}
