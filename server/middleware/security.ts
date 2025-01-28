import session from "express-session";
import MemoryStore from "memorystore";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { z } from "zod";
import { type Request, Response, NextFunction } from "express";
import express from "express";
import xss from "xss";
import hpp from "hpp";

const MemoryStoreSession = MemoryStore(session);

// XSS sanitization middleware
const xssMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

// Different rate limits for different endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts, please try again after an hour",
});

// Input validation middleware with detailed error messages
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(400).json({ error: "Invalid request data" });
      }
    }
  };
};

// Security middleware setup
export const setupSecurity = (app: express.Application) => {
  // Request size limits
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Apply XSS protection
  app.use(xssMiddleware);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Enable CORS with specific options
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.ALLOWED_ORIGIN
          : "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Enhanced Helmet configuration with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", process.env.ALLOWED_ORIGIN || "http://localhost:3000"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: "same-site" },
      dnsPrefetchControl: true,
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: "same-origin" },
      xssFilter: true,
    })
  );

  // Apply different rate limits to different routes
  app.use("/api/auth", authLimiter);
  app.use("/api", apiLimiter);

  // Enhanced session configuration
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000,
      }),
      secret: process.env.SESSION_SECRET || "development_secret",
      name: "sessionId", // Don't use default connect.sid
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        path: "/",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      },
    })
  );

  // Add security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
};
