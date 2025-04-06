import React from "react"
import { HashRouter, Routes, Route } from "react-router-dom"

export const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<></>}></Route>
            </Routes>
        </HashRouter>
    )
}