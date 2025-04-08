import React, { useEffect, useState } from "react"
import { Container, Button, InputGroup, Dropdown } from "react-bootstrap"
import { Dash, Plus } from "react-bootstrap-icons/dist";
import { StyledButton } from "../StyledButton";



export const Settings = () => {

    type modeType = "Jasny" | "Ciemny"

    const [mode, setMode] = useState<modeType>();

    const changeFontSize = (valueInPx: number) => {
        const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
        document.body.style.fontSize = (currentSize + valueInPx) + "px";
    }

    useEffect(()=>{
        switch(mode){
            case "Ciemny":
                document.documentElement.setAttribute('data-bs-theme','dark')
                break;

            case "Jasny":
                document.documentElement.setAttribute('data-bs-theme','light')
                break;
        }
    }, [mode])

    return (
        <Container>

            <InputGroup>
                <InputGroup.Text>Wielkość czcionki</InputGroup.Text>
                <StyledButton
                    onClick={() => changeFontSize(5)}
                >
                    <Plus />
                </StyledButton>
                <StyledButton
                    onClick={() => changeFontSize(-5)}
                >
                    <Dash />
                </StyledButton>
            </InputGroup>

            <InputGroup>
                <InputGroup.Text>Motyw aplikacji</InputGroup.Text>
                <Dropdown>     
                    <Dropdown.Toggle variant="light" className="border">{mode}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            onClick={()=>setMode("Ciemny")}
                        >
                            Ciemny                    
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={()=>setMode("Jasny")}
                        >
                            Jasny
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </InputGroup>

        </Container>
    )
}