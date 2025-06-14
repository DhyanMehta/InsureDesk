const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // For local dev
        trustServerCertificate: true,
    },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
    .then(() => console.log("✅ Database connected successfully."))
    .catch((err) => console.error("❌ Database connection failed:", err.message));

module.exports = {
    sql,
    pool,
    poolConnect,
};
