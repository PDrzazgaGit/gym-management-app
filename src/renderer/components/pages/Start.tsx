import React from "react"
import { Card, Container, Form } from "react-bootstrap"
import { useTraining } from "../../../renderer/hooks/useTraining"


export const Start = () => {

    const {training} = useTraining();

    return (
        <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    <Card.Title className="text-muted">Rozpocznij trening</Card.Title>
                    <Form.Group className="mb-2"></Form.Group>
                </Card.Body>
            </Card>
        </Container>
    )
}

/*

TO DO:

Widok rozpoczętego treningu.

LOGIC FLOW: scan karty -> (UUID) -> pass.getByUUID -> (PASS) -> | getTrainingsByPass -> (TRAININGSESSION) -> start TS
                                                                | (Zacznij nieplanowany trening) -> createTrainingSession (TRAININGSESSION) -> start TS

Obsługa czytnika

Szyfrowanie danych

*/