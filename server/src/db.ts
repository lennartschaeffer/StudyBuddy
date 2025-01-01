import { Pool } from "pg";
require('dotenv').config();

const pool = new Pool({
    user : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    database: process.env.DB_NAME,
})

export default pool;