import { studioEngine } from "../engines/StudioEngine";

export class StudioService {
  async getStudioData(type: string): Promise<any> {
    return await studioEngine.getSnapshot(type);
  }
}

export const studioService = new StudioService();
