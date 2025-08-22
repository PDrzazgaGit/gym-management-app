// handlers/trainingSessionHandlers.ts (Main Process)
import { ipcMain } from "electron";
import { TrainingSessionRepository } from "../repositories/TrainingSessionRepository";
import { AppDataSource } from "../data/data-source";
import { PassRepository } from "../repositories/PassRepository";
import { TrainingsDayFilter } from "../enums/TrainingsDayFilter";
import { Pass } from "../entities/Pass";
import { LoggerService } from "../services/LoggerService";
import { ok, fail } from "../utils/safeHandlerObjects";

const passRepository = PassRepository.getInstance(AppDataSource);
const trainingSessionRepository = TrainingSessionRepository.getInstance(AppDataSource);
const loggerService = LoggerService.getInstance();

export function registerTrainingSessionHandlers() {
  ipcMain.handle("training-session:create", async (_event, passId: number, description?: string, plannedDate?: Date) => {
    try {
      loggerService.info(`[training-session:create] Tworzenie sesji dla passId=${passId}`);
      const pass = await passRepository.findOne(passId);
      return ok(await trainingSessionRepository.createTrainingSession(pass, description, plannedDate));
    } catch (err: any) {
      loggerService.error(`[training-session:create] Błąd (passId=${passId})`, err);
      return fail(err, "Nie udało się utworzyć sesji treningowej");
    }
  });

  ipcMain.handle("training-session:get-by-pass", async (_event, passId: number, planned = false, inprogress = false, completed = false, cancelOwner = false, cancelClient = false) => {
    try {
      loggerService.info(`[training-session:get-by-pass] Pobieranie sesji dla passId=${passId}`);
      const pass = await passRepository.findOne(passId);
      return ok(await trainingSessionRepository.getTrainingSessionsByPass(pass, planned, inprogress, completed, cancelOwner, cancelClient));
    } catch (err: any) {
      loggerService.error(`[training-session:get-by-pass] Błąd (passId=${passId})`, err);
      return fail(err, "Nie udało się pobrać sesji treningowych");
    }
  });

  ipcMain.handle("training-session:start", async (_event, trainingSessionId: number) => {
    try {
      loggerService.info(`[training-session:start] Rozpoczynanie sesji ID=${trainingSessionId}`);
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
      return ok(await trainingSessionRepository.startTrainingSession(trainingSession));
    } catch (err: any) {
      loggerService.error(`[training-session:start] Błąd przy rozpoczęciu sesji ID=${trainingSessionId}`, err);
      return fail(err, "Nie udało się rozpocząć sesji treningowej");
    }
  });

  ipcMain.handle("training-session:cancel-client", async (_event, trainingSessionId: number, description?: string) => {
    try {
      loggerService.info(`[training-session:cancel-client] Anulowanie sesji ID=${trainingSessionId} przez klienta`);
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
      return ok(await trainingSessionRepository.clientCancelTrainingSession(trainingSession, description));
    } catch (err: any) {
      loggerService.error(`[training-session:cancel-client] Błąd przy anulowaniu przez klienta ID=${trainingSessionId}`, err);
      return fail(err, "Nie udało się anulować sesji przez klienta");
    }
  });

  ipcMain.handle("training-session:cancel-owner", async (_event, trainingSessionId: number, description?: string) => {
    try {
      loggerService.info(`[training-session:cancel-owner] Anulowanie sesji ID=${trainingSessionId} przez właściciela`);
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
      return ok(await trainingSessionRepository.ownerCancelTrainingSession(trainingSession, description));
    } catch (err: any) {
      loggerService.error(`[training-session:cancel-owner] Błąd przy anulowaniu przez właściciela ID=${trainingSessionId}`, err);
      return fail(err, "Nie udało się anulować sesji przez właściciela");
    }
  });

  ipcMain.handle("training-session:end", async (_event, trainingSessionId: number) => {
    try {
      loggerService.info(`[training-session:end] Zamykanie sesji ID=${trainingSessionId}`);
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
      return ok(await trainingSessionRepository.endTrainingSession(trainingSession));
    } catch (err: any) {
      loggerService.error(`[training-session:end] Błąd przy zamykaniu sesji ID=${trainingSessionId}`, err);
      return fail(err, "Nie udało się zakończyć sesji treningowej");
    }
  });

  ipcMain.handle("training-session:modify", async (_event, trainingSessionId: number, description?: string, plannedDate?: Date) => {
    try {
      loggerService.info(`[training-session:modify] Modyfikacja sesji ID=${trainingSessionId}`);
      const trainingSession = await trainingSessionRepository.findOne(trainingSessionId);
      return ok(await trainingSessionRepository.modify(trainingSession, description, plannedDate));
    } catch (err: any) {
      loggerService.error(`[training-session:modify] Błąd przy modyfikacji sesji ID=${trainingSessionId}`, err);
      return fail(err, "Nie udało się zmodyfikować sesji treningowej");
    }
  });

  ipcMain.handle("training-session:get", async (_event, day?: Date) => {
    try {
      loggerService.info(`[training-session:get] Pobieranie sesji (day=${day})`);
      return ok(await trainingSessionRepository.getTrainingSessions(day));
    } catch (err: any) {
      loggerService.error("[training-session:get] Błąd przy pobieraniu sesji", err);
      return fail(err, "Nie udało się pobrać sesji treningowych");
    }
  });

  ipcMain.handle("training-session:get-by-day", async (_event, day: Date) => {
    try {
      loggerService.info(`[training-session:get-by-day] Pobieranie sesji z dnia ${day}`);
      return ok(await trainingSessionRepository.getTrainingSessionsByDay(day));
    } catch (err: any) {
      loggerService.error("[training-session:get-by-day] Błąd przy pobieraniu sesji", err);
      return fail(err, "Nie udało się pobrać sesji z tego dnia");
    }
  });

  ipcMain.handle("training-session:get-by-week", async (_event, dayOfWeek: Date) => {
    try {
      loggerService.info(`[training-session:get-by-week] Pobieranie sesji tygodnia od dnia ${dayOfWeek}`);
      return ok(await trainingSessionRepository.getTrainingSessionsByWeek(dayOfWeek));
    } catch (err: any) {
      loggerService.error("[training-session:get-by-week] Błąd przy pobieraniu sesji tygodniowych", err);
      return fail(err, "Nie udało się pobrać sesji z tego tygodnia");
    }
  });

  ipcMain.handle("training-session:filter", async (_event, {
    passId,
    planned = false,
    inprogress = false,
    completed = false,
    cancelOwner = false,
    cancelClient = false,
    trainingsDayFilter,
    day
  }: {
    passId?: number;
    planned?: boolean;
    inprogress?: boolean;
    completed?: boolean;
    cancelOwner?: boolean;
    cancelClient?: boolean;
    trainingsDayFilter?: TrainingsDayFilter;
    day?: Date;
  }) => {
    try {
      loggerService.info(`[training-session:filter] Filtrowanie sesji (passId=${passId}, planned=${planned}, inprogress=${inprogress}, completed=${completed})`);
      let pass: Pass | undefined = undefined;
      if (passId) {
        pass = await passRepository.findOne(passId);
      }
      return ok(await trainingSessionRepository.filterTrainingSessions({
        pass,
        planned,
        inprogress,
        completed,
        cancelOwner,
        cancelClient,
        trainingsDayFilter,
        day
      }));
    } catch (err: any) {
      loggerService.error("[training-session:filter] Błąd przy filtrowaniu sesji", err);
      return fail(err, "Nie udało się przefiltrować sesji treningowych");
    }
  });
}