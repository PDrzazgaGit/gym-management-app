import React from "react";
import { Col, Container, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

export const Sidebar: React.FC = () => {
    return (
        
        <Container className="bg-light" style={{ width: '250px' }}>
            <Row className="mt-4">
                <Col className="p-0">
                    <h4 className="text-center fs-2">Ewidencja</h4>
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