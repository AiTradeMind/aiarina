import { Request, Response } from "express";
import { qaService } from "../services/qa.service.ts";
import { qaRepository } from "../repositories/qa.repository.ts";

export class QAController {
  async certifyPlatform(req: Request, res: Response) {
    try {
      const report = await qaService.runFullCertificationSuite();
      res.status(200).json({
        status: "SUCCESS",
        message: "Enterprise QA Certification execution completed successfully",
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Failed to execute QA Certification",
      });
    }
  }

  async getLatestReport(req: Request, res: Response) {
    try {
      const reportFromDb = await qaRepository.getLatestCertificationReport();
      if (reportFromDb) {
        return res.status(200).json({ status: "SUCCESS", data: reportFromDb });
      }
      // If none in DB, run suite live
      const liveReport = await qaService.runFullCertificationSuite();
      res.status(200).json({ status: "SUCCESS", data: liveReport });
    } catch (error: any) {
      res.status(500).json({ status: "ERROR", message: error.message });
    }
  }

  async getDomainResults(req: Request, res: Response) {
    try {
      const report = await qaService.runFullCertificationSuite();
      res.status(200).json({
        status: "SUCCESS",
        data: report.domains,
      });
    } catch (error: any) {
      res.status(500).json({ status: "ERROR", message: error.message });
    }
  }

  async getBenchmarks(req: Request, res: Response) {
    try {
      const benchmarks = await qaService.getBenchmarks();
      res.status(200).json({
        status: "SUCCESS",
        data: benchmarks,
      });
    } catch (error: any) {
      res.status(500).json({ status: "ERROR", message: error.message });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await qaRepository.getAuditLogs();
      res.status(200).json({
        status: "SUCCESS",
        data: logs,
      });
    } catch (error: any) {
      res.status(500).json({ status: "ERROR", message: error.message });
    }
  }
}

export const qaController = new QAController();
