import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import MergePage from './components/MergePage.jsx'
import SplitPage from './components/SplitPage.jsx'
import HomePage from './components/HomePage.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            {/* <Route path="/edit-pdf" element={<EditPage/>}/> */}
            <Route path="/merge-pdf" element={<MergePage/>}/>
            <Route path="/split-pdf" element={<SplitPage/>}/>
            <Route path="/*" element={<HomePage/>}/>
        </Routes>
    </BrowserRouter>
)
