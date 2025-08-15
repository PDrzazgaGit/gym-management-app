import React from "react";
import { Col, Container, Nav, Row, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

//#D7F902

interface SidebarProps {
    width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ width }) => {

    const logo = require("../assets/logo.jpg")

    const defaultWidth = 250;
    return (

        <Container className="bg-black"

            style={{
                width: `${width ? width : defaultWidth}px`,
                minHeight: '100vh'
            }}>
            <Row>
                <Col className="p-0">
                    <Image src={logo} width={width ? width : defaultWidth} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Nav className="d-flex flex-column fs-2 align-items-center">

                        <Nav.Link as={Link} to="/start" className="text-sidebar"> Start </Nav.Link>
                        <Nav.Link as={Link} to="/trainings" className="text-sidebar">Treningi</Nav.Link>
                        <Nav.Link as={Link} to="/passes" className="text-sidebar">Karnety</Nav.Link>
                        <Nav.Link as={Link} to="/clients" className="text-sidebar">Klienci</Nav.Link>
                        <Nav.Link className="text-sidebar">Ustawienia</Nav.Link>

                    </Nav>
                </Col>

            </Row>


        </Container>
    );
}

/*

<div className="d-flex flex-column bg-light vh-100" style={{ width: '250px' }}>

            <h4 className="mb-4">Ewidencja treningów</h4>
            <Nav defaultActiveKey="/clients" className="flex-column">
                <Nav.Link as={Link} to="/clients">🧍 Klienci</Nav.Link>
                <Nav.Link>🏷️ Karnety</Nav.Link>
                <Nav.Link>🏋️ Treningi</Nav.Link>
                <Nav.Link>📊 Statystyki</Nav.Link>
                <Nav.Link>⚙️ Ustawienia</Nav.Link>
            </Nav>
        </div>

*/