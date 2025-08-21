import React, { useState } from "react"
import { Container, Card, Button, ListGroup, Form, FormGroup, Row, Col } from "react-bootstrap"
import { OtherApi } from "../../../renderer/ui-services/OtherAPI"
import { BackupManager } from "../../ui-services/BackupManager";
import { PoppingModal } from "../PoppingModal";



export const Settings = () => {

    const backupManager = BackupManager.getInstance();
    // Modal błędu
    const [message, setMessage] = useState<string | null>(null);
    const [showPoppingModal, setShowPoppingModal] = useState<boolean>(false);
    const [poppingModalType, setPoppingModalType] = useState<'error' | 'info'>('error');
    const [poppingModalTitle, setPoppingModalTitle] = useState<'Błąd' | 'Sukces'>('Błąd');

    const handleCreateBackup = async () => {
        try {
            const result = await backupManager.create();
            if (result === undefined) return;
            setMessage(`Udało się utworzyć kopię zapasową w '${result}'.`)
            setPoppingModalType("info");
            setPoppingModalTitle("Sukces");
            setShowPoppingModal(true);
        } catch (error) {
            setMessage(error.message);
            setShowPoppingModal(true);
        }
    }

    const handleRestoreBackup = async () => {
        try {
            const result = await backupManager.restore();
            if (result === undefined) return;
            setMessage(`Udało się przywrócić kopię zapasową z '${result}'.`)
            setPoppingModalType("info");
            setPoppingModalTitle("Sukces");
            setShowPoppingModal(true);
        } catch (error) {
            setMessage(error.message);
            setShowPoppingModal(true);
        }
    }

    return (
        <Container fluid className="py-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
            {/* Nagłówek u góry */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary fs-2 m-0">
                    Ustawienia
                </h2>
            </div>

            <Row>
                <Col>
                    <Card className="mb-3 shadow-sm border-0">
                        <Card.Header className="bg-primary text-white border-0">
                            <Card.Title>Skróty</Card.Title>
                        </Card.Header>
                        <Card.Body>

                            <Form.Group className="mb-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => OtherApi.openFolder("log")}
                                >
                                    Folder logów
                                </Button>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => OtherApi.openFolder("config")}
                                >
                                    Folder konfiguracyjny
                                </Button>
                            </Form.Group>
                            <Form.Group>
                                <Button
                                    onClick={() => OtherApi.openFolder("db")}
                                    variant="outline-primary"
                                >
                                    Folder z bazą danych
                                </Button>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="mb-3 shadow-sm border-0">
                        <Card.Header className="bg-primary text-white border-0">
                            <Card.Title>Backup</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-2">
                                <Button
                                    onClick={handleCreateBackup}
                                    variant="outline-primary"
                                >
                                    Stwórz kopie bazy (ręcznie)
                                </Button>
                            </Form.Group>
                            <Form.Group>
                                <Button
                                    onClick={handleRestoreBackup}
                                    variant="outline-primary"
                                >
                                    Przywróć bazę z kopii (ręcznie)
                                </Button>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <PoppingModal
                title={poppingModalTitle}
                show={showPoppingModal}
                setShow={setShowPoppingModal}
                setMessage={setMessage}
                message={message}
                type={poppingModalType}
                onClose={() => { setPoppingModalType('error'); setPoppingModalTitle('Błąd'); }}
            />
        </Container>

    )
}