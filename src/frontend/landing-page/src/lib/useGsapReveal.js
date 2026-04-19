import { useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

function useGsapReveal(scopeRef, options = {}) {
  const {
    selector = "[data-reveal-item]",
    y = 24,
    duration = 0.8,
    stagger = 0.12,
    start = "top 82%",
  } = options

  useLayoutEffect(() => {
    if (!scopeRef?.current) return undefined

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(selector)

      if (!items.length) return

      gsap.set(items, { autoAlpha: 0, y })
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeRef.current,
          start,
          once: true,
        },
      })
    }, scopeRef)

    return () => ctx.revert()
  }, [duration, scopeRef, selector, stagger, start, y])
}

export default useGsapReveal
