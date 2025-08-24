import { DataSource, Repository, In } from "typeorm";
import { TrainingSession } from "../entities/TrainingSession";
import { Pass } from "../entities/Pass";
import { PassRepository } from "./PassRepository";
import { TrainingSessionStatus } from "../enums/TrainingSessionStatus";
import { TrainingsDayFilter } from "../enums/TrainingsDayFilter";
import { AppError } from "../data/AppError";

export class TrainingSessionRepository {
    private repository: Repository<TrainingSession>;
    private passRepository: PassRepository;


    private static instance: TrainingSessionRepository;


    private constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(TrainingSession);
        this.passRepository = PassRepository.getInstance(dataSource);
    }

    public static getInstance(dataSource: DataSource): TrainingSessionRepository {
        if (!TrainingSessionRepository.instance) {
            TrainingSessionRepository.instance = new TrainingSessionRepository(dataSource);
        }
        return TrainingSessionRepository.instance;
    }

    public async findOne(id: number): Promise<TrainingSession> {
        const trainingSession = await this.repository.findOne({ where: { id }, relations: ['pass'] });
        if (!trainingSession) {
            throw new AppError(`Nie znaleziono sesji treningowej.`, `Id: '${id}'.`);
        }
        return trainingSession;
    }



    public async getTrainingSessionsByPass(
        pass: Pass,
        planned: boolean = false,
        inprogress: boolean = false,
        completed: boolean = false,
        cancelOwner: boolean = false,
        cancelClient: boolean = false
    ): Promise<TrainingSession[]> {
        try {
            const selectedStatuses: TrainingSessionStatus[] = [];

            if (planned) selectedStatuses.push(TrainingSessionStatus.PLANNED);
            if (inprogress) selectedStatuses.push(TrainingSessionStatus.IN_PROGRESS);
            if (completed) selectedStatuses.push(TrainingSessionStatus.COMPLETED);
            if (cancelOwner) selectedStatuses.push(TrainingSessionStatus.CANCELED_OWNER);
            if (cancelClient) selectedStatuses.push(TrainingSessionStatus.CANCELED_CLIENT);

            // Jeśli żadna flaga nie została zaznaczona — traktujemy jakby zaznaczone były wszystkie
            const allStatuses = Object.values(TrainingSessionStatus);
            const statusesToUse = selectedStatuses.length > 0 ? selectedStatuses : allStatuses;

            return await this.repository.find({
                where: {
                    pass: { id: pass.id },
                    status: In(statusesToUse),
                },
                order: { plannedAt: 'DESC' },
            });

        } catch (error) {
            throw new AppError(`Nie udało się pobrać sesji treningowych dla przepustki.`, error);
        }
    }

    public async filterTrainingSessions(
        {
            pass,
            planned = false,
            inprogress = false,
            completed = false,
            cancelOwner = false,
            cancelClient = false,
            trainingsDayFilter = TrainingsDayFilter.GETALL,
            day
        }: {
            pass?: Pass;
            planned?: boolean;
            inprogress?: boolean;
            completed?: boolean;
            cancelOwner?: boolean;
            cancelClient?: boolean;
            trainingsDayFilter?: TrainingsDayFilter;
            day?: Date;
        }
    ): Promise<TrainingSession[]> {
        // 1. Ustalamy statusy do filtrowania
        const selectedStatuses: TrainingSessionStatus[] = [];
        if (planned) selectedStatuses.push(TrainingSessionStatus.PLANNED);
        if (inprogress) selectedStatuses.push(TrainingSessionStatus.IN_PROGRESS);
        if (completed) selectedStatuses.push(TrainingSessionStatus.COMPLETED);
        if (cancelOwner) selectedStatuses.push(TrainingSessionStatus.CANCELED_OWNER);
        if (cancelClient) selectedStatuses.push(TrainingSessionStatus.CANCELED_CLIENT);

        const allStatuses = Object.values(TrainingSessionStatus);
        const statusesToUse = selectedStatuses.length > 0 ? selectedStatuses : allStatuses;

        // 2. Pobieramy bazową listę sesji wg filtra dni
        let sessions: TrainingSession[] = [];

        switch (trainingsDayFilter) {
            case TrainingsDayFilter.GETALL:

                sessions = await this.getTrainingSessions(day);
                break;
            case TrainingsDayFilter.GETBYDAY:
                sessions = await this.getTrainingSessionsByDay(day ?? new Date());
                break;
            case TrainingsDayFilter.GETBYWEEK:
                sessions = await this.getTrainingSessionsByWeek(day ?? new Date());
                break;
            default:
                throw new AppError(`Nieznany typ filtra dni.`, trainingsDayFilter);
        }
        // 3. Filtrujemy po pass (jeśli podane)
        if (pass) {
            sessions = sessions.filter(s => s.pass?.id === pass.id);
        }

        // 4. Filtrujemy po statusach
        sessions = sessions.filter(s => statusesToUse.includes(s.status));

        return sessions;
    }

    private async findSessionsByDateRange(start: Date, end: Date): Promise<TrainingSession[]> {
        return this.repository
            .createQueryBuilder("ts")
            .leftJoinAndSelect("ts.pass", "pass")
            .leftJoinAndSelect("pass.client", "client") // <-- dodanie klienta
            .where("(ts.status = :planned AND ts.plannedAt BETWEEN :start AND :end)", {
                planned: TrainingSessionStatus.PLANNED,
                start,
                end
            })
            .orWhere("(ts.status IN (:...otherStatuses) AND ts.startsAt BETWEEN :start AND :end)", {
                otherStatuses: [
                    TrainingSessionStatus.IN_PROGRESS,
                    TrainingSessionStatus.CANCELED_CLIENT,
                    TrainingSessionStatus.CANCELED_OWNER
                ],
                start,
                end
            })
            .orWhere("(ts.status = :completed AND ts.endedAt BETWEEN :start AND :end)", {
                completed: TrainingSessionStatus.COMPLETED,
                start,
                end
            })
            .orderBy("ts.startsAt", "DESC")
            .getMany();
    }

    // do dodania
    public async getTrainingSessions(day?: Date): Promise<TrainingSession[]> {
        if (!day) {
            return this.repository.find({
                order: { createdAt: 'DESC' },
                relations: ['pass', 'pass.client'],
            });
        } else {

            const startOfDay = new Date(day);
            startOfDay.setHours(0, 0, 0, 0);

            return this.repository
                .createQueryBuilder("ts")
                .leftJoinAndSelect("ts.pass", "pass")
                .leftJoinAndSelect("pass.client", "client") // <-- dodanie klienta
                .where("(ts.status = :planned AND ts.plannedAt >= :startOfDay)", {
                    planned: TrainingSessionStatus.PLANNED,
                    startOfDay
                })
                .orWhere("(ts.status IN (:...otherStatuses) AND ts.startsAt >= :startOfDay)", {
                    otherStatuses: [
                        TrainingSessionStatus.IN_PROGRESS,
                        TrainingSessionStatus.CANCELED_CLIENT,
                        TrainingSessionStatus.CANCELED_OWNER
                    ],
                    startOfDay
                })
                .orWhere("(ts.status = :completed AND ts.endedAt >= :startOfDay)", {
                    completed: TrainingSessionStatus.COMPLETED,
                    startOfDay
                })
                .orderBy("ts.startsAt", "DESC")
                .getMany();
        }
    }

    // do dodania
    public async getTrainingSessionsByDay(day: Date): Promise<TrainingSession[]> {
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);

        return this.findSessionsByDateRange(startOfDay, endOfDay);
    }

    // do dodania
    public async getTrainingSessionsByWeek(dayOfWeek: Date): Promise<TrainingSession[]> {
        const startOfWeek = new Date(dayOfWeek);
        const day = startOfWeek.getDay(); // niedziela=0, pon=1, ..., sob=6
        const diffToMonday = (day + 6) % 7;
        startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return this.findSessionsByDateRange(startOfWeek, endOfWeek);
    }


    public async createTrainingSession(pass: Pass, description?: string, plannedDate?: Date): Promise<TrainingSession> {
        if (plannedDate) {
            this.validatePlannedDate(plannedDate);
        }

        const trainingSession = new TrainingSession();
        trainingSession.pass = pass;
        trainingSession.description = description;
        trainingSession.status = TrainingSessionStatus.PLANNED;
        trainingSession.plannedAt = plannedDate;

        try {
            const saved = await this.repository.save(trainingSession);

            return await this.repository.findOneOrFail({
                where: { id: saved.id },
                relations: ['pass', 'pass.client'],
            });
        } catch (error) {
            throw new AppError(`Nie udało się utworzyć sesji treningowej.`, error);
        }
    }

    public async startTrainingSession(trainingSession: TrainingSession): Promise<TrainingSession> {
        if (trainingSession.status !== TrainingSessionStatus.PLANNED) {
            throw new AppError(`Nie można rozpocząć sesji, ponieważ nie została zaplanowana.`, trainingSession);
        }

        const pass: Pass = trainingSession.pass;

        if (pass.entryLeft <= 0) {
            throw new AppError(`Nie można rozpocząć sesji: brak dostępnych wejść na przepustce.`);
        }

        // Sprawdzenie, czy istnieje już sesja IN_PROGRESS dla tej samej przepustki
        const ongoingSession = await this.repository.findOne({
            where: {
                pass: { id: pass.id },
                status: TrainingSessionStatus.IN_PROGRESS
            },
            relations: ['pass', 'pass.client']
        });

        if (ongoingSession) {
            throw new AppError(`Nie można rozpocząć sesji: istnieje już aktywny trening dla tej przepustki.`, ongoingSession);
        }

        trainingSession.startsAt = new Date();
        trainingSession.status = TrainingSessionStatus.IN_PROGRESS;

        try {
            await this.passRepository.decrementEntries(pass);


            const saved = await this.repository.save(trainingSession);

            return await this.repository.findOneOrFail({
                where: { id: saved.id },
                relations: ['pass', 'pass.client'],
            });
        } catch (error) {
            throw new AppError(`Nie udało się rozpocząć sesji treningowej.`, error);
        }
    }

    public async clientCancelTrainingSession(trainingSession: TrainingSession, description?: string) {
        if (trainingSession.status != TrainingSessionStatus.PLANNED) {
            throw new Error(`Nie da się anulować niezaplanowej sesji treningowej.`)
        }
        trainingSession.status = TrainingSessionStatus.CANCELED_CLIENT;
        if (description) {
            trainingSession.description = description;
            trainingSession.startsAt = new Date();
            trainingSession.endedAt = trainingSession.startsAt;
        }
        try {
            this.passRepository.decrementEntries(trainingSession.pass);
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new AppError(`Nie udało się anulować sesji treningowej.`,error);
        }
    }

    public async ownerCancelTrainingSession(trainingSession: TrainingSession, description?: string) {
        if (trainingSession.status != TrainingSessionStatus.PLANNED) {
            throw new Error(`Nie da się anulować niezaplanowej sesji treningowej.`)
        }
        trainingSession.status = TrainingSessionStatus.CANCELED_OWNER;
        if (description) {
            trainingSession.description = description;
            trainingSession.startsAt = new Date();
            trainingSession.endedAt = trainingSession.startsAt;
        }
        try {
            this.passRepository.incrementEntries(trainingSession.pass);
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new AppError(`Nie udało się anulować sesji treningowej.`, error);
        }
    }

    public async endTrainingSession(trainingSession: TrainingSession): Promise<TrainingSession> {
        if (trainingSession.status !== TrainingSessionStatus.IN_PROGRESS) {
            throw new AppError(`Nie można zakończyć sesji, ponieważ nie została rozpoczęta.`, trainingSession);
        }
        trainingSession.endedAt = new Date();
        trainingSession.status = TrainingSessionStatus.COMPLETED;
        try {
            return await this.repository.save(trainingSession);
        } catch (error) {
            throw new AppError(`Nie udało się rozpocząć sesji treningowej.`, error);
        }
    }

    private validatePlannedDate(plannedDate: Date): void {
        const now = new Date();

        const truncatedPlanned = new Date(plannedDate);
        truncatedPlanned.setSeconds(0, 0);

        const truncatedNow = new Date(now);
        truncatedNow.setSeconds(0, 0);

        if (truncatedPlanned < truncatedNow) {
            throw new AppError("Nie można zaplanować treningu w przeszłości.", truncatedPlanned);
        }
    }

    private sameDate(d1?: Date, d2?: Date): boolean {
        if (!d1 && !d2) return true;
        if (!d1 || !d2) return false;
        return d1.getTime() === d2.getTime();
    }

    //poprawić wszędzie indziej
    public async modify(trainingSession: TrainingSession, description?: string, plannedDate?: Date): Promise<TrainingSession> {
        if (description) {
            trainingSession.description = description;
        }
        if (!this.sameDate(plannedDate, trainingSession.plannedAt)) {
            if (trainingSession.status != TrainingSessionStatus.PLANNED) {
                throw new AppError(`Nie można zmienić daty sesji treningowej, w innym stanie niż zaplanowana.`, trainingSession);
            }
            if (plannedDate) {
                this.validatePlannedDate(plannedDate);
            }
            trainingSession.plannedAt = plannedDate;
        }

        try {
            const saved = await this.repository.save(trainingSession);

            return await this.repository.findOneOrFail({
                where: { id: saved.id },
                relations: ['pass', 'pass.client'],
            });

        } catch (error) {
            throw new AppError(`Nie udało się zmodyfikować sesji treningowej.`, error);
        }

    }

}