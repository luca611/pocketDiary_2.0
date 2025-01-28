import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;


/* Must change:
    -> connectionString: must be placed in .env file
*/
const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL : false;

/**
 * Connect to the database
 * 
 * @returns {Client} - PostgreSQL client
 * @throws {Error} - Error if connection fails
 */
export async function connectToDb() {
    if (!connectionString) {
        console.error("No connection string provided, please provide one in the .env file");
    }
    const client = new Client({
        connectionString: connectionString,
    });
    try {
        await client.connect();
        return client;
    } catch (err) {
        throw err;
    }
}

/** 
 * Close the database connection
 * 
 * @param {Client} client - PostgreSQL client
 */
export async function closeDbConnection(client) {
    if (!connectionString) {
        console.error("No connection string provided, please provide one in the .env file");
    }
    try {
        await client.end();
    } catch (err) {
        throw err;
    }
}

/**
 * Execute a query
 * 
 * @param {Client} client - PostgreSQL client
 * @param {string} query - SQL query
 * @returns {Array} - Result rows
 */
export async function executeQuery(client, query) {
    if (!connectionString) {
        console.error("No connection string provided, please provide one in the .env file");
    }
    try {
        const result = await client.query(query);
        return result.rows;
    } catch (err) {
        throw err;
    }
}