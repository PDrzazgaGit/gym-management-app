import { DataSource, Repository } from "typeorm";
import { PassType } from "../entities/PassType";

export class PassTypeRepository {
    private repository: Repository<PassType>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(PassType);
    }

    public async addPassType(name: string, description: string, entry: number): Promise<PassType> {
        if (!name || !description || entry <= 0)
            throw new Error("Pass properties cannot be empty or invalid.");

        // Sprawdź unikalność
        const existing = await this.repository.findOne({
            where: [{ name }, { description }]
        });

        if (existing) {
            throw new Error("PassType with the same name or description already exists.");
        }

        const passType = this.repository.create({ name, description, entry });
        return await this.repository.save(passType);
    }

    public async getPassTypes(): Promise<PassType[]> {
        return await this.repository.find();
    }

    public async modifyPassType(id: number, name?: string, description?: string, entry?: number): Promise<PassType> {
        const passType = await this.repository.findOne({ where: { id } });

        if (!passType) {
            throw new Error(`PassType with ID ${id} not found.`);
        }

        if (name) passType.name = name;
        if (description) passType.description = description;
        if (entry !== undefined) passType.entry = entry;

        return await this.repository.save(passType);
    }

    public async deletePassType(id: number): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new Error(`PassType with ID ${id} not found.`);
        }
    }
}
