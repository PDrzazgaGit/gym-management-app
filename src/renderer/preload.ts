// preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { TrainingSession } from "../main/entities/TrainingSession";
import { PassType } from "../main/entities/PassType";
import { Pass } from "../main/entities/Pass";
import { Client } from "../main/entities/Client";
import { TrainingsDayFilter } from "../main/enums/TrainingsDayFilter";
import { CardData } from "../main/data/CardData";
import { Card } from "nfc-pcsc";

// helper do wywołań
async function invoke<T>(channel: string, ...args: any[]): Promise<T> {
  const result = await ipcRenderer.invoke(channel, ...args);
  if (!result?.success) {
    throw new Error(result.error || "Nieznany błąd");
  }
  return result?.data as T;
}

contextBridge.exposeInMainWorld("api", {
  trainingSession: {
    create: (passId: number, description?: string, plannedDate?: Date): Promise<TrainingSession> =>
      invoke("training-session:create", passId, description, plannedDate),

    getByPass: (
      passId: number,
      planned = false,
      inprogress = false,
      completed = false,
      cancelOwner = false,
      cancelClient = false
    ): Promise<TrainingSession[]> =>
      invoke("training-session:get-by-pass", passId, planned, inprogress, completed, cancelOwner, cancelClient),

    start: (trainingSessionId: number): Promise<TrainingSession> =>
      invoke("training-session:start", trainingSessionId),

    cancelClient: (trainingSessionId: number, description?: string) =>
      invoke("training-session:cancel-client", trainingSessionId, description),

    cancelOwner: (trainingSessionId: number, description?: string) =>
      invoke("training-session:cancel-owner", trainingSessionId, description),

    end: (trainingSessionId: number): Promise<TrainingSession> =>
      invoke("training-session:end", trainingSessionId),

    modify: (trainingSessionId: number, description?: string, plannedDate?: Date) =>
      invoke("training-session:modify", trainingSessionId, description, plannedDate),

    get: (day?: Date) => invoke("training-session:get", day),

    getByDay: (day: Date) => invoke("training-session:get-by-day", day),

    getByWeek: (dayOfWeek: Date) => invoke("training-session:get-by-week", dayOfWeek),

    filter: (options: {
      passId?: number;
      planned?: boolean;
      inprogress?: boolean;
      completed?: boolean;
      cancelOwner?: boolean;
      cancelClient?: boolean;
      trainingsDayFilter?: TrainingsDayFilter;
      day?: Date;
    }): Promise<TrainingSession[]> => invoke("training-session:filter", options),
  },

  passType: {
    add: (name: string, description: string, entry: number): Promise<PassType> =>
      invoke("pass-type:add", name, description, entry),

    getAll: (): Promise<PassType[]> => invoke("pass-type:get-all"),

    modify: (passTypeId: number, name?: string, description?: string, entry?: number): Promise<void> =>
      invoke("pass-type:modify", passTypeId, name, description, entry),

    delete: (passTypeId: number): Promise<void> => invoke("pass-type:delete", passTypeId),
  },

  pass: {
    add: (passTypeId: number): Promise<Pass> => invoke("pass:add", passTypeId),

    delete: (passId: number): Promise<void> => invoke("pass:delete", passId),

    getByUUID: (uuid: string): Promise<Pass> => invoke("pass:get-by-uuid", uuid),

    tryAssignCard: (passId: number, previousUUID: string): Promise<string | null> =>
      invoke("pass:try-assign-card", passId, previousUUID),

    extend: (passId: number, passTypeId: number): Promise<Pass> => invoke("pass:extend", passId, passTypeId),
  },

  client: {
    delete: (clientId: number): Promise<void> => invoke("client:delete", clientId),

    add: (name: string, surname: string, phone?: string, alias?: string): Promise<Client> =>
      invoke("client:add", name, surname, phone, alias),

    getAll: (): Promise<Client[]> => invoke("client:get-all"),

    find: (
      input: string,
      searchByName = false,
      searchBySurname = false,
      searchByPhone = false,
      searchByPass = false
    ): Promise<Client[]> =>
      invoke("client:find", input, searchByName, searchBySurname, searchByPhone, searchByPass),

    modify: (clientId: number, name?: string, surname?: string, phone?: string, alias?: string): Promise<Client> =>
      invoke("client:modify", clientId, name, surname, phone, alias),

    assignPass: (clientId: number, passId: number): Promise<Client> =>
      invoke("client:assign-pass", clientId, passId),

    removePass: (clientId: number): Promise<Client> => invoke("client:remove-pass", clientId),

    getByPass: (passId: number): Promise<Client> => invoke("client:get-by-pass", passId),
  },

  other: {
    openFolder: (folderName: "db" | "log" | "config"): Promise<void> =>
      invoke("other:open-folder", folderName),
  },
  backup: {
    create: (): Promise<string | null> => invoke("backup:create"),
    restore: (): Promise<string | null> => invoke("backup:restore"),
  },
  acrManager: {
    isAvailable: async (): Promise<boolean> => invoke("acr:is-available"),

    read: async (): Promise<CardData> => invoke("acr:read"),

    write: async (data: CardData): Promise<void> => invoke("acr:write", data),

    // subskrypcja eventów z main
    onReaderConnected: (callback: (name: string) => void) => {
      ipcRenderer.on("acr:reader-connected", (_event, name) => callback(name));
    },
    onReaderDisconnected: (callback: (name: string) => void) => {
      ipcRenderer.on("acr:reader-disconnected", (_event, name) => callback(name));
    },
    onCardInserted: (callback: (card: Card) => void) => {
      ipcRenderer.on("acr:card-inserted", (_event, card) => callback(card));
    },
    onCardRemoved: (callback: (card: Card) => void) => {
      ipcRenderer.on("acr:card-removed", (_event, card) => callback(card));
    },
    onReaderError: (callback: (err: any) => void) => {
      ipcRenderer.on("acr:reader-error", (_event, err) => callback(err));
    },

    // usuwanie subskrypcji
    offReaderConnected: (listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener("acr:reader-connected", listener);
    },
    offReaderDisconnected: (listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener("acr:reader-disconnected", listener);
    },
    offCardInserted: (listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener("acr:card-inserted", listener);
    },
    offCardRemoved: (listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener("acr:card-removed", listener);
    },
    offReaderError: (listener: (...args: any[]) => void) => {
      ipcRenderer.removeListener("acr:reader-error", listener);
    },
  },
});
