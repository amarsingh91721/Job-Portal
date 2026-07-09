const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "amar",
  password: "password",
  database: "job_portal",
  port: 5435,
});

module.exports = pool;