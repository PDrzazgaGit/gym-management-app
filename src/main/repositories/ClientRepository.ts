import { DataSource, Repository, Not } from "typeorm";
import { Client } from "../entities/Client";
import { Pass } from "../entities/Pass";

export class ClientRepository {
    private repository: Repository<Client>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Client);
    }

    public async addClient(name: string, surname: string, phone?: string, alias?: string): Promise<number> {

        if (name === '' || surname === '') {
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

    private async getClientById(id: number): Promise<Client> {
        const client: Client = await this.repository.findOne({ where: { id: id } });
        if (!client) {
            throw new Error('Nie znaleziono klienta.');
        }
        return client;
    }

    public async getAll(): Promise<Client[]> {
        const clients = await this.repository.find();
        return clients;
    }

    public async modifyClient(
        id: number,
        name?: string,
        surname?: string,
        phone?: string,
        alias?: string
    ): Promise<void> {
        const client = await this.getClientById(id);

        // Przygotuj nowe wartości
        const newName = name ?? client.name;
        const newSurname = surname ?? client.surname;
        const newPhone = phone ?? client.phone;
        const newAlias = alias ?? client.alias;

        // Sprawdź czy zmieniamy imię lub nazwisko i czy ktoś inny ma już takie dane
        const isChangingIdentity = newName !== client.name || newSurname !== client.surname;

        if (isChangingIdentity) {
            const duplicate = await this.repository.findOne({
                where: {
                    name: newName,
                    surname: newSurname,
                    id: Not(id), // inny klient
                }
            });

            if (duplicate) {
                if (!newAlias) {
                    throw new Error(`Istnieje już klient o imieniu "${newName}" i nazwisku "${newSurname}". Wprowadź alias, aby rozróżnić klientów.`);
                }

                // Sprawdź czy alias jest unikalny
                const aliasExists = await this.repository.findOne({
                    where: {
                        alias: newAlias,
                        id: Not(id),
                    }
                });

                if (aliasExists) {
                    throw new Error(`Alias "${newAlias}" jest już zajęty. Wybierz inny.`);
                }
            }
        }

        // Zaktualizuj dane
        client.name = newName;
        client.surname = newSurname;
        client.phone = newPhone;
        client.alias = newAlias;

        await this.repository.save(client);
    }


    public async removePass(id: number) {
        const client: Client = await this.getClientById(id);
        if (client.pass == null) {
            throw new Error(`Klient ${client.name} ${client.surname} ${client.alias ? '(' + client.alias + ')' : ''} już nie posiadał przepustki.`);
        }
        client.pass = null;
        await this.repository.save(client);
    }

    public async addPass(id: number, pass: Pass) {
        const client: Client = await this.getClientById(id);
        if (client.pass != null) {
            throw new Error(`Klient ${client.name} ${client.surname} ${client.alias ? '(' + client.alias + ')' : ''} już posiada przepustkę.`);
        }
        client.pass = pass;
        await this.repository.save(client);
    }
}