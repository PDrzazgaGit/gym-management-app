import { ipcMain } from "electron";
import { PassRepository } from "../repositories/PassRepository";
import { AppDataSource } from "../data/data-source"
import { PassTypeRepository } from "../repositories/PassTypeRepository";

const passRepository = PassRepository.getInstance(AppDataSource);
const passTypeRepository = PassTypeRepository.getInstance(AppDataSource);

export function registerPassHandlers() {
  ipcMain.handle("pass:add", async (_event, passTypeId: number) => {
    const passType = await passTypeRepository.findOne(passTypeId);
    return await passRepository.addPass(passType);
  });

  ipcMain.handle("pass:delete", async (_event, passId: number) => {
    const pass = await passRepository.findOne(passId);
    return await passRepository.deletePass(pass);
  });

  ipcMain.handle("pass:get-by-uuid", async (_event, uuid: string) => {
    return await passRepository.getPassByUUID(uuid);
  })
}
