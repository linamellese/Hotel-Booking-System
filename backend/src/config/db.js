import mysql from "mysql2/promise";

let hosts = process.env.DB_HOSTS || "localhost";
hosts = hosts.split(",");
const port = Number(process.env.DB_PORT);

let activePool = null;
let activeHostIndex = 0;
let host = null;

async function createPool(host) {
   return mysql.createPool({
      host,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
   });
}

async function connect() {
   for (let i = 0; i < hosts.length; i++) {
      host = hosts[activeHostIndex];

      try {
         const pool = await createPool(host);
         await pool.query("SELECT 1");
         console.log("==> Connected to DB host:", host);
         activePool = pool;
         return;
      } catch (err) {
         console.error("==> DB Host Unreachable:", host);
         activeHostIndex = (activeHostIndex + 1) % hosts.length;
      }
   }

   console.error("==> All DB Nodes Unreachable");
}

/**
 * This Proxy object behaves exactly like mysql2 Pool.
 * It exposes .query(), .execute(), .getConnection(), etc.
 */
const pool = new Proxy(
   {},
   {
      get(_, prop) {
         return async (...args) => {
            try {
               if (!activePool) await connect();
               return await activePool[prop](...args);
            } catch (err) {
               // Force reconnect on error and retry on next node
               activePool = null;
               await connect();
               return await activePool[prop](...args);
            }
         };
      },
   }
);

export default pool;
export { host };
