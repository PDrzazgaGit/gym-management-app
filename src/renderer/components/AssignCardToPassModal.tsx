import React, { useEffect, useState } from "react";
import {
    Modal,
    Alert,
} from "react-bootstrap";
import { StyledButton } from "./StyledButton";
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

    /*
    useEffect(()=>{      
        if (!client?.pass?.id) return;
        const fetchSaveUUID = async () =>{
            await passManager.assignCard(client.pass?.id, cardData.uuid);
        }
        if(show && cardData){
           
            fetchSaveUUID();
        }
    }, [cardData])
*/

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
                        Przypisz kartę RFID do karnetu
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AnimatedCircle
                        deviceConnected={isReaderConnected}
                        dataReady={cardData ? true : false}
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
                <Modal.Footer className="border-0">
                    <StyledButton variant="outline-secondary" onClick={handleClose}>
                        Zamknij
                    </StyledButton>
                </Modal.Footer>
            </Modal>

            <StyledButton className={className} variant="outline-primary" onClick={() => setShow(true)}>
                Przypisz kartę
            </StyledButton>
        </>
    );
};
