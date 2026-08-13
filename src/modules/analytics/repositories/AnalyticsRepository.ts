import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class AnalyticsRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_analytics (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        ai_name VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL,
        confidence NUMERIC(5, 2) NOT NULL,
        accuracy NUMERIC(5, 2) NOT NULL,
        roi NUMERIC(8, 2) NOT NULL,
        drawdown NUMERIC(5, 2) NOT NULL,
        trades_count INT NOT NULL,
        predictions_count INT NOT NULL,
        ranking INT NOT NULL,
        score NUMERIC(5, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_scores (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        overall_score NUMERIC(5, 2) NOT NULL,
        accuracy_score NUMERIC(5, 2) NOT NULL,
        confidence_score NUMERIC(5, 2) NOT NULL,
        profit_score NUMERIC(5, 2) NOT NULL,
        consistency_score NUMERIC(5, 2) NOT NULL,
        risk_score NUMERIC(5, 2) NOT NULL,
        research_score NUMERIC(5, 2) NOT NULL,
        decision_score NUMERIC(5, 2) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_health (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        health_score NUMERIC(5, 2) NOT NULL,
        reliability NUMERIC(5, 2) NOT NULL,
        consistency NUMERIC(5, 2) NOT NULL,
        stability NUMERIC(5, 2) NOT NULL,
        risk_rating VARCHAR(20) NOT NULL,
        learning_progress NUMERIC(5, 2) NOT NULL,
        performance_trend VARCHAR(20) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_rankings (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        rank_position INT NOT NULL,
        accuracy_rank INT NOT NULL,
        profit_rank INT NOT NULL,
        consistency_rank INT NOT NULL,
        risk_rank INT NOT NULL,
        enterprise_score NUMERIC(5, 2) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_performance_history (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        period_type VARCHAR(20) NOT NULL,
        period_value VARCHAR(30) NOT NULL,
        accuracy NUMERIC(5, 2) NOT NULL,
        roi NUMERIC(8, 2) NOT NULL,
        drawdown NUMERIC(5, 2) NOT NULL,
        sharpe NUMERIC(5, 2) NOT NULL,
        trades INT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_comparison (
        id VARCHAR(64) PRIMARY KEY,
        session_name VARCHAR(100) NOT NULL,
        ai_ids JSONB NOT NULL,
        metrics_compared JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_insights (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        insight_type VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_alerts (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_forecasts (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        metric_name VARCHAR(50) NOT NULL,
        current_value NUMERIC(8, 2) NOT NULL,
        forecast_value NUMERIC(8, 2) NOT NULL,
        confidence_interval NUMERIC(5, 2) NOT NULL,
        horizon VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_correlations (
        id VARCHAR(64) PRIMARY KEY,
        ai_id_1 VARCHAR(64) NOT NULL,
        ai_id_2 VARCHAR(64) NOT NULL,
        correlation_coefficient NUMERIC(5, 4) NOT NULL,
        metric_paired VARCHAR(50) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_anomalies (
        id VARCHAR(64) PRIMARY KEY,
        ai_id VARCHAR(64) NOT NULL,
        anomaly_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_heatmaps (
        id VARCHAR(64) PRIMARY KEY,
        dimension_x VARCHAR(50) NOT NULL,
        dimension_y VARCHAR(50) NOT NULL,
        intensity_score NUMERIC(5, 2) NOT NULL,
        metadata JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed initial data if tables are empty
    const res = await db.execute(sql`SELECT COUNT(*) as count FROM ai_analytics`);
    const count = parseInt((res.rows[0] as any)?.count || '0', 10);
    if (count === 0) {
      const sampleModels = [
        { id: 'AI-001', name: 'Gemini 2.5 Pro Enterprise', provider: 'Google', version: 'v2.5-pro', status: 'ACTIVE', confidence: 96.4, accuracy: 94.2, roi: 34.5, drawdown: 3.2, trades: 450, predictions: 1200, rank: 1, score: 95.8 },
        { id: 'AI-002', name: 'Claude 3.5 Sonnet Analyst', provider: 'Anthropic', version: 'v3.5', status: 'ACTIVE', confidence: 95.1, accuracy: 93.8, roi: 31.2, drawdown: 3.8, trades: 410, predictions: 1100, rank: 2, score: 94.1 },
        { id: 'AI-003', name: 'GPT-4o Reasoning Core', provider: 'OpenAI', version: 'v4.0', status: 'ACTIVE', confidence: 94.0, accuracy: 92.5, roi: 28.9, drawdown: 4.5, trades: 390, predictions: 1050, rank: 3, score: 92.7 },
        { id: 'AI-004', name: 'DeepSeek R1 Quant Engine', provider: 'DeepSeek', version: 'v1.0', status: 'ACTIVE', confidence: 93.5, accuracy: 91.9, roi: 35.8, drawdown: 5.8, trades: 520, predictions: 1400, rank: 4, score: 91.5 },
        { id: 'AI-005', name: 'Llama 3 70B Arbiter', provider: 'Meta', version: 'v3-70b', status: 'ACTIVE', confidence: 91.2, accuracy: 89.4, roi: 22.4, drawdown: 4.1, trades: 310, predictions: 890, rank: 5, score: 89.2 },
        { id: 'AI-006', name: 'Mistral Large 2', provider: 'Mistral AI', version: 'v2.0', status: 'STANDBY', confidence: 90.5, accuracy: 88.7, roi: 19.8, drawdown: 4.9, trades: 280, predictions: 750, rank: 6, score: 87.9 },
      ];

      for (const m of sampleModels) {
        await db.execute(sql`
          INSERT INTO ai_analytics (id, ai_id, ai_name, provider, model_version, status, confidence, accuracy, roi, drawdown, trades_count, predictions_count, ranking, score)
          VALUES (${'ANL-' + m.id}, ${m.id}, ${m.name}, ${m.provider}, ${m.version}, ${m.status}, ${m.confidence}, ${m.accuracy}, ${m.roi}, ${m.drawdown}, ${m.trades}, ${m.predictions}, ${m.rank}, ${m.score})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_scores (id, ai_id, overall_score, accuracy_score, confidence_score, profit_score, consistency_score, risk_score, research_score, decision_score)
          VALUES (${'SCR-' + m.id}, ${m.id}, ${m.score}, ${m.accuracy}, ${m.confidence}, ${m.roi * 2.5}, ${95.0 - m.rank}, ${100 - m.drawdown * 10}, ${94.0}, ${95.5})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_health (id, ai_id, health_score, reliability, consistency, stability, risk_rating, learning_progress, performance_trend)
          VALUES (${'HLT-' + m.id}, ${m.id}, ${99.0 - m.rank * 0.4}, ${99.5}, ${96.0}, ${98.5}, ${m.drawdown > 4 ? 'MODERATE' : 'LOW'}, ${94.5}, ${'UPWARD'})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_rankings (id, ai_id, rank_position, accuracy_rank, profit_rank, consistency_rank, risk_rank, enterprise_score)
          VALUES (${'RNK-' + m.id}, ${m.id}, ${m.rank}, ${m.rank}, ${m.rank === 4 ? 1 : m.rank}, ${m.rank}, ${m.rank === 1 ? 1 : m.rank + 1}, ${m.score})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_performance_history (id, ai_id, period_type, period_value, accuracy, roi, drawdown, sharpe, trades)
          VALUES 
          (${'HST-' + m.id + '-1'}, ${m.id}, 'MONTHLY', '2026-05', ${m.accuracy - 1.2}, ${m.roi - 4}, ${m.drawdown + 0.5}, ${2.1}, ${Math.floor(m.trades / 3)}),
          (${'HST-' + m.id + '-2'}, ${m.id}, 'MONTHLY', '2026-06', ${m.accuracy - 0.5}, ${m.roi - 2}, ${m.drawdown + 0.2}, ${2.3}, ${Math.floor(m.trades / 3)}),
          (${'HST-' + m.id + '-3'}, ${m.id}, 'MONTHLY', '2026-07', ${m.accuracy}, ${m.roi}, ${m.drawdown}, ${2.5}, ${Math.floor(m.trades / 3)})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_insights (id, ai_id, insight_type, title, description, severity)
          VALUES (${'INS-' + m.id}, ${m.id}, 'PERFORMANCE_OPTIMIZATION', ${m.name + ' High Alpha Detected'}, ${'Model demonstrated exceptional prediction consistency across high-volatility sessions.'}, 'INFO')
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_alerts (id, ai_id, alert_type, message, status)
          VALUES (${'ALR-' + m.id}, ${m.id}, 'HEALTH_CHECK', ${'Routine health audit completed successfully for ' + m.name}, 'RESOLVED')
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_forecasts (id, ai_id, metric_name, current_value, forecast_value, confidence_interval, horizon)
          VALUES (${'FRC-' + m.id}, ${m.id}, 'ROI', ${m.roi}, ${m.roi * 1.15}, ${94.5}, ${'30D'})
          ON CONFLICT (id) DO NOTHING;
        `);

        await db.execute(sql`
          INSERT INTO ai_anomalies (id, ai_id, anomaly_type, severity, description, root_cause)
          VALUES (${'ANM-' + m.id}, ${m.id}, 'LATENCY_SPIKE', ${m.drawdown > 4 ? 'MEDIUM' : 'LOW'}, ${'Minor deviation in execution latency during US market open.'}, ${'Network congestion on edge relay node.'})
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // Seed correlations & heatmaps
      await db.execute(sql`
        INSERT INTO ai_correlations (id, ai_id_1, ai_id_2, correlation_coefficient, metric_paired)
        VALUES 
        ('COR-1', 'AI-001', 'AI-002', 0.9420, 'ACCURACY'),
        ('COR-2', 'AI-001', 'AI-003', 0.8910, 'ROI'),
        ('COR-3', 'AI-002', 'AI-004', 0.9150, 'CONFIDENCE')
        ON CONFLICT (id) DO NOTHING;
      `);

      await db.execute(sql`
        INSERT INTO ai_heatmaps (id, dimension_x, dimension_y, intensity_score, metadata)
        VALUES 
        ('HMP-1', 'Volatility', 'Accuracy', 92.4, '{"region": "Global", "sector": "Tech"}'),
        ('HMP-2', 'Liquidity', 'ROI', 88.9, '{"region": "APAC", "sector": "Fintech"}'),
        ('HMP-3', 'Latency', 'Confidence', 95.1, '{"region": "EMEA", "sector": "Crypto"}')
        ON CONFLICT (id) DO NOTHING;
      `);
    }
  }

  async getAiAnalyticsList(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_analytics ORDER BY ranking ASC`);
    return res.rows;
  }

  async getAiAnalyticsById(id: string): Promise<any> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_analytics WHERE ai_id = ${id} OR id = ${id}`);
    if (res.rows.length === 0) return null;
    const model = res.rows[0];
    
    const scoresRes = await db.execute(sql`SELECT * FROM ai_scores WHERE ai_id = ${(model as any).ai_id}`);
    const healthRes = await db.execute(sql`SELECT * FROM ai_health WHERE ai_id = ${(model as any).ai_id}`);
    const historyRes = await db.execute(sql`SELECT * FROM ai_performance_history WHERE ai_id = ${(model as any).ai_id}`);
    const insightsRes = await db.execute(sql`SELECT * FROM ai_insights WHERE ai_id = ${(model as any).ai_id}`);
    const alertsRes = await db.execute(sql`SELECT * FROM ai_alerts WHERE ai_id = ${(model as any).ai_id}`);

    return {
      ...model,
      scores: scoresRes.rows[0] || null,
      health: healthRes.rows[0] || null,
      history: historyRes.rows,
      insights: insightsRes.rows,
      alerts: alertsRes.rows
    };
  }

  async getAiRankings(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_rankings ORDER BY rank_position ASC`);
    return res.rows;
  }

  async getAiHealth(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_health`);
    return res.rows;
  }

  async getAiTrends(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_performance_history ORDER BY timestamp DESC LIMIT 50`);
    return res.rows;
  }

  async getAiHistory(id: string): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_performance_history WHERE ai_id = ${id} ORDER BY timestamp ASC`);
    return res.rows;
  }

  async getAiCompare(aiIds: string[]): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    if (!aiIds || aiIds.length === 0) {
      const all = await this.getAiAnalyticsList();
      return all.slice(0, 3);
    }
    const results = [];
    for (const id of aiIds) {
      const data = await this.getAiAnalyticsById(id);
      if (data) results.push(data);
    }
    return results;
  }

  async getForecasts(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_forecasts`);
    return res.rows;
  }

  async getCorrelations(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_correlations`);
    return res.rows;
  }

  async getAnomalies(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_anomalies`);
    return res.rows;
  }

  async getHeatmaps(): Promise<any[]> {
    const db = getDb();
    await this.ensureTables();
    const res = await db.execute(sql`SELECT * FROM ai_heatmaps`);
    return res.rows;
  }

  async getCrossModuleAggregation(): Promise<any> {
    const db = getDb();
    await this.ensureTables();
    const aiList = await this.getAiAnalyticsList();
    const forecasts = await this.getForecasts();
    const correlations = await this.getCorrelations();
    const anomalies = await this.getAnomalies();
    const heatmaps = await this.getHeatmaps();

    return {
      modules: {
        market: { status: 'CONNECTED', latencyMs: 12, feedRate: '1,200 msg/s' },
        research: { status: 'CONNECTED', papersIndexed: 45200, confidence: 96.2 },
        aiIntelligence: { status: 'CONNECTED', activeModels: aiList.length, avgAccuracy: 92.4 },
        strategy: { status: 'CONNECTED', activePipelines: 18, executionMode: 'READ_ONLY' },
        paperTrading: { status: 'CONNECTED', simulatedVolume: '$4.2M', winRate: '68.4%' },
        aiLifecycle: { status: 'CONNECTED', stagesMaintained: 10, auditIntegrity: '100%' },
        portfolio: { status: 'CONNECTED', totalExposure: '$12.5M', sharpeRatio: 2.45 },
        accounting: { status: 'CONNECTED', ledgerSynced: true, reconciliation: 'OK' },
        fund: { status: 'CONNECTED', NAV: '$104.2M', aum: '$150M' },
        administration: { status: 'CONNECTED', accessControl: 'ENFORCED' },
        alerts: { status: 'CONNECTED', activeAlerts: anomalies.length },
        explainability: { status: 'CONNECTED', shapleyComputed: true }
      },
      aiList,
      forecasts,
      correlations,
      anomalies,
      heatmaps
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
