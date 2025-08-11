import React, { useState } from "react";
import { FormControl, InputGroup, ListGroup, Modal } from "react-bootstrap";
import { StyledButton } from "./StyledButton";
import { TrainingSession } from "../../main/entities/TrainingSession";
import { TrainingSessionManager } from "../ui-services/TrainingSessionManager";
import { DateFormatter } from "../ui-services/DateFormatter";
import { TrainingSessionStatus } from "../../main/entities/TrainingSessionStatus";

interface ModalContextType {
    trainningSession: TrainingSession;
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactElement<any>;
}

export const TrainingSessionSettingsModal: React.FC<ModalContextType> = ({ onSave, trainningSession, children }) => {
    const trainingSessionManager = TrainingSessionManager.getInstance();

    const [show, setShow] = useState<boolean>(false);
    const [confirmCancel, setConfirmCancel] = useState<"client" | "owner" | null>(null);

    const [description, setDescription] = useState<string>(trainningSession.description);

    const [message, setMessage] = useState<string | null>(null);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        onSave && onSave();
        setShow(false);
        setConfirmCancel(null);
        setDescription(trainningSession.description);
        setMessage(null);
    };

    const handleSave = async () => {
        try {
            if (confirmCancel === "client") {
                await trainingSessionManager.cancelClient(trainningSession.id, description);
            } else if (confirmCancel === "owner") {
                await trainingSessionManager.cancelOwner(trainningSession.id, description);
            } else {
                await trainingSessionManager.modifyDescription(trainningSession.id, description);
            }
            handleClose();
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    const handleTypeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

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
                        <ListGroup.Item className="text-muted border-0" style={{ textAlign: "justify" }}>
                            Dane treningu
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0">{`Status: ${trainningSession.status}`}</ListGroup.Item>
                        <ListGroup.Item className="border-0">{`Utworzono ${DateFormatter.formatToDateOnly(trainningSession.createdAt)}`}</ListGroup.Item>
                        <ListGroup.Item className="border-0">{`Zaplanowano (data godzina): ${
                            trainningSession.plannedAt
                                ? DateFormatter.formatToDateWithHours(trainningSession.plannedAt)
                                : "Zaplanowano bez daty"
                        }`}</ListGroup.Item>
                        {trainningSession.status !== TrainingSessionStatus.CANCELED_CLIENT &&
                            trainningSession.status !== TrainingSessionStatus.CANCELED_OWNER && (
                                <>
                                    <ListGroup.Item className="border-0">
                                        {`Rozpoczęto: ${
                                            trainningSession.startsAt ? trainningSession.startsAt : "Oczekuje na rozpoczęcie"
                                        }`}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        {`Zakończono: ${
                                            trainningSession.endedAt ? trainningSession.endedAt : "Oczekuje na zakończenie"
                                        }`}
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        {`Czas trwania: ${
                                            trainningSession.startsAt && trainningSession.endedAt
                                                ? DateFormatter.diffInHoursAndMinutes(trainningSession.startsAt, trainningSession.endedAt)
                                                : "Brak danych"
                                        }`}
                                    </ListGroup.Item>
                                </>
                            )}

                        <ListGroup.Item className="text-muted border-0" style={{ textAlign: "justify" }}>
                            Opis
                        </ListGroup.Item>
                        <ListGroup.Item className="border-0">
                            <InputGroup>
                                <FormControl
                                    onChange={handleTypeDescription}
                                    value={description}
                                    type="text"
                                    placeholder={
                                        !confirmCancel
                                            ? undefined
                                            : "Powód odwołania (opcjonalne)"
                                    }
                                />
                            </InputGroup>
                        </ListGroup.Item>

                        {trainningSession.status === TrainingSessionStatus.PLANNED && !confirmCancel && (
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
                                        setDescription(trainningSession.description);
                                    }}
                                >
                                    Anuluj
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
                        <StyledButton variant="success" onClick={handleSave}>
                            Zapisz zmiany
                        </StyledButton>
                    )}
                </Modal.Footer>
            </Modal>
            {clickableChild}
        </>
    );
};
