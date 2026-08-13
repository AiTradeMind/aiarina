import { RESEARCH_CATEGORIES, ResearchCategoryValue } from "../constants/index.ts";
import { ResearchClassificationResult } from "../types/index.ts";

export class ResearchClassificationEngine {
  /**
   * Classify, extract tags, and normalize research content for AI consumption
   */
  public static classifyContent(
    researchId: string,
    title: string,
    content: string,
    userCategory?: string
  ): ResearchClassificationResult {
    const textToAnalyze = `${title} ${content}`.toLowerCase();
    const extractedTags: Set<string> = new Set();
    const aiLabels: Set<string> = new Set();
    let suggestedCategory: ResearchCategoryValue = RESEARCH_CATEGORIES.MARKET;
    let confidenceScore = 0.85;

    // Keyword detection rules
    if (textToAnalyze.includes("option") || textToAnalyze.includes("call") || textToAnalyze.includes("put") || textToAnalyze.includes("strike") || textToAnalyze.includes("implied volatility")) {
      suggestedCategory = RESEARCH_CATEGORIES.OPTIONS;
      extractedTags.add("derivatives");
      extractedTags.add("options");
      aiLabels.add("derivative_instrument");
    } else if (textToAnalyze.includes("future") || textToAnalyze.includes("contango") || textToAnalyze.includes("backwardation") || textToAnalyze.includes("open interest")) {
      suggestedCategory = RESEARCH_CATEGORIES.FUTURES;
      extractedTags.add("derivatives");
      extractedTags.add("futures");
      aiLabels.add("futures_contract");
    } else if (textToAnalyze.includes("rsi") || textToAnalyze.includes("macd") || textToAnalyze.includes("moving average") || textToAnalyze.includes("candlestick") || textToAnalyze.includes("chart")) {
      suggestedCategory = RESEARCH_CATEGORIES.TECHNICAL;
      extractedTags.add("technical_analysis");
      extractedTags.add("chart_pattern");
      aiLabels.add("quantitative_signal");
    } else if (textToAnalyze.includes("earnings") || textToAnalyze.includes("balance sheet") || textToAnalyze.includes("p/e ratio") || textToAnalyze.includes("cash flow") || textToAnalyze.includes("valuation")) {
      suggestedCategory = RESEARCH_CATEGORIES.FUNDAMENTAL;
      extractedTags.add("fundamental_analysis");
      extractedTags.add("equity_valuation");
      aiLabels.add("fundamental_metric");
    } else if (textToAnalyze.includes("gdp") || textToAnalyze.includes("inflation") || textToAnalyze.includes("cpi") || textToAnalyze.includes("interest rate") || textToAnalyze.includes("central bank") || textToAnalyze.includes("fed")) {
      suggestedCategory = RESEARCH_CATEGORIES.ECONOMIC;
      extractedTags.add("macroeconomics");
      extractedTags.add("central_bank");
      aiLabels.add("macro_indicator");
    } else if (textToAnalyze.includes("dividend") || textToAnalyze.includes("split") || textToAnalyze.includes("buyback") || textToAnalyze.includes("merger") || textToAnalyze.includes("acquisition")) {
      suggestedCategory = RESEARCH_CATEGORIES.CORPORATE_ACTIONS;
      extractedTags.add("corporate_event");
      aiLabels.add("corporate_action");
    } else if (textToAnalyze.includes("crude") || textToAnalyze.includes("gold") || textToAnalyze.includes("silver") || textToAnalyze.includes("commodity") || textToAnalyze.includes("oil")) {
      suggestedCategory = RESEARCH_CATEGORIES.COMMODITY;
      extractedTags.add("commodities");
      aiLabels.add("commodity_asset");
    } else if (textToAnalyze.includes("bullish") || textToAnalyze.includes("bearish") || textToAnalyze.includes("fear") || textToAnalyze.includes("greed") || textToAnalyze.includes("sentiment")) {
      suggestedCategory = RESEARCH_CATEGORIES.SENTIMENT;
      extractedTags.add("market_sentiment");
      aiLabels.add("sentiment_score");
    } else if (textToAnalyze.includes("breaking") || textToAnalyze.includes("news") || textToAnalyze.includes("report") || textToAnalyze.includes("announced")) {
      suggestedCategory = RESEARCH_CATEGORIES.NEWS;
      extractedTags.add("market_news");
      aiLabels.add("news_feed");
    } else if (textToAnalyze.includes("ai") || textToAnalyze.includes("generated") || textToAnalyze.includes("llm") || textToAnalyze.includes("model")) {
      suggestedCategory = RESEARCH_CATEGORIES.AI_GENERATED;
      extractedTags.add("ai_generated");
      aiLabels.add("synthetic_research");
    }

    // Final category determination
    const finalCategory = (userCategory && Object.values(RESEARCH_CATEGORIES).includes(userCategory as any))
      ? (userCategory as ResearchCategoryValue)
      : suggestedCategory;

    // Additional generic metadata normalization
    const normalizedMetadata: Record<string, any> = {
      wordCount: content.split(/\s+/).length,
      language: "en",
      preparedForAI: true,
      autoCategoryDetected: suggestedCategory,
      extractionTimestamp: new Date().toISOString(),
    };

    return {
      researchId,
      classifiedCategory: finalCategory,
      extractedTags: Array.from(extractedTags),
      aiLabels: Array.from(aiLabels),
      normalizedMetadata,
      confidenceScore,
    };
  }
}
