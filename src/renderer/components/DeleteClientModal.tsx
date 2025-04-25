import React, { useState } from 'react';
import { Badge, Button, ButtonProps, FormControl, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import { StyledButton } from './StyledButton';
import { ValidationService } from '../ui-services/ValidationService';
import { useDb } from '../hooks/useDb';
import { Client } from "../../main/entities/Client";

interface ModalContextType{
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    client: Client;
}

export const DeleteClientModal: React.FC<ModalContextType> = ({onSave, client}) => {

    const {clientManager} = useDb();

    const [show, setShow] = useState<boolean>(false);


    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false)

  
    
    const handleDeleteClient = async () => {
        
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Usuń klienta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup variant='flush'>
                    <ListGroup.Item className='text-muted border-0' style={{textAlign: "justify"}}>
                            Akcja powoduje usunięcie klienta {client.name} {client.surname} {client?.alias} z ewidencji. Tej operacji nie można cofnąć. Czy na pewno chcesz kontynuować?
                        </ListGroup.Item>
                       </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <StyledButton variant="danger" onClick={handleClose}>
                        Zamknij
                    </StyledButton>
                    <StyledButton variant="success" onClick={handleDeleteClient}>
                        Usuń na zawsze
                    </StyledButton>
                </Modal.Footer>
            </Modal>
            <StyledButton
                onClick={handleShow} variant='danger'
            >
                Usuń klienta
            </StyledButton>
        </>

    );
};
