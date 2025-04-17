import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 100000
});

pool.on('error', (err, client) => {
    console.error('▶ Database connection idle', err, client);
});



/**
 * Connect to the database
 * @returns {Client | null} - PostgreSQL client or null if connection fails
 */
export async function connectToDb() {
    try {
        const client = await pool.connect();
        return client;
    } catch (err) {
        console.error("▶ Database connection error:", err);
        return null;
    }
}

/** 
 * Close the database connection
 * @param {Client} client - PostgreSQL client
 */
export async function closeDbConnection(client) {
    if (!client) {
        console.error("▶ Cannot close connection: Database client is null.");
        return;
    }

    try {
        await client.release();
    } catch (err) {
        console.error("▶ Database close connection error:", err);
    }
}

/**
 * Execute a query
 * @param {Client} client - PostgreSQL client
 * @param {string} query - SQL query
 * @param {Array} [params=[]] - Query parameters
 * @returns {Array | null} - Result rows or null on error
 */
export async function executeQuery(client, query, params = []) {
    if (!client) {
        console.error("▶ Cannot execute query: Database client is null.");
        return null;
    }

    try {
        const result = await client.query(query, params);
        return result.rows;
    } catch (err) {
        console.error("▶ Database query error:", err);
        return null;
    }
}