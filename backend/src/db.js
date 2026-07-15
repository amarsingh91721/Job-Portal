const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(async (client) => {
    console.log("✅ Connected to Neon PostgreSQL");

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS schema_name;
    `);

    console.log("DATABASE DETAILS:", result.rows[0]);

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(
      "PUBLIC TABLES:",
      tablesResult.rows.map((row) => row.table_name)
    );

    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

module.exports = pool;