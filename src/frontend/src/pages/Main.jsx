import { useState, useRef, useEffect } from "react";
import { ChartRenderer, MermaidRenderer, GraphRenderer, FormRenderer, DocRenderer, PdfRenderer } from "../components/renderers";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TOOLS = [
  { id: "graph", label: "General Graph", desc: "Create a graph showing relationships between entities." },
  { id: "forms", label: "Feedback Forms", desc: "Generate structured survey or feedback forms." },
  { id: "charts", label: "Data Charts", desc: "Create bar charts and visualizations from data." },
  { id: "docs", label: "Document Gen", desc: "Write structured documents and proposals." },
  { id: "pdfs", label: "PDF Layouts", desc: "Generate professional PDF layouts like invoices." },
  { id: "flowcharts", label: "Flowcharts", desc: "Create flowcharts for systems and processes." },
];

function Dots() {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-600 py-1">
      <span>Analyzing</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#E8715A] opacity-60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
          />
        ))}
      </span>
    </div>
  );
}

function ToolIcon({ id }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#E8715A]">
      {id === "pdfs" && <><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5h6M4 7.5h4M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>}
      {id === "docs" && <><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5h2M4 7h6M4 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>}
      {id === "forms" && <><path d="M7 1L12 3.5V7C12 9.8 9.8 12.3 7 13C4.2 12.3 2 9.8 2 7V3.5L7 1Z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>}
      {id === "graph" && <><ellipse cx="7" cy="4.5" rx="4" ry="2" stroke="currentColor" strokeWidth="1.2"/><path d="M3 4.5V7c0 1.1 1.8 2 4 2s4-.9 4-2V4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 7v2.5C3 10.6 4.8 11.5 7 11.5s4-.9 4-2V7" stroke="currentColor" strokeWidth="1.2"/></>}
      {id === "charts" && <><rect x="3" y="7" width="2" height="5" fill="currentColor"/><rect x="6" y="3" width="2" height="9" fill="currentColor"/><rect x="9" y="5" width="2" height="7" fill="currentColor"/></>}
      {id === "flowcharts" && <><rect x="2" y="2" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="9" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5v5.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>}
    </svg>
  );
}

