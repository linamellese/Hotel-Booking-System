import os from "os";

/**
 * Returns all non-internal IPv4 addresses
 * Useful when machine has multiple NICs (Wi-Fi, Ethernet, Docker, etc)
 */
export function getAllLocalIPs() {
   const interfaces = os.networkInterfaces();
   const ips = [];

   for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
         if (net.family === "IPv4" && !net.internal) {
            ips.push({
               interface: name,
               address: net.address,
            });
         }
      }
   }

   return ips;
}
