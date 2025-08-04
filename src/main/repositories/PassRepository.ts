import { DataSource, Repository } from "typeorm";
import { Pass } from "../entities/Pass";
import { PassType } from "../entities/PassType";
import { randomUUID } from 'crypto';

export class PassRepository {
    private repository: Repository<Pass>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Pass);
    }

    public async addPass(passType: PassType): Promise<Pass> {
        const pass = new Pass();
        pass.cardId = randomUUID(); // lub np. `generateCardId()`
        pass.entryLeft = passType.entry; // zakładamy że `PassType` ma takie pole
        pass.passType = passType;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new Error(`Nie udało się dodać przepustki: ${error.message}`);
        }
    }

    public async decrementEntries(pass: Pass): Promise<Pass> {
        if (pass.entryLeft <= 0) {
            throw new Error(`Nie można zmniejszyć liczby wejść: brak dostępnych wejść.`);
        }

        pass.entryLeft -= 1;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new Error(`Nie udało się zmniejszyć liczby wejść: ${error.message}`);
        }
    }

    public async incrementEntries(pass: Pass): Promise<Pass> {
        pass.entryLeft += 1;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new Error(`Nie udało się zwiększyć liczby wejść: ${error.message}`);
        }
    }

    public async deletePass(pass: Pass): Promise<void> {
        try {
            await this.repository.remove(pass);
        } catch (error) {
            throw new Error(`Nie udało się usunąć przepustki: ${error.message}`);
        }
    }



}