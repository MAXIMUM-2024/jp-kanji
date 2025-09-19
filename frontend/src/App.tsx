import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./components/header"
import Home from "./components/home"
import About from "./components/about"

function App() {

  return (
    <BrowserRouter>
      <Header  />
      <div className="h-screen pt-[40px] overflow-hidden">
      <Routes>
            <Route path='/' element={ <Home /> } />
            <Route path='/about' element={ <About />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
