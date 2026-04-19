import { useRef } from "react"
import SectionHeading from "@c/home/SectionHeading"
import useGsapReveal from "@/lib/useGsapReveal"

const rows = [
  {
    claim: "WHO declared climate change a global emergency in 2025.",
    status: "Unsupported",
    confidence: "18%",
    source: "No official WHO declaration found",
  },
  {
    claim: "India's UPI processed over 16 billion monthly transactions.",
    status: "Supported",
    confidence: "93%",
    source: "NPCI monthly dashboard",
  },
  {
    claim: "A 2024 Nature paper proved AGI benchmark parity.",
    status: "Uncertain",
    confidence: "46%",
    source: "Citation exists but claim overstates findings",
  },
]

const statusStyles = {
  Supported: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  Uncertain: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  Unsupported: "border-rose-300/30 bg-rose-400/10 text-rose-100",
}

function DemoPreviewSection() {
  const sectionRef = useRef(null)

  useGsapReveal(sectionRef)

  return (
    <section ref={sectionRef} id="demo" className="py-14 md:py-18" aria-label="Demo Preview">
      <div data-reveal-item>
      <SectionHeading
        eyebrow="Demo Preview"
        title="Structured audit output, ready to review"
        description="Every result includes clear status labeling, confidence, and source traceability for fast decision-making."
      />
      </div>

      <div data-reveal-item className="overflow-hidden rounded-2xl border border-white/15 bg-black/25 transition duration-300 hover:border-white/30">
        <div className="hidden grid-cols-[2.5fr_1fr_1fr_2fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/60 md:grid">
          <p>Claim</p>
          <p>Status</p>
          <p>Confidence</p>
          <p>Source</p>
        </div>

        <div className="divide-y divide-white/10">
          {rows.map((row) => (
            <article
              key={row.claim}
              className="grid gap-3 px-4 py-4 md:grid-cols-[2.5fr_1fr_1fr_2fr] md:items-center md:gap-4"
            >
              <p className="text-sm text-white/85">{row.claim}</p>
              <p>
                <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[row.status]}`}>
                  {row.status}
                </span>
              </p>
              <p className="text-sm text-white/80">{row.confidence}</p>
              <p className="text-sm text-white/65">{row.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DemoPreviewSection
