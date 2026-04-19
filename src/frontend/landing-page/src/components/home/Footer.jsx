import { useRef } from "react"
import useGsapReveal from "@/lib/useGsapReveal"

function Footer() {
  const footerRef = useRef(null)

  useGsapReveal(footerRef, {
    selector: "[data-reveal-item]",
    y: 16,
    duration: 0.6,
    stagger: 0.08,
    start: "top 92%",
  })

  return (
    <footer ref={footerRef} className="mt-8 border-t border-white/15 py-8 text-sm text-white/65">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-5">
        <p data-reveal-item className="tracking-wide">Trust, but Verify.</p>
        <div data-reveal-item className="flex items-center gap-4 uppercase tracking-wide">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-white">
            GitHub
          </a>
          <a href="#top" className="transition hover:text-white">
            About
          </a>
          <a href="mailto:contact@truthtrace.ai" className="transition hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
