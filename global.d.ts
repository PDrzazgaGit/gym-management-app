import { TrainingSession } from "src/main/entities/TrainingSession";
import { ClientAPI } from "./src/renderer/api/ClientApi";
import { PassAPI } from "./src/renderer/api/PassApi";
import { PassTypeAPI } from "./src/renderer/api/PassTypeApi";
import { TrainingSessionAPI } from "./src/renderer/api/TrainingSessionApi";
import { PassType } from "src/main/entities/PassType";
import { Pass } from "src/main/entities/Pass";
import { Client } from "src/main/entities/Client";
import { TrainingSessionStatus } from "src/main/entities/TrainingSessionStatus";
import { Card } from "nfc-pcsc";

declare global {
  interface Window {
    api: {
      client: {
        add(name: string, surname: string, phone?: string, alias?: string): Promise<Client>;
        getAll(): Promise<Client[]>;
        find(input: string, searchByName?: boolean, searchBySurname?: boolean, searchByPhone?: boolean, searchByPass?: boolean): Promise<Client[]>;
        modify(clientId: number, name?: string, surname?: string, phone?: string, alias?: string): Promise<Client>;
        assignPass(clientId: number, passId: number): Promise<Client>;
        removePass(clientId: number): Promise<Client>;
        getByPass(passId: number): Promise<Client>;
        delete(clientId: number): Promise<void>;
      };
      pass: {
        add(passTypeId: number): Promise<Pass>;
        delete(passId: number): Promise<void>;
        getByUUID(uuid: string): Promise<Pass>;
        tryAssignCard(passId: number, previousUUID: string): Promise<string | null>
        extend(passId: number, passTypeId: number): Promise<Pass>
      };
      passType: {
        add(name: string, description: string, entry: number): Promise<PassType>;
        getAll(): Promise<PassType[]>;
        modify(passTypeId: number, name?: string, description?: string, entry?: number): Promise<void>;
        delete(passTypeId: number): Promise<void>;
      };
      trainingSession: {
        create(passId: number, description?: string, plannedDate?: Date): Promise<TrainingSession>;
        getByPass(passId: number, planned: boolean = false,
          inprogress: boolean = false,
          completed: boolean = false,
          cancelOwner: boolean = false,
          cancelClient: boolean = false): Promise<TrainingSession[]>;
        start(trainingSessionId: number): Promise<TrainingSession>;
        cancelClient(trainingSessionId: number, description?: string): Promise<void>;
        cancelOwner(trainingSessionId: number, description?: string): Promise<void>;
        end(trainingSessionId: number): Promise<TrainingSession>;
        modify(trainingSessionId: number, description?: string, plannedDate?: Date): Promise<TrainingSession>;
        get(day?: Date): Promise<TrainingSession[]>;
        getByDay(day: Date): Promise<TrainingSession[]>;
        getByWeek(dayOfWeek: Date): Promise<TrainingSession[]>;
        filter(options: {
          passId?: number;
          planned?: boolean;
          inprogress?: boolean;
          completed?: boolean;
          cancelOwner?: boolean;
          cancelClient?: boolean;
          trainingsDayFilter?: TrainingsDayFilter;
          day?: Date;
        }): Promise<TrainingSession[]>;
      };
      acrManager: {
        isAvailable(): Promise<boolean>;
        read(): Promise<CardData>;
        write(data: CardData): Promise<void>;
        onReaderConnected(callback: (name: string) => void): void;
        onReaderDisconnected(callback: (name: string) => void): void;
        onCardInserted(callback: (card: Card) => void): void;
        onCardRemoved(callback: (card: Card) => void): void;
        onReaderError(callback: (err: any) => void): void;
        offReaderConnected(callback: (name: string) => void): void;
        offReaderDisconnected(callback: (name: string) => void): void;
        offCardInserted(callback: (card: Card) => void): void;
        offCardRemoved(callback: (card: Card) => void): void;
        offReaderError(callback: (err: any) => void): void;
      };
      other: {
        openFolder(folderName: "db" | "log" | "config"): Promise<void>;
        quitApp (): Promise<void>
      };
      backup: {
        create(): Promise<string | null>;  // zwraca ścieżkę zapisanego backupu lub null jeśli anulowano
        restore(): Promise<string | null>; // zwraca ścieżkę wgranego backupu lub null jeśli anulowano
      };
    };
  }
}

export { };
