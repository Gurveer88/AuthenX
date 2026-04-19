import { Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Home from "./pages/Home";



function App() {
  return (
    <div
    className="font-Poppins">
      <Routes>
        <Route path="/" element={<Body/>} >
          <Route index element={<Home />}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App;
