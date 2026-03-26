require("dotenv").config();
const app = require("./app");
const { checkDatabaseHealth, checkSchemaReady, pool } = require("./db");

const PORT = Number(process.env.PORT || 4000);

async function startServer() {
  try {
    await checkDatabaseHealth();
    await checkSchemaReady();
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    await pool.end();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
