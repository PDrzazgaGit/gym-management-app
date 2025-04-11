import React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { Link } from "react-router-dom"

export const Menubar = () => {
    return (
        <Navbar expand="lg" className="bg-body-tertiary mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">Ewidencja</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/clients">Klienci</Nav.Link>
                        <Nav.Link>Treningi</Nav.Link>
                        <Nav.Link>Karnety</Nav.Link>
                        <Nav.Link as={Link} to="/creator">Kreator</Nav.Link>
                        <Nav.Link as={Link} to="/settings">Ustawienia</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}