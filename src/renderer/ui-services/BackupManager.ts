export class BackupManager{
private static instance: BackupManager;

  private constructor() {}

  public static getInstance(): BackupManager {
    if (!this.instance) {
      this.instance = new BackupManager();
    }
    return this.instance;
  }

  public async create(): Promise<string | null>{
    return await window.api.backup.create();
  }

  public async restore(): Promise<string | null>{
    return await window.api.backup.restore();
  }
}