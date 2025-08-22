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
                <h2 className="fw-bold text-black fs-2 m-0">
                    Ustawienia
                </h2>
            </div>

            <Row>
                <Col md={12} lg={6}>
                    <Card className="mb-3 shadow border-0 bg-white">
                        <Card.Header className="bg-black text-white border-0">
                            <Card.Title className="mb-0">Skróty</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col lg={3}>
                                        <Button
                                            variant="outline-black"
                                            onClick={() => OtherApi.openFolder("log")}
                                            id="button_log"
                                        >
                                            Folder logów
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Form.Label>
                                            <Card.Text className="mb-0">
                                                Przechowuje logi aplikacji z każdego dnia. Nazwa pliku odpowiada dacie.
                                            </Card.Text>
                                            <Card.Text className="mb-0 text-muted">
                                                <span className="text-success">[timestamp]</span> <span className="text-danger">[INFO | WARN | ERROR]</span> <span className="text-primary">[opcjonalny_tag_zródła]</span> wiadomość <span className="text-warning">[opcjonalnie_stack_trace]</span>
                                            </Card.Text>
                                        </Form.Label>
                                    </Col>
                                </Row>


                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col lg={3}>
                                        <Button
                                            variant="outline-black"
                                            onClick={() => OtherApi.openFolder("config")}
                                        >
                                            Folder config
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            Przechowuje plik konfiguracyjny <span className="text-success">app-config.json</span> zawierający klucz szyfrowania kart RFID. W przyszłości będzie przechowywał dane uwierzytelniające do usługi google cloud (zaawansowany backup).
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Form.Group>
                                <Row>
                                    <Col lg={3}>
                                        <Button
                                            onClick={() => OtherApi.openFolder("db")}
                                            variant="outline-black"
                                        >
                                            Folder z DB
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            Przechowuje plik z bazą danych o nazwie <span className="text-success">gymdb.sqlite</span>.
                                            Aplikacja korzysta z lokalnej bazy danych SQLite, której struktura tabel i relacje są zdefiniowane w kodzie źródłowym. Dzięki temu wszystkie dane dotyczące klientów, karnetów i sesji treningowych są przechowywane lokalnie i spójnie z logiką aplikacji.
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
                            Dostęp do ważnych katalogów
                        </Card.Footer>
                    </Card>
                </Col>
                <Col md={12} lg={6}>
                    <Card className="mb-3 shadow border-0">
                        <Card.Header className="bg-black text-white border-0">
                            <Card.Title className="mb-0">Backup</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col lg={4}> <Button
                                        onClick={handleCreateBackup}
                                        variant="gym"
                                    >
                                        Stwórz kopie bazy
                                    </Button>
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            Otwiera okno z zapisem bazy danych z pliku <span className="text-success">gymdb.sqlite</span> do pliku z dzisiejszą datą. Domyślnie okno otwiera się w katalogu „Dokumenty”.
                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Row>
                                <Col lg={4}>
                                    <Form.Group>
                                        <Button
                                            onClick={handleRestoreBackup}
                                            variant="gym"
                                        >
                                            Przywróć bazę z kopii
                                        </Button>
                                    </Form.Group>
                                </Col>
                                <Col>
                                <Card.Text>
                                    Otwiera okno pozwalające na przywrócenie bazy danych z wybranego pliku. Domyślnie okno otwiera się w katalogu „Dokumenty”.
                                </Card.Text>
                                </Col>
                            </Row>

                        </Card.Body>
                        <Card.Footer className="bg-gym text-black border-0 text-end fs-8 p-2">
                            Opcje backupu bazy danych
                        </Card.Footer>
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