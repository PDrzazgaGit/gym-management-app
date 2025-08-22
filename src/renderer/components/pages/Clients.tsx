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
import { Search } from "react-bootstrap-icons";
import { Client } from "../../../main/entities/Client";
import { ClientManager } from "../../ui-services/ClientManager";
import { useClient } from "../../../renderer/hooks/useClient";
import { useNavigate } from "react-router-dom";
import { ValidationService } from "../../../renderer/ui-services/ValidationService";
import { PoppingModal } from "../PoppingModal";

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

  const [visibleCount, setVisibleCount] = useState(0);
  const SPEED = 25;

  useEffect(() => {
    if (!clientList) return;

    setVisibleCount(0); // reset
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= clientList.length) clearInterval(interval);
    }, SPEED); // 10ms per row

    return () => clearInterval(interval);
  }, [clientList]);

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
        <h2 className="fw-bold text-black fs-2 m-0">
          Ewidencja klientów
        </h2>
      </div>
      <Row>
        <Col md={12} lg={6}>
          {/* Karta z formularzem dodawania klienta */}
          <Card className="mb-3 shadow border-0 bg-white">
            <Card.Header className="bg-black text-white border-0">
              <Card.Title className="mb-0">Dodaj klienta</Card.Title>
            </Card.Header>
            <Card.Body>

              <Form.Group className="mb-3">
                <Form.Label>Imię</Form.Label>
                <Form.Control
                  placeholder="Wpisz imię"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                ></Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nazwisko</Form.Label>
                <Form.Control
                  placeholder="Wpisz nazwisko"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  type="text"
                />
              </Form.Group>
              <Form.Group className={showAlias ? "mb-3" : ''}>
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  placeholder="Wpisz telefon (opcjonalnie)"
                  value={phone}
                  onChange={(e) => {
                    const phone = ValidationService.typingPhone(e.target.value);
                    setPhone(phone)
                  }}
                  type="text"
                />
              </Form.Group>
              {showAlias && (
                <Form.Group>
                  <Form.Label>Alias</Form.Label>
                  <Form.Control
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    type="text"
                    placeholder="Wpisz alias"
                  />
                </Form.Group>
              )}

            </Card.Body>
            <Card.Footer className="border-0 bg-gym d-flex justify-content-end p-2">
              <Button variant="black" onClick={handleAddClient}>
                Dodaj klienta
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={12} lg={6}>
          {/* Karta wyszukiwania klientów */}
          <Card className="mb-3 shadow border-0 bg-white">
            <Card.Header className="bg-black text-white border-0">
              <Card.Title className="mb-0">Znajdź osobę</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <InputGroup>
                  <Form.Control
                    type="search"
                    onChange={handleTypeSearch}
                    value={search}
                    placeholder="Wpisz szukaną frazę..."
                  />
                  <Button variant="gym" onClick={handleSearch}>
                    <Search />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Card.Body>
            <Card.Footer className="border-0 bg-gym d-flex justify-content-end p-2">
              <InputGroup className="flex-wrap d-flex justify-content-end">
                <Form.Check
                  id="imie_check"
                  label="Imię"
                  checked={searchByName}
                  onChange={(e) => setSearchByName(e.target.checked)}
                  disabled={disabled}
                  className="me-2"
                />
                <Form.Check
                  id="nazwisko_check"
                  label="Nazwisko"
                  checked={searchBySurname}
                  onChange={(e) => setSearchBySurname(e.target.checked)}
                  className="me-2"
                />
                <Form.Check
                  id="telefon_check"
                  label="Telefon"
                  checked={searchByPhone}
                  onChange={(e) => setSearchByPhone(e.target.checked)}
                  className="me-2"
                />
                <Form.Check
                  id="pass_check"
                  label="Karnet"
                  checked={searchByPass}
                  onChange={(e) => setSearchByPass(e.target.checked)}
                  className="me-2"
                />
              </InputGroup>
            </Card.Footer>
          </Card>
        </Col>
      </Row>


      {/* Karta z tabelą klientów */}
      <Card className="mb-3 shadow border-0 bg-white" >
        <Card.Header className="bg-black text-white border-0">
          <Card.Title className="mb-0">Lista klientów</Card.Title>
        </Card.Header>
        <Card.Body>
          <div style={{ maxHeight: "32vh", overflowY: "auto" }}>
            <Table hover style={{ tableLayout: "fixed", width: "100%" }}>
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "white" }}>
                <tr>
                  <th style={{ width: "10%" }} className="text-muted">LP.</th>
                  <th style={{ width: "25%" }} className="text-muted">IMIĘ</th>
                  <th style={{ width: "25%" }} className="text-muted">NAZWISKO (ALIAS)</th>
                  <th style={{ width: "30%" }} className="text-muted">TELEFON</th>
                  <th style={{ width: "20%" }} className="text-muted">KARNET</th>
                </tr>
              </thead>
              <tbody>
                {clientList &&
                  clientList.slice(0, visibleCount).map((clientData, index) => (
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
          </div>

        </Card.Body>
        <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
          Wybierz klienta z listy aby wyświetlić profil
        </Card.Footer>
      </Card>

      <PoppingModal
        show={showErrorModal}
        setShow={setShowErrorModal}
        setMessage={setMessage}
        message={message}
      />
    </Container>
  );
};
