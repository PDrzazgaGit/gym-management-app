import React, { useState } from "react";
import { Dropdown, FormControl, InputGroup, ListGroup, Modal } from "react-bootstrap";
import { StyledButton } from "./StyledButton";
import { Client } from "../../main/entities/Client";
import { ValidationService } from '../ui-services/ValidationService';
import { Pass } from "../../main/entities/Pass";
import { DeleteClientModal } from "./DeleteClientModal";

interface ModalContextType {
    client: Client
    onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactElement<any>;
}

export const ManageClientModal: React.FC<ModalContextType> = ({ onSave, client, children }) => {

    const [show, setShow] = useState<boolean>(false);

    const [message, setMessage] = useState<string | null>(null);

    const [name, setName] = useState<string>(client.name);

    const [phone, setPhone] = useState<string>(client.phone);

    const [surname, setSurname] = useState<string>(client.surname);

    const [alias, setAlias] = useState<string | undefined>(client.alias);

    const [pass, setPass] = useState<Pass | undefined>(client.pass);

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setShow(false)
    };

    const handleSave = () => {

    }

    const handleTypePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkPhone = ValidationService.typingPhone(value)
        setPhone(checkPhone);
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

    const handleTypeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checkName = ValidationService.typingNaming(value)
        setName(checkName);
    }

    const clickableChild = React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
            children.props?.onClick?.(e);
            handleShow();
        },
        style: {
            ...(children.props.style || {}),
            cursor: "pointer" // opcjonalnie
        }
    });

    return (<>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{`Konto ${client.name} ${client.surname}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup variant='flush'>
                    <ListGroup.Item className='text-muted border-0' style={{ textAlign: "justify" }}>
                        Dane klienta
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
                    {alias && (
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
                     <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <DeleteClientModal client={client}/>
                            </InputGroup>
                        </ListGroup.Item>

                    <ListGroup.Item className='border-0 text-muted'>
                        Karnet
                    </ListGroup.Item>
                    {pass && (
                        <ListGroup.Item className='border-0'>
                            <InputGroup>
                                <InputGroup.Text>{`Karnet ${pass.passType.name}`}</InputGroup.Text>
                            </InputGroup>
                            Reszta
                        </ListGroup.Item>
                    ) || (
                        <>
                        <ListGroup.Item className='border-0 text-warning'>
                            Do tego klienta nie został przypisany jeszcze żaden karnet
                            </ListGroup.Item>
                            <ListGroup.Item className='border-0 text-warning'>
                            <InputGroup>
                                <StyledButton variant="warning">Skonfiguruj karnet</StyledButton>
                            </InputGroup>
                            </ListGroup.Item>
                           
                        </>
                            
                        )}



                </ListGroup>
                {message && (
                    <ListGroup className='border-0 text-center' style={{ textAlign: "justify" }}>
                        {message}
                    </ListGroup>
                )}

            </Modal.Body>
            <Modal.Footer>
                <StyledButton variant="danger" onClick={handleClose}>
                    Zamknij
                </StyledButton>
                <StyledButton variant="success" onClick={handleSave}>
                    Zapisz zmiany
                </StyledButton>
            </Modal.Footer>
        </Modal>
        {clickableChild}
    </>)
}