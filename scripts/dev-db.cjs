// Embedded Postgres (PGlite) server for local dev when no real Postgres is available.
// Serves the Postgres wire protocol on 127.0.0.1:5432 so the `pg` driver (and
// drizzle-kit) can connect normally.
//
// Note: data lives in memory and is reset every time this process restarts.
const { PGlite } = require("@electric-sql/pglite");
const { PGLiteSocketServer } = require("@electric-sql/pglite-socket");

const HOST = process.env.PGHOST || "127.0.0.1";
const PORT = Number(process.env.PGPORT || 5432);
const MAX_CONNECTIONS = Number(process.env.PGLITE_MAX_CONNECTIONS || 10);

(async () => {
  const db = await PGlite.create();
  const server = new PGLiteSocketServer({
    db,
    host: HOST,
    port: PORT,
    maxConnections: MAX_CONNECTIONS,
  });
  await server.start();
  console.log(`[dev-db] Embedded Postgres (PGlite) listening on ${HOST}:${PORT}`);

  // Ensure the database referenced by drizzle.config.json exists.
  try {
    await db.exec("CREATE DATABASE app_db");
    console.log("[dev-db] Created database 'app_db'");
  } catch (e) {
    if (!String(e.message).includes("already exists")) {
      console.warn("[dev-db] Could not create app_db:", e.message);
    }
  }

  const shutdown = async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  console.error("[dev-db] Failed to start:", e);
  process.exit(1);
});
