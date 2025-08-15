import { DataSource, Repository, In } from "typeorm";
import { TrainingSession } from "../entities/TrainingSession";
import { Pass } from "../entities/Pass";
import { PassRepository } from "./PassRepository";
import { TrainingSessionStatus } from "../enums/TrainingSessionStatus";
import { TrainingsDayFilter } from "../enums/TrainingsDayFilter";

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
            throw new Error(`Nie znaleziono sesji treningowej o id: ${id}.`);
        }
        return trainingSession;
    }

    /*

    Potrzebuję jednej dużej metody do filtrowania treningów. Ma stanowić połączenie metod: 

    getTrainingSessionsByPass

    getTrainingSessions

    getTrainingSessionsByDay

    getTrainingSessionsByWeek.

    Działanie: filtruje w zależności od podanych wejściowych. Wejściwe (wzięte z tamtych metod):

    pass?: Pass - jeżeli podana, to wyszukuje z relacją dla wejściówki, jeśli nie podana to wszystkie

    // wyszukiwanie po stanie
    planned: boolean = false,
    inprogress: boolean = false,
    completed: boolean = false,
    cancelOwner: boolean = false,
    cancelClient: boolean = false

    trainingsDayFIlter: TrainingsDayFilter - filtruje po dniach i odnosi się do działania metod:

     getTrainingSessions

    getTrainingSessionsByDay

    getTrainingSessionsByWeek.

    enum: 

    export enum TrainingsDayFilter {
        GETALL = "Wszystkie",
        GETBYDAY = "Dzień",
        GETBYWEEK = "Tydzień"
    }

    day?: Date - jeśli trainingsDayFIlter jest na GETALL to day może pozostać puste. Jeśli zostanie podane to wyświetlają się wszystkie treningi od tej daty włącznie (Tak jak w metodzie get Training sessions)
               - jeśli trainingsDayFIlter jest na GetByDay i day jest puste to wyświetla dzisiaj, jeśli podany jest dzień to wyświetla ten wskazany. (drobna zmiana względem getTrainingSessionsByDay - dopuszczane niepodanie day - wtedy: dzisiaj)
               - jeśli trainingsDayFilter jest ba GETBYWEEK i day jest puste to wyśweitla aktualny tydzień, jeśli podany jest dzień to wyświetla tydzień w którym ten dzień się znajduje (znowu drobna zmiana  względem getTrainingSessionByWeek)

    Zasady filtrowania po dacie w zależności od stanu treningu zostają takie jak w wymienionych metodach. Błędy i niepowodzenia zgłaszane wyjątkami. 



    public async filterTrainingSession...
    */


