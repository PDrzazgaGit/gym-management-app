import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, InputGroup,
  ListGroup, Dropdown, Table, Form, FormCheck, Card, Modal,
  Button,
  Badge
} from "react-bootstrap";
import { useClient } from "../../../renderer/hooks/useClient";
import { ValidationService } from "../../ui-services/ValidationService";
import { ClientManager } from "../../../renderer/ui-services/ClientManager";
import { PassManager } from "../../../renderer/ui-services/PassManager";
import { PassTypeManager } from "../../../renderer/ui-services/PassTypeManager";
import { TrainingSessionManager } from "../../../renderer/ui-services/TrainingSessionManager";
import { PassType } from "../../../main/entities/PassType";
import { TrainingList } from "../TrainingList";
import { AssignCardToPassModal } from "../AssignCardToPassModal";
import { AcrProvider } from "../../../renderer/react-context/AcrProvider";
import { CardData } from "../../../main/data/CardData";
import { Client } from "../../../main/entities/Client";
import { PoppingModal } from "../PoppingModal";
import { DateFormatter } from "../../../renderer/ui-services/DateFormatter";

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

        if (client.pass && client.pass.entryLeft === 0) {
          const extendedPass = await passManager.extend(client.pass.id, selectedPassType.id);
          const updated: Client = await clientManager.getByPass(extendedPass.id);
          setClient(updated);
        } else {
          const newPass = await passManager.add(selectedPassType.id);
          const updated: Client = await clientManager.assignPass(client.id, newPass.id);
          setClient(updated);
        }

        setSelectedPassType(null);
      } else {
        setClient(updatedClient);
      }
      setConfirmRemovePass(false);
      setConfirmDeleteClient(false);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleAddTraining = async () => {
    try {
      await trainingManager.create(client?.pass?.id, description, plannedDate);
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
        <h2 className="fw-bold text-black fs-2 m-0">
          {client?.name}{" "}{client?.surname}{" "}
          {client?.alias && <small className="text-muted">({client.alias})</small>}
        </h2>
      </div>


      <Row>
        <Col>
          <Card className="mb-3 shadow border-0 bg-white">
            <Card.Header className="bg-black text-white border-0">
              <Card.Title className="mb-0">Dane klienta</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12} lg={8}>
                  <Form.Group className="mb-1">
                    <Form.Label>Imię</Form.Label>
                    <Form.Control
                      value={name}
                      onChange={(e) => setName(ValidationService.typingNaming(e.target.value))}
                      placeholder="Wpisz imię"
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Nazwisko</Form.Label>
                    <Form.Control
                      value={surname}
                      onChange={(e) => setSurname(ValidationService.typingNaming(e.target.value))}
                      placeholder="Wpisz nazwisko"
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Telefon</Form.Label>
                    <Form.Control
                      value={phone}
                      onChange={(e) => setPhone(ValidationService.typingPhone(e.target.value))}
                      placeholder="Wpisz telefon (opcjonalnie)"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Alias</Form.Label>
                    <Form.Control
                      value={alias ?? ""}
                      onChange={(e) => setAlias(ValidationService.typingAlias(e.target.value))}
                      placeholder="Wpisz alias (opcjonalnie)"
                    />
                  </Form.Group>

                </Col>
                <Col md={12} lg={4} className="">
                  {client?.pass ? (
                    <Card className="shadow border-0">
                      <Card.Header className="bg-gym border-0">
<Card.Title className="text-black mb-0">
                              Karnet
                            </Card.Title>
                      </Card.Header>
                      <Card.Body>
                      <Row>
                        <Col>
                          <Row className="mb-3">
                            <Col>
                              <Card.Text>Nazwa:</Card.Text>
                            </Col>
                            <Col>
                              <Card.Text>{client.pass.passType.name}</Card.Text>
                            </Col>
                          </Row>
                          <Row className="mb-3">
                            <Col>
                              <Card.Text>Data zakupu:</Card.Text>
                            </Col>
                            <Col>
                              <Card.Text>{DateFormatter.formatToDateOnly(client.pass.createdAt)}</Card.Text>
                            </Col>
                          </Row>
                          <Row className="mb-3">
                            <Col>
                              <Card.Text>Pozostałych wejść:</Card.Text>
                            </Col>
                            <Col>
                              <Card.Text>{client.pass.entryLeft}</Card.Text>
                            </Col>
                          </Row>
                          <Row className="mb-3">
                            <Col>
                              <Card.Text>Przypisana karta:</Card.Text>
                            </Col>
                            <Col>
                              <Card.Text>{client.pass.cardId ? "Tak" : "Nie"}</Card.Text>
                            </Col>
                          </Row>


                          <Row>
                            <Col>
                              {client.pass.entryLeft === 0 && (
                                <Dropdown className="mb-3">
                                  <Dropdown.Toggle variant="warning" disabled={!passTypes?.length}>
                                    {selectedPassType ? selectedPassType.name : "Przedłuż karnet na"}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {passTypes?.map((pt) => (
                                      <Dropdown.Item key={pt.id} onClick={() => setSelectedPassType(pt)}>
                                        {`${pt.name} (${pt.entry})`}
                                      </Dropdown.Item>
                                    ))}
                                    <Dropdown.Item onClick={() => setSelectedPassType(null)}>Anuluj</Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              ) || (
                                  <AssignCardToPassModal
                                    client={client}
                                    onSave={async () => {
                                      handleSave();
                                    }}
                                  />
                                )}
                            </Col>
                            <Col>
                              {confirmRemovePass ? (
                                <div className="d-flex gap-2 ">
                                  <Button variant="outline-black" onClick={() => setConfirmRemovePass(false)}>
                                    Anuluj
                                  </Button>
                                  <Button variant="danger" onClick={handleRemovePass}>
                                    Potwierdź
                                  </Button>

                                </div>
                              ) : (
                                <div className="d-flex">
                                  <Button variant="outline-black" onClick={() => setConfirmRemovePass(true)}>
                                    Usuń karnet
                                  </Button>

                                </div>

                              )}
                            </Col>
                          </Row>
                        </Col>

                      </Row>
</Card.Body>
                    </Card>
                  ) : (
                    <Dropdown className="mb-3">
                      <Dropdown.Toggle variant="warning" disabled={!passTypes?.length}>
                        {selectedPassType ? selectedPassType.name : "Dodaj karnet"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {passTypes?.map((pt) => (
                          <Dropdown.Item key={pt.id} onClick={() => setSelectedPassType(pt)}>
                            {`${pt.name} (${pt.entry})`}
                          </Dropdown.Item>
                        ))}
                        <Dropdown.Item onClick={() => setSelectedPassType(null)}>Anuluj</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="border-0 bg-gym d-flex justify-content-between p-2">
              {/* Lewa strona */}
              <div className="d-flex gap-2">
                {confirmDeleteClient ? (
                  <>
                    <Button
                      variant="outline-black"
                      onClick={() => setConfirmDeleteClient(false)}
                    >
                      Anuluj
                    </Button>
                    <Button variant="danger" onClick={handleDeleteClient}>
                      Potwierdź usunięcie
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline-black"
                    onClick={() => setConfirmDeleteClient(true)}
                  >
                    Usuń klienta
                  </Button>
                )}
              </div>

              {/* Prawa strona */}
              <div className="d-flex gap-2">
                <Button variant="outline-black" onClick={() => navigate("/clients")}>
                  Powrót
                </Button>
                <Button variant="black" onClick={handleSave}>
                  Zapisz zmiany
                </Button>
              </div>
            </Card.Footer>

          </Card>
        </Col>
      </Row>


      <PoppingModal
        show={showErrorModal}
        setShow={setShowErrorModal}
        setMessage={setMessage}
        message={message}
      />



      {client?.pass && (

        <Row>
          <Col lg={4} md={12}>
            <Card className="mb-3 shadow border-0 bg-white">
                <Card.Header className="bg-black text-white border-0">
                                          <Card.Title className="mb-0">Nowy trening</Card.Title>
                                      </Card.Header>
              <Card.Body>
               
                <Form.Group className="mb-1">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Wpisz opis"
                  />
                </Form.Group>
                <Form.Group className="mb-1">
                  <Form.Label>Data</Form.Label>
                  <Form.Control type="date" value={plannedDateString} onChange={(e) => {
                    setPlannedDateString(e.target.value);
                    updatePlannedDate(e.target.value, plannedHourString);
                  }} disabled={plannedHourString != ""} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Godzina</Form.Label>
                  <Form.Control type="time" value={plannedHourString} onChange={(e) => {
                    setPlannedHourString(e.target.value);
                    updatePlannedDate(plannedDateString, e.target.value);
                  }} disabled={!plannedDateString} />
                </Form.Group>
              </Card.Body>
              <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
                 <Button variant="black" onClick={handleAddTraining} disabled={plannedDateString && !plannedHourString}>
                  {plannedDateString ? "Zaplanuj trening" : "Zaplanuj trening bez daty"}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg={8} md={12}>
            <TrainingList pass={client?.pass} maxHeight="17vh" refreshKey={refreshTrainings} onSave={handleSave} />
          </Col>
        </Row>
      )}
    </Container>
  );
};
