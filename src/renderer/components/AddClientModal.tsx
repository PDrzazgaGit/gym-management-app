import React, { useState } from 'react';
import { Badge, Button, ButtonProps, FormControl, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import { StyledButton } from './StyledButton';
import { ValidationService } from '../ui-services/ValidationService';


export const AddClientModal = () => {

    const [show, setShow] = useState<boolean>(false);
    const [showAlias, setShowAlias] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [alias, setAlias] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        reset();
        setShow(false)
    };

    const reset = () => {
        setShowAlias(false);
        setPhone('');
        setName('');
        setSurname('');
        setAlias('');
        setMessage(null)
    }
    
    const handleAddClient = async () => {
        const success = await (window as any).database.addClient(
            name.trim(),
            surname.trim(),
            phone,
            alias
        )
        if(success){
            setShowAlias(false);
            setPhone('');
            setName('');
            setSurname('');
            setAlias('');
            setMessage("Pomyślnie dodano osobę.")
        }else{
            if(alias){
                setMessage(`${alias} się powtarza. Nadaj unikalny alias.`)
                setAlias('');
            }else{
                setShowAlias(true);
                setMessage(`${name} ${surname} się powtarza. Nadaj unikalny alias.`)
            }
           
        }
    }

    const handleTypePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkPhone = ValidationService.typingPhone(value)
        setPhone(checkPhone);      
    }

    const handleTypeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkName = ValidationService.typingNaming(value)
        setName(checkName);      
    }

    const handleTypeSurname = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkSurname = ValidationService.typingNaming(value)
        setSurname(checkSurname);      
    }

    const handleTypeAlias = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkAlias = ValidationService.typingAlias(value)
        setAlias(checkAlias);      
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Nowy klient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup variant='flush'>
                    <ListGroup.Item className='text-muted border-0' style={{textAlign: "justify"}}>
                            Akcja powoduje dodanie nowego klienta do ewidencji. W&nbsp;przypadku powtarzającego się imienia i nazwiska w&nbsp;ewidencji, system wymusi dodanie unikalnego aliasu.
                        </ListGroup.Item>
                        <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <InputGroup.Text  
                                >
                                    Imię
                                </InputGroup.Text>
                                <FormControl
                                    onChange={handleTypeName}
                                    value={name}
                                    type="text"
                                >
                                </FormControl>
                            </InputGroup>
                        </ListGroup.Item>

                        <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <InputGroup.Text>
                                    Nazwisko
                                </InputGroup.Text>
                                <FormControl
                                    onChange={handleTypeSurname}
                                    value={surname}
                                    type="text"
                                >
                                </FormControl>
                            </InputGroup>
                        </ListGroup.Item>
                        <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <InputGroup.Text>
                                    Telefon
                                </InputGroup.Text>
                                <FormControl
                                    type="text"
                                    onChange={handleTypePhone}
                                    value={phone}
                                >
                                </FormControl>
                            </InputGroup>
                        </ListGroup.Item>
                        {showAlias && (
                            <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <InputGroup.Text>
                                    Alias
                                </InputGroup.Text>
                                <FormControl
                                    type="text"
                                    value={alias}
                                    onChange={handleTypeAlias}
                                >
                                </FormControl>
                            </InputGroup>
                        </ListGroup.Item>
                        )}
                    </ListGroup>
                    {message && (
                        <ListGroup className='border-0 text-center' style={{textAlign: "justify"}}>
                            {message}
                        </ListGroup>
                    )}
                    
                </Modal.Body>
                <Modal.Footer>
                    <StyledButton variant="danger" onClick={handleClose}>
                        Zamknij
                    </StyledButton>
                    <StyledButton variant="success" onClick={handleAddClient}>
                        Zapisz zmiany
                    </StyledButton>
                </Modal.Footer>
            </Modal>
            <StyledButton
                onClick={handleShow}
            >
                Nowy klient
            </StyledButton>
        </>

    );
};
