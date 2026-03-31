import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom' // 1. Import BrowserRouter
import Register from './pages/Register'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    // 2. Wrap your app in the BrowserRouter
    <BrowserRouter>
        <Register />
        <div>hello</div>
    </BrowserRouter>
  )
}

export default App