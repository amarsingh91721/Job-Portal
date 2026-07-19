const { Pool } = require("pg");

const isProduction = Boolean(process.env.DATABASE_URL);

const pool = new Pool(
  isProduction
    ? {
        // Render + Neon
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },

        // Always use Neon public schema
        options: "-c search_path=public",
      }
    : {
        // Local Docker PostgreSQL
        host: "localhost",
        user: "amar",
        password: "password",
        database: "job_portal",
        port: 5435,

        options: "-c search_path=public",
      }
);

pool
  .connect()
  .then(async (client) => {
    console.log("✅ PostgreSQL connected successfully");

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS current_schema,
        current_setting('search_path') AS search_path
    `);

    console.log("Database details:", result.rows[0]);

    client.release();
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });

module.exports = pool;