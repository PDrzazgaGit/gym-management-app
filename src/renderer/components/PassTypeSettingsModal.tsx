import React, { useState } from "react";
import {
    Modal,
    Form,
    Alert,
} from "react-bootstrap";
import { StyledButton } from "./StyledButton";
import { PassType } from "../../main/entities/PassType";
import { PassTypeManager } from "../ui-services/PassTypeManager";

interface ModalContextType {
    passType: PassType;
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactElement<any>;
}

export const PassTypeSettingsModal: React.FC<ModalContextType> = ({
    onSave,
    passType,
    children,
}) => {
    const passTypeManager = PassTypeManager.getInstance();

    const [show, setShow] = useState<boolean>(false);
    const [confirmDeletePass, setConfirmDeletePass] = useState<boolean>(false);
    const [entries, setEntries] = useState<number>(passType.entry);
    const [name, setName] = useState<string>(passType.name);
    const [description, setDescription] = useState<string>(passType.description);
    const [message, setMessage] = useState<string | null>(null);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setMessage(null);
        setConfirmDeletePass(false);
        onSave?.();
        setShow(false);
    };

    const handleSave = async () => {
        try {
            await passTypeManager.modify(passType.id, name, description, entries);
            handleClose();
        } catch (error: any) {
            setMessage(error.message || "Wystąpił błąd podczas zapisu");
        }
    };

    const handleDeletePassType = async () => {
        try {
            await passTypeManager.delete(passType.id);
            handleClose();
        } catch (error: any) {
            setMessage(error.message || "Wystąpił błąd podczas usuwania");
        }
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
            <Modal
                show={show}
                onHide={handleClose}
                size="lg"
                centered
                backdrop="static"
                keyboard={false}
                contentClassName="shadow rounded-3"
            >
                <Modal.Header
                    closeButton
                    className="bg-primary text-white border-0"
                >
                    <Modal.Title className="fw-semibold fs-5">
                        Szczegóły karnetu &quot;{passType.name}&quot;
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-4" style={{ textAlign: "justify" }}>
                        Modyfikacja danych karnetu. Zmiana liczby wejść dla danego rodzaju karnetu nie ma wpływu na
                        przypisane wejściówki. Nie można usunąć rodzaju karnetu, jeśli jest on przypisany do klienta.
                    </p>

                    <Form>
                        <Form.Group className="mb-3" controlId="passName">
                            <Form.Label className="fw-semibold">Nazwa</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="passDescription">
                            <Form.Label className="fw-semibold">Opis</Form.Label>
                            <Form.Control
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="passEntries">
                            <Form.Label className="fw-semibold">Wejścia</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                value={entries}
                                onChange={(e) => setEntries(Number(e.target.value))}
                            />
                        </Form.Group>

                        <Form.Group>
                            {confirmDeletePass ? (
                                <div className="d-flex gap-2">
                                    <StyledButton variant="danger" onClick={handleDeletePassType} className="me-2">
                                        Potwierdź usunięcie
                                    </StyledButton>
                                    <StyledButton variant="outline-secondary" onClick={() => setConfirmDeletePass(false)}>
                                        Anuluj
                                    </StyledButton>
                                </div>


                            ) : (
                                <StyledButton variant="outline-danger" onClick={() => setConfirmDeletePass(true)} className="me-2">
                                    Usuń karnet
                                </StyledButton>
                            )}
                        </Form.Group>
                    </Form>

                    {message && (
                        <Alert
                            variant="danger"
                            onClose={() => setMessage(null)}
                            dismissible
                            className="mt-4"
                        >
                            {message}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <StyledButton variant="outline-secondary" onClick={handleClose}>
                        Zamknij
                    </StyledButton>
                    <StyledButton variant="success" onClick={handleSave}>
                        Zapisz zmiany
                    </StyledButton>
                </Modal.Footer>
            </Modal>

            {clickableChild}
        </>
    );
};
