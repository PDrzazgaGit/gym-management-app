import { TrainingSession } from "src/main/entities/TrainingSession";
import { ClientAPI } from "./src/renderer/api/ClientApi";
import { PassAPI } from "./src/renderer/api/PassApi";
import { PassTypeAPI } from "./src/renderer/api/PassTypeApi";
import { TrainingSessionAPI } from "./src/renderer/api/TrainingSessionApi";
import { PassType } from "src/main/entities/PassType";
import { Pass } from "src/main/entities/Pass";
import { Client } from "src/main/entities/Client";
import { TrainingSessionStatus } from "src/main/entities/TrainingSessionStatus";

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
      };
      passType: {
        add(name: string, description: string, entry: number): Promise<PassType>;
        getAll(): Promise<PassType[]>;
        modify(passTypeId: number, name?: string, description?: string, entry?: number): Promise<void>;
        delete(passTypeId: number): Promise<void>;
      };
      trainingSession: {
        create(description: string, passId: number, plannedDate?: Date): Promise<TrainingSession>;
        getByPass(passId: number, planned: boolean = false,
    inprogress: boolean = false,
    completed: boolean = false,
    cancelOwner: boolean = false,
    cancelClient: boolean = false): Promise<TrainingSession[]>;
        start(trainingSessionId: number): Promise<void>;
        cancelClient(trainingSessionId: number, description?: string): Promise<void>;
        cancelOwner(trainingSessionId: number, description?: string): Promise<void>;
        end(trainingSessionId: number): Promise<void>;
        modifyDescription(trainingSessionId: number, description: string): Promise<void>;
      };
    };
  }
}

export {};
