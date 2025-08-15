import React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./components/Sidebar"
import { TrainingProvider } from "./react-context/TrainingProvider"

export const App = () => {

    return (
        <div className="d-flex p-0 m-0">
            <Sidebar />
            <div className="flex-grow-1 p-0 m-0">
                 <TrainingProvider>

                        <Outlet />
                        
                    </TrainingProvider>
            </div>

        </div>
    )
}