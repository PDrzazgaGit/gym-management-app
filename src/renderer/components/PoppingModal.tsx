import React from 'react';
import { Button, Modal } from "react-bootstrap";

interface ErrorModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    message: string | null;
    setMessage?: (message: string | null) => void;
    title?: string;
    type?: "error" | "info";
    confirmText?: string;
    onClose? : () => void; 
    onSave? : () => void;
    closeText?: string;
}

export const PoppingModal: React.FC<ErrorModalProps> = ({ show, setShow, message, setMessage, title = "Błąd", type = "error", confirmText="Zapisz", closeText="Zamknij", onClose, onSave}) => {

    const handleSave = () => {
        onSave?.();
        handleClose();
    }

    const handleClose = () => {
        setShow(false);
        setMessage?.(null);
        onClose?.();
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            animation
            size='lg'
            backdrop="static"
            keyboard={false}
            contentClassName="shadow rounded-3"
        >
            <Modal.Header 
            closeButton 
            className={`${type === "error" ? "bg-danger" : "bg-black"} border-0 text-white`}>
                <Modal.Title className='mb-0'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer className="border-0 p-1 bg-gym d-flex justify-content-end">
                {onSave && (
                    <Button variant="black" onClick={handleSave}>
                        {confirmText}
                    </Button>
                )}
                <Button variant="outline-black" onClick={handleClose}>
                    {closeText}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}