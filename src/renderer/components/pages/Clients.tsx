import React, { useEffect, useState } from "react"
import { Col, Container, FormControl, InputGroup, Row, Table } from "react-bootstrap"
import { StyledButton } from "../StyledButton"
import { Search } from "react-bootstrap-icons"
import { Client } from "../../../main/entities/Client"

export const Clients = () => {

    const [client, setClient] = useState<Client[] | undefined>(undefined);

    const [search, setSearch] = useState<string>('');

    const getClient = async () => {
        const result = await (window as any).database.getAll();
        setClient(result);
    }

    useEffect(() => {
        if (!client) {
            getClient();
        }
    })


    const handleTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
    }

    const handleSearch = async () => {
        const result = await (window as any).database.findClient(search, true, true, false);
        setClient(result);
    }

    return (
        <Container>
            <Row className="mb-2">
                <h3 className="text-center text-muted">Znajdź osobę</h3>
            </Row>
            <Row className="mb-4">
                <InputGroup>
                    <FormControl type="search"
                        onChange={handleTypeSearch}
                        value={search}
                    ></FormControl>
                    <StyledButton
                        onClick={handleSearch}
                    >
                        <Search />
                    </StyledButton>
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
                                <th className="text-muted">NAZWISKO (ALIAS)</th>
                                <th className="text-muted">TELEFON</th>
                                <th className="text-muted">KARNET</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client &&
                                client.map((clientData, index) => (
                                    <tr key={clientData.id}>
                                        <td>{index + 1}.</td>
                                        <td>{clientData.name}</td>
                                        <td>{clientData.surname}{clientData.alias != undefined ? ` (${clientData.alias})` : ""}</td>
                                        <td>{clientData.phone ? clientData.phone : '-'}</td>
                                        <td>{clientData.pass ? "TAK" : 'NIE'}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Col>

            </Row>


        </Container>
    )
}