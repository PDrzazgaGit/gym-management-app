import React from "react"
import { Col, Container, FormControl, InputGroup, Row, Table } from "react-bootstrap"
import { StyledButton } from "../StyledButton"
import { Search } from "react-bootstrap-icons"

export const Clients = () => {
    return (
        <Container>
            <Row className="mb-2">
                <h3 className="text-center text-muted">Znajdź osobę</h3>
            </Row>
            <Row className="mb-4">
                <InputGroup>
                    <FormControl type="search"></FormControl><StyledButton><Search /></StyledButton>
                </InputGroup>
            </Row>
            <Row className="mb-2">
                <h3 className="text-center text-muted">Lista</h3>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="text-muted">LP.</th>
                                <th className="text-muted">IMIĘ</th>
                                <th className="text-muted">NAZWISKO</th>
                                <th className="text-muted">TELEFON</th>
                                <th className="text-muted">WIĘCEJ</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </Table>
                </Col>

            </Row>


        </Container>
    )
}