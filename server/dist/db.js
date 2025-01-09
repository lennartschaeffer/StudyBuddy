"use strict";
// import { Pool } from "pg";
// require('dotenv').config();
Object.defineProperty(exports, "__esModule", { value: true });
// const pool = new Pool({
//     user : process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
//     database: process.env.DB_NAME,
// })
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
});
exports.default = pool;
