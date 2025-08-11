import { DataSource, Repository, In } from "typeorm";
import { TrainingSession } from "../entities/TrainingSession";
import { Pass } from "../entities/Pass";
import { PassRepository } from "./PassRepository";
import { TrainingSessionStatus } from "../entities/TrainingSessionStatus";

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

    //zmienić resztę pod tą metodę
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
            order: { startsAt: 'DESC' },
        });

    } catch (error) {
        throw new Error(`Nie udało się pobrać sesji treningowych dla przepustki: ${error.message}`);
    }
}



    public async createTrainingSession(description: string, pass: Pass, plannedDate?: Date): Promise<TrainingSession> {
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

    public async clientCancelTrainingSession(trainingSession: TrainingSession, description?: string){
        trainingSession.status = TrainingSessionStatus.CANCELED_CLIENT;
        if(description){
            trainingSession.description = description;
        }
        try {
            this.passRepository.decrementEntries(trainingSession.pass);
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się rozpocząć sesji treningowej: ${error.message}`);
        }
    }

    public async ownerCancelTrainingSession(trainingSession: TrainingSession, description?: string){
        trainingSession.status = TrainingSessionStatus.CANCELED_OWNER;
        if(description){
            trainingSession.description = description;
        }
        try {
            this.passRepository.incrementEntries(trainingSession.pass);
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się rozpocząć sesji treningowej: ${error.message}`);
        }
    }

    public async endTrainingSession(trainingSession: TrainingSession){
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

    public async modifyDescription(trainingSession: TrainingSession, description: string) {
        trainingSession.description = description;
        try {
            await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się zmodyfikować opisu sesji treningowej: ${error.message}`);
        }

    }

}