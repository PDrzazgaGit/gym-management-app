// TrainingList.tsx
import React, { useEffect, useState } from "react";
import { Table, Form, InputGroup, Button, Dropdown, Modal } from "react-bootstrap";
import { TrainingSessionManager } from "../ui-services/TrainingSessionManager";
import { TrainingSession } from "../../main/entities/TrainingSession";
import { DateFormatter } from "../ui-services/DateFormatter";
import { TrainingsDayFilter } from "../../main/enums/TrainingsDayFilter";
import { Pass } from "../../main/entities/Pass";
import { StyledButton } from "./StyledButton";
import { useNavigate } from "react-router-dom";
import { useTraining } from "../hooks/useTraining";

interface StartListProps {
  show: boolean;
  setShow: (show: boolean) => void;
  pass: Pass;
  maxHeight?: string;
  refreshKey?: number;
  onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

export const StartListModal: React.FC<StartListProps> = ({ pass, maxHeight, refreshKey, onSave, show, setShow }) => {
  const trainingManager = TrainingSessionManager.getInstance();

  const {setTraining} = useTraining();
  const navigate = useNavigate();

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>();
  const [trainingDay, setTrainingDay] = useState<Date | null>(new Date());
  const [trainingDayString, setTrainingDayString] = useState(DateFormatter.formatToDateOnly(new Date()));
  const [trainingsDayFilter, setTrainingsDayFilter] = useState<TrainingsDayFilter>(TrainingsDayFilter.GETBYDAY);

  const isToday = (trainingDate: Date): boolean => {
    const today = new Date();
    return (
      trainingDate.getFullYear() === today.getFullYear() &&
      trainingDate.getMonth() === today.getMonth() &&
      trainingDate.getDate() === today.getDate()
    );
}

  const handleClose = () => {
    onSave?.();
    setShow(false);
    setTrainingDay(new Date())
    setTrainingDayString(DateFormatter.formatToDateOnly(new Date()));
    setTrainingsDayFilter(TrainingsDayFilter.GETBYDAY);

  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await trainingManager.filter({
        planned: true,
        inprogress: true,
        completed: false,
        cancelClient: false,
        cancelOwner: false,
        day: trainingDay,
        trainingsDayFilter: trainingsDayFilter,
        passId: pass?.id,
      });
      setTrainingSessions(data);
    };
    fetchData();
  }, [trainingsDayFilter, trainingDay, pass, refreshKey]);

  const handleClearDate = () => {
    setTrainingDay(null);
    setTrainingDayString("");
    setTrainingsDayFilter(TrainingsDayFilter.GETALL);
  };

  const getTableTitle = () => {
    switch (trainingsDayFilter) {
      case TrainingsDayFilter.GETALL:
        return trainingDay
          ? `Wszystkie treningi od dnia ${trainingDayString}`
          : "Wszystkie treningi";
      case TrainingsDayFilter.GETBYDAY:
        return isToday(trainingDay)
          ? "Dzisiejsze treningi"
          : `Treningi z dnia ${trainingDayString}`;
      case TrainingsDayFilter.GETBYWEEK:
        return `Wszystkie z tygodnia dla dnia ${trainingDayString}`;
    }
  };

  const handleStartPlannedTraining = async (session: TrainingSession) => {
    setTraining(session);
    handleClose();
  }

  const handleStartUnPlannedTraining = async () => {
    const unplanned = await trainingManager.create(pass.id);
    setTraining(unplanned);
    handleClose();
  }
  return (
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
          {`Rozpocznij trening: ${pass.client.name} ${pass.client.surname} ${pass.client.alias ? `(${pass.client.alias})` : ''}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <InputGroup>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary">
                {trainingsDayFilter === TrainingsDayFilter.GETBYDAY && isToday(trainingDay)
                  ? "Dzisiaj"
                  : trainingsDayFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETALL)}>
                  {TrainingsDayFilter.GETALL}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETBYDAY)}
                >
                  {TrainingsDayFilter.GETBYDAY}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setTrainingsDayFilter(TrainingsDayFilter.GETBYWEEK)}
                >
                  {TrainingsDayFilter.GETBYWEEK}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="date"
              value={trainingDayString}
              onChange={(e) => {
                setTrainingDayString(e.target.value);
                setTrainingDay(e.target.value ? new Date(`${e.target.value}`) : null);
              }}
            />
            <Button variant="outline-danger" onClick={handleClearDate}>
              Wyczyść
            </Button>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>{getTableTitle()}</Form.Label>
          <div style={{ maxHeight: maxHeight ?? '65vh', overflowY: "auto" }}>
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>LP.</th>
                  <th>Status</th>
                  <th>Data planowana</th>
                  <th>Opis</th>
                </tr>
              </thead>
              <tbody>
                {trainingSessions?.map((session, index) => (
                  <tr key={index} style={{cursor: "pointer"}} onClick={()=>{
                    handleStartPlannedTraining(session)
                  }}>
                    <td>{index + 1}</td>
                    <td>{session.status}</td>
                    <td>
                      {session.plannedAt
                        ? DateFormatter.formatToDateWithHours(session.plannedAt)
                        : "Brak danych"}
                    </td>
                    <td>{session.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Form.Group>
        <Form.Group>
          <Button variant="outline-success" onClick={handleStartUnPlannedTraining}>
            Rozpocznij nieplanowany trening
          </Button>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <StyledButton variant="outline-secondary" onClick={handleClose}>
          Zamknij
        </StyledButton>
      </Modal.Footer>
    </Modal>
  );
};
