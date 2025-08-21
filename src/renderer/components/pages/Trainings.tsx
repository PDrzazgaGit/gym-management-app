import React from "react";
import { Container } from "react-bootstrap";
import { TrainingList } from "../TrainingList";



export const Trainings = () => {

    return (
        <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary fs-2 m-0">
                    Ewidencja treningów
                </h2>
            </div>
            
            <TrainingList></TrainingList>

        </Container>

    );
}