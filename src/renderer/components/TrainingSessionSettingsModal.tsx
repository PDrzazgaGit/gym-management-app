import React, { useEffect, useState } from "react";
import { Button, Col, Form, FormControl, InputGroup, ListGroup, Modal, Row } from "react-bootstrap";
import { TrainingSession } from "../../main/entities/TrainingSession";
import { TrainingSessionManager } from "../ui-services/TrainingSessionManager";
import { DateFormatter } from "../ui-services/DateFormatter";
import { TrainingSessionStatus } from "../../main/enums/TrainingSessionStatus";
import { useClient } from "../hooks/useClient";
import { redirect, useNavigate } from "react-router-dom";
import { ClientManager } from "../ui-services/ClientManager";
import { useTraining } from "../hooks/useTraining";

interface ModalContextType {
    trainingSession: TrainingSession;
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactElement<any>;
    showClient?: boolean;
}

export const TrainingSessionSettingsModal: React.FC<ModalContextType> = ({ onSave, trainingSession, children, showClient }) => {
    const trainingSessionManager = TrainingSessionManager.getInstance();
    const clientManager = ClientManager.getInstance();

    const navigate = useNavigate();
    const { setClient } = useClient();

    const { training, setTraining } = useTraining();

    const [show, setShow] = useState<boolean>(false);
    const [confirmButton, setConfirmButton] = useState<"client" | "owner" | "startTraining" | null>(null);

    const [description, setDescription] = useState<string>(trainingSession.description ?? '');
    const [plannedDateString, setPlannedDateString] = useState("");
    const [plannedHourString, setPlannedHourString] = useState("");
    const [plannedDate, setPlannedDate] = useState<Date | null>(null);

    const [message, setMessage] = useState<string | null>(null);

    const handleShow = () => setShow(true);

    const handleClose = () => {
        onSave && onSave();
        setShow(false);
        setConfirmButton(null);
        setDescription(description);
        setMessage(null);
        setPlannedDateString("");
        setPlannedDateString("");
        setPlannedDate(null);
    };

    const handleRedirect = async () => {
        const client = await clientManager.getByPass(trainingSession.pass.id);
        setClient(client);
        navigate('/clientpanel');
    }

    const handleSave = async () => {
        try {
            if (confirmButton === "client") {
                await trainingSessionManager.cancelClient(trainingSession.id, description);
            } else if (confirmButton === "owner") {
                await trainingSessionManager.cancelOwner(trainingSession.id, description);
            } else if (confirmButton === "startTraining") {
                const updated = await trainingSessionManager.start(trainingSession.id);
                setTraining(updated);
                navigate("/start");
            } else {

                await trainingSessionManager.modify(trainingSession.id, description, plannedDate);
            }
            handleClose();
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    const handleTypeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

    const handleReturnToStartPage = () => {
        if (trainingSession.status === TrainingSessionStatus.IN_PROGRESS && training != trainingSession) {
            setTraining(trainingSession);
            navigate("/start");
        }
    }

    const updatePlannedDate = (dateStr: string, timeStr: string) => {
        if (dateStr && timeStr) {
            const combined = new Date(`${dateStr}T${timeStr}`);
            setPlannedDate(combined);
        } else {
            setPlannedDate(null);
        }
    };

    useEffect(() => {
        if (trainingSession.plannedAt) {
            const dateObj = new Date(trainingSession.plannedAt);

            // Format: YYYY-MM-DD (dla <input type="date" />)
            const dateStr = dateObj.toISOString().split("T")[0];

            // Format: HH:MM (dla <input type="time" />)
            const timeStr = dateObj.toTimeString().slice(0, 5);

            setPlannedDateString(dateStr);
            setPlannedHourString(timeStr);
            setPlannedDate(dateObj);
        } else {
            // Jeśli brak daty w trainingSession
            setPlannedDateString("");
            setPlannedHourString("");
            setPlannedDate(null);
        }
    }, [trainingSession]);

    const clickableChild = React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
            children.props?.onClick?.(e);
            if (training && trainingSession.id === training.id) {
                navigate("/start")
            } else {
                handleShow();
            }
        },
        style: {
            ...(children.props.style || {}),
            cursor: "pointer",
        },
    });

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                centered
                backdrop="static"
                keyboard={false}
                contentClassName="shadow rounded-3"
                animation
                size="lg"
            >
                <Modal.Header closeButton className="bg-black text-white border-0">
                    <Modal.Title className="fw-semibold fs-5 mb-0">{`Szczegóły treningu`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="border-0">{`Status: ${trainingSession.status}`}</ListGroup.Item>
                                <ListGroup.Item className="border-0">{`Utworzono: ${DateFormatter.formatToDateOnly(trainingSession.createdAt)}`}</ListGroup.Item>
                                <ListGroup.Item className="border-0">{`${trainingSession.plannedAt
                                    ? `Zaplanowano na: ${DateFormatter.formatToDateWithHours(trainingSession.plannedAt)}`
                                    : "Zaplanowano bez daty"
                                    }`}</ListGroup.Item>
                                {trainingSession.status !== TrainingSessionStatus.CANCELED_CLIENT &&
                                    trainingSession.status !== TrainingSessionStatus.CANCELED_OWNER && (
                                        <>
                                            <ListGroup.Item className="border-0">
                                                {`${trainingSession.startsAt ? `Rozpoczęto: ${DateFormatter.formatToDateWithHours(trainingSession.startsAt)}` : "Oczekuje na rozpoczęcie"
                                                    }`}
                                            </ListGroup.Item>
                                            <ListGroup.Item className="border-0">
                                                {`${trainingSession.endedAt ? `Zakończono: ${DateFormatter.formatToDateWithHours(trainingSession.endedAt)}` : "Oczekuje na zakończenie"
                                                    }`}
                                            </ListGroup.Item>
                                            <ListGroup.Item className="border-0">
                                                {`Czas trwania: ${trainingSession.startsAt && trainingSession.endedAt
                                                    ? DateFormatter.diffInHoursAndMinutes(trainingSession.startsAt, trainingSession.endedAt)
                                                    : "Brak danych"
                                                    }`}
                                            </ListGroup.Item>
                                        </>
                                    )}
                                {(trainingSession.status === TrainingSessionStatus.CANCELED_CLIENT || trainingSession.status === TrainingSessionStatus.CANCELED_OWNER) && (
                                    <>
                                        <ListGroup.Item className="border-0">
                                            {`${trainingSession.endedAt ? `Odwołano: ${DateFormatter.formatToDateOnly(trainingSession.endedAt)}` : "Brak danych"
                                                }`}
                                        </ListGroup.Item>
                                    </>
                                )}
                                <ListGroup.Item className="border-0">
                                    <Form.Group>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            onChange={handleTypeDescription}
                                            value={description}
                                            type="text"
                                            placeholder={
                                                !confirmButton || confirmButton === "startTraining"
                                                    ? "Wpisz opisz"
                                                    : "Powód odwołania (opcjonalne)"
                                            }
                                        />
                                    </Form.Group>
                                </ListGroup.Item>
                                {showClient && (
                                    <ListGroup.Item className="border-0">
                                        <Button variant="outline-black" onClick={handleRedirect}>
                                            Strona klienta
                                        </Button>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Col>
                        {trainingSession.status != TrainingSessionStatus.COMPLETED && (
                            <Col>
                                <ListGroup variant="flush">
                                    {trainingSession.status === TrainingSessionStatus.PLANNED && (
                                        <ListGroup.Item className="border-0">
                                            <Form.Group className="mb-2">
                                                <Form.Label className="fw-semibold">Data</Form.Label>
                                                <Form.Control type="date" value={plannedDateString} onChange={(e) => {
                                                    setPlannedDateString(e.target.value);
                                                    updatePlannedDate(e.target.value, plannedHourString);
                                                }} disabled={plannedHourString != ""} />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">Godzina</Form.Label>
                                                <Form.Control type="time" value={plannedHourString} onChange={(e) => {
                                                    setPlannedHourString(e.target.value);
                                                    updatePlannedDate(plannedDateString, e.target.value);
                                                }} disabled={!plannedDateString} />
                                            </Form.Group>
                                        </ListGroup.Item>
                                    )}


                                    {trainingSession.status === TrainingSessionStatus.IN_PROGRESS && !confirmButton && (
                                        <ListGroup.Item className="border-0">
                                            <Button
                                                variant="outline-black"
                                                onClick={handleReturnToStartPage}
                                            >
                                                Powrót do podglądu
                                            </Button>
                                        </ListGroup.Item>

                                    )}

                                    {trainingSession.status === TrainingSessionStatus.PLANNED && !confirmButton && (
                                        <ListGroup.Item className="border-0">
                                            <Button
                                                variant="gym"
                                                onClick={() => setConfirmButton("startTraining")}
                                            >
                                                Rozpocznij trening bez karty
                                            </Button>
                                        </ListGroup.Item>

                                    )}



                                    {trainingSession.status === TrainingSessionStatus.PLANNED && !confirmButton && (
                                        <>
                                            <ListGroup.Item className="border-0">
                                                <Button
                                                    variant="outline-black"
                                                    onClick={() => {
                                                        setConfirmButton("client");
                                                        setDescription("");
                                                    }}
                                                >
                                                    Klient odwołał trening
                                                </Button>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="border-0">
                                                <Button
                                                    variant="outline-black"
                                                    onClick={() => {
                                                        setConfirmButton("owner");
                                                        setDescription("");
                                                    }}
                                                >
                                                    Odwołaj trening
                                                </Button>
                                            </ListGroup.Item>
                                        </>
                                    )}

                                    {confirmButton && (
                                        <ListGroup.Item className="border-0 d-flex gap-2">
                                             
                                            <Button variant={confirmButton === "startTraining" ? "success" : "danger"} onClick={handleSave}>{ }
                                                {confirmButton === "startTraining" ? "Potwierdź rozpoczęcie" : "Potwierdź odwołanie"}
                                            </Button>
                                            <Button
                                                variant="outline-black"
                                                onClick={() => {
                                                    setConfirmButton(null);
                                                    setDescription(trainingSession.description);
                                                }}
                                            >
                                                Anuluj
                                            </Button>
                                           
                                        </ListGroup.Item>
                                    )}


                                    {message && (
                                        <ListGroup.Item className="border-0 text-center" style={{ textAlign: "justify" }}>
                                            {message}
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            </Col>
                        )}

                    </Row>

                </Modal.Body>
                <Modal.Footer className="border-0 p-1 bg-gym d-flex justify-content-end">
                    
                    {/* Pokaż przycisk "Zapisz zmiany" tylko, gdy nie czekamy na potwierdzenie odwołania */}
                    {!confirmButton && (
                        <Button variant="black" onClick={handleSave} disabled={plannedDateString && !plannedHourString}>
                            Zapisz zmiany
                        </Button>
                    )}
                    <Button variant="outline-black" onClick={handleClose}>
                        Zamknij
                    </Button>
                </Modal.Footer>
            </Modal>
            {clickableChild}
        </>
    );
};
