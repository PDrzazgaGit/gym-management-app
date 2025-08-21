import React, { useEffect, useState } from "react"
import { Button, Card, Col, Container, Form, ListGroup, Modal, Row } from "react-bootstrap"
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
  const { training, setTraining, elapsedFormatted } = useTraining();
  const { isReaderConnected, cardData, isCardPresent, acrError, setMode } = useAcr();
  const trainingManager = TrainingSessionManager.getInstance();
  const passManager = PassManager.getInstance();

  const [error, setError] = useState<string | null>(null);

  const [pass, setPass] = useState<Pass | null>(null);

  const [showTrainingsModal, setShowTrainingsModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [description, setDescription] = useState<string>(training?.description ?? '');

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

  /*

  Dokończyć widoki w tym pliku

  */

  return (
    <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
      {/* Nagłówek u góry */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary fs-2 m-0">
          {training ? "Trwający trening" : "Zaczynajmy"}
        </h2>
      </div>
      <Card className="mb-3 shadow-sm border-0">
              <Card.Header className="bg-primary text-white border-0">
                <Card.Title> Zasady rozpoczynania treningów</Card.Title>
              </Card.Header>
        <Card.Body>
          <Card.Text>
            Można rozpocząć dowolną ilość treningów w tym samym momencie. Jedynym ograniczeniem jest przynależność do karnetu - dla każdej osoby może trwać tylko jeden trening w tym samym czasie. Dzięki temu można rozpoczynać treningi grupowe.
          </Card.Text>
        </Card.Body>
      </Card>
      <Row>
        {training && (
          <Col>
            <Card className="mb-3 shadow-sm border-0">
               <Card.Header className="bg-primary text-white border-0">
                <Card.Title>
                  {`Szczegóły treningu: ${training.pass.client.name} ${training.pass.client.surname} ${training.pass.client.alias ? `(${training.pass.client.alias})` : ''}`}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                
                <ListGroup variant="flush">
                  <ListGroup.Item className="border-0">{`Utworzono: ${DateFormatter.formatToDateOnly(training.createdAt)}`}</ListGroup.Item>
                  <ListGroup.Item className="border-0">{`${training.plannedAt
                    ? `Zaplanowano na: ${DateFormatter.formatToDateWithHours(training.plannedAt)}`
                    : "Zaplanowano bez daty"
                    }`}</ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    {`${training.startsAt ? `Rozpoczęto: ${DateFormatter.formatToDateWithHours(training.startsAt)}` : "Oczekuje na rozpoczęcie"
                      }`}
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    {training.status === TrainingSessionStatus.IN_PROGRESS
                      ? `Czas trwania: ${elapsedFormatted}`
                      : "Trening jeszcze się nie rozpoczął"}
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Opis
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={handleTypeDescription}
                        value={description}
                        type="text"
                        placeholder={"Wpisz opis"}
                      //onBlur={async ()=> await trainingManager.modify(training.id, description, training.plannedAt)}
                      />
                    </Form.Group>
                  </ListGroup.Item>
                </ListGroup>

                <Button variant="outline-danger" onClick={handleEndTraining}>
                  Zakończ trening
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col>
          <Card className="mb-3 shadow-sm border-0">
            <Card.Body>
              <AnimatedCircle
                deviceConnected={isReaderConnected}
                dataReady={cardData &&!error ? true : false}
                cardInserted={isCardPresent}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-3 shadow-sm border-0">
                      <Card.Header className="bg-primary text-white border-0">
                <Card.Title>           Rozpocznij trening bez karty</Card.Title>
              </Card.Header>
        <Card.Body>
          <Card.Text>
            Rozpoczęcie treningu bez karty jest również możliwe z poziomu zakładki Treningi lub z profilu klienta.
          </Card.Text>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={() => { navigate("/trainings") }}>
              Treningi
            </Button>
            <Button variant="outline-primary" onClick={() => { navigate("/clients") }}>
              Klienci
            </Button>
          </div>

        </Card.Body>
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
      />
    </Container>
  );
};