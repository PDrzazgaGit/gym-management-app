import { DataSource, Repository, Not } from "typeorm";
import { Client } from "../entities/Client";
import { Pass } from "../entities/Pass";
import { PassRepository } from "./PassRepository";
import { AppError } from "../data/AppError";

export class ClientRepository {
    private repository: Repository<Client>;
    private passRepository: PassRepository;
    private static instance: ClientRepository;

    private constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Client);
        this.passRepository = PassRepository.getInstance(dataSource);
    }

    public static getInstance(dataSource: DataSource): ClientRepository {
        if (!ClientRepository.instance) {
            ClientRepository.instance = new ClientRepository(dataSource);
        }
        return ClientRepository.instance;
    }

    public async findOne(id: number): Promise<Client> {
        const client = await this.repository.findOne({ where: { id }, relations: ['pass'] });
        if (!client) {
            throw new AppError(`Nie znaleziono klienta.`, `Id: '${id}'.`);
        }
        return client;
    }

    public async addClient(name: string, surname: string, phone?: string, alias?: string): Promise<Client> {
        if (!name?.trim() || !surname?.trim()) {
            throw new AppError("Imię i nazwisko klienta nie mogą być puste.");
        }

        try {
            const existingClient = await this.repository.findOne({ where: { name, surname } });

            if (existingClient) {
                if (!alias?.trim()) {
                    throw new AppError(`Klient "${name} ${surname}" już istnieje. Wprowadź unikalny alias.`);
                }

                const existingAlias = await this.repository.findOne({ where: { alias } });
                if (existingAlias) {
                    throw new AppError(`Alias "${alias}" już istnieje.`);
                }
            } else if (alias) {
                const existingAlias = await this.repository.findOne({ where: { alias } });
                if (existingAlias) {
                    throw new AppError(`Alias "${alias}" już istnieje.`);
                }
            }
            if (alias) {
                const newClient = this.repository.create({ name, surname, phone, alias });
                return await this.repository.save(newClient);
            } else {
                const newClient = this.repository.create({ name, surname, phone });
                return await this.repository.save(newClient);
            }

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Nie udało się dodać klienta.`, { error });
        }
    }

    public async getClients(): Promise<Client[]> {
        try {
            return await this.repository.find({ relations: ['pass'] });
        } catch (error) {
            throw new AppError(`Nie udało się pobrać wszystkich klientów.`, error);
        }
    }

    public async getClientByPass(pass: Pass): Promise<Client> {
        try {
            const client = await this.repository.findOneOrFail({
                where: { pass: { id: pass.id } },
                relations: ['pass'],
            });
            return client;
        } catch (error) {
            throw new AppError(`Nie znaleziono klienta z daną przepustką.`, error);
        }
    }

    public async findClient(
        input: string,
        searchByName = false,
        searchBySurname = false,
        searchByPhone = false,
        searchByPass = false
    ): Promise<Client[]> {
        try {
            if (input === '' && !searchByPass)
                return await this.getClients();

            const queryBuilder = this.repository.createQueryBuilder("client");
            const tokens = input.split(/[,; ]+/);

            if (searchByPhone) {
                tokens.forEach(t => queryBuilder.orWhere("client.phone LIKE :input", { input: `%${t}%` }));
            }
            if (searchByName) {
                tokens.forEach(t => queryBuilder.orWhere("client.name LIKE :input", { input: `%${t}%` }));
            }
            if (searchBySurname) {
                tokens.forEach(t => queryBuilder.orWhere("client.surname LIKE :input", { input: `%${t}%` }));
            }

            if (searchByPass) {
                queryBuilder.leftJoinAndSelect("client.pass", "pass").leftJoinAndSelect("pass.passType", "passType").andWhere("pass.id IS NOT NULL");
            } else {
                queryBuilder.leftJoinAndSelect("client.pass", "pass").leftJoinAndSelect("pass.passType", "passType");
            }

            return await queryBuilder.getMany();
        } catch (error) {
            throw new AppError(`Nie udało się wyszukać klientów.`, error);
        }
    }

    public async modifyClient(
        client: Client,
        name?: string,
        surname?: string,
        phone?: string,
        alias?: string
    ): Promise<Client> {
        try {
            if (!name?.trim() || !surname?.trim()) {
                throw new AppError("Imię i nazwisko klienta nie mogą być puste.");
            }

            const newName = name ?? client.name;
            const newSurname = surname ?? client.surname;
            const newPhone = phone ?? client.phone;
            // const newAlias = alias ?? client.alias;
            const newAlias = alias?.trim() === "" ? null : alias;
            const isChangingIdentity = newName !== client.name || newSurname !== client.surname;

            if (isChangingIdentity) {
                const duplicate = await this.repository.findOne({
                    where: {
                        name: newName,
                        surname: newSurname,
                        id: Not(client.id),
                    }
                });

                if (duplicate) {
                    if (!newAlias?.trim()) {
                        throw new AppError(`Istnieje już klient "${newName} ${newSurname}". Wprowadź alias.`);
                    }

                    const aliasExists = await this.repository.findOne({
                        where: {
                            alias: newAlias,
                            id: Not(client.id),
                        }
                    });

                    if (aliasExists) {
                        throw new AppError(`Alias "${newAlias}" jest już zajęty.`);
                    }
                }
            }

            client.name = newName;
            client.surname = newSurname;
            client.phone = newPhone;
            client.alias = newAlias;

            return await this.repository.save(client);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Nie udało się zmodyfikować klienta.`, error);
        }
    }

    public async assignPass(client: Client, pass: Pass): Promise<Client> {
        if (client.pass != null) {
            throw new AppError(`Klient ${client.name} ${client.surname}${client.alias ? ' (' + client.alias + ')' : ''} już posiada przepustkę.`);
        }

        try {

            client.pass = pass;
            return await this.repository.save(client);

        } catch (error) {
            throw new AppError(`Nie udało się przypisać przepustki.`, error);
        }
    }

    public async removePass(client: Client): Promise<Client> {
        if (client.pass == null) {
            throw new AppError(`Klient ${client.name} ${client.surname}${client.alias ? ' (' + client.alias + ')' : ''} już nie posiadał przepustki.`);
        }

        try {
            await this.passRepository.deletePass(client.pass)
            client.pass = null;
            return await this.repository.save(client);
        } catch (error) {
            throw new AppError(`Nie udało się usunąć przepustki.`, error);
        }
    }

    public async deleteClient(client: Client): Promise<void> {
        try {
            await this.repository.remove(client);
        } catch (error) {
            throw new AppError(`Nie udało się usunąć klienta.`, error);
        }
    }
}