/*
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

    const selectedStatuses: TrainingSessionStatus[] = [];

    if (planned) selectedStatuses.push(TrainingSessionStatus.PLANNED);
    if (inprogress) selectedStatuses.push(TrainingSessionStatus.IN_PROGRESS);
    if (completed) selectedStatuses.push(TrainingSessionStatus.COMPLETED);
    if (cancelOwner) selectedStatuses.push(TrainingSessionStatus.CANCELED_OWNER);
    if (cancelClient) selectedStatuses.push(TrainingSessionStatus.CANCELED_CLIENT);

    const allStatuses = Object.values(TrainingSessionStatus);
    const statusesToUse = selectedStatuses.length > 0 ? selectedStatuses : allStatuses;

    // ustalenie zakresu dat
    let start: Date | undefined;
    let end: Date | undefined;

    const now = new Date();
    switch (trainingsDayFilter) {
        case TrainingsDayFilter.GETALL:
            if (day) {
                start = new Date(day);
                start.setHours(0, 0, 0, 0);
            }
            break;

        case TrainingsDayFilter.GETBYDAY:
            const dayToUse = day ? new Date(day) : now;
            start = new Date(dayToUse);
            start.setHours(0, 0, 0, 0);

            end = new Date(dayToUse);
            end.setHours(23, 59, 59, 999);
            break;

        case TrainingsDayFilter.GETBYWEEK:
            const weekDay = day ? new Date(day) : now;
            const startOfWeek = new Date(weekDay);
            const diffToMonday = (startOfWeek.getDay() + 6) % 7;
            startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            start = startOfWeek;
            end = endOfWeek;
            break;
    }

    let qb = this.repository
        .createQueryBuilder("ts")
        .leftJoinAndSelect("ts.pass", "pass")
        .leftJoinAndSelect("pass.client", "client");

    // filtr po wejściówce
    if (pass) {
        qb = qb.andWhere("pass.id = :passId", { passId: pass.id });
    }

    // filtr po statusach
    qb = qb.andWhere("ts.status IN (:...statuses)", { statuses: statusesToUse });

    // filtr po dacie wg zasad z findSessionsByDateRange
    if (start && end) {
        qb = qb.andWhere(
            `( (ts.status = :planned AND ts.plannedAt BETWEEN :start AND :end)
            OR (ts.status IN (:...otherStatuses) AND ts.startsAt BETWEEN :start AND :end)
            OR (ts.status = :completed AND ts.endedAt BETWEEN :start AND :end) )`,
            {
                planned: TrainingSessionStatus.PLANNED,
                otherStatuses: [
                    TrainingSessionStatus.IN_PROGRESS,
                    TrainingSessionStatus.CANCELED_CLIENT,
                    TrainingSessionStatus.CANCELED_OWNER
                ],
                completed: TrainingSessionStatus.COMPLETED,
                start,
                end
            }
        );
    } else if (start && !end) {
        qb = qb.andWhere(
            `( (ts.status = :planned AND ts.plannedAt >= :start)
            OR (ts.status IN (:...otherStatuses) AND ts.startsAt >= :start)
            OR (ts.status = :completed AND ts.endedAt >= :start) )`,
            {
                planned: TrainingSessionStatus.PLANNED,
                otherStatuses: [
                    TrainingSessionStatus.IN_PROGRESS,
                    TrainingSessionStatus.CANCELED_CLIENT,
                    TrainingSessionStatus.CANCELED_OWNER
                ],
                completed: TrainingSessionStatus.COMPLETED,
                start
            }
        );
    }

    qb = qb.orderBy("ts.startsAt", "DESC");

    try {
        return await qb.getMany();
    } catch (error) {
        throw new Error(`Nie udało się przefiltrować sesji treningowych: ${error.message}`);
    }
}
*/


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

     console.log(day)
     console.log(trainingsDayFilter)
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
            throw new Error(`Nieznany typ filtra dni: ${trainingsDayFilter}`);
    }
    console.log(sessions)
    // 3. Filtrujemy po pass (jeśli podane)
    if (pass) {
        sessions = sessions.filter(s => s.pass?.id === pass.id);
    }

    // 4. Filtrujemy po statusach
    sessions = sessions.filter(s => statusesToUse.includes(s.status));

    return sessions;
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
            throw new Error(`Nie udało się pobrać sesji treningowych dla przepustki: ${error.message}`);
        }
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


    public async createTrainingSession(description: string, pass: Pass, plannedDate?: Date): Promise<TrainingSession> {
        if (plannedDate) {
            this.validatePlannedDate(plannedDate);
        }

        const trainingSession = new TrainingSession();
        trainingSession.pass = pass;
        trainingSession.description = description;
        trainingSession.status = TrainingSessionStatus.PLANNED;
        trainingSession.plannedAt = plannedDate;

        try {
            return await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się utworzyć sesji treningowej: ${error.message}`);
        }
    }

    public async startTrainingSession(trainingSession: TrainingSession) {
        if (trainingSession.status !== TrainingSessionStatus.PLANNED) {
            throw new Error(`Nie można rozpocząć sesji, ponieważ nie została zaplanowana.`);
        }

        const pass: Pass = trainingSession.pass;

        if (pass.entryLeft <= 0) {
            throw new Error(`Nie można rozpocząć sesji: brak dostępnych wejść na przepustce (ID: ${pass.cardId}).`);
        }

        trainingSession.startsAt = new Date();
        trainingSession.status = TrainingSessionStatus.IN_PROGRESS;

        try {
            await this.passRepository.decrementEntries(pass);
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się rozpocząć sesji treningowej: ${error.message}`);
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
            throw new Error(`Nie udało się anulować sesji treningowej: ${error.message}`);
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
            throw new Error(`Nie udało się anulować sesji treningowej: ${error.message}`);
        }
    }

    public async endTrainingSession(trainingSession: TrainingSession) {
        if (trainingSession.status !== TrainingSessionStatus.IN_PROGRESS) {
            throw new Error(`Nie można zakończyć sesji, ponieważ nie została rozpoczęta.`);
        }
        trainingSession.endedAt = new Date();
        trainingSession.status = TrainingSessionStatus.COMPLETED;
        try {
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się rozpocząć sesji treningowej: ${error.message}`);
        }
    }

    private validatePlannedDate(plannedDate: Date): void {
        const now = new Date();

        const truncatedPlanned = new Date(plannedDate);
        truncatedPlanned.setSeconds(0, 0);

        const truncatedNow = new Date(now);
        truncatedNow.setSeconds(0, 0);

        if (truncatedPlanned < truncatedNow) {
            throw new Error("Nie można zaplanować treningu w przeszłości ;).");
        }
    }

    private sameDate(d1?: Date, d2?: Date): boolean {
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
                throw new Error(`Nie można zmienić daty sesji treningowej, w innym stanie niż zaplanowana.`);
            }
            if (plannedDate) {
                this.validatePlannedDate(plannedDate);
            }
            trainingSession.plannedAt = plannedDate;
        }

        try {
            return await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się zmodyfikować sesji treningowej: ${error.message}`);
        }

    }

}