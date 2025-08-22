import { app } from 'electron';
import { AppDataSource } from './data/data-source';
import { registerClientHandlers } from './ipcHandlers/clientHandlers';
import { registerPassHandlers } from './ipcHandlers/passHandlers';
import { registerPassTypeHandlers } from './ipcHandlers/passTypeHandlers';
import { registerTrainingSessionHandlers } from './ipcHandlers/trainingSessionHandlers';
import { registerACRManagerHandlers } from './ipcHandlers/acrManagerHandlers';
import { CryptoManager } from './services/CryptoManager';
import { ACRManager } from './services/ACRManager';
import { LoggerService } from './services/LoggerService';
import { getConfigPath } from './utils/getConfigPath';
import { registerOtherHandlers } from './ipcHandlers/otherHandlers';
import {registerBackupHandlers} from './ipcHandlers/backupHandlers'
import { createWindow } from './utils/createWindow';
import { subscribeAppEvents } from './utils/subscribeAppEvents';

const configPath = getConfigPath();

subscribeAppEvents(app, configPath);

app.whenReady().then(async () => {
  const loggerService = LoggerService.getInstance();
  try {
    await AppDataSource.initialize();

    const cryptoManager = CryptoManager.getInstance(configPath);
    const acrManager = ACRManager.getInstance(cryptoManager);

    const mainWindow = createWindow(app);

    loggerService.info('App is ready, registering handlers...');

    registerClientHandlers();
    registerPassHandlers();
    registerPassTypeHandlers();
    registerTrainingSessionHandlers();
    registerACRManagerHandlers(mainWindow, acrManager);
    registerBackupHandlers(mainWindow);
    registerOtherHandlers();

    loggerService.info('Handlers registered');

  } catch (error: any) {
    loggerService.error("Unknown application error", error);
    app.quit();
  }
});