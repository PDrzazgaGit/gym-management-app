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

  // Pobierz karnety
  useEffect(() => {
    if (!passTypes) {
      (async () => {
        const result = await passTypeManager.getAll();
        setPassTypes(result);
      })();
    }
  }, [passTypes]);

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
      <h2 className="mb-4 text-primary fw-bold">Dostępne karnety</h2>
      <Row style={{ height: "100%" }}>
        <Col md={7} style={{ overflowY: "auto", maxHeight: "65vh" }}>
          <Card className="shadow-sm mb-3 border-0">
            <Card.Header className="bg-primary text-white border-0">
              <Card.Title>Lista karnetów</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th className="text-muted">LP.</th>
                    <th className="text-muted">NAZWA</th>
                    <th className="text-muted">OPIS</th>
                    <th className="text-muted">WEJŚCIA</th>
                  </tr>
                </thead>
                <tbody>
                  {passTypes &&
                    passTypes.map((passTypeData, index) => (
                      <PassTypeSettingsModal passType={passTypeData} key={passTypeData.id} onSave={() => setPassTypes(undefined)}>
                        <tr key={passTypeData.id}>
                          <td>{index + 1}.</td>
                          <td>{passTypeData.name}</td>
                          <td>{passTypeData.description} </td>
                          <td>{passTypeData.entry}</td>
                        </tr>
                      </PassTypeSettingsModal>

                    ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm mb-3 border-0">
            <Card.Header className="bg-primary text-white border-0">
                          <Card.Title>Nowy karnet</Card.Title>
                        </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-2" controlId="passName">
                  <Form.Label>Nazwa</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wpisz nazwę"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-2" controlId="passDescription">
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

                <Form.Group className="mb-2" controlId="passEntries">
                  <Form.Label>Wejścia</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ilość wejść"
                    value={entries !== null ? entries : ""}
                    onChange={(e) => setEntries(Number(e.target.value))}
                    min={1}
                  />
                </Form.Group>

                <Button
                  variant="outline-success"
                  onClick={handleAddPass}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? "Dodawanie..." : "Dodaj karnet"}
                </Button>
              </Form>
            </Card.Body>
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
