// import { Pool } from "pg";
// require('dotenv').config();

// const pool = new Pool({
//     user : process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
//     database: process.env.DB_NAME,
// })

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

export default pool;