function MiniBar() {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {[38, 62, 44, 80, 55, 90, 67].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 5 ? "#E8715A" : "#E8715A44" }} />
      ))}
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function AuthenX() {
  const [view, setView] = useState("home");
  const [tool, setTool] = useState("docs");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [genMsgs, setGenMsgs] = useState([]);
  const [valMsgs, setValMsgs] = useState([]);
  const [genStatus, setGenStatus] = useState("idle");
  const [valStatus, setValStatus] = useState("idle");
  const [running, setRunning] = useState(false);
  const genRef = useRef(null);
  const valRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if (genRef.current) genRef.current.scrollTop = genRef.current.scrollHeight; }, [genMsgs]);
  useEffect(() => { if (valRef.current) valRef.current.scrollTop = valRef.current.scrollHeight; }, [valMsgs]);

  const pushGen = (m) => setGenMsgs((p) => [...p, { ...m, id: Math.random() }]);
  const pushVal = (m) => setValMsgs((p) => [...p, { ...m, id: Math.random() }]);
  const popGen = () => setGenMsgs((p) => p.slice(0, -1));
  const popVal = () => setValMsgs((p) => p.slice(0, -1));

  async function analyze() {
    if (running || !prompt.trim()) return;
    setRunning(true);
    setView("pipeline");
    const q = prompt;
    setPrompt("");

    const history = [];
    genMsgs.forEach(m => {
      if (m.type === "user") {
        history.push({ role: "user", content: m.text });
      } else if (m.type === "gen" && m.content) {
        history.push({ role: "assistant", content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) });
      }
    });

    setGenStatus("thinking");
    pushGen({ type: "user", text: q });
    pushGen({ type: "thinking" });

    try {
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        const sRes = await fetch(`${API_BASE}/sessions`, {
          method: "POST", headers: { "Content-Type": "application/json" }
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          currentSessionId = sData.session_id;
          setActiveSessionId(currentSessionId);
          fetchSessions();
        }
      }

      // 1. Submit task to background endpoint
      const initRes = await fetch(`${API_BASE}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q, tool: tool, session_id: currentSessionId }),
      });
      
      const initData = await initRes.json();
      if (!initRes.ok) {
        throw new Error(initData.detail?.message || initData.detail?.error || "Submission failed.");
      }
      
      const taskId = initData.task_id;
      setActiveTaskId(taskId);
      
      // 2. Poll for results
      let data;
      while (true) {
        await delay(1000);
        const pollRes = await fetch(`${API_BASE}/send/${taskId}`);
        data = await pollRes.json();
        if (data.status !== "processing") break;
      }

      popGen();
      pushGen({ type: "tool-call", text: `${tool}_generate()` });
      await delay(500);
      
      if (data.status === "failed" || !data.result) {
        pushGen({ type: "gen", text: `<b>Error:</b> ${data.error || "Generation failed."}` });
        setGenStatus("done");
        setRunning(false);
        return;
      }

      const result = data.result;
      const contentStr = typeof result.content === 'object' ? JSON.stringify(result.content, null, 2) : result.content;
      const score = Math.round((result.validation?.final_confidence || 0) * 100);
      
      pushGen({ type: "tool-out", text: `Generated using ${TOOLS.find((t) => t.id === tool)?.label} · Rounds: ${data.rounds_taken}` });
      await delay(300);
      pushGen({ type: "gen", tool: tool, content: result.content, citations: result.citations });
      setGenStatus("done");

      await delay(350);
      setValStatus("thinking");
      pushVal({ type: "user", text: `Validating output structure and constraints...` });
      pushVal({ type: "thinking" });
      await delay(1100);

      const validation = result.validation || {};
      const pass = validation.is_validated;
      const issues = validation.remaining_issues || [];

      popVal();
      
      let valHtml = `<b>Validation Rounds:</b> ${validation.total_rounds}<br/><br/>`;
      if (pass) {
        valHtml += `<b>Fact integrity:</b> Passed. No contradictions found.<br/><br/><b>Structural coherence:</b> Passed. Claims are logically consistent.<br/><br/><b>Status:</b> Passed. Aligned with current standards.`;
      } else {
        valHtml += `<b>Status:</b> Warning. Found ${issues.length} issues.<br/><br/>`;
        valHtml += issues.map(i => `• ${i}`).join('<br/>');
      }

      pushVal({ type: "val", text: valHtml });
      pushVal({ type: "metrics", score, issues: issues.length });
      pushVal({ type: "verdict", pass });
      
      setValStatus("done");
      setRunning(false);

      setRunning(false);
      fetchSessions();
    } catch (err) {
      popGen();
      pushGen({ type: "gen", text: `<b>Error:</b> Failed to connect to the backend server. Make sure it is running on port 8000. Detail: ${err.message}` });
      setGenStatus("done");
      setRunning(false);
    }
  }

  const loadSession = async (s) => {
    if (running) return;
    setActiveSessionId(s.session_id);
    setView("pipeline");
    setTool(s.tool);
    
    try {
      const res = await fetch(`${API_BASE}/sessions/${s.session_id}`);
      if (res.ok) {
        const data = await res.json();
        const gMsgs = [];
        let lastTaskId = null;
        
        data.messages.forEach(m => {
          if (m.role === "user") {
            gMsgs.push({ type: "user", text: m.content, id: Math.random() });
          }
          if (m.role === "assistant") {
            // Try to parse content if it's a JSON string
            let content = m.content;
            try {
              if (typeof content === 'string' && content.trim().startsWith('{')) {
                content = JSON.parse(content);
              }
            } catch (e) {
              // Keep as string if parse fails
            }
            gMsgs.push({ 
              type: "gen", 
              tool: data.tool,  // Use the session's tool
              content: content, 
              citations: m.citations, 
              id: Math.random() 
            });
            // Track the last task_id for download buttons
            if (m.task_id) lastTaskId = m.task_id;
          }
        });
        setGenMsgs(gMsgs);
        setValMsgs([]);
        setGenStatus("done");
        setValStatus("done");  // Set to done so download buttons appear
        setActiveTaskId(lastTaskId);  // Set the last task ID for downloads
      }
    } catch (e) { console.error(e); }
  };

  function reset() {
    setGenMsgs([]); setValMsgs([]);
    setGenStatus("idle"); setValStatus("idle");
    setView("home"); setPrompt("");
    setActiveSessionId(null);
    setActiveTaskId(null);
  }

  const statusBadge = (s) =>
    s === "thinking" ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
    : s === "done" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    : "text-neutral-600 bg-neutral-600/10 border-neutral-600/20";

  const dotCls = (s) =>
    `w-1.5 h-1.5 rounded-full ${s === "thinking" ? "bg-amber-400 animate-pulse" : s === "done" ? "bg-emerald-500" : "bg-neutral-600"}`;

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#f0ece8] overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 shrink-0 bg-[#141414] border-r border-[#2e2e2e] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-md bg-[#E8715A1a] border border-[#E8715A44] flex items-center justify-center">
              <img src="../" alt="" />
            </div>
            <span className="text-lg font-bold tracking-tight">AuthenX</span>
          </div>
          <p className="text-[9px] tracking-[0.18em] text-neutral-600 uppercase pl-9">The Obsidian Vault</p>
        </div>

        {/* New Chat */}
        <button onClick={reset} className="mx-3.5 my-3 px-3.5 py-2.5 rounded-lg bg-[#E8715A18] border border-[#E8715A40] text-[#E8715A] text-[13px] font-semibold flex items-center justify-between hover:bg-[#E8715A28] transition-colors">
          <span className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v6M4 7h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            New Chat
          </span>
          <span className="text-[10px] opacity-50">⌘N</span>
        </button>

        {/* Recent */}
        <p className="text-[10px] font-semibold text-neutral-700 uppercase tracking-widest px-5 pt-2 pb-1.5 flex items-center justify-between">
          Recent Chats
          <button onClick={fetchSessions} className="hover:text-neutral-300"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 4v4h4M11 8V4H7M6 1a5 5 0 00-4.8 3.5M6 11a5 5 0 004.8-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </p>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <button key={s.session_id} onClick={() => loadSession(s)} className={`w-full flex items-center gap-2.5 px-5 py-2 text-[13px] text-left border-l-2 transition-all ${activeSessionId === s.session_id ? "text-[#E8715A] bg-[#E8715A10] border-[#E8715A]" : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-white/5"}`}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/><path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
              <span className="truncate">{s.title}</span>
            </button>
          ))}
          {sessions.length === 0 && <p className="px-5 py-2 text-[11px] text-neutral-600 italic">No history yet.</p>}
        </div>

        {/* Vault */}
        <p className="text-[10px] font-semibold text-neutral-700 uppercase tracking-widest px-5 pt-4 pb-1.5">Vault Categories</p>
        {["Saved Documents", "Security Logs"].map((c) => (
          <button key={c} className="flex items-center gap-2.5 px-5 py-2 text-[13px] text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/><path d="M4 6h4M4 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
            {c}
          </button>
        ))}

        {/* Bottom */}
        <div className="mt-auto border-t border-[#2e2e2e] pt-2">
          {["Help", "Settings"].map((item) => (
            <button key={item} className="flex items-center gap-2.5 px-5 py-2 text-[13px] text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors w-full">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                {item === "Help"
                  ? <><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/><path d="M6 5.5C6 4.7 7.2 4 7.2 5.2C7.2 6 6 6 6 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="6" cy="8.5" r="0.5" fill="currentColor"/></>
                  : <><path d="M6 1L7.5 2.5H9.5L10 4.5L11.5 6L10 7.5L9.5 9.5H7.5L6 11L4.5 9.5H2.5L2 7.5L0.5 6L2 4.5L2.5 2.5H4.5L6 1Z" stroke="currentColor" strokeWidth="1"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1"/></>}
              </svg>
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2">
            {activeTaskId && valStatus === "done" && (
              <>
                {(tool === 'docs' || tool === 'pdfs') && (
                  <>
                    <button onClick={() => window.open(`${API_BASE}/download/${activeTaskId}?format=pdf`)} className="px-3 py-1.5 rounded bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v6M3.5 5.5L6 8l2.5-2.5M2 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      PDF
                    </button>
                    <button onClick={() => window.open(`${API_BASE}/download/${activeTaskId}?format=docx`)} className="px-3 py-1.5 rounded bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v6M3.5 5.5L6 8l2.5-2.5M2 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      DOCX
                    </button>
                  </>
                )}
                {tool === 'forms' && (
                  <button disabled className="px-3 py-1.5 rounded bg-[#2e2e2e] text-[11px] font-semibold text-neutral-500 cursor-not-allowed flex items-center gap-1.5 opacity-50">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8H2z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M4 5h4M4 7h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    Export (Coming Soon)
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {[
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2.5 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
            ].map((icon, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${i === 2 ? "bg-[#E8715A18] border-[#E8715A44] text-[#E8715A]" : "border-[#2e2e2e] text-neutral-500 hover:border-[#E8715A55] hover:text-[#E8715A]"}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {view === "home" ? (

            /* ── HOME VIEW ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10 pb-20">
              <div className="text-center">
                <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                  Hi, Welcome to <span className="text-[#E8715A]">AuthenX!</span>
                </h1>
                <p className="text-neutral-500 mt-3 text-base">What do you want to verify today?</p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-3xl">
                {TOOLS.map((t) => (
                  <button key={t.id} onClick={() => setTool(t.id)} className={`relative text-left rounded-xl p-5 pb-10 border transition-all hover:-translate-y-0.5 overflow-hidden ${tool === t.id ? "border-[#E8715A55] bg-[#E8715A08]" : "border-[#2e2e2e] bg-[#222] hover:border-[#E8715A44]"}`}>
                    <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center border ${tool === t.id ? "bg-[#E8715A28] border-[#E8715A55]" : "bg-[#E8715A18] border-[#E8715A33]"}`}>
                      <ToolIcon id={t.id} />
                    </div>
                    <p className="text-[13px] font-bold mb-1.5">{t.label}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{t.desc}</p>
                    <span className="absolute bottom-[-10px] right-[-4px] text-6xl opacity-[0.04] pointer-events-none select-none">◈</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-700 uppercase tracking-widest">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="2" y="4.5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M3.5 4.5V3a1.5 1.5 0 013 0v1.5" stroke="currentColor" strokeWidth="1"/></svg>
                All verifications are end-to-end encrypted in the Vault
              </div>
            </div>

          ) : (

            /* ── PIPELINE VIEW ── */
            <div className="flex-1 grid grid-cols-2 overflow-hidden border-b border-[#2e2e2e]">

              {/* Generator Panel */}
              <div className="flex flex-col border-r border-[#2e2e2e] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e2e2e] bg-[#161616]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                    <span className={dotCls(genStatus)} />
                    Generator LLM
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(genStatus)}`}>
                    {genStatus === "idle" ? "ready" : genStatus}
                  </span>
                </div>
                <div ref={genRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {genMsgs.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-700 text-[13px]">
                      <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.2"/><path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Generator output appears here
                    </div>
                  )}
                  {genMsgs.map((m) => (
                    <div key={m.id}>
                      {m.type === "user" && (
                        <div className="rounded-xl px-3.5 py-2.5 bg-[#242424] border border-[#2e2e2e] text-neutral-400 text-[13px] leading-relaxed">
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Prompt</p>
                          {m.text}
                        </div>
                      )}
                      {m.type === "thinking" && <Dots />}
                      {m.type === "tool-call" && (
                        <div className="rounded-lg px-3 py-2 bg-[#1a1a1a] border border-[#2e2e2e] text-[11px] font-mono text-neutral-600">
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Tool invoked</p>
                          <span className="text-[#E8715A]">{m.text}</span>
                        </div>
                      )}
                      {m.type === "tool-out" && (
                        <div className="rounded-lg border border-[#2e2e2e] overflow-hidden">
                          <div className="bg-[#1c1c1c] px-3 py-1.5 text-[11px] text-neutral-500 font-mono border-b border-[#2e2e2e]">⚙ output</div>
                          <div className="px-3 py-2.5 text-[12px] text-neutral-500 leading-relaxed">{m.text}</div>
                        </div>
                      )}
                      {m.type === "gen" && (
                        <div className="w-full mt-2">
                          {m.tool === 'docs' && typeof m.content === 'object' ? (
                            <DocRenderer data={m.content} />
                          ) : m.tool === 'graph' && typeof m.content === 'object' ? (
                            <GraphRenderer data={m.content} />
                          ) : m.tool === 'charts' && typeof m.content === 'object' ? (
                            <ChartRenderer data={m.content} />
                          ) : m.tool === 'forms' && typeof m.content === 'object' ? (
                            <FormRenderer data={m.content} />
                          ) : m.tool === 'pdfs' && typeof m.content === 'object' ? (
                            <PdfRenderer data={m.content} />
                          ) : m.tool === 'flowcharts' && typeof m.content === 'object' ? (
                            <MermaidRenderer data={m.content} />
                          ) : (
                            <>
                              <div className="markdown-body prose prose-invert max-w-none text-[13px] leading-relaxed prose-p:my-2 prose-headings:my-3 prose-pre:bg-transparent prose-pre:p-0">
                                <ReactMarkdown
                                  components={{
                                    code({node, inline, className, children, ...props}) {
                                      const match = /language-(\w+)/.exec(className || '')
                                      const lang = match ? match[1] : '';
                                      
                                      if (!inline && lang) {
                                        try {
                                          const rawString = String(children).trim();
                                          if (lang === 'mermaid') return <div className="my-4"><MermaidRenderer data={{title: "Flowchart", mermaid: rawString}} /></div>;
                                          
                                          const parsedJson = JSON.parse(rawString);
                                          if (lang === 'chart') return <div className="my-4"><ChartRenderer data={parsedJson} /></div>;
                                          if (lang === 'graph') return <div className="my-4"><GraphRenderer data={parsedJson} /></div>;
                                          if (lang === 'form') return <div className="my-4"><FormRenderer data={parsedJson} /></div>;
                                          if (lang === 'pdf') return <div className="my-4"><PdfRenderer data={parsedJson} /></div>;
                                        } catch (e) {
                                          // Fall through to syntax highlighting on parse error
                                        }
                        
                                        return (
                                          <SyntaxHighlighter
                                            {...props}
                                            style={vscDarkPlus}
                                            language={lang}
                                            PreTag="div"
                                            className="rounded-lg text-[11px] !bg-[#1a1a1a] !border !border-[#2e2e2e]"
                                          >
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        )
                                      }
                                      return <code {...props} className="bg-[#242424] px-1.5 py-0.5 rounded text-[11px] text-[#E8715A]">{children}</code>
                                    }
                                  }}
                                >
                                  {typeof m.content === 'object' ? JSON.stringify(m.content, null, 2) : m.content}
                                </ReactMarkdown>
                              </div>
                              
                              {m.citations && m.citations.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-[#2e2e2e]">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Sources & Citations</p>
                                  <div className="flex flex-col gap-1.5">
                                    {m.citations.map((cit, idx) => (
                                      <a key={idx} href={cit.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-[11px] text-neutral-400 hover:text-[#E8715A] transition-colors p-2 rounded-lg bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#E8715A44]">
                                        <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 10H2a1 1 0 01-1-1V2a1 1 0 011-1h4M8 1h3v3M11 1L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span>{cit.text}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Validator Panel */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e2e2e] bg-[#161616]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                    <span className={dotCls(valStatus)} />
                    Validator LLM
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(valStatus)}`}>
                    {valStatus === "idle" ? "waiting" : valStatus}
                  </span>
                </div>
                <div ref={valRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {valMsgs.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-700 text-[13px]">
                      <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M14 3L24 8V15C24 20.5 19.5 25.3 14 27C8.5 25.3 4 20.5 4 15V8L14 3Z" stroke="currentColor" strokeWidth="1.2"/><path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Validation output appears here
                    </div>
                  )}
                  {valMsgs.map((m) => (
                    <div key={m.id}>
                      {m.type === "user" && (
                        <div className="rounded-xl px-3.5 py-2.5 bg-[#242424] border border-[#2e2e2e] text-neutral-400 text-[13px] leading-relaxed">
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Input</p>
                          {m.text}
                        </div>
                      )}
                      {m.type === "thinking" && <Dots />}
                      {m.type === "val" && (
                        <div className="rounded-xl px-3.5 py-2.5 bg-[#0e1f18] border border-emerald-900/50 text-emerald-100/70 text-[13px] leading-relaxed">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 opacity-70 mb-1">Validator</p>
                          <span dangerouslySetInnerHTML={{ __html: m.text }} />
                        </div>
                      )}
                      {m.type === "metrics" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-2.5">
                            <p className="text-[18px] font-bold">{m.score}%</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">Confidence</p>
                          </div>
                          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-2.5">
                            <p className="text-[18px] font-bold">{m.issues}</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">Issues</p>
                          </div>
                          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-2.5"><MiniBar /></div>
                        </div>
                      )}
                      {m.type === "verdict" && (
                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold border ${m.pass ? "bg-[#0e1f18] border-emerald-900/50 text-emerald-500" : "bg-[#1f1408] border-amber-900/50 text-amber-400"}`}>
                          {m.pass ? "✓ All checks passed — document verified" : "! Partial pass — 1 item needs review"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── INPUT BAR ── */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[#141414] border-t border-[#2e2e2e]">
            <button className="w-9 h-9 shrink-0 rounded-lg border border-[#2e2e2e] flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M11.5 7.5L7 12C5.3 13.7 2.7 13.7 1 12-.7 10.3-.7 7.7 1 6L6.5.5C7.6-.6 9.4-.6 10.5.5 11.6 1.6 11.6 3.4 10.5 4.5L5 10C4.4 10.6 3.6 10.6 3 10 2.4 9.4 2.4 8.6 3 8L7.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <textarea
              rows={1}
              className="flex-1 bg-[#2a2a2a] border border-[#2e2e2e] focus:border-[#E8715A44] rounded-xl px-4 py-2.5 text-[13px] text-[#f0ece8] placeholder-neutral-600 outline-none resize-none leading-relaxed transition-colors"
              placeholder="Paste a link, upload a file, or type a query…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); } }}
            />
            <button onClick={analyze} disabled={running} className="flex items-center gap-2 px-5 py-2.5 bg-[#E8715A] hover:bg-[#f0907a] active:scale-95 disabled:opacity-50 text-white text-[13px] font-bold rounded-xl transition-all whitespace-nowrap">
              Analyze
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-neutral-700 uppercase tracking-widest py-2">Powered by Aegis AI · Secure Identity Layer</p>
        </div>
      </main>
    </div>
  );
}