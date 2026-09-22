/**
 * Server entry point: process lifecycle only.
 *
 *   connectDatabase()  ->  app.listen()
 *
 * The HTTP listener is deliberately opened *after* the database connection
 * succeeds, so the API never accepts traffic it cannot serve.
 */
import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const registerProcessHandlers = (httpServer) => {
  const shutdown = async (signal) => {
    console.info(`\n[server] ${signal} received, shutting down gracefully...`);

    try {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
      await disconnectDatabase();
      console.info("[server] shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error(`[server] error during shutdown: ${error.message}`);
      process.exit(1);
    }
  };

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }

  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandled promise rejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[server] uncaught exception:", error);
    process.exit(1);
  });
};

const startServer = async () => {
  await connectDatabase();

  const httpServer = app.listen(env.PORT, () => {
    console.info(`[server] Community Forum API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.info(`[server] environment: ${env.NODE_ENV}`);
    console.info(`[server] CORS origin(s): ${env.CLIENT_ORIGINS.join(", ")}`);
  });

  registerProcessHandlers(httpServer);
};

startServer().catch((error) => {
  console.error("[server] failed to start the Community Forum API");
  console.error(`[server] ${error.message}`);
  process.exit(1);
});
