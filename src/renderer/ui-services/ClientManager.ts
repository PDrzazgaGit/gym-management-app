//import { ClientAPI } from "../api/ClientApi";

import { Client } from "../../main/entities/Client";

export class ClientManager {
  private static instance: ClientManager;

  private constructor() {}

  public static getInstance(): ClientManager {
    if (!this.instance) {
      this.instance = new ClientManager();
    }
    return this.instance;
  }

  public async delete(clientId: number){
    return window.api.client.delete(clientId);
  }

  public async add(name: string, surname: string, phone?: string, alias?: string): Promise<Client> {
    return window.api.client.add(name, surname, phone, alias);
  }

  public async getAll(): Promise<Client[]> {
    return window.api.client.getAll();
  }

  public async find(input: string, searchByName = false, searchBySurname = false, searchByPhone = false, searchByPass = false): Promise<Client[]>{
    return window.api.client.find(input, searchByName, searchBySurname, searchByPhone, searchByPass);
  }

  public async modify(clientId: number, name?: string, surname?: string, phone?: string, alias?: string) {
    return window.api.client.modify(clientId, name, surname, phone, alias);
  }

  public async assignPass(clientId: number, passId: number) {
    return window.api.client.assignPass(clientId, passId);
  }

  public async removePass(clientId: number) {
    return window.api.client.removePass(clientId);
  }

  public async getByPass(passId: number) {
    return window.api.client.getByPass(passId);
  }
}
