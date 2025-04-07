import React from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { DbProvider } from "./react-context/DbProvider"
import { Home } from "./components/Home"

export const App = () => {

    return (  
        <DbProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home/>}></Route>
                </Routes>
            </HashRouter>
        </DbProvider>
        
    )
}