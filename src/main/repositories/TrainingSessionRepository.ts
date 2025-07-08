import { DataSource, Repository } from "typeorm";
import { TrainingSession } from "../entities/TrainingSession";

export class TrainingSessionRepository{
    private repository: Repository<TrainingSession>;
    
    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(TrainingSession);
    }
}