// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron"
import { Client } from "../main/entities/Client";

const DATABASE_API = {
    addClient: (name: string, surname: string, phone: string, alias?: string): Promise<boolean> => ipcRenderer.invoke("add/client", name, surname, phone, alias),
    getClient: (name?: string, surname?: string, phone?: string, alias?: string): Promise<Client[]> => ipcRenderer.invoke("get/client", name, surname, phone, alias),
    getAll: (): Promise<Client[]> => ipcRenderer.invoke("get/all"),
    findClient: (input: string, searchByName: boolean, searchBySurname: boolean,searchByPhone: boolean, searchByPass: boolean):  Promise<Client[]> => ipcRenderer.invoke("find/client", input, searchByName, searchBySurname, searchByPhone, searchByPass)
}

contextBridge.exposeInMainWorld("database", DATABASE_API);