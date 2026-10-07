import pool from "../../../config/db.js";
import engdaMarefyaDB from "../migrations/engdaMarefyaDB.js";

class InstallModel {
   static async installDb() {
      const connection = await pool.getConnection();

      try {
         connection.beginTransaction();
         await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
         await connection.query(engdaMarefyaDB.usersTableQuery);
         await connection.query(engdaMarefyaDB.hotelsTableQuery);
         await connection.query(engdaMarefyaDB.roomTypesTableQuery);
         await connection.query(engdaMarefyaDB.roomsTableQuery);
         await connection.query(engdaMarefyaDB.bookingsTableQuery);
         await connection.query(engdaMarefyaDB.paymentsTableQuery);
         await connection.query(engdaMarefyaDB.amenitiesTableQuery);
         await connection.query(engdaMarefyaDB.roomTypesAmenitiesTableQuery);
         await connection.query(engdaMarefyaDB.roomTypeImagesTableQuery);
         await connection.query(engdaMarefyaDB.reviewsTableQuery);
         await connection.query(engdaMarefyaDB.emailLogsTableQuery);
         await connection.query(engdaMarefyaDB.refreshTokensTableQuery);
         await connection.query(engdaMarefyaDB.wishlistsTableQuery);
         await connection.query(engdaMarefyaDB.bedTypesTableQuery);
         await connection.query(engdaMarefyaDB.hotelBankDetailsTableQuery);
         await connection.query(engdaMarefyaDB.enableEventSchedulerQuery);
         await connection.query(
            engdaMarefyaDB.dropDeleteExpiredBookingsEventQuery
         );
         await connection.query(
            engdaMarefyaDB.createDeleteExpiredBookingsEventQuery
         );
         await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);

         await connection.commit();
         connection.release();
         return true;
      } catch (error) {
         console.error("Install failed:", error);
         await connection.rollback();
         connection.release();
         throw error;
      }
   }
}

export default InstallModel;
