import { RESEARCH_CATEGORIES } from "../constants/index.ts";
import { ResearchCategoryInfo, ResearchStatusType } from "../types/index.ts";

export class ResearchRegistry {
  private static categories: Map<string, ResearchCategoryInfo> = new Map();

  static {
    // Populate default system research categories
    Object.entries(RESEARCH_CATEGORIES).forEach(([key, value]) => {
      ResearchRegistry.categories.set(value.toUpperCase(), {
        categoryId: `CAT-${key}`,
        name: value,
        description: `Centralized system research category for ${value}`,
        isSystem: true,
      });
    });
  }

  public static getCategories(): ResearchCategoryInfo[] {
    return Array.from(ResearchRegistry.categories.values());
  }

  public static isValidCategory(category: string): boolean {
    const categoriesList = Object.values(RESEARCH_CATEGORIES) as string[];
    return categoriesList.includes(category);
  }

  public static registerCustomCategory(name: string, description: string): ResearchCategoryInfo {
    const categoryId = `CAT-CUSTOM-${Date.now()}`;
    const info: ResearchCategoryInfo = {
      categoryId,
      name,
      description,
      isSystem: false,
    };
    ResearchRegistry.categories.set(name.toUpperCase(), info);
    return info;
  }
}
