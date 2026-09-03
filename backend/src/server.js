import "dotenv/config";
import pool from "./config/db.js";
import { getAllLocalIPs } from "./utils/network.js";
import ngrok from "@ngrok/ngrok";

// Import the configured Express app
import app from "./app.js";

// ====== Server configuration ======
const hosts = getAllLocalIPs();
const PORT = process.env.PORT || 9000;
const SERVER_NAME = process.env.SERVER_NAME || "Engda Marefya API";

// ====== Test database connection ======
async function testDBConnection() {
   try {
      await pool.query("SELECT 1");
      console.log(`==> DB Connection successful.`);
   } catch (err) {
      console.error("==> DB Connection failed:", err.message);
   }
}
testDBConnection();

// ====== Start the server ======
app.listen(PORT, "0.0.0.0", (error) => {
   if (!error) {
      for (const ipInfo of hosts) {
         console.log(
            `==> ${SERVER_NAME} is running at http://${ipInfo.address}:${PORT} (interface: ${ipInfo.interface})`
         );
      }
   }
});

// ====== Start ngrok ======
ngrok
   .connect({ addr: PORT, authtoken_from_env: true })
   .then((listener) => console.log(`==> Live at: ${listener.url()}`))
   .catch((error) => console.error("==> ngrok connection failed:", error));
