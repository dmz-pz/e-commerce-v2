import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    retryStrategy(times) {
      if (times > 5) {
        console.warn("[Redis] Reintentos agotados. Operando en modo degrada/memoria si corresponde.");
        return null; // Detener reintentos automáticos tras 5 intentos si Redis no existe
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("[Redis] Conectado exitosamente.");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    // Log suave para no saturar consola si Redis no está activo en dev local
    console.warn(`[Redis Error]: ${err.message}`);
  });
} catch (error) {
  console.warn("[Redis] No se pudo inicializar la conexión:", error);
  redisClient = null;
}

export { redisClient, isRedisConnected };
