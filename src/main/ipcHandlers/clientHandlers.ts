// handlers/clientHandlers.ts (Main Process)
import { ipcMain } from "electron";
import { ClientRepository } from "../repositories/ClientRepository";
import { AppDataSource } from "../data/data-source"
import { PassRepository } from "../repositories/PassRepository";

const clientRepository = ClientRepository.getInstance(AppDataSource);
const passRepository =  PassRepository.getInstance(AppDataSource);

export function registerClientHandlers() { //OK
  ipcMain.handle("client:add", async (_event, name: string, surname: string, phone?: string, alias?: string) => {
    return await clientRepository.addClient(name, surname, phone, alias);
  });

  ipcMain.handle("client:get-all", async () => { //OK
    return await clientRepository.getClients();
  });

  ipcMain.handle("client:delete", async (_event, clientId: number) =>{
    const client = await clientRepository.findOne(clientId);
    return await clientRepository.deleteClient(client);
  })

  ipcMain.handle("client:get-by-pass", async (_event, passId: number) => { //OK
    const pass = await passRepository.findOne(passId);
    return await clientRepository.getClientByPass(pass);
  });

  ipcMain.handle("client:modify", async (_event, clientId: number, name?: string, surname?: string, phone?: string, alias?: string) => { //OK
    const client = await clientRepository.findOne(clientId);
    return await clientRepository.modifyClient(client, name, surname, phone, alias);
  });

  ipcMain.handle("client:assign-pass", async (_event, clientId: number, passId: number) => {
    const pass = await passRepository.findOne(passId);
    const client = await clientRepository.findOne(clientId);
    return await clientRepository.assignPass(client, pass);
  });

  ipcMain.handle("client:remove-pass", async (_event, clientId: number) => {
    const client = await clientRepository.findOne(clientId);
    return await clientRepository.removePass(client);
  });

  ipcMain.handle("client:find", async (_event, input: string, searchByName: boolean, searchBySurname: boolean, searchByPhone: boolean, searchByPass: boolean) => {
    return await clientRepository.findClient(input, searchByName, searchBySurname, searchByPhone, searchByPass);
  });
}
