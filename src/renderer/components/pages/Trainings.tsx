import React, { useEffect, useState } from "react";
import { Container, Row, Col, InputGroup, Card, FormCheck, Table, Form, Button, DropdownButton, Dropdown } from "react-bootstrap";
import { TrainingSessionSettingsModal } from "../TrainingSessionSettingsModal";
import { TrainingSessionManager } from "../../../renderer/ui-services/TrainingSessionManager";
import { TrainingSession } from "../../../main/entities/TrainingSession";
import { DateFormatter } from "../../../renderer/ui-services/DateFormatter";
import { StyledButton } from "../StyledButton";
import { TrainingsDayFilter } from "../../../main/enums/TrainingsDayFilter";
import { TrainingList } from "../TrainingList";



export const Trainings = () => {

    return (
        <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary fs-2 m-0">
                    Ewidencja treningów
                </h2>
            </div>
            
            <TrainingList></TrainingList>

        </Container>

    );
}

/*
<Card className="mb-3 shadow-sm">
                <Card.Body>
                    <Card.Title className="text-muted">Filtr treningów</Card.Title>
                    <Form.Group  className="mb-2">
                        <InputGroup className="flex-wrap">
                            {Object.entries(searchFilters).map(([key, value]) => (
                                <Form.Check
                                    key={key}
                                    inline
                                    label={key === "clientCancel" ? "Odwołane (klient)" : key === "ownerCancel" ? "Odwołane" : key.charAt(0).toUpperCase() + key.slice(1)}
                                    checked={value}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                                    className="me-2"
                                    id={`check_${key}`}
                                />
                            ))}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <InputGroup>
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-primary">{
                                    trainingsDayFilter === TrainingsDayFilter.GETBYDAY && !trainingDay ? `Dzisiaj` : trainingsDayFilter
                                }</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETALL)}>{TrainingsDayFilter.GETALL}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETBYDAY)}>{TrainingsDayFilter.GETBYDAY}</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETBYWEEK)}>{TrainingsDayFilter.GETBYWEEK}</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Form.Control type="date" value={trainingDayString} onChange={(e) => {
                                setTrainingDayString(e.target.value);
                                if (e.target.value) {
                                    setTrainingDay(new Date(`${e.target.value}`))
                                } else {
                                    setTrainingDay(null)
                                };
                            }} />
                            <Button variant="outline-danger" onClick={handleClearDate}>
                                Wyczyść
                            </Button>
                        </InputGroup>

                    </Form.Group>
                    

                </Card.Body>
            </Card>

            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    <Card.Title className="text-muted">
                        {getTableTitle()}
                    </Card.Title>
                    <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                        <Table hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>LP.</th>
                                    <th>Klient</th>
                                    <th>Status</th>
                                    <th>Data planowana</th>
                                    <th>Opis</th>

                                </tr>
                            </thead>
                            <tbody>
                                {trainingSessions?.map((session, index) => (
                                    <TrainingSessionSettingsModal showClient
                                        key={session.id}
                                        trainingSession={session}
                                        onSave={() => {
                                            setRefreshTrainings(prev => prev + 1);
                                        }}
                                    >
                                        <tr>
                                            <td>{index + 1}</td>
                                            <td>{`${session.pass.client.name} ${session.pass.client.surname}${session.pass.client.alias ? ` (${session.pass.client.alias})` : ''}`}</td>
                                            <td>{session.status}</td>
                                            <td>{session.plannedAt ? DateFormatter.formatToDateWithHours(session.plannedAt) : "Brak danych"}</td>
                                            <td>{session.description}</td>

                                        </tr>
                                    </TrainingSessionSettingsModal>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

*/