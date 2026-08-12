import { Router } from 'express';
import { NotificationEngine } from '../services/NotificationEngine';
import { NotificationQueue } from '../services/NotificationQueue';
import { NotificationSettingsService } from '../services/NotificationSettingsService';
import { TelegramProvider } from '../services/TelegramProvider';
import { EnweController } from '../controllers/enwe.controller';

const router = Router();

// ==========================================
// 1. EP18 ENWE SPECIFICATION MANDATED ENDPOINTS
// ==========================================

// GET /api/notifications
router.get('/', EnweController.getNotifications);

// GET /api/notifications/unread
router.get('/unread', EnweController.getUnreadCount);

// POST /api/notifications/read
router.post('/read', EnweController.markAsRead);

// POST /api/notifications/emit-event
router.post('/emit-event', EnweController.emitEvent);

// GET /api/notifications/audit
router.get('/audit', EnweController.getAuditTrail);

// GET /api/notifications/qa
router.get('/qa', EnweController.getQaReport);

// GET /api/notifications/templates
router.get('/templates', EnweController.getTemplates);

// GET /api/notifications/delivery
router.get('/delivery', EnweController.getDeliveryChannels);

// GET /api/notifications/runtime
router.get('/runtime', EnweController.getWorkflowRuntime);

// GET /api/notifications/escalations
router.get('/escalations', EnweController.getEscalations);

// POST /api/notifications/escalate
router.post('/escalate', EnweController.triggerEscalation);

// Workflow Alias Routes on Notification Router
router.post('/workflow/start', EnweController.startWorkflow);
router.get('/workflow', EnweController.getWorkflows);
router.get('/workflow/:id', EnweController.getWorkflowById);
router.post('/workflow/approve', EnweController.approveWorkflow);
router.post('/workflow/reject', EnweController.rejectWorkflow);

// ==========================================
// 2. SETTINGS & TELEGRAM GATEWAY ENDPOINTS
// ==========================================

router.get('/settings', (req, res) => {
  try {
    const settings = NotificationSettingsService.getSettings();
    const health = NotificationQueue.getMetrics();
    res.json({ status: 'ok', data: { settings, health } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/telegram/config', (req, res) => {
  res.json({ status: 'ok', data: NotificationSettingsService.getSettings() });
});

router.post('/telegram/config', async (req, res) => {
  try {
    const updatedSettings = NotificationSettingsService.updateSettings(req.body || {});
    res.json({ status: 'ok', message: 'Telegram Gateway settings updated', data: updatedSettings });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/telegram/verify', async (req, res) => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      NotificationSettingsService.updateSettings(req.body);
    }
    const verification = await TelegramProvider.verifyConnection();
    const currentSettings = NotificationSettingsService.getSettings();

    if (!verification.ok) {
      return res.status(400).json({
        status: 'error',
        message: verification.description || 'Telegram Verification Failed',
        data: { verification, settings: currentSettings }
      });
    }

    res.json({
      status: 'ok',
      message: `Verified Telegram Bot: ${verification.botName}`,
      data: { verification, settings: currentSettings }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/telegram/test', async (req, res) => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      NotificationSettingsService.updateSettings(req.body);
    }

    const settings = NotificationSettingsService.getInternalSettings();

    if (!settings.telegramGatewayEnabled) {
      return res.status(400).json({
        status: 'error',
        code: 'NOT_CONFIGURED',
        message: 'Test Alert Blocked: Enterprise Telegram Gateway is currently disabled.'
      });
    }

    if (!settings.rawBotToken || !settings.telegramTargetChatId) {
      return res.status(400).json({
        status: 'error',
        code: 'NOT_CONFIGURED',
        message: 'Test Alert Blocked: Telegram Bot Token or Target Chat ID is not configured.'
      });
    }

    if (settings.connectionStatus !== 'CONNECTED') {
      const verification = await TelegramProvider.verifyConnection();
      if (!verification.ok) {
        return res.status(400).json({
          status: 'error',
          code: 'NOT_CONFIGURED',
          message: `Test Alert Blocked: ${verification.description || 'Bot Token is unverified or invalid.'}`
        });
      }
    }

    const text = [
      `⚡ <b>AI ARINA TELEGRAM GATEWAY TEST</b>`,
      ``,
      `• <b>System Mode:</b> Enterprise OS v3.2 Gateway`,
      `• <b>Connection Status:</b> VERIFIED OK`,
      `• <b>Channels Supported:</b> Telegram Bot API (Active)`,
      `• <b>Time:</b> ${new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      ``,
      `<i>Telegram Notification Gateway is operational and active.</i>`
    ].join('\n');

    const result = await TelegramProvider.sendMessage(text);

    if (!result.ok) {
      return res.status(400).json({
        status: 'error',
        message: `Telegram Delivery Failed: ${result.description || 'Dispatch Error'}`
      });
    }

    const queueItem = NotificationQueue.enqueue({
      notificationType: 'TEST_NOTIFICATION',
      channel: 'TELEGRAM',
      payload: { message: 'Telegram Test Notification' },
      formattedText: text,
      sanitizedFields: ['System Mode', 'Connection Status', 'Channels Supported', 'Time']
    });

    res.json({
      status: 'ok',
      message: 'Test alert dispatched successfully to Telegram target',
      data: queueItem
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/telegram/disconnect', (req, res) => {
  try {
    const updated = NotificationSettingsService.disconnectTelegram();
    res.json({ status: 'ok', message: 'Telegram Gateway disconnected & credentials cleared', data: updated });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/telegram/queue', (req, res) => {
  res.json({ status: 'ok', data: NotificationQueue.getQueue() });
});

router.get('/history', (req, res) => {
  try {
    const auditLogs = NotificationEngine.getAuditHistory();
    const queue = NotificationQueue.getQueue();
    res.json({ status: 'ok', data: { auditLogs, queue } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;

export const workflowRouter = Router();
workflowRouter.post('/start', EnweController.startWorkflow);
workflowRouter.get('/', EnweController.getWorkflows);
workflowRouter.get('/:id', EnweController.getWorkflowById);
workflowRouter.post('/approve', EnweController.approveWorkflow);
workflowRouter.post('/reject', EnweController.rejectWorkflow);
