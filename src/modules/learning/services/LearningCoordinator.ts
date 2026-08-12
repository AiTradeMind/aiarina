import { learningRepository } from "../repositories/LearningRepository";
import { learningQueue } from "./LearningQueue";

export class LearningCoordinator {
  public async initialize(): Promise<void> {
    await learningRepository.ensureTables();
  }

  public async coordinateQueue(): Promise<void> {
    await learningQueue.processQueue();
  }
}

export const learningCoordinator = new LearningCoordinator();
