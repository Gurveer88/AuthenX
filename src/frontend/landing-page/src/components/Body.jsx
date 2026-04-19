import { Outlet } from "react-router-dom"
import Silk from './Silk';
import Navbar from "./nav/Navbar"

function Body() {
  return (
    <div
    className="

    relative min-h-dvh w-full">
      <Navbar className={"relative z-10"}/>

      <div
      className="fixed top-0 left-0 h-full w-full">
        <Silk
          speed={3}
          scale={0.7}
          color="#E8715A"
          noiseIntensity={1.7}
          rotation={4.97}
        />
      </div>

      <div
      className="relative z-10 mx-auto
      max-w-7xl
      ">
        <Outlet />
      </div>
    </div>
  )
}

export default Body
