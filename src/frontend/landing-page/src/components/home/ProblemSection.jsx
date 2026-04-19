import { useRef } from "react"
import SectionHeading from "@c/home/SectionHeading"
import useGsapReveal from "@/lib/useGsapReveal"

const problems = [
  {
    title: "Hallucinated facts at scale",
    description:
      "Language models can confidently state facts that are incomplete, outdated, or entirely incorrect. In high-stakes workflows, one unchecked claim can spread quickly.",
  },
  {
    title: "Fabricated citations",
    description:
      "AI output may include references that look real but do not exist, point to the wrong source, or misrepresent what the source actually says.",
  },
  {
    title: "Hidden confidence gaps",
    description:
      "Without structured verification, teams cannot separate reliable information from uncertain statements, making trust and accountability difficult.",
  },
]

function ProblemSection() {
  const sectionRef = useRef(null)

  useGsapReveal(sectionRef)

  return (
    <section ref={sectionRef} className="py-14 md:py-18" aria-label="Problem">
      <div data-reveal-item>
      <SectionHeading
        id="problem"
        eyebrow="Problem"
        title="Unverified AI answers create costly risk"
        description="AuthenX addresses the core reliability gap: AI can be fluent and still be wrong. Teams need traceable evidence, not just plausible wording."
      />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {problems.map((problem) => (
          <article
            key={problem.title}
            data-reveal-item
            className="rounded-2xl border border-white/15 bg-black/25 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-black/35"
          >
            <h3 className="text-lg">{problem.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">{problem.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProblemSection
