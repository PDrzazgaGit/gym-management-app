import React, { useState } from "react";
import { Col, Container, FormControl, InputGroup, Row } from "react-bootstrap";

export const SearchBar = () => {

    const [search, setSearch] = useState<string>('');

    const handleTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
    }

    return (
        <Container className="bg-black">
            <Row>
                <Col className="p-1">
                    <InputGroup>
                    <InputGroup.Text className="border-0 rounded-0 bg-black text-center text-white">
                        Szukaj
                    </InputGroup.Text>
                    <FormControl type="search" className="border-0 rounded-0"
                        onChange={handleTypeSearch}
                        value={search}
                    />
                    </InputGroup>
                    
                </Col>
            </Row>
        </Container>
    )
}