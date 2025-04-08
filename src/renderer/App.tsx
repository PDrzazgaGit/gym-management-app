import React from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { DbProvider } from "./react-context/DbProvider"
import { Home } from "./components/pages/Home"
import { Menubar } from "./components/Menubar"
import { Settings } from "./components/pages/Settings"
import { Clients } from "./components/pages/Clients"

export const App = () => {

    return (
        <>
           
            <DbProvider>
                <HashRouter>
                <Menubar />
                    <Routes>
                        <Route path="/" element={<Home />}></Route>
                        <Route path="/clients" element={<Clients />}></Route>
                        <Route path="/settings" element={<Settings />}></Route>
                    </Routes>
                </HashRouter>
            </DbProvider>
        </>
    )
}