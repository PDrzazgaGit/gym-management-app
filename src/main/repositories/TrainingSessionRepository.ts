import { DataSource, Repository } from "typeorm";
import { TrainingSession } from "../entities/TrainingSession";
import { Pass } from "../entities/Pass";
import { PassRepository } from "./PassRepository";

export class TrainingSessionRepository {
    private repository: Repository<TrainingSession>;
    private passRepository: PassRepository;

    constructor(dataSource: DataSource, passRepository: PassRepository) {
        this.repository = dataSource.getRepository(TrainingSession);
        this.passRepository = passRepository;
    }

    public async newTrainingSession(description: string, pass: Pass): Promise<TrainingSession> {
        if (pass.entryLeft <= 0) {
            throw new Error('Nie można rozpocząć treningu: brak dostępnych wejść na przepustce.');
        }

        const trainingSession = new TrainingSession();
        trainingSession.pass = pass;
        trainingSession.description = description;

        try {
            return await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się utworzyć sesji treningowej: ${error.message}`);
        }
    }

   
    /*
    TODO
        metoda do zaczęcia (startowania) sesji dla pass:
            - sprawdza czy jest jakaś nieskończona (niezdefiniowana, tj null)
            - jeśli jest więcej niż 1 nieskończona to zgłasza błąd, trzeba będzie zakończyć resztę
            - ustawia starts at i dekrementuje liczbe przepustek

        metoda do zamykania sesji dla pass: zamyka otwartą sesję dla pass
    */

    public async modifyDescription(trainingSession: TrainingSession, description: string){
        trainingSession.description = description;
        try {
            return await this.repository.save(trainingSession);
        } catch (error) {
            throw new Error(`Nie udało się zmodyfikować opisu sesji treningowej: ${error.message}`);
        }
        
    }

}