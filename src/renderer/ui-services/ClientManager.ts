import { Client } from "../../main/entities/Client";

export class ClientManager{
    private static instance: ClientManager | undefined;

    private constructor(){}

    public static getInstance(){
        if(!this.instance){
            this.instance = new ClientManager();
        }
        return this.instance;
    }

    public async getAll(): Promise<Client[]>{
        return await (window as any).database.getAll();
    }

    public async findClient(input: string, searchByName: boolean, searchBySurname: boolean,searchByPhone: boolean, searchByPass: boolean): Promise<Client[]>{
        return await (window as any).database.findClient(input, searchByName, searchBySurname, searchByPhone, searchByPass);
    }

    public async addClient(name: string, surname: string, phone: string, alias?: string): Promise<Boolean>{
        return await (window as any).database.addClient(
            name.trim(),
            surname.trim(),
            phone,
            alias
        )
    }
}