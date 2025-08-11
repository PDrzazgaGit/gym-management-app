import { DataSource, Repository } from "typeorm";
import { PassType } from "../entities/PassType";

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
            throw new Error(`Nie znaleziono rodzaju przepustki o id: ${id}.`);
        }
        return passType;
    }

    public async addPassType(name: string, description: string, entry: number): Promise<PassType> {
        if (!name?.trim() || !description?.trim() || entry <= 0) {
            throw new Error("Nieprawidłowe dane: nazwa, opis i liczba wejść muszą być poprawne.");
        }

        const existing = await this.repository.findOne({
            where: [
                { name },
                { description }
            ]
        });

        if (existing) {
            throw new Error("PassType o podanej nazwie lub opisie już istnieje.");
        }

        try {
            const passType = this.repository.create({ name, description, entry });
            return await this.repository.save(passType);
        } catch (error) {
            throw new Error(`Błąd podczas zapisu PassType: ${error.message}`);
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
            throw new Error(`Nie znaleziono PassType o ID: ${id}`);
        }

        if (name) passType.name = name;
        if (description) passType.description = description;
        if (entry !== undefined) {
            if (entry <= 0) {
                throw new Error("Liczba wejść musi być większa niż 0.");
            }
            passType.entry = entry;
        }

        try {
            await this.repository.save(passType);
        } catch (error) {
            throw new Error(`Nie udało się zaktualizować PassType: ${error.message}`);
        }
    }

    public async deletePassType(id: number): Promise<void> {
        try {
            const result = await this.repository.delete(id);
            if (result.affected === 0) {
                throw new Error(`Nie znaleziono PassType o ID: ${id}`);
            }
        } catch (error) {
            throw new Error(`Nie udało się usunąć PassType: ${error.message}`);
        }
    }
}
