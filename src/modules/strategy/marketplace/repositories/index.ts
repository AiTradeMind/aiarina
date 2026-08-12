import { getDb } from "../../../../db/client.ts";
import { 
  strategyMarketplace,
  strategyPublications,
  strategyTemplateLibrary,
  strategyInstallations,
  strategyReviews,
  strategyUsageStatistics,
  strategyFeatured
} from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { 
  StrategyMarketplace, 
  StrategyPublication, 
  StrategyTemplateLibrary, 
  StrategyInstallation, 
  StrategyReview, 
  StrategyUsageStatistic, 
  StrategyFeatured 
} from "../types";

export class MarketplaceRepository {
  async getMarketplaces(): Promise<StrategyMarketplace[]> {
    const records = await (await getDb()).select().from(strategyMarketplace);
    return records.map(record => ({
      ...record,
      createdTime: record.createdTime.toISOString()
    }));
  }

  async getPublications(): Promise<StrategyPublication[]> {
    const records = await (await getDb()).select().from(strategyPublications).orderBy(desc(strategyPublications.publicationDate));
    return records.map(record => ({
      ...record,
      publicationDate: record.publicationDate.toISOString()
    }));
  }

  async getTemplates(): Promise<StrategyTemplateLibrary[]> {
    const records = await (await getDb()).select().from(strategyTemplateLibrary);
    return records.map(record => ({
      ...record,
      createdTime: record.createdTime.toISOString()
    }));
  }

  async getFeatured(): Promise<StrategyFeatured[]> {
    const records = await (await getDb()).select().from(strategyFeatured).orderBy(desc(strategyFeatured.priority));
    return records.map(record => ({
      ...record,
      featuredStartDate: record.featuredStartDate.toISOString(),
      featuredEndDate: record.featuredEndDate?.toISOString() || null
    }));
  }

  async getReviews(publicationId?: string): Promise<StrategyReview[]> {
    let query = (await getDb()).select().from(strategyReviews);
    if (publicationId) {
      // @ts-ignore
      query = query.where(eq(strategyReviews.publicationId, publicationId));
    }
    const records = await query;
    return records.map(record => ({
      ...record,
      reviewDate: record.reviewDate.toISOString()
    }));
  }

  async getUsageStatistics(): Promise<StrategyUsageStatistic[]> {
    const records = await (await getDb()).select().from(strategyUsageStatistics);
    return records.map(record => ({
      ...record,
      updatedTime: record.updatedTime.toISOString()
    }));
  }

  async createPublication(data: any): Promise<StrategyPublication> {
    const [record] = await (await getDb()).insert(strategyPublications).values({
      id: data.id,
      strategyId: data.strategyId,
      versionId: data.versionId,
      publisher: data.publisher,
      visibility: data.visibility || 'Public',
      category: data.category,
      tags: data.tags,
      description: data.description,
      releaseNotes: data.releaseNotes,
      publicationDate: new Date()
    }).returning();

    return {
      ...record,
      publicationDate: record.publicationDate.toISOString()
    };
  }

  async createInstallation(data: any): Promise<StrategyInstallation> {
    const [record] = await (await getDb()).insert(strategyInstallations).values({
      id: data.id,
      publicationId: data.publicationId,
      userId: data.userId,
      installedStrategyId: data.installedStrategyId,
      installationDate: new Date()
    }).returning();

    return {
      ...record,
      installationDate: record.installationDate.toISOString()
    };
  }
}
