import { DataSource, Repository } from "typeorm";
import { Client } from "../entities/Client";

export class ClientRepository {
    private repository: Repository<Client>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Client);
    }

    public async addClient(name: string, surname: string, phone?: string, alias?: string): Promise<number> {

        if(name === '' || surname === ''){
             throw new Error("Imię i nazwisko klienta w ewidencji nie mogą być puste.");
        }

        const existingClient = await this.repository.findOne({
            where: {
                name, surname
            }
        })

        if (existingClient) {
            if (!alias) {
                 throw new Error(`Klient "${name} ${surname}" już istnieje w ewidencji. Wprowadź unikalny alias.`);
            }

            const existingAlias = await this.repository.findOne({ where: { alias } })

            if (existingAlias) {
                // Jeśli alias nie jest unikalny, zwróć false
                throw new Error(`Alias "${alias}" już istnieje w ewidencji.`);
            } else {
                const newClient = this.repository.create({
                    name,
                    surname,
                    phone: phone, 
                    alias,
                });

                await this.repository.save(newClient);

                return newClient.id;
            }
        } else {
            const newClient = this.repository.create({
                name,
                surname,
                phone: phone, 
            });

            await this.repository.save(newClient);
            return newClient.id;
        }
    }

    public async getClient(name?: string, surname?: string, phone?: string, alias?: string): Promise<Client[]> {
        // not implemented yet
        const clients = await this.repository.find();
        return clients;
    }

    public async findClient(
        input: string,
        searchByName: boolean = false,
        searchBySurname: boolean = false,
        searchByPhone: boolean = false,
        searchByPass: boolean = false
    ): Promise<Client[]> {

        if (input == '' && !searchByPass)
            return await this.getAll();

        const queryBuilder = this.repository.createQueryBuilder("client");

        

        if (input != "") {

            const tokens = input.split(/[,; ]+/);

            if (searchByPhone) {
                tokens.forEach(t => queryBuilder.orWhere("client.phone LIKE :input", { input: `%${t}%` }))
                //queryBuilder.orWhere("client.phone LIKE :input", { input: `%${input}%` });
            }

            if (searchByName) {
                tokens.forEach(t => queryBuilder.orWhere("client.name LIKE :input", { input: `%${t}%` }))
            }

            if (searchBySurname) {
                tokens.forEach(t => queryBuilder.orWhere("client.surname LIKE :input", { input: `%${t}%` }))
                //queryBuilder.orWhere("client.surname LIKE :input", { input: `%${input}%` });
            }
        }

        if (searchByPass) {
            // LEFT JOIN, bo możemy mieć inne OR w zapytaniu i nie chcemy ich tracić
            queryBuilder.leftJoin("client.pass", "pass").andWhere("pass.id IS NOT NULL");
        }

        const clients = await queryBuilder.getMany();

        return clients;
    }

    public async getAll(): Promise<Client[]> {
        const clients = await this.repository.find();
        return clients;
    }
}