// TrainingList.tsx
import React, { useEffect, useState } from "react";
import { Card, Table, Form, InputGroup, Button, Dropdown } from "react-bootstrap";
import { TrainingSessionSettingsModal } from "./TrainingSessionSettingsModal";
import { TrainingSessionManager } from "../../renderer/ui-services/TrainingSessionManager";
import { TrainingSession } from "../../main/entities/TrainingSession";
import { DateFormatter } from "../../renderer/ui-services/DateFormatter";
import { TrainingsDayFilter } from "../../main/enums/TrainingsDayFilter";
import { Pass } from "../../main/entities/Pass";
import { useTraining } from "../hooks/useTraining";

interface TrainingListProps {
  pass?: Pass;
  maxHeight?: string;
  refreshKey?: number;
  onSave?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrainingList: React.FC<TrainingListProps> = ({ pass, maxHeight, refreshKey, onSave }) => {
  const trainingManager = TrainingSessionManager.getInstance();
  const { training } = useTraining();
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>();
  const [trainingDay, setTrainingDay] = useState<Date | null>(new Date());
  const [trainingDayString, setTrainingDayString] = useState(DateFormatter.formatToDateOnly(new Date()));
  const [trainingsDayFilter, setTrainingsDayFilter] = useState<TrainingsDayFilter>(TrainingsDayFilter.GETBYWEEK);
  const [refreshTrainings, setRefreshTrainings] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    planned: false,
    in_progress: false,
    completed: false,
    canceled_owner: false,
    canceled_client: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await trainingManager.filter({
        planned: searchFilters.planned,
        inprogress: searchFilters.in_progress,
        completed: searchFilters.completed,
        cancelClient: searchFilters.canceled_client,
        cancelOwner: searchFilters.canceled_owner,
        day: trainingDay,
        trainingsDayFilter: trainingsDayFilter,
        passId: pass?.id,
      });
      setTrainingSessions(data);
    };
    fetchData();
  }, [trainingsDayFilter, trainingDay, refreshTrainings, searchFilters, pass, refreshKey]);

  const handleClearDate = () => {
    setTrainingDay(null);
    setTrainingDayString("");
    setTrainingsDayFilter(TrainingsDayFilter.GETALL);
  };

  const isToday = (trainingDate?: Date): boolean => {
    const today = new Date();
    if (!trainingDate) return false;
    return (
      trainingDate.getFullYear() === today.getFullYear() &&
      trainingDate.getMonth() === today.getMonth() &&
      trainingDate.getDate() === today.getDate()
    );
  }

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

  return (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Header className="bg-primary text-white border-0">
        <Card.Title>Filtr treningów</Card.Title>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-2">
          <InputGroup className="flex-wrap">
            {Object.entries(searchFilters).map(([key, value]) => (
              <Form.Check
                key={key}
                inline
                label={
                  key
                }
                checked={value}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="me-2"
                id={`check_${key}`}
              />
            ))}
          </InputGroup>
        </Form.Group>
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
        <Form.Group className="mt-4 mb-2">
          <Card.Title>{getTableTitle()}</Card.Title>
        </Form.Group>
        <Form.Group className="mb-2">
          <div style={{ maxHeight: maxHeight ?? '65vh', overflowY: "auto" }}>
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>LP.</th>
                {!pass && (<th>Klient</th>)}
                <th>Status</th>
                <th>Data planowana</th>
                <th>Opis</th>
              </tr>
            </thead>
            <tbody>
              {trainingSessions?.map((session, index) => (
                <TrainingSessionSettingsModal
                  showClient={!pass}
                  key={session.id}
                  trainingSession={session}
                  onSave={() => {
                    setRefreshTrainings((prev) => prev + 1);
                    onSave?.();
                  }}
                >
                  <tr>
                    <td>{index + 1}</td>
                    {!pass && (<td>
                      {`${session.pass.client.name} ${session.pass.client.surname}${session.pass.client.alias ? ` (${session.pass.client.alias})` : ""
                        }`}
                    </td>)}
                    <td>{session.status}</td>
                    <td>
                      {session.plannedAt
                        ? DateFormatter.formatToDateWithHours(session.plannedAt)
                        : "Brak danych"}
                    </td>
                    <td>{session.description}</td>
                  </tr>
                </TrainingSessionSettingsModal>
              ))}
            </tbody>
          </Table>
        </div>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};
