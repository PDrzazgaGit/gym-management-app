import React, { useEffect, useState } from "react"
import { Badge, Col, Container, FormCheck, FormControl, InputGroup, Row, Table } from "react-bootstrap"
import { StyledButton } from "../StyledButton"
import { Search } from "react-bootstrap-icons"
import { Client } from "../../../main/entities/Client"
import { AddClientModal } from "../AddClientModal"
import { useDb } from "../../../renderer/hooks/useDb"
import { ManageClientModal } from "../ManageClientModal"

export const Clients = () => {

    const {clientManager} = useDb();

    const [client, setClient] = useState<Client[] | undefined>(undefined);

    const [search, setSearch] = useState<string>('');

    const [disabled, setDisabled] = useState<boolean>(false);

    const [searchByName, setSearchByName] = useState<boolean>(false);
    const [searchBySurname, setSearchBySurname] = useState<boolean>(false);
    const [searchByPhone, setSearchByPhone] = useState<boolean>(false);
    const [searchByPass, setSearchByPass] = useState<boolean>(false);

    useEffect(() => {
        if (!client) {
            const fetch = async () =>{
                const result = await clientManager.getAll()
                setClient(result)
            }
            fetch();
        }
    }, [client])

    useEffect(()=>{
        if(!searchByName && !searchByPass && !searchByPhone && !searchBySurname){
        
            setSearchByName(true);
            setDisabled(true);
            
        }
    }, [searchByName, searchByPass, searchByPhone, searchBySurname])

    useEffect(()=>{
        if(searchByPass || searchByPhone || searchBySurname){

            setDisabled(false);
            
        }
    }, [searchByPass, searchByPhone, searchBySurname])

    const handleTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
    }

    const handleSearch = async () => {
        const result = await clientManager.findClient(search.trim(), searchByName, searchBySurname, searchByPhone, searchByPass);
        setClient(result);
    }

    return (
        <Container>
            <Row className="mb-2">

            </Row>
            <Row className="mb-4">
                <InputGroup>
                    <InputGroup.Text>Znajdź osobę</InputGroup.Text>


                    <FormControl type="search"
                        onChange={handleTypeSearch}
                        value={search}
                    />


                    <InputGroup.Text>
                        <FormCheck 
                        id="imie_check" 
                        label="Imię" 
                        checked={searchByName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearchByName(e.target.checked)}
                        disabled={disabled}
                        />

                    </InputGroup.Text>
                    <InputGroup.Text>
                        <FormCheck 
                        id="nazwisko_check" 
                        label="Nazwisko" 
                        checked={searchBySurname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearchBySurname(e.target.checked)}
                        />

                    </InputGroup.Text>

                    <InputGroup.Text>
                        <FormCheck 
                        id="telefon_check" 
                        label="Telefon" 
                        checked={searchByPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearchByPhone(e.target.checked)}
                        />

                        

                    </InputGroup.Text>

                    <InputGroup.Text>
                        <FormCheck 
                        id="pass_check" 
                        label="Karnet" 
                        checked={searchByPass}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearchByPass(e.target.checked)}
                        />

                        

                    </InputGroup.Text>

                    <StyledButton
                        onClick={handleSearch}
                        variant="success"
                    >
                        <Search 
                            
                        />
                    </StyledButton>
                </InputGroup>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="text-muted">LP.</th>
                                <th className="text-muted">IMIĘ</th>
                                <th className="text-muted">NAZWISKO (ALIAS)</th>
                                <th className="text-muted">TELEFON</th>
                                <th className="text-muted">KARNET</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client &&
                                client.map((clientData, index) => (
                                    <ManageClientModal client={clientData} key={clientData.id}>
                                        <tr key={clientData.id}>
                                            <td>{index + 1}.</td>
                                            <td>{clientData.name}</td>
                                            <td>{clientData.surname}{clientData.alias != undefined ? ` (${clientData.alias})` : ""}</td>
                                            <td>{clientData.phone ? clientData.phone : '-'}</td>
                                            <td>{clientData.pass ? "TAK" : 'NIE'}</td>
                                        </tr>
                                    </ManageClientModal>
                                    
                                ))}
                        </tbody>
                    </Table>
                </Col>

            </Row>
            <Row>
                <Col>
                    <AddClientModal onSave={()=>{  
                        setClient(undefined);
                    }}/>
                </Col>
            </Row>


        </Container>
    )
}