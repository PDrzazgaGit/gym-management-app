// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron"
import { TrainingSession } from "../main/entities/TrainingSession";
import { PassType } from "../main/entities/PassType";
import { Pass } from "../main/entities/Pass";
import { Client } from "../main/entities/Client";
import { TrainingSessionStatus } from "../main/entities/TrainingSessionStatus";


/*
import { ClientAPI } from './api/ClientApi';
import { PassAPI } from './api/PassApi';
import { PassTypeAPI } from './api/PassTypeApi';
import { TrainingSessionAPI } from './api/TrainingSessionApi';

contextBridge.exposeInMainWorld('api', {
  client: new ClientAPI(),
  pass: new PassAPI(),
  passType: new PassTypeAPI(),
  trainingSession: new TrainingSessionAPI(),
});
*/

contextBridge.exposeInMainWorld('api', {
  trainingSession: {
    create: (description: string, passId: number, plannedDate?: Date): Promise<TrainingSession> =>
      ipcRenderer.invoke('training-session:create', description, passId, plannedDate),

    getByPass: (passId: number, planned: boolean = false,
    inprogress: boolean = false,
    completed: boolean = false,
    cancelOwner: boolean = false,
    cancelClient: boolean = false): Promise<TrainingSession[]> =>
      ipcRenderer.invoke('training-session:get-by-pass', passId, planned, inprogress, completed, cancelOwner, cancelClient),

    start: (trainingSessionId: number) =>
      ipcRenderer.invoke('training-session:start', trainingSessionId),

    cancelClient: (trainingSessionId: number, description?: string) =>
      ipcRenderer.invoke('training-session:cancel-client', trainingSessionId, description),

    cancelOwner: (trainingSessionId: number, description?: string) =>
      ipcRenderer.invoke('training-session:cancel-owner', trainingSessionId, description),

    end: (trainingSessionId: number) =>
      ipcRenderer.invoke('training-session:end', trainingSessionId),

    modifyDescription: (trainingSessionId: number, description: string) =>
      ipcRenderer.invoke('training-session:modify-description', trainingSessionId, description),
  },
  passType: {
    add: (name: string, description: string, entry: number): Promise<PassType> =>
      ipcRenderer.invoke('pass-type:add', name, description, entry),

    getAll: (): Promise<PassType[]> =>
      ipcRenderer.invoke('pass-type:get-all'),

    modify: (passTypeId: number, name?: string, description?: string, entry?: number): Promise<void> =>
      ipcRenderer.invoke('pass-type:modify', passTypeId, name, description, entry),

    delete: (passTypeId: number): Promise<void> =>
      ipcRenderer.invoke('pass-type:delete', passTypeId),
  },
  pass: {
    add: (passTypeId: number): Promise<Pass> =>
      ipcRenderer.invoke('pass:add', passTypeId),

    delete: (passId: number): Promise<void> =>
      ipcRenderer.invoke('pass:delete', passId),
  },
  client: {

    delete: (clientId: number): Promise<void> => 
      ipcRenderer.invoke('client:delete', clientId),
    

    add: (name: string, surname: string, phone?: string, alias?: string): Promise<Client> =>
      ipcRenderer.invoke('client:add', name, surname, phone, alias),

    getAll: (): Promise<Client[]> =>
      ipcRenderer.invoke('client:get-all'),

    find: (
      input: string,
      searchByName: boolean = false,
      searchBySurname: boolean = false,
      searchByPhone: boolean = false,
      searchByPass: boolean = false
    ): Promise<Client[]> =>
      ipcRenderer.invoke('client:find', input, searchByName, searchBySurname, searchByPhone, searchByPass),

    modify: (
      clientId: number,
      name?: string,
      surname?: string,
      phone?: string,
      alias?: string
    ): Promise<Client> =>
      ipcRenderer.invoke('client:modify', clientId, name, surname, phone, alias),

    assignPass: (clientId: number, passId: number): Promise<Client> =>
      ipcRenderer.invoke('client:assign-pass', clientId, passId),

    removePass: (clientId: number): Promise<Client> =>
      ipcRenderer.invoke('client:remove-pass', clientId),

    getByPass: (passId: number): Promise<Client> =>
      ipcRenderer.invoke('client:get-by-pass', passId),
  }

});

/*
contextBridge.exposeInMainWorld('PassTypeAPI', {
  add: (name: string, description: string, entry: number): Promise<PassType> =>
    ipcRenderer.invoke('pass-type:add', name, description, entry),

  getAll: (): Promise<PassType[]> =>
    ipcRenderer.invoke('pass-type:get-all'),

  modify: (passTypeId: number, name?: string, description?: string, entry?: number): Promise<void> =>
    ipcRenderer.invoke('pass-type:modify', passTypeId, name, description, entry),

  delete: (passTypeId: number): Promise<void> =>
    ipcRenderer.invoke('pass-type:delete', passTypeId),
});
*/
/*
contextBridge.exposeInMainWorld('PassAPI', {
  add: (passTypeId: number): Promise<Pass> =>
    ipcRenderer.invoke('pass:add', passTypeId),

  delete: (passId: number): Promise<void> =>
    ipcRenderer.invoke('pass:delete', passId),
});
*/
/*
contextBridge.exposeInMainWorld('ClientAPI', {
  add: (name: string, surname: string, phone?: string, alias?: string): Promise<Client> =>
    ipcRenderer.invoke('client:add', name, surname, phone, alias),

  getAll: (): Promise<Client[]> =>
    ipcRenderer.invoke('client:get-all'),

  find: (
    input: string,
    searchByName: boolean = false,
    searchBySurname: boolean = false,
    searchByPhone: boolean = false,
    searchByPass: boolean = false
  ): Promise<Client[]> =>
    ipcRenderer.invoke('client:find', input, searchByName, searchBySurname, searchByPhone, searchByPass),

  modify: (
    clientId: number,
    name?: string,
    surname?: string,
    phone?: string,
    alias?: string
  ): Promise<void> =>
    ipcRenderer.invoke('client:modify', clientId, name, surname, phone, alias),

  assignPass: (clientId: number, passId: number): Promise<void> =>
    ipcRenderer.invoke('client:assign-pass', clientId, passId),

  removePass: (clientId: number): Promise<void> =>
    ipcRenderer.invoke('client:remove-pass', clientId),

  getByPass: (passId: number): Promise<Client> =>
    ipcRenderer.invoke('client:get-by-pass', passId),
});
*/