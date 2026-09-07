import rateLimit from "express-rate-limit";

// Limitador global para todas las peticiones a la API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Limita a cada IP a 300 peticiones por ventana (windowMs)
  message: {
    status: "fail",
    message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos.",
  },
  standardHeaders: true, // Retorna los límites en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Limitador estricto específicamente para rutas de autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Límite mucho más estricto (30 intentos) para auth (login/registro)
  message: {
    status: "fail",
    message: "Demasiados intentos de autenticación. Por seguridad, intenta nuevamente en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
