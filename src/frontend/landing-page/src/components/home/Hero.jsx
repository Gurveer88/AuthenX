import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@c/ui/terminal"
import { Marquee } from "@c/ui/marquee"

const trustHighlights = [
  "Evidence-linked answers",
  "Claim-level verification",
  "Fast hallucination detection",
  "Auditable AI workflows",
]

function Hero() {
  const rootRef = useRef(null)

  const handleDemoRedirect = () => {
    window.location.href = "/app/"
  }

  useLayoutEffect(() => {
    if (!rootRef.current) return undefined

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } })

      timeline
        .from("[data-hero-label]", { y: 18, autoAlpha: 0, duration: 0.45 })
        .from("[data-hero-title]", { y: 22, autoAlpha: 0, duration: 0.55 }, "-=0.2")
        .from("[data-hero-copy]", { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .from("[data-hero-cta]", { y: 16, autoAlpha: 0, duration: 0.45 }, "-=0.2")
        .from("[data-hero-marquee]", { y: 18, autoAlpha: 0, duration: 0.45 }, "-=0.2")
        .from("[data-hero-terminal]", { y: 28, autoAlpha: 0, scale: 0.98, duration: 0.7 }, "-=0.35")
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
    ref={rootRef}
    id="top"
    className="
    grid grid-cols-1 lg:grid-cols-2
    min-h-144 gap-10 pt-8 pb-16
    "
    >
      <div
      className="flex flex-col
      justify-center gap-6
      ">
        <p
        data-hero-label
        className="text-sm uppercase tracking-[0.28em] text-white/70">
          TruthTrace • AI Hallucination Auditor
        </p>
        <p
        data-hero-title
        className="text-4xl leading-tight md:text-6xl">
          Make AI Outputs Verifiable
        </p>
        <p
        data-hero-copy
        className="max-w-xl text-base font-medium text-white/75 md:text-lg">
          Audit every claim. Detect hallucinations. Build trust in AI-generated content.
        </p>
        <p data-hero-copy className="max-w-2xl text-sm text-white/60 md:text-base">
          TruthTrace helps teams move from guesswork to evidence-backed AI usage. From a single chatbot response to enterprise-scale model workflows, every statement is extracted, traced to sources, and graded for reliability in seconds.
        </p>

        <div data-hero-cta className="flex flex-wrap items-center gap-3 pt-2">
          <button
          type="button"
          onClick={handleDemoRedirect}
          className="rounded-lg border border-white/40 px-5 py-2 text-sm font-semibold uppercase tracking-wide transition hover:border-white hover:bg-white/10">
            Try Demo
          </button>
          <a
          href="#use-cases"
          className="rounded-lg border border-white/25 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/45 hover:text-white">
            View Use Cases
          </a>
        </div>

        <div
        data-hero-marquee
        className="max-w-xl overflow-hidden rounded-xl border border-white/15 bg-black/20">
          <Marquee pauseOnHover repeat={3} className="[--duration:20s] py-2">
            {trustHighlights.map((item) => (
              <p key={item} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/75">
                {item}
              </p>
            ))}
          </Marquee>
        </div>
      </div>

      <div
      data-hero-terminal
      className="flex items-center justify-center">
        <Terminal className="border-white/20 bg-black/35">
          <TypingAnimation>$ AuthenX audit response.json --strict</TypingAnimation>
          <AnimatedSpan>✓ 14 claims extracted from AI response</AnimatedSpan>
          <AnimatedSpan>✓ 11 claims verified against primary sources</AnimatedSpan>
          <AnimatedSpan>⚠ 2 claims missing sufficient evidence</AnimatedSpan>
          <AnimatedSpan>✕ 1 fabricated citation detected</AnimatedSpan>
          <TypingAnimation>Report generated: audit-2026-04-19.json</TypingAnimation>
        </Terminal>
      </div>

    </div>
  )
}

export default Hero
