import { useMemo, useRef } from "react"
import { AnimatedBeam } from "@c/ui/animated-beam"
import SectionHeading from "@c/home/SectionHeading"
import useGsapReveal from "@/lib/useGsapReveal"

const steps = [
  {
    title: "Claim Extraction",
    description:
      "Parse generated text into atomic, checkable claims with context and entity tagging.",
  },
  {
    title: "Evidence Retrieval",
    description:
      "Search trusted documents, references, and indexed sources for supporting or contradicting evidence.",
  },
  {
    title: "Verification & Classification",
    description:
      "Classify each claim as supported, uncertain, or unsupported with confidence scoring and source links.",
  },
]

function SolutionSection() {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const stepRefs = useMemo(() => steps.map(() => ({ current: null })), [])

  useGsapReveal(sectionRef)

  return (
    <section ref={sectionRef} className="py-14 md:py-18" aria-label="Solution">
      <div data-reveal-item>
      <SectionHeading
        id="solution"
        eyebrow="Solution"
        title="A transparent verification workflow"
        description="TruthTrace turns model output into a repeatable audit pipeline so decisions are grounded in evidence, not assumptions."
      />
      </div>

      <div
        ref={containerRef}
        className="relative grid gap-4 md:grid-cols-3"
      >
        {steps.map((step, index) => (
          <article
            key={step.title}
            ref={stepRefs[index]}
            data-reveal-item
            className="rounded-2xl border border-white/15 bg-black/25 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-black/35"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Step {index + 1}</p>
            <h3 className="mt-2 text-lg">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">{step.description}</p>
          </article>
        ))}

        {stepRefs[0]?.current && stepRefs[1]?.current ? (
          <AnimatedBeam
            className="hidden md:block"
            containerRef={containerRef}
            fromRef={stepRefs[0]}
            toRef={stepRefs[1]}
            curvature={30}
            pathColor="rgba(255,255,255,0.2)"
            gradientStartColor="#ffffff"
            gradientStopColor="#a3a3a3"
            pathWidth={2}
            duration={4}
          />
        ) : null}

        {stepRefs[1]?.current && stepRefs[2]?.current ? (
          <AnimatedBeam
            className="hidden md:block"
            containerRef={containerRef}
            fromRef={stepRefs[1]}
            toRef={stepRefs[2]}
            curvature={30}
            pathColor="rgba(255,255,255,0.2)"
            gradientStartColor="#ffffff"
            gradientStopColor="#a3a3a3"
            pathWidth={2}
            duration={4}
            delay={0.4}
          />
        ) : null}
      </div>
    </section>
  )
}

export default SolutionSection
