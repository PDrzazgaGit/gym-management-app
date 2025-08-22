import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Table,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { PassTypeManager } from "../../../renderer/ui-services/PassTypeManager";
import { PassType } from "../../../main/entities/PassType";
import { PassTypeSettingsModal } from "../PassTypeSettingsModal";
import { PoppingModal } from "../PoppingModal";

export const PassTypes = () => {
  const passTypeManager = PassTypeManager.getInstance();

  const [passTypes, setPassTypes] = useState<PassType[] | undefined>(undefined);

  // Formularz dodawania
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [entries, setEntries] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal błędu
  const [message, setMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  const [refreshKey, setRefreshKey] = useState(0);

    const SPEED = 25;


  const [visibleCount, setVisibleCount] = useState(0); 

  useEffect(() => {
    if (!passTypes) return;

    setVisibleCount(0); // reset
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= passTypes.length) clearInterval(interval);
    }, SPEED); 

    return () => clearInterval(interval);
  }, [passTypes]);

  // Pobierz karnety
  useEffect(() => {
    if (!passTypes) {
      (async () => {
        const result = await passTypeManager.getAll();
        setPassTypes(result);
      })();
    }
  }, [passTypes, refreshKey]);

  const handleAddPass = async () => {
    setMessage(null);
    if (!name.trim() || !description.trim() || entries === null || entries <= 0) {
      setShowErrorModal(true);
      setMessage("Proszę uzupełnić wszystkie pola poprawnie.");
      return;
    }
    setLoading(true);
    try {
      await passTypeManager.add(name.trim(), description.trim(), entries);
      setName("");
      setDescription("");
      setEntries(null);
      setPassTypes(undefined); // odśwież listę
    } catch (error: any) {
      setShowErrorModal(true);
      setMessage(error.message || "Wystąpił błąd podczas dodawania.");
    }
    setLoading(false);
  };

  return (
    <Container fluid className="py-3" style={{ height: "100%", overflow: "hidden" }}>
      {/* Nagłówek u góry */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-black fs-2 m-0">
          Rodzaje karnetów
        </h2>
      </div>
      <Row>
        <Col md={12} lg={4}>
          <Card className="shadow mb-3 border-0 bg-white">
            <Card.Header className="bg-black text-white border-0">
              <Card.Title className="mb-0">Nowy karnet</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="passName">
                  <Form.Label>Nazwa</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wpisz nazwę"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="passDescription">
                  <Form.Label>Opis</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    placeholder="Wpisz opis"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="passEntries">
                  <Form.Label>Wejścia</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Wpisz liczbę wejść"
                    value={entries !== null ? entries : ""}
                    onChange={(e) => setEntries(Number(e.target.value))}
                    min={1}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
            <Card.Footer className="border-0 bg-gym d-flex justify-content-end p-2">
              <Button
                variant="black"
                onClick={handleAddPass}
                disabled={loading}
              >
                {loading ? "Dodawanie..." : "Dodaj karnet"}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={12} lg={8}>
          <Card className="shadow mb-3 border-0 bg-white">
            <Card.Header className="bg-black text-white border-0">
              <Card.Title className="mb-0">Lista karnetów</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '74vh', overflowY: "auto" }}>
                <Table hover style={{ tableLayout: "fixed", width: "100%" }}>
                  <thead
                    className="table-light"
                    style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "white" }}
                  >
                    <tr>
                      <th style={{ width: "10%" }} className="text-muted">LP.</th>
                      <th style={{ width: "20%" }} className="text-muted">NAZWA</th>
                      <th style={{ width: "50%" }} className="text-muted">OPIS</th>
                      <th style={{ width: "20%" }} className="text-muted">WEJŚCIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passTypes &&
                      passTypes.slice(0, visibleCount).map((passTypeData, index) => (
                        <PassTypeSettingsModal
                          passType={passTypeData}
                          key={passTypeData.id}
                          onSave={() => setRefreshKey(prev => prev + 1)}
                        >
                          <tr>
                            <td>{index + 1}.</td>
                            <td>{passTypeData.name}</td>
                            <td>{passTypeData.description}</td>
                            <td>{passTypeData.entry}</td>
                          </tr>
                        </PassTypeSettingsModal>
                      ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
              Wybierz karnet z listy aby wyświetlić szczegóły
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
    </Container>
  );
};
