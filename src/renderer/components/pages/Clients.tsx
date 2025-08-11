import React, { useEffect, useState } from "react";
import {
  Col,
  FormCheck,
  FormControl,
  InputGroup,
  Row,
  Table,
  Card,
  Modal,
  Button,
  Container,
  Form,
} from "react-bootstrap";
import { StyledButton } from "../StyledButton";
import { Search } from "react-bootstrap-icons";
import { Client } from "../../../main/entities/Client";
import { ClientManager } from "../../ui-services/ClientManager";
import { useClient } from "../../../renderer/hooks/useClient";
import { useNavigate } from "react-router-dom";
import { ValidationService } from "../../../renderer/ui-services/ValidationService";

export const Clients = () => {
  const navigate = useNavigate();
  const { setClient } = useClient();
  const clientManager = ClientManager.getInstance();

  // Lista klientów
  const [clientList, setClientList] = useState<Client[] | undefined>(undefined);

  // Wyszukiwanie
  const [search, setSearch] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [searchByName, setSearchByName] = useState<boolean>(false);
  const [searchBySurname, setSearchBySurname] = useState<boolean>(false);
  const [searchByPhone, setSearchByPhone] = useState<boolean>(false);
  const [searchByPass, setSearchByPass] = useState<boolean>(false);

  // Dodawanie klienta - formularz na stronie
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [showAlias, setShowAlias] = useState<boolean>(false);

  // Modal błędu
  const [message, setMessage] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  // Fetch wszystkich klientów (inicjalne i po odświeżeniu)
  useEffect(() => {
    if (!clientList) {
      (async () => {
        const result = await clientManager.getAll();
        setClientList(result);
      })();
    }
  }, [clientList]);

  // Logika wymuszająca zaznaczenie co najmniej jednego kryterium wyszukiwania
  useEffect(() => {
    if (!searchByName && !searchByPass && !searchByPhone && !searchBySurname) {
      setSearchByName(true);
      setDisabled(true);
    }
  }, [searchByName, searchByPass, searchByPhone, searchBySurname]);

  useEffect(() => {
    if (searchByPass || searchByPhone || searchBySurname) {
      setDisabled(false);
    }
  }, [searchByPass, searchByPhone, searchBySurname]);

  // Obsługa wpisywania frazy wyszukiwania
  const handleTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Wyszukiwanie klientów wg kryteriów
  const handleSearch = async () => {
    const result = await clientManager.find(
      search,
      searchByName,
      searchBySurname,
      searchByPhone,
      searchByPass
    );
    setClientList(result);
  };

  // Dodawanie klienta na stronie (bez modala), błędy wyświetlane w osobnym modalu
  const handleAddClient = async () => {
    try {
      await clientManager.add(name, surname, phone, alias);
      // Czyszczenie formularza po sukcesie
      setName("");
      setSurname("");
      setPhone("");
      setAlias("");
      setShowAlias(false);
      // Odśwież listę klientów
      setClientList(undefined);
    } catch (error: any) {
      if (alias) {
        setMessage(error.message);
        setAlias("");
      } else {
        if (!name || !surname) {
          setMessage("Wypełnij pola imię oraz nazwisko.");
        } else {
          setShowAlias(true);
          setMessage(error.message);
        }
      }
      setShowErrorModal(true);
    }
  };

  return (
    <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
      {/* Karta wyszukiwania klientów */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary fs-2 m-0">
          Ewidencja klientów
        </h2>
      </div>
      <Row>
        <Col>
          {/* Karta z formularzem dodawania klienta */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="text-muted">Dodaj klienta</Card.Title>
              <Form.Group className="mb-2">
                <Form.Label>Imię</Form.Label>
                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                ></Form.Control>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Nazwisko</Form.Label>
                <Form.Control
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  type="text"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  value={phone}
                  onChange={(e) => {
                    const phone = ValidationService.typingPhone(e.target.value);
                    setPhone(phone)
                  }}
                  type="text"
                />
              </Form.Group>
              {showAlias && (
                <Form.Group className="mb-2">
                  <Form.Label>Alias</Form.Label>
                  <Form.Control
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    type="text"
                  />
                </Form.Group>
              )}
              <StyledButton variant="outline-success" onClick={handleAddClient}>
                Dodaj klienta
              </StyledButton>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          {/* Karta wyszukiwania klientów */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="text-muted mb-2">Znajdź osobę</Card.Title>
              <Form.Group className="mb-2">
                <InputGroup>
                  <Form.Control
                    type="search"
                    onChange={handleTypeSearch}
                    value={search}
                    placeholder="Wpisz szukaną frazę..."
                  />
                  <Button variant="gym" className="border"onClick={handleSearch}>
                    <Search />
                  </Button>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Check
                    id="imie_check"
                    label="Imię"
                    checked={searchByName}
                    onChange={(e) => setSearchByName(e.target.checked)}
                    disabled={disabled}
                  />
                  <Form.Check
                    id="nazwisko_check"
                    label="Nazwisko"
                    checked={searchBySurname}
                    onChange={(e) => setSearchBySurname(e.target.checked)}
                  />
                  <Form.Check
                    id="telefon_check"
                    label="Telefon"
                    checked={searchByPhone}
                    onChange={(e) => setSearchByPhone(e.target.checked)}
                  />
                  <Form.Check
                    id="pass_check"
                    label="Karnet"
                    checked={searchByPass}
                    onChange={(e) => setSearchByPass(e.target.checked)}
                  />
              </Form.Group>

            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* Karta z tabelą klientów */}
      <Card className="mb-3 shadow-sm" style={{ maxHeight: "40vh", overflowY: "auto" }}>
        <Card.Body>
          <Table hover responsive className="mx-0 mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-muted">LP.</th>
                <th className="text-muted">IMIĘ</th>
                <th className="text-muted">NAZWISKO (ALIAS)</th>
                <th className="text-muted">TELEFON</th>
                <th className="text-muted">KARNET</th>
              </tr>
            </thead>
            <tbody>
              {clientList &&
                clientList.map((clientData, index) => (
                  <tr
                    key={clientData.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setClient(clientData);
                      navigate("/clientpanel");
                    }}
                  >
                    <td>{index + 1}.</td>
                    <td>{clientData.name}</td>
                    <td>
                      {clientData.surname}
                      {clientData.alias ? ` (${clientData.alias})` : ""}
                    </td>
                    <td>{clientData.phone ? clientData.phone : "-"}</td>
                    <td>{clientData.pass ? "TAK" : "NIE"}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>



      {/* Modal do wyświetlania błędów */}
      <Modal
        show={showErrorModal}
        onHide={() => {
          setShowErrorModal(false);
          setMessage(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Błąd</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <StyledButton
            variant="secondary"
            onClick={() => {
              setShowErrorModal(false);
              setMessage(null);
            }}
          >
            Zamknij
          </StyledButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
