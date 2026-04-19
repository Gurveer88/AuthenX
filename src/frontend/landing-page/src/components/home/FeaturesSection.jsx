import { useRef } from "react"
import SectionHeading from "@c/home/SectionHeading"
import { BentoGrid } from "@c/ui/bento-grid"
import useGsapReveal from "@/lib/useGsapReveal"

const features = [
  {
    title: "Claim Extraction",
    description:
      "Automatically separates generated text into individual factual claims, preserving context for precise verification.",
  },
  {
    title: "Source Verification",
    description:
      "Maps each claim to relevant references and flags weak, missing, or mismatched citations before they reach users.",
  },
  {
    title: "Confidence Scoring",
    description:
      "Scores evidence strength and claim reliability to prioritize reviewer attention where uncertainty is highest.",
  },
  {
    title: "Audit Report Export",
    description:
      "Generates portable reports for compliance, internal reviews, and product QA workflows.",
  },
]

function FeaturesSection() {
  const sectionRef = useRef(null)

  useGsapReveal(sectionRef)

  return (
    <section ref={sectionRef} className="py-14 md:py-18" aria-label="Features">
      <div data-reveal-item>
      <SectionHeading
        id="features"
        eyebrow="Features"
        title="Built for reliable AI operations"
        description="Core capabilities designed to help teams review outputs faster without losing verification depth."
      />
      </div>

      <BentoGrid className="auto-rows-auto grid-cols-1 md:grid-cols-6">
        {features.map((feature) => (
          <article
            key={feature.title}
            data-reveal-item
            className="col-span-1 rounded-2xl border border-white/15 bg-black/25 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-black/35 md:col-span-3"
          >
            <h3 className="text-lg">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">{feature.description}</p>
          </article>
        ))}
      </BentoGrid>
    </section>
  )
}

export default FeaturesSection
