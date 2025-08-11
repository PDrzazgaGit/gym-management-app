import { Pass } from "../../main/entities/Pass";

export class PassManager {
  private static instance: PassManager;

  private constructor() { }

  public static getInstance(): PassManager {
    if (!this.instance) {
      this.instance = new PassManager();
    }
    return this.instance;
  }

  async add(passTypeId: number): Promise<Pass> {
    return window.api.pass.add(passTypeId);
  }

  async delete(passId: number) {
    return window.api.pass.delete(passId);
  }
}
