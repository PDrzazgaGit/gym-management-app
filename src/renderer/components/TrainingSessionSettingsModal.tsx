import React, { useEffect, useState } from "react";
import { Form, FormControl, InputGroup, ListGroup, Modal } from "react-bootstrap";
import { StyledButton } from "./StyledButton";
import { TrainingSession } from "../../main/entities/TrainingSession";
import { TrainingSessionManager } from "../ui-services/TrainingSessionManager";
import { DateFormatter } from "../ui-services/DateFormatter";
import { TrainingSessionStatus } from "../../main/enums/TrainingSessionStatus";
import { useClient } from "../hooks/useClient";
import { useNavigate } from "react-router-dom";
import { ClientManager } from "../ui-services/ClientManager";

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

    const [show, setShow] = useState<boolean>(false);
    const [confirmCancel, setConfirmCancel] = useState<"client" | "owner" | null>(null);

    const [description, setDescription] = useState<string>(trainingSession.description);
    const [plannedDateString, setPlannedDateString] = useState("");
    const [plannedHourString, setPlannedHourString] = useState("");
    const [plannedDate, setPlannedDate] = useState<Date | null>(null);

    const [message, setMessage] = useState<string | null>(null);

    const handleShow = () => setShow(true);

    const handleClose = () => {
        onSave && onSave();
        setShow(false);
        setConfirmCancel(null);
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
            if (confirmCancel === "client") {
                await trainingSessionManager.cancelClient(trainingSession.id, description);
            } else if (confirmCancel === "owner") {
                await trainingSessionManager.cancelOwner(trainingSession.id, description);
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
            handleShow();
        },
        style: {
            ...(children.props.style || {}),
            cursor: "pointer",
        },
    });

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>{`Szczegóły treningu`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="fw-semibold border-0" style={{ textAlign: "justify" }}>
                            Dane treningu
                        </ListGroup.Item>
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
                                        {`${trainingSession.startsAt ? `Rozpoczęto: ${trainingSession.startsAt}` : "Oczekuje na rozpoczęcie"
                                            }`}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        {`${trainingSession.endedAt ? `Zakończono: ${trainingSession.endedAt}` : "Oczekuje na zakończenie"
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
                                <Form.Label className="fw-semibold">
                                    Opis
                                </Form.Label>
                                <Form.Control
                                    onChange={handleTypeDescription}
                                    value={description}
                                    type="text"
                                    placeholder={
                                        !confirmCancel
                                            ? undefined
                                            : "Powód odwołania (opcjonalne)"
                                    }
                                />
                            </Form.Group>
                        </ListGroup.Item>

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




                        {trainingSession.status === TrainingSessionStatus.PLANNED && !confirmCancel && (
                            <>
                                <ListGroup.Item className="border-0">
                                    <StyledButton
                                        variant="outline-danger"
                                        onClick={() => {
                                            setConfirmCancel("client");
                                            setDescription("");
                                        }}
                                    >
                                        Klient odwołał trening
                                    </StyledButton>
                                </ListGroup.Item>
                                <ListGroup.Item className="border-0">
                                    <StyledButton
                                        variant="outline-danger"
                                        onClick={() => {
                                            setConfirmCancel("owner");
                                            setDescription("");
                                        }}
                                    >
                                        Odwołaj trening
                                    </StyledButton>
                                </ListGroup.Item>
                            </>
                        )}

                        {confirmCancel && (
                            <ListGroup.Item className="border-0 d-flex gap-2">
                                <StyledButton variant="danger" onClick={handleSave}>
                                    Potwierdź odwołanie
                                </StyledButton>
                                <StyledButton
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setConfirmCancel(null);
                                        setDescription(trainingSession.description);
                                    }}
                                >
                                    Anuluj
                                </StyledButton>
                            </ListGroup.Item>
                        )}


                        {showClient && (
                            <ListGroup.Item className="border-0">
                                <StyledButton variant="outline-primary" onClick={handleRedirect}>
                                    Strona klienta
                                </StyledButton>
                            </ListGroup.Item>
                        )}

                        {message && (
                            <ListGroup.Item className="border-0 text-center" style={{ textAlign: "justify" }}>
                                {message}
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <StyledButton variant="outline-secondary" onClick={handleClose}>
                        Anuluj
                    </StyledButton>
                    {/* Pokaż przycisk "Zapisz zmiany" tylko, gdy nie czekamy na potwierdzenie odwołania */}
                    {!confirmCancel && (
                        <StyledButton variant="success" onClick={handleSave} disabled={plannedDateString && !plannedHourString}>
                            Zapisz zmiany
                        </StyledButton>
                    )}
                </Modal.Footer>
            </Modal>
            {clickableChild}
        </>
    );
};
