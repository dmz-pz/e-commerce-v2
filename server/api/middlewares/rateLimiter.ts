import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { Request } from "express";
import { redisClient } from "../lib/redis.ts";

/**
 * Extrae la IP real del usuario respetando la cadena de proxies:
 * 1. Prioriza `CF-Connecting-IP` (Cloudflare)
 * 2. Recurre a `X-Real-IP` (Nginx)
 * 3. Recurre a `req.ip` (Express parsed proxy)
 */
const getRealClientIp = (req: Request): string => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) {
    const firstCfIp = Array.isArray(cfIp) ? cfIp[0] : cfIp;
    if (firstCfIp) return firstCfIp;
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    const firstRealIp = Array.isArray(realIp) ? realIp[0] : realIp;
    if (firstRealIp) return firstRealIp;
  }

  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

// Generador de tienda (Redis o MemoryStore como fallback si no hay Redis)
const getStore = (prefix: string) => {
  if (!redisClient) return undefined;

  const client = redisClient;
  return new RedisStore({
    sendCommand: async (...args: string[]): Promise<any> => {
      const command = args[0];
      if (!command) return null;
      return client.call(command, ...args.slice(1));
    },
    prefix: `rl:${prefix}:`,
  });
};

// Limitador global para todas las peticiones a la API (300 req / 15 min)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    status: "fail",
    message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRealClientIp,
  store: getStore("global"),
});

// Limitador estricto específicamente para rutas de autenticación (30 req / 15 min)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: "fail",
    message: "Demasiados intentos de autenticación. Por seguridad, intenta nuevamente en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRealClientIp,
  store: getStore("auth"),
});
