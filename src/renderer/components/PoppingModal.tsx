import React from 'react';
import { Button, Modal } from "react-bootstrap";

interface ErrorModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    message: string | null;
    setMessage: (message: string | null) => void;
    title?: string;
    type?: "error" | "info";
    onClose? : () => void; 
}

export const PoppingModal: React.FC<ErrorModalProps> = ({ show, setShow, message, setMessage, title = "Błąd", type = "error", onClose}) => {

    const handleClose = () => {
        setShow(false);
        setMessage(null);
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
                <Button variant="outline-black" onClick={handleClose}>
                    Zamknij
                </Button>
            </Modal.Footer>
        </Modal>
    )
}