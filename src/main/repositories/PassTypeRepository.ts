import { DataSource, Repository } from "typeorm";
import { PassType } from "../entities/PassType";
import { AppError } from "../data/AppError";

export class PassTypeRepository {
    private static instance: PassTypeRepository;
    private repository: Repository<PassType>;

    private constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(PassType);
    }

    public static getInstance(dataSource: DataSource): PassTypeRepository {
        if (!PassTypeRepository.instance) {
            PassTypeRepository.instance = new PassTypeRepository(dataSource);
        }
        return PassTypeRepository.instance;
    }

    public async findOne(id: number): Promise<PassType> {
        const passType = await this.repository.findOne({ where: { id } });
        if (!passType) {
            throw new AppError(`Nie znaleziono typu przepustki.`, `Id: '${id}'.`);
        }
        return passType;
    }

    public async addPassType(name: string, description: string, entry: number): Promise<PassType> {
        if (!name?.trim() || !description?.trim() || entry <= 0) {
            throw new AppError("Nieprawidłowe dane: nazwa, opis i liczba wejść muszą być poprawne.");
        }

        const existing = await this.repository.findOne({
            where: [
                { name },
                { description }
            ]
        });

        if (existing) {
            throw new AppError("Typ przepustki o podanej nazwie lub opisie już istnieje.", `${existing}`);
        }

        try {
            const passType = this.repository.create({ name, description, entry });
            return await this.repository.save(passType);
        } catch (error) {
            throw new AppError(`Błąd podczas zapisu typu przepustki.`, error);
        }
    }

    public async getPassTypes(): Promise<PassType[]> {
        try {
            return await this.repository.find();
        } catch (error) {
            throw new Error(`Nie udało się pobrać listy PassType: ${error.message}`);
        }
    }

    public async modifyPassType(id: number, name?: string, description?: string, entry?: number){
        const passType = await this.repository.findOne({ where: { id } });

        if (!passType) {
            throw new AppError(`Nie znaleziono typu przepustki.`);
        }

        if (name) passType.name = name;
        if (description) passType.description = description;
        if (entry !== undefined) {
            if (entry <= 0) {
                throw new AppError("Liczba wejść musi być większa niż 0.");
            }
            passType.entry = entry;
        }

        try {
            await this.repository.save(passType);
        } catch (error) {
            throw new AppError(`Nie udało się zaktualizować typu przepustki.`, error);
        }
    }

    public async deletePassType(id: number): Promise<void> {
        try {
            const result = await this.repository.delete(id);
            if (result.affected === 0) {
                throw new AppError(`Nie znaleziono typu przepustki.`,`Id: '${id}'.`);
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Nie udało się usunąć typu przepustki.`,error);
        }
    }
}
