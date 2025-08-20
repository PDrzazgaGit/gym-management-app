import { DataSource, Repository } from "typeorm";
import { Pass } from "../entities/Pass";
import { PassType } from "../entities/PassType";
import { randomUUID } from 'crypto';
import { AppError } from "../data/AppError";

export class PassRepository {
    private repository: Repository<Pass>;

    private static instance: PassRepository;

    private constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Pass);
    }

    public static getInstance(dataSource: DataSource): PassRepository {
        if (!PassRepository.instance) {
            PassRepository.instance = new PassRepository(dataSource);
        }
        return PassRepository.instance;
    }

    public async findOne(id: number): Promise<Pass> {
        const pass = await this.repository.findOne({ where: { id } });
        if (!pass) {
            throw new AppError(`Nie znaleziono przepustki.`, `Id: '${id}'.`);
        }
        return pass;
    }

    public async getPassByUUID(uuid: string): Promise<Pass> {
        const pass = await this.repository.findOne({
            where: { cardId: uuid }, relations: ["client"]
        });

        if (!pass) {
            throw new AppError(`Nie udało się znaleźć przepustki z danym uuid.`, `UUID: '${uuid}'.`);
        }

        return pass;
    }

    public async addPass(passType: PassType): Promise<Pass> {
        const pass = new Pass();
        //pass.cardId = randomUUID(); // lub np. `generateCardId()`
        pass.entryLeft = passType.entry; // zakładamy że `PassType` ma takie pole
        pass.passType = passType;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new AppError(`Nie udało się dodać przepustki.`,error);
        }
    }

    public async tryAssignCard(pass: Pass, previousUUID: string): Promise<string | null> {


        // Sprawdzenie, czy previousUUID istnieje w bazie w innych przepustkach
        const existingPass = await this.repository.findOne({ where: { cardId: previousUUID } });

        if (existingPass && existingPass.id !== pass.id) {
            // previousUUID jest już użyty przez inną przepustkę
            return null;
        }

        // Generujemy nowy UUID
        const newUUID = randomUUID();
        pass.cardId = newUUID;

        try {
            await this.repository.save(pass);
            return newUUID;
        } catch (error: any) {
            throw new AppError(`Nie udało się dodać lub zmienić UUID przepustki.`, error);
        }
    }

    public async extendPass(pass: Pass, passType: PassType): Promise<Pass>{
        if (pass.entryLeft !== 0) {
            throw new AppError(`Nie można przedłużyć jeszcze ważnej przepustki.`);
        }
        pass.passType = passType;
        pass.entryLeft = passType.entry;
        try{
            return await this.repository.save(pass);
        }catch(error){
             throw new AppError(`Nie udało się przedłużyć przepustki.`, error);
        }
    }

    public async decrementEntries(pass: Pass): Promise<Pass> {
        if (pass.entryLeft <= 0) {
            throw new AppError(`Nie można zmniejszyć liczby wejść: brak dostępnych wejść.`);
        }

        pass.entryLeft -= 1;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new AppError(`Nie udało się zmniejszyć liczby wejść`, error);
        }
    }

    public async incrementEntries(pass: Pass): Promise<Pass> {
        pass.entryLeft += 1;

        try {
            return await this.repository.save(pass);
        } catch (error) {
            throw new AppError(`Nie udało się zwiększyć liczby wejść.`,error);
        }
    }

    public async deletePass(pass: Pass): Promise<void> {
        try {
            await this.repository.remove(pass);
        } catch (error) {
            throw new AppError(`Nie udało się usunąć przepustki.`, error);
        }
    }



}