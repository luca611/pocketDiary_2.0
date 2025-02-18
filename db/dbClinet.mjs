import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

/**
 * Connect to the database
 * @returns {Client | null} - PostgreSQL client or null if connection fails
 */
export async function connectToDb() {
    if (!connectionString) {
        console.error("▶ Cannot connect: No connection string provided.");
        return null;
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("▶ Database connected successfully.");
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
        console.warn("▶ Cannot close database: Client is null or undefined.");
        return;
    }

    try {
        await client.end();
        console.log("▶ Database connection closed.");
    } catch (err) {
        console.error("▶ Error closing database connection:", err);
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