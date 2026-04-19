import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { NAV, BTNS } from "@u/constants/NavData"


function Navbar({className}) {
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  const handleDemoClick = (event) => {
    event.preventDefault()
    window.location.href = "/app/"
  }

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrollingDown(currentScrollY > 0)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
    className={`${className}
    text-white sticky top-5 z-40 transition-all duration-300 py-4
    ${isScrollingDown ? "max-w-7xl bg-black/30 backdrop-blur-sm" : "max-w-400"}
    mx-auto px-4 md:px-8 rounded-2xl
    flex justify-between items-center my-5
    `}>
      <div
      className="flex
      gap-3 items-center">
        <Link to="/" className="text-sm uppercase tracking-[0.22em]">
          AuthenX
        </Link>

        <p className="text-white/40">/</p>

        {
          NAV.map( ({title,url},i) => (
            <a
            key={i}
            href={url}
            onClick={title.toLowerCase().includes("demo") ? handleDemoClick : undefined}
            className="uppercase text-xs text-white/75 transition hover:text-white"
            >
              {title}
            </a>
          ) )
        }

      </div>

      <div
      className="flex gap-5 ">
        {
          BTNS.map( ({title, url}, i) => (
            <a
            key={i}
            href={url}
            onClick={title.toLowerCase().includes("demo") ? handleDemoClick : undefined}
            target={url?.startsWith("http") ? "_blank" : undefined}
            rel={url?.startsWith("http") ? "noreferrer" : undefined}
            className="text-xs px-3 py-1 border
            border-white/40 rounded-lg
            flex gap-2 uppercase items-center
            transition hover:border-white hover:bg-white/10
            "
            >
              {title}
            </a>
          ) )
        }
      </div>

    </div>
  )
}

export default Navbar
