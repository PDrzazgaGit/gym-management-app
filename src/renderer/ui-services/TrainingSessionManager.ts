import { TrainingSessionStatus } from "../../main/entities/TrainingSessionStatus";
import { TrainingSession } from "../../main/entities/TrainingSession";

export class TrainingSessionManager {
  private static instance: TrainingSessionManager;

  private constructor() {}

  public static getInstance(): TrainingSessionManager {
    if (!this.instance) {
      this.instance = new TrainingSessionManager();
    }
    return this.instance;
  }

  async create(description: string, passId: number, plannedDate?: Date): Promise<TrainingSession> {
    return window.api.trainingSession.create(description, passId, plannedDate);
  }

  async getByPass(passId: number, planned: boolean = false,
    inprogress: boolean = false,
    completed: boolean = false,
    cancelOwner: boolean = false,
    cancelClient: boolean = false): Promise<TrainingSession[]> {
    return window.api.trainingSession.getByPass(passId, planned, inprogress, completed, cancelOwner, cancelClient);
  }

  async start(trainingSessionId: number) {
    return window.api.trainingSession.start(trainingSessionId);
  }

  async cancelClient(trainingSessionId: number, description?: string) {
    return window.api.trainingSession.cancelClient(trainingSessionId, description);
  }

  async cancelOwner(trainingSessionId: number, description?: string) {
    return window.api.trainingSession.cancelOwner(trainingSessionId, description);
  }

  async end(trainingSessionId: number) {
    return window.api.trainingSession.end(trainingSessionId);
  }

  async modifyDescription(trainingSessionId: number, description: string) {
    return window.api.trainingSession.modifyDescription(trainingSessionId, description);
  }
}
