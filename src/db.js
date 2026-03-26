const { Pool } = require("pg");

function buildSslConfig() {
  const enabled = (process.env.PG_SSL || "").toLowerCase() === "true";
  if (!enabled) return false;

  const rejectUnauthorized = (process.env.PG_SSL_REJECT_UNAUTHORIZED || "").toLowerCase() !== "false";
  return { rejectUnauthorized };
}

function createPool() {
  const ssl = buildSslConfig();

  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
    });
  }

  return new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || "feedback_app",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    ssl,
  });
}

const pool = createPool();

function mapFeedbackRow(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    rating: row.rating,
    createdAt: row.created_at,
  };
}

async function getAllFeedback() {
  const { rows } = await pool.query(
    `
    SELECT id, name, message, rating, created_at
    FROM feedback
    ORDER BY created_at DESC
    `
  );
  return rows.map(mapFeedbackRow);
}

async function insertFeedback({ id, name, message, rating, createdAt }) {
  const { rows } = await pool.query(
    `
    INSERT INTO feedback (id, name, message, rating, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, message, rating, created_at
    `,
    [id, name, message, rating, createdAt]
  );

  return mapFeedbackRow(rows[0]);
}

async function checkDatabaseHealth() {
  await pool.query("SELECT 1");
}

async function checkSchemaReady() {
  const { rows } = await pool.query("SELECT to_regclass('public.feedback') AS table_name");
  if (!rows[0] || !rows[0].table_name) {
    throw new Error("Missing table 'feedback'. Run backend migrations: npm run migrate:up");
  }
}

module.exports = {
  getAllFeedback,
  insertFeedback,
  checkDatabaseHealth,
  checkSchemaReady,
  pool,
};
