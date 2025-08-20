// handlers/clientHandlers.ts
import { ipcMain } from "electron";
import { ClientRepository } from "../repositories/ClientRepository";
import { AppDataSource } from "../data/data-source";
import { PassRepository } from "../repositories/PassRepository";
import { LoggerService } from "../services/LoggerService";
import {ok, fail} from "../utils/safeHandlerObjects"
import { AppError } from "../data/AppError";

const clientRepository = ClientRepository.getInstance(AppDataSource);
const passRepository = PassRepository.getInstance(AppDataSource);

export function registerClientHandlers() {
  ipcMain.handle("client:add", async (_event, name: string, surname: string, phone?: string, alias?: string) => {
    try {
      LoggerService.info(`[client:add] Dodawanie klienta: ${name} ${surname}`);
      const result = await clientRepository.addClient(name, surname, phone, alias);
      LoggerService.info(`[client:add] Sukces: dodano klienta ID=${result.id}`);
      return ok(result);
    } catch (err: AppError | Error | any) {
      LoggerService.error("[client:add] Błąd przy dodawaniu klienta", err);
      return fail(err, "Nie udało się dodać klienta");
    }
  });

  ipcMain.handle("client:get-all", async () => {
    try {
      LoggerService.info("[client:get-all] Pobieranie wszystkich klientów");
      return ok(await clientRepository.getClients());
    } catch (err: any) {
      LoggerService.error("[client:get-all] Błąd przy pobieraniu klientów", err);
      return fail(err, "Nie udało się pobrać listy klientów");
    }
  });

  ipcMain.handle("client:delete", async (_event, clientId: number) => {
    try {
      LoggerService.info(`[client:delete] Usuwanie klienta ID=${clientId}`);
      const client = await clientRepository.findOne(clientId);
      return ok(await clientRepository.deleteClient(client));
    } catch (err: any) {
      LoggerService.error(`[client:delete] Błąd przy usuwaniu klienta ID=${clientId}`, err);
      return fail(err, "Nie udało się usunąć klienta");
    }
  });

  ipcMain.handle("client:get-by-pass", async (_event, passId: number) => {
    try {
      LoggerService.info(`[client:get-by-pass] Pobieranie klienta dla przepustki ID=${passId}`);
      const pass = await passRepository.findOne(passId);
      return ok(await clientRepository.getClientByPass(pass));
    } catch (err: any) {
      LoggerService.error(`[client:get-by-pass] Błąd dla passId=${passId}`, err);
      return fail(err, "Nie udało się pobrać klienta dla przepustki");
    }
  });

  ipcMain.handle("client:modify", async (_event, clientId: number, name?: string, surname?: string, phone?: string, alias?: string) => {
    try {
      LoggerService.info(`[client:modify] Modyfikacja klienta ID=${clientId}`);
      const client = await clientRepository.findOne(clientId);
      return ok(await clientRepository.modifyClient(client, name, surname, phone, alias));
    } catch (err: any) {
      LoggerService.error(`[client:modify] Błąd przy modyfikacji klienta ID=${clientId}`, err);
      return fail(err, "Nie udało się zmodyfikować klienta");
    }
  });

  ipcMain.handle("client:assign-pass", async (_event, clientId: number, passId: number) => {
    try {
      LoggerService.info(`[client:assign-pass] Przypisywanie przepustki ID=${passId} do klienta ID=${clientId}`);
      const pass = await passRepository.findOne(passId);
      const client = await clientRepository.findOne(clientId);
      return ok(await clientRepository.assignPass(client, pass));
    } catch (err: any) {
      LoggerService.error(`[client:assign-pass] Błąd przy przypisywaniu passId=${passId} klientowi ID=${clientId}`, err);
      return fail(err, "Nie udało się przypisać przepustki do klienta");
    }
  });

  ipcMain.handle("client:remove-pass", async (_event, clientId: number) => {
    try {
      LoggerService.info(`[client:remove-pass] Usuwanie przepustki od klienta ID=${clientId}`);
      const client = await clientRepository.findOne(clientId);
      return ok(await clientRepository.removePass(client));
    } catch (err: any) {
      LoggerService.error(`[client:remove-pass] Błąd przy usuwaniu przepustki od klienta ID=${clientId}`, err);
      return fail(err, "Nie udało się usunąć przepustki od klienta");
    }
  });

  ipcMain.handle("client:find", async (_event, input: string, searchByName: boolean, searchBySurname: boolean, searchByPhone: boolean, searchByPass: boolean) => {
    try {
      LoggerService.info(`[client:find] Szukanie klientów (input="${input}")`);
      return ok(await clientRepository.findClient(input, searchByName, searchBySurname, searchByPhone, searchByPass));
    } catch (err: any) {
      LoggerService.error("[client:find] Błąd przy wyszukiwaniu klienta", err);
      return fail(err, "Nie udało się wyszukać klientów");
    }
  });
}
