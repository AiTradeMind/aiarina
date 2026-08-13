import { Request, Response } from 'express';
import { EnterpriseSecretsService } from '../services/secrets.service';
import { EnterpriseSecretsValidator } from '../validators/secrets.validator';

export class EnterpriseSecretsController {
  // GET /api/secrets
  public static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseSecretsService.getOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/status
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseSecretsService.getStatus();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/list
  public static async listSecrets(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string;
      const environment = req.query.environment as string;
      const data = await EnterpriseSecretsService.listSecrets(category, environment);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/history
  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getHistory(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/versions
  public static async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getVersions(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/usage
  public static async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getUsage(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/rotation
  public static async getRotation(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getRotation(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/validation
  public static async getValidation(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getValidation(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/permissions
  public static async getPermissions(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.query.secretId as string;
      const data = await EnterpriseSecretsService.getPermissions(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/secrets/preview
  public static async getPreview(req: Request, res: Response): Promise<void> {
    try {
      const secretId = (req.query.secretId || req.query.id) as string;
      if (!secretId) {
        res.status(400).json({ success: false, error: 'Query parameter "secretId" or "id" is required' });
        return;
      }
      const data = await EnterpriseSecretsService.getPreview(secretId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/secrets/create
  public static async createSecret(req: Request, res: Response): Promise<void> {
    try {
      const validation = EnterpriseSecretsValidator.validateCreateSecret(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: 'Validation Error', details: validation.errors });
        return;
      }
      const data = await EnterpriseSecretsService.createSecret(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/secrets/rotate
  public static async rotateSecret(req: Request, res: Response): Promise<void> {
    try {
      const validation = EnterpriseSecretsValidator.validateRotateSecret(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: 'Validation Error', details: validation.errors });
        return;
      }
      const data = await EnterpriseSecretsService.rotateSecret(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/secrets/verify
  public static async verifySecret(req: Request, res: Response): Promise<void> {
    try {
      const validation = EnterpriseSecretsValidator.validateVerifySecret(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: 'Validation Error', details: validation.errors });
        return;
      }
      const data = await EnterpriseSecretsService.verifySecret(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/secrets/import
  public static async importSecrets(req: Request, res: Response): Promise<void> {
    try {
      const validation = EnterpriseSecretsValidator.validateImportSecrets(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: 'Validation Error', details: validation.errors });
        return;
      }
      const data = await EnterpriseSecretsService.importSecrets(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/secrets/export
  public static async exportSecrets(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseSecretsService.exportSecrets();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
