import { PassType } from "../../main/entities/PassType";

export class PassTypeManager {
  private static instance: PassTypeManager;


  private constructor() {}

  public static getInstance(): PassTypeManager {
    if (!this.instance) {
      this.instance = new PassTypeManager();
    }
    return this.instance;
  }

  async add(name: string, description: string, entry: number): Promise<PassType> {
    return window.api.passType.add(name, description, entry);
  }

  async getAll(): Promise<PassType[]> {
    return window.api.passType.getAll();
  }

  async modify(passTypeId: number, name?: string, description?: string, entry?: number) {
    return window.api.passType.modify(passTypeId, name, description, entry);
  }

  async delete(passTypeId: number) {
    return window.api.passType.delete(passTypeId);
  }
}
