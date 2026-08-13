import { Request, Response, NextFunction } from 'express';
import { ReportingService } from '../services/reporting.service';

export class ReportingController {
  public getDashboard(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getExecutiveDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getKpis(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getExecutiveDashboard();
      res.json({ success: true, count: data.kpis.length, data: data.kpis });
    } catch (error) {
      next(error);
    }
  }

  public getTrading(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getTradingIntelligence();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getFinancial(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getFinancialReports();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getOperational(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getOperationalReports();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getCompliance(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = ReportingService.getComplianceReports();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public runBiQuery(req: Request, res: Response, next: NextFunction): void {
    try {
      const { dimension, metric, timeframe, filterModule } = req.body;
      const data = ReportingService.executeBiQuery({
        dimension: dimension || 'Strategy Breakdown',
        metric: metric || 'AUM',
        timeframe: timeframe || 'YTD',
        filterModule
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public createCustomReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const { title, category, format, author } = req.body;
      if (!title || !category || !format) {
        res.status(400).json({ success: false, message: 'title, category, and format are required' });
        return;
      }
      const data = ReportingService.generateCustomReport({ title, category, format, author });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getReports(req: Request, res: Response, next: NextFunction): void {
    try {
      const reports = ReportingService.getReportsList();
      res.json({ success: true, count: reports.length, data: reports });
    } catch (error) {
      next(error);
    }
  }

  public getSchedules(req: Request, res: Response, next: NextFunction): void {
    try {
      const schedules = ReportingService.getSchedulesList();
      res.json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  public createSchedule(req: Request, res: Response, next: NextFunction): void {
    try {
      const { title, category, frequency, emails, format } = req.body;
      if (!title || !category || !frequency) {
        res.status(400).json({ success: false, message: 'title, category, and frequency are required' });
        return;
      }
      const newSch = ReportingService.createSchedule({
        title,
        category,
        frequency,
        emails: emails || ['reports@arina.ai'],
        format: format || 'PDF'
      });
      res.status(201).json({ success: true, data: newSch });
    } catch (error) {
      next(error);
    }
  }

  public getQaReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const qa = ReportingService.runEp21QaSuite();
      res.json({ success: true, data: qa });
    } catch (error) {
      next(error);
    }
  }
}
