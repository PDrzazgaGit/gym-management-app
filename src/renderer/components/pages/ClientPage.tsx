import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, InputGroup,
  ListGroup, Dropdown, Table, Form, FormCheck, Card, Modal
} from "react-bootstrap";
import { StyledButton } from "../StyledButton";
import { useClient } from "../../../renderer/hooks/useClient";
import { ValidationService } from "../../ui-services/ValidationService";
import { ClientManager } from "../../../renderer/ui-services/ClientManager";
import { PassManager } from "../../../renderer/ui-services/PassManager";
import { PassTypeManager } from "../../../renderer/ui-services/PassTypeManager";
import { TrainingSessionManager } from "../../../renderer/ui-services/TrainingSessionManager";
import { PassType } from "../../../main/entities/PassType";
import { TrainingList } from "../TrainingList";

export const ClientPage = () => {
  const { client, setClient } = useClient();
  const navigate = useNavigate();

  const clientManager = ClientManager.getInstance();
  const passManager = PassManager.getInstance();
  const passTypeManager = PassTypeManager.getInstance();
  const trainingManager = TrainingSessionManager.getInstance();

  const [name, setName] = useState(client?.name ?? "");
  const [surname, setSurname] = useState(client?.surname ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [alias, setAlias] = useState(client?.alias ?? "");

  const [description, setDescription] = useState("");
  const [plannedDateString, setPlannedDateString] = useState("");
  const [plannedHourString, setPlannedHourString] = useState("");
  const [plannedDate, setPlannedDate] = useState<Date | null>(null);

  const [selectedPassType, setSelectedPassType] = useState<PassType | null>(null);
  const [passTypes, setPassTypes] = useState<PassType[]>();
  const [message, setMessage] = useState<string | null>(null);

  const [confirmDeleteClient, setConfirmDeleteClient] = useState(false);
  const [confirmRemovePass, setConfirmRemovePass] = useState(false);

  const [refreshTrainings, setRefreshTrainings] = useState(0);


  // nowy stan do kontrolowania modala błędów
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!passTypes) {
      passTypeManager.getAll().then(setPassTypes);
    }
  }, [passTypes]);

  useEffect(() => {
    if (!client) {
      navigate("/clients");
      return;
    }
  }, [client]);

  // otwieraj modal gdy pojawi się wiadomość błędu
  useEffect(() => {
    if (message) {
      setShowErrorModal(true);
    }
  }, [message]);

  const updatePlannedDate = (dateStr: string, timeStr: string) => {
    if (dateStr && timeStr) {
      const combined = new Date(`${dateStr}T${timeStr}`);
      setPlannedDate(combined);
    }
  };

  const handleSave = async () => {
    try {
      const updatedClient = await clientManager.modify(client?.id, name, surname, phone, alias);
      if (selectedPassType) {
        const newPass = await passManager.add(selectedPassType.id);
        const updated = await clientManager.assignPass(client.id, newPass.id);
        setClient(updated);
        setSelectedPassType(null);
      } else {
        setClient(updatedClient);
      }
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleAddTraining = async () => {
    try {
      await trainingManager.create(description, client?.pass?.id, plannedDate);
      setDescription("");
      setPlannedDate(null);
      setPlannedDateString("");
      setPlannedHourString("");
      setRefreshTrainings(prev => prev + 1);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleDeleteClient = async () => {
    try {
      await clientManager.delete(client?.id);
      navigate("/clients");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleRemovePass = async () => {
    try {
      const updated = await clientManager.removePass(client?.id);
      setClient(updated);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  useEffect(() => {
    return () => setClient(undefined);
  }, []);

  return (
    <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
      {/* Nagłówek strony */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary fs-2 m-0">
          {client?.name} {client?.surname}{" "}
          {client?.alias && <small className="text-muted">({client.alias})</small>}
        </h2>
        <div className="d-flex gap-2">
          <StyledButton variant="secondary" onClick={() => navigate("/clients")}>
            Powrót
          </StyledButton>
          <StyledButton variant="success" onClick={handleSave}>
            Zapisz zmiany
          </StyledButton>
        </div>
      </div>

      {/* Modal błędów */}
      <Modal
        show={showErrorModal}
        onHide={() => { setShowErrorModal(false); setMessage(null); }}
        centered
        animation
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Błąd</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <StyledButton variant="secondary" onClick={() => { setShowErrorModal(false); setMessage(null); }}>
            Zamknij
          </StyledButton>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col md={6}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="text-muted">Dane klienta</Card.Title>
              <Form.Group className="mb-2">
                <Form.Label>Imię</Form.Label>
                <Form.Control value={name} onChange={(e) => setName(ValidationService.typingNaming(e.target.value))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Nazwisko</Form.Label>
                <Form.Control value={surname} onChange={(e) => setSurname(ValidationService.typingNaming(e.target.value))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Telefon</Form.Label>
                <Form.Control value={phone} onChange={(e) => setPhone(ValidationService.typingPhone(e.target.value))} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Alias</Form.Label>
                <Form.Control value={alias ?? ""} onChange={(e) => setAlias(ValidationService.typingAlias(e.target.value))} />
              </Form.Group>
              {confirmDeleteClient ? (
                <div className="d-flex gap-2">
                  <StyledButton variant="danger" onClick={handleDeleteClient}>
                    Potwierdź usunięcie
                  </StyledButton>
                  <StyledButton variant="outline-secondary" onClick={() => setConfirmDeleteClient(false)}>
                    Anuluj
                  </StyledButton>
                </div>
              ) : (
                <StyledButton variant="outline-danger" onClick={() => setConfirmDeleteClient(true)}>
                  Usuń klienta
                </StyledButton>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="text-muted">Karnet</Card.Title>
              {client?.pass ? (
                <>
                  <ListGroup className="mb-3">
                    <ListGroup.Item>{`Karnet: ${client.pass.passType.name}`}</ListGroup.Item>
                    <ListGroup.Item>{`Data zakupu: ${client.pass.createdAt.toISOString().split("T")[0]}`}</ListGroup.Item>
                    <ListGroup.Item>{`Pozostałych wejść: ${client.pass.entryLeft}`}</ListGroup.Item>
                  </ListGroup>
                  {confirmRemovePass ? (
                    <div className="d-flex gap-2">
                      <StyledButton variant="danger" onClick={handleRemovePass}>
                        Potwierdź usunięcie
                      </StyledButton>
                      <StyledButton variant="outline-secondary" onClick={() => setConfirmRemovePass(false)}>
                        Anuluj
                      </StyledButton>
                    </div>
                  ) : (
                    <StyledButton variant="outline-danger" onClick={() => setConfirmRemovePass(true)}>
                      Usuń karnet
                    </StyledButton>
                  )}
                </>
              ) : (
                <Dropdown className="mb-2">
                  <Dropdown.Toggle variant="warning" disabled={!passTypes?.length}>
                    {selectedPassType ? selectedPassType.name : "Dodaj karnet"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {passTypes?.map((pt) => (
                      <Dropdown.Item key={pt.id} onClick={() => setSelectedPassType(pt)}>
                        {`${pt.name} (${pt.entry})`}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {client?.pass && (
        
        <Row>
          
          

          <Col md={4}>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title className="text-muted">Nowy trening</Card.Title>
                <Form.Group className="mb-2">
                  <Form.Label>Opis</Form.Label>
                  <Form.Control value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Data</Form.Label>
                  <Form.Control type="date" value={plannedDateString} onChange={(e) => {
                    setPlannedDateString(e.target.value);
                    updatePlannedDate(e.target.value, plannedHourString);
                  }}  disabled={plannedHourString != ""}/>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Godzina</Form.Label>
                  <Form.Control type="time" value={plannedHourString} onChange={(e) => {
                    setPlannedHourString(e.target.value);
                    updatePlannedDate(plannedDateString, e.target.value);
                  }} disabled={!plannedDateString} />
                </Form.Group>
                <StyledButton variant="primary" onClick={handleAddTraining} disabled={plannedDateString && !plannedHourString}>
                  {plannedDateString ? "Zaplanuj trening" : "Zaplanuj trening bez daty"}
                </StyledButton>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <TrainingList pass={client?.pass} maxHeight="20vh" refreshKey={refreshTrainings}/>
          </Col>
        </Row>
      )}
    </Container>
  );
};
