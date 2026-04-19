import { useRef } from "react"
import SectionHeading from "@c/home/SectionHeading"
import { Marquee } from "@c/ui/marquee"
import useGsapReveal from "@/lib/useGsapReveal"

const professionalUseCases = [
  "Researchers verifying reports and literature summaries",
  "Journalists fact-checking model-generated claims before publication",
  "Businesses validating AI insights used in strategic decisions",
]

const developerUseCases = [
  "API integration into internal review pipelines",
  "Debugging unstable or contradictory LLM outputs",
  "Building reliable AI systems with auditable verification layers",
]

function UseCasesSection() {
  const sectionRef = useRef(null)

  useGsapReveal(sectionRef)

  return (
    <section ref={sectionRef} id="use-cases" className="py-14 md:py-18" aria-label="Use Cases">
      <div data-reveal-item>
      <SectionHeading
        eyebrow="Use Cases"
        title="Designed for both operators and builders"
        description="TruthTrace supports teams that consume AI output and teams that ship AI-powered products."
      />
      </div>

      <div className="space-y-4">
        <article data-reveal-item className="overflow-hidden rounded-2xl border border-white/15 bg-black/25 p-5 transition duration-300 hover:border-white/30">
          <h3 className="mb-3 text-lg">Professional</h3>
          <Marquee pauseOnHover repeat={3} className="[--duration:28s] py-1">
            {professionalUseCases.map((item) => (
              <p
                key={item}
                className="mr-4 rounded-lg border border-white/10 bg-black/15 px-4 py-2 text-sm text-white/75"
              >
                {item}
              </p>
            ))}
          </Marquee>
        </article>

        <article data-reveal-item className="overflow-hidden rounded-2xl border border-white/15 bg-black/25 p-5 transition duration-300 hover:border-white/30">
          <h3 className="mb-3 text-lg">Developers</h3>
          <Marquee pauseOnHover reverse repeat={3} className="[--duration:26s] py-1">
            {developerUseCases.map((item) => (
              <p
                key={item}
                className="mr-4 rounded-lg border border-white/10 bg-black/15 px-4 py-2 text-sm text-white/75"
              >
                {item}
              </p>
            ))}
          </Marquee>
        </article>
      </div>
    </section>
  )
}

export default UseCasesSection
