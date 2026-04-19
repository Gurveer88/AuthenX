import Hero from "@c/home/Hero"
import ProblemSection from "@c/home/ProblemSection"
import SolutionSection from "@c/home/SolutionSection"
import FeaturesSection from "@c/home/FeaturesSection"
import UseCasesSection from "@c/home/UseCasesSection"
import DemoPreviewSection from "@c/home/DemoPreviewSection"
import Footer from "@c/home/Footer"

function Home() {
  return (
    <div
    className="text-white px-4 pb-10 md:px-8">
      <Hero/>
      <ProblemSection/>
      <SolutionSection/>
      <FeaturesSection/>
      <UseCasesSection/>
      <DemoPreviewSection/>
      <Footer/>
    </div>
  )
}

export default Home
