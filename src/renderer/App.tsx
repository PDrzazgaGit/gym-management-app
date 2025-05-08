import React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./components/Sidebar"
import { Container } from "react-bootstrap/esm"
import { DbContext } from "./react-context/dbContext"
import { DbProvider } from "./react-context/DbProvider"

export const App = () => {

    return (
        <div className="d-flex">
      <Sidebar />
      <Container fluid className="p-4">
        <DbProvider>
            <Outlet />
        </DbProvider>
         
      </Container>
    </div>
    )
}


/*
 <DbProvider>
            
                <HashRouter>
               
                   <Routes>
                        <Route path="/" element={<Home />}></Route>
                        <Route path="/clients" element={
                            <DbProvider>
                                <Clients />
                            </DbProvider>
                        }>
                        </Route>
                        <Route path="/settings" element={<Settings />}></Route>
                        <Route path="/creator" element={<Creator />}></Route>
                    </Routes>
                </HashRouter>
            </DbProvider>
 

*/