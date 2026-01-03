import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

// Sensitive keys to redact from logs
const REDACT_PATHS = [
  "password",
  "token",
  "apiKey",
  "api_key",
  "authorization",
  "Authorization",
  "cookie",
  "Cookie",
  "secret",
  "SECRET",
  "creditCard",
  "cardNumber",
  "cvv",
  "*.password",
  "*.token",
  "*.apiKey",
  "*.secret",
  "headers.authorization",
  "headers.cookie",
  "body.password",
  "body.token",
];

// Create logger instance
export const logger = pino({
  level: isDev ? "debug" : "info",
  redact: {
    paths: REDACT_PATHS,
    censor: "[REDACTED]",
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {
        // Production: JSON format for log aggregators
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

// Child loggers for specific modules
export const apiLogger = logger.child({ module: "api" });
export const authLogger = logger.child({ module: "auth" });
export const paymentLogger = logger.child({ module: "payment" });
export const shippingLogger = logger.child({ module: "shipping" });
export const searchLogger = logger.child({ module: "search" });
export const cmsLogger = logger.child({ module: "cms" });

// Helper to safely log errors without exposing sensitive data
export function logError(
  log: pino.Logger,
  message: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorInfo =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          // Don't include stack in production
          ...(isDev && { stack: error.stack }),
        }
      : { error: String(error) };

  log.error({ ...errorInfo, ...context }, message);
}

export default logger;
