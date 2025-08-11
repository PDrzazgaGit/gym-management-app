import React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./components/Sidebar"
import { Container } from "react-bootstrap/esm"
import { SearchBar } from "./components/Searchbar"
import { ClientProvider } from "./react-context/ClientProvider"

export const App = () => {

    return (
        <div className="d-flex p-0 m-0">
            <Sidebar />
            <div className="flex-grow-1 p-0 m-0">
                 <ClientProvider>

                        <Outlet />
                        
                    </ClientProvider>
            </div>

        </div>
    )
}