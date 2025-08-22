import React, { useEffect, useState } from "react"
import { Badge, Button, Card, Col, Container, Form, ListGroup, Modal, Row } from "react-bootstrap"
import { useTraining } from "../../../renderer/hooks/useTraining"
import { TrainingSessionManager } from "../../../renderer/ui-services/TrainingSessionManager";
import { PassManager } from "../../../renderer/ui-services/PassManager";
import { useAcr } from "../../../renderer/hooks/useAcr";
import { AnimatedCircle } from "../AnimatedCircle";
import { Pass } from "../../../main/entities/Pass";
import { StartListModal } from "../StartListModal";
import { TrainingSessionStatus } from "../../../main/enums/TrainingSessionStatus";
import { DateFormatter } from "../../../renderer/ui-services/DateFormatter";
import { useNavigate } from "react-router-dom";
import { PoppingModal } from "../PoppingModal";

export const Start = () => {
  const { training, setTraining, elapsedFormatted,  } = useTraining();
  const { isReaderConnected, cardData, isCardPresent, acrError, setMode, clearError } = useAcr();
  const trainingManager = TrainingSessionManager.getInstance();
  const passManager = PassManager.getInstance();

  const [error, setError] = useState<string | null>(null);

  const [pass, setPass] = useState<Pass | null>(null);

  const [showTrainingsModal, setShowTrainingsModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [confirmButton, setConfirmButton] = useState(false);
  const [description, setDescription] = useState<string>(training && training?.description !== "" ? training?.description : "");

  const navigate = useNavigate();

  const handleTypeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    if (acrError) {
      setError(acrError);
      setShowErrorModal(true);
    } else {
      setError(null);
      setShowErrorModal(false);
    }
  }, [acrError])

  useEffect(() => {
    const fetch = async () => {
      try {
        const pass = await passManager.getByUUID(cardData.uuid);
        setPass(pass);
        setShowTrainingsModal(true);
      } catch (e) {
        setError(e.message);
        setShowErrorModal(true);
      }
    };

    if (cardData) {
      fetch();
    }
  }, [cardData]);

  useEffect(() => {
    const fetchStart = async () => {
      if (training) {
        setDescription(training.description);
      }
      try {
        if (training && training.status === TrainingSessionStatus.PLANNED) {
          const updated = await trainingManager.start(training.id);
          setTraining(updated);

          console.log("what")
        }
      } catch (e) {
        setError(e.message);
        setShowErrorModal(true);
        setTraining(null);
      }

    }
    fetchStart();

  }, [training]);

  useEffect(() => {
    setMode("read");
    return () => setMode("idle");
  }, []);

  const handleEndTraining = () => {
    if (training && training.status === TrainingSessionStatus.IN_PROGRESS) {
      trainingManager.modify(training.id, description, training.plannedAt)
      trainingManager.end(training.id);
      setTraining(null);
    }
  }

  return (
    <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
      {/* Nagłówek u góry */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-black fs-2 m-0">
          {training ? "Trwający trening" : "Zaczynajmy"}
        </h2>
      </div>
      <Card className="mb-3 shadow border-0 bg-white">
        <Card.Header className="bg-black text-white border-0">
          <Card.Title className="mb-0"> Zasady rozpoczynania treningów</Card.Title>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            Można rozpocząć dowolną liczbę treningów jednocześnie. Dla każdego klienta może trwać maksymalnie jeden trening (stan <span className="text-success">in-progress</span>). Podgląd treningu dostępny jest dla ostatniego odbitego kartą klienta. Istnieje także możliwość powrotu do innego trwającego treningu – można to zrobić poprzez wybór treningu w stanie <span className="text-success">in_progress</span> z poziomu jego szczegółów.
          </Card.Text>
        </Card.Body>
        <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
          Zbliż kartę aby wybrać trening do rozpoczęcia
        </Card.Footer>
      </Card>
      <Row>
        {training && (
          <Col md={12} lg={6}>
            <Card className="mb-3 shadow border-0 bg-white">
              <Card.Header className="bg-black text-white border-0">
                <Card.Title className="mb-0">
                  {`Szczegóły treningu: ${training.pass.client.name} ${training.pass.client.surname} ${training.pass.client.alias ? `(${training.pass.client.alias})` : ''}`}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col lg={6} mg ={12}>
                    <Card.Text className="mb-3">{`${training.plannedAt
                      ? `Zaplanowano na: ${DateFormatter.formatToDateWithHours(training.plannedAt)}`
                      : "Zaplanowano bez daty"
                      }`}</Card.Text>
                    <Card.Text className="mb-3">
                      {`Utworzono: ${DateFormatter.formatToDateOnly(training.createdAt)}`}
                    </Card.Text>
                    <Card.Text className="mb-3">
                      {`${training.startsAt ? `Rozpoczęto: ${DateFormatter.formatToDateWithHours(training.startsAt)}` : "Oczekuje na rozpoczęcie"
                        }`}
                    </Card.Text >
                  </Col>
                  <Col  lg={6} mg ={12} className="d-flex justify-content-center align-items-center">
                    {training.status === TrainingSessionStatus.IN_PROGRESS && (
                      <Badge className="fs-2 bg-black">{elapsedFormatted}</Badge>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={handleTypeDescription}
                        value={description}
                        type="text"
                        placeholder={"Wpisz opis"}
                        onBlur={async () => await trainingManager.modify(training.id, description, training.plannedAt)}
                      />
                    </Form.Group>
                  </Col>
                </Row>



              </Card.Body>
              <Card.Footer className="border-0 bg-gym d-flex justify-content-end p-2">
                {confirmButton && (
                  <ListGroup.Item className="border-0 d-flex gap-2">
                    <Button 
                    variant="danger"
                    onClick={() => {
                      setConfirmButton(false);
                      handleEndTraining();

                    }}>{ }
                      Na pewno zakończyć?
                    </Button>
                    <Button
                      variant="outline-black"
                      onClick={() => {
                        setConfirmButton(false);
                      }}
                    >
                      Anuluj
                    </Button>
                  </ListGroup.Item>
                ) || (
                    <Button variant="black" onClick={() => setConfirmButton(true)}>
                      Zakończ trening
                    </Button>
                  )}

              </Card.Footer>
            </Card>
          </Col>
        )}
        <Col lg={training ? 6 : null} className="d-flex align-items-center justify-content-center ">
          <Card className="mb-3 shadow border-0 bg-black rounded-circle" >
            <Card.Body >
              <AnimatedCircle
                deviceConnected={isReaderConnected}
                dataReady={cardData && !error ? true : false}
                cardInserted={isCardPresent}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-3 shadow border-0 bg-white">
        <Card.Header className="bg-black text-white border-0">
          <Card.Title className="mb-0">Klient nie wizął karty?</Card.Title>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            Rozpoczęcie treningu bez karty jest również możliwe z poziomu zakładki Treningi lub z profilu klienta. Po kliknięciu w przycisk <span className="text-success">Rozpocznij trening bez karty</span> nastąpi przekierowanie na stronę z podglądem treningu.
          </Card.Text>
        </Card.Body>
        <Card.Footer className="border-0 bg-gym d-flex justify-content-end gap-2 p-2">
          <Button variant="black" onClick={() => { navigate("/trainings") }}>
            Treningi
          </Button>
          <Button variant="black" onClick={() => { navigate("/clients") }}>
            Klienci
          </Button>
        </Card.Footer>
      </Card>


      {pass && (<StartListModal
        pass={pass}
        setShow={setShowTrainingsModal}
        show={showTrainingsModal}
        onSave={() => {
          setPass(null);
        }}
      />)}

      <PoppingModal
        show={showErrorModal}
        setShow={setShowErrorModal}
        setMessage={setError}
        message={error}
        onClose={()=>clearError()}
      />
    </Container>
  );
};