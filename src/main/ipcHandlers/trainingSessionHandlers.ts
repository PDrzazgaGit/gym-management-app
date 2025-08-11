import { ipcMain } from "electron";
import { TrainingSessionRepository } from "../repositories/TrainingSessionRepository";
import { AppDataSource } from "../data/data-source"
import { PassRepository } from "../repositories/PassRepository";
import { TrainingSessionStatus } from "../entities/TrainingSessionStatus";

const passRepository = PassRepository.getInstance(AppDataSource);
const trainingSessionRepository = TrainingSessionRepository.getInstance(AppDataSource);

export function registerTrainingSessionHandlers() {
  ipcMain.handle("training-session:create", async (_event, description: string, passId: number, plannedDate?: Date) => {
    const pass = await passRepository.findOne(passId);
    return await trainingSessionRepository.createTrainingSession(description, pass, plannedDate);
  });

  ipcMain.handle("training-session:get-by-pass", async (_event, passId: number, planned: boolean = false,
    inprogress: boolean = false,
    completed: boolean = false,
    cancelOwner: boolean = false,
    cancelClient: boolean = false) => {
    const pass = await passRepository.findOne(passId);
    return await trainingSessionRepository.getTrainingSessionsByPass(pass, planned, inprogress, completed, cancelOwner, cancelClient);
  });

  ipcMain.handle("training-session:start", async (_event, trainingSessionId: number) => {
    const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
    return await trainingSessionRepository.startTrainingSession(trainingSession);
  });

    ipcMain.handle("training-session:cancel-client", async (_event, trainingSessionId: number, description?: string ) => {
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
    return await trainingSessionRepository.clientCancelTrainingSession(trainingSession, description);
  });

  ipcMain.handle("training-session:cancel-owner", async (_event, trainingSessionId: number, description?: string) => {
    const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
    return await trainingSessionRepository.ownerCancelTrainingSession(trainingSession, description);
  });

  ipcMain.handle("training-session:end", async (_event, trainingSessionId: number) => {
    const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
    return await trainingSessionRepository.endTrainingSession(trainingSession);
  });

  ipcMain.handle("training-session:modify-description", async (_event,  trainingSessionId: number, description: string ) => {
    const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
    return await trainingSessionRepository.modifyDescription(trainingSession, description);
  });
}
