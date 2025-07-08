import { DataSource, Repository } from "typeorm";
import { Pass } from "../entities/Pass";

export class PassRepository{
    private repository: Repository<Pass>;
    
    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Pass);
    }

    
}