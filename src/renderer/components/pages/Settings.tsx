import React from "react"
import { Container, Card, Button, ListGroup } from "react-bootstrap"
import { OtherApi } from "../../../renderer/ui-services/OtherAPI"

export const Settings = () => {

    return (
        <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
            {/* Nagłówek u góry */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary fs-2 m-0">
                    Ustawienia
                </h2>
            </div>
            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    <Card.Title>
                        Skróty
                    </Card.Title>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="border-0">
                            <Button onClick={() => OtherApi.openFolder("log")}>
                                Folder logów
                            </Button>
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0">
                            <Button onClick={() => OtherApi.openFolder("config")}>
                                Folder konfiguracyjny
                            </Button>
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0">
                            <Button onClick={() => OtherApi.openFolder("db")}>
                                Folder z bazą danych
                            </Button>
                        </ListGroup.Item>
                    </ListGroup>




                </Card.Body>
            </Card>
        </Container>
    )
}