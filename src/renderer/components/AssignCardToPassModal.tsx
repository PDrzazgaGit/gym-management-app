import React, { useEffect, useState } from "react";
import {
    Modal,
    Alert,
    Button,
} from "react-bootstrap";
import { useAcr } from "../hooks/useAcr";
import { AnimatedCircle } from "./AnimatedCircle";
import { Client } from "../../main/entities/Client";
import { PassManager } from "../ui-services/PassManager";

interface ModalContextType {
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    client: Client
}

export const AssignCardToPassModal: React.FC<ModalContextType> = ({
    onSave,
    className,
    client
}) => {

    const passManager = PassManager.getInstance();

    const { isReaderConnected, isCardPresent, cardData, acrError: error, clearError, setMode, setWriteData, setBeforeWriteCheck } = useAcr();
    const [show, setShow] = useState<boolean>(false);

    const handleClose = () => {
        clearError();
        onSave?.();
        setShow(false);

    };
    
    useEffect(() => {
        if (!client?.pass?.id) return;
        setMode("write");
       
        setBeforeWriteCheck(async (prevData, setWriteData)=>{
            const uuid : string | null = await passManager.tryAssignCard(client.pass?.id, prevData.uuid);
            if(uuid != null){
                setWriteData({uuid})
                 //setWriteData({ uuid:uuid }); 
                 return true;
            }
            return false;
        })
        return () => {
            setMode("idle");
            setWriteData(null);
        };
    }, []);

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
                        Przypisz kartę RFID do karnetu
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AnimatedCircle
                        deviceConnected={isReaderConnected}
                        dataReady={cardData &&!error ? true : false}
                        cardInserted={isCardPresent}
                    />
                    {error && (
                        <Alert
                            variant="danger"
                            onClose={() => clearError()}
                            dismissible
                            className="mt-4"
                        >
                            {error}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 p-1 bg-gym d-flex justify-content-end">
                    <Button variant="black" onClick={handleClose}>
                        Zamknij
                    </Button>
                </Modal.Footer>
            </Modal>

            <Button className={className} variant="gym" onClick={() => setShow(true)}>
                Przypisz kartę
            </Button>
        </>
    );
};
