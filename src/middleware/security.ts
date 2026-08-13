import { Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../infrastructure/config/env';

export const securityMiddleware = Router();

securityMiddleware.use(helmet({
  contentSecurityPolicy: config.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], 
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameAncestors: ["'none'"], // Frame protection
    }
  } : false, // Turn off CSP for development so Vite resources can load
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xssFilter: true, // XSS Protection
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Referrer Policy
  hidePoweredBy: true, // Remove Server Header
}));

securityMiddleware.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'requestId', 'correlationId', 'x-internal-worker-token']
}));
