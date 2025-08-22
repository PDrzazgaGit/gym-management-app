import React, { useState } from "react";
import {
    Modal,
    Form,
    Alert,
    Button,
} from "react-bootstrap";
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
                centered
                backdrop="static"
                keyboard={false}
                contentClassName="shadow rounded-3"
                animation
                 size="lg"
            >
                <Modal.Header
                    closeButton
                    className="bg-black text-white border-0"
                >
                    <Modal.Title className="fw-semibold fs-5 mb-0">
                        Szczegóły karnetu &quot;{passType.name}&quot;
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-3" style={{ textAlign: "justify" }}>
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
                                as="textarea"
                                rows={3}
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
                                    <Button variant="outline-black" onClick={() => setConfirmDeletePass(false)}>
                                        Anuluj
                                    </Button>
                                    <Button variant="danger" onClick={handleDeletePassType} className="me-2">
                                        Potwierdź usunięcie
                                    </Button>
                                    
                                </div>


                            ) : (
                                <Button variant="outline-black" onClick={() => setConfirmDeletePass(true)} className="me-2">
                                    Usuń karnet
                                </Button>
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
                <Modal.Footer className="border-0 p-1 bg-gym d-flex justify-content-end">
                    <Button variant="outline-black" onClick={handleClose}>
                        Zamknij
                    </Button>
                    {!confirmDeletePass && (
                        <Button variant="black" onClick={handleSave}>
                            Zapisz zmiany
                        </Button>
                    )}

                </Modal.Footer>
            </Modal>

            {clickableChild}
        </>
    );
};
