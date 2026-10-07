import pool from "../../../config/db.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";

class BookingModel {
   // Create a new hotel
   static async createBooking(bookingData) {
      const {
         id,
         user_id,
         room_id,
         check_in,
         check_out,
         total_amount,
         booking_reference,
      } = bookingData;
      const query = `INSERT INTO bookings (id, room_id, user_id, check_in, check_out, total_amount, booking_reference)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [
         id,
         room_id,
         user_id,
         check_in,
         check_out,
         total_amount,
         booking_reference,
      ];

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { ...bookingData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("booking_reference")) {
               throw new AppError(
                  "Booking already exists with this booking reference",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get booking details with hotel rating and room type rating with review count by joining reviews table
   static async getBookingDetails(bookingId) {
      const query = `
         SELECT
            b.id,
            b.booking_reference,
            b.check_in,
            b.check_out,
            b.actual_check_out,
            b.status,
            b.total_amount,
            b.created_at,

            r.id AS room_id,
            r.room_number,

            rt.id AS room_type_id,
            rt.name AS room_type_name,
            rt.price_per_night,
            rt.bed_type,
            rt.number_of_beds,
            rt.description AS room_type_description,
            rt.main_image_url AS room_type_main_image_url,
            rt.main_image_public_id AS room_type_main_image_public_id,

            h.id AS hotel_id,
            h.name AS hotel_name,
            h.description AS hotel_description,
            h.location AS hotel_location,
            h.profile_pic_url AS hotel_profile_pic_url,
            h.contact_info AS hotel_contact_number,

            -- Room Type Reviews
            COALESCE(rt_reviews.review_count, 0) AS room_type_reviews_count,
            COALESCE(rt_reviews.avg_rating, 0) AS room_type_average_rating,

            -- Hotel Reviews
            COALESCE(h_reviews.review_count, 0) AS hotel_reviews_count,
            COALESCE(h_reviews.avg_rating, 0) AS hotel_average_rating,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.phone_number,
            u.email,
            u.profile_pic_url

         FROM bookings b
         JOIN rooms r ON b.room_id = r.id
         JOIN room_types rt ON r.room_type_id = rt.id
         JOIN hotels h ON rt.hotel_id = h.id
         JOIN users u ON b.user_id = u.id

         -- Room Type review aggregation
         LEFT JOIN (
            SELECT
               room_type_id,
               COUNT(*) AS review_count,
               ROUND(AVG(rating), 1) AS avg_rating
            FROM reviews
            GROUP BY room_type_id
         ) rt_reviews ON rt.id = rt_reviews.room_type_id

         -- Hotel review aggregation
         LEFT JOIN (
            SELECT
               hotel_id,
               COUNT(*) AS review_count,
               ROUND(AVG(rating), 1) AS avg_rating
            FROM reviews
            GROUP BY hotel_id
         ) h_reviews ON h.id = h_reviews.hotel_id

         WHERE b.id = ?;
      `;

      try {
         const [rows] = await pool.execute(query, [bookingId]);

         if (rows.length === 0) {
            return null;
         }

         const booking = rows[0];

         const checkInDate = new Date(booking.check_in);
         const checkOutDate = new Date(booking.check_out);
         const timeDiff = Math.abs(
            checkOutDate.getTime() - checkInDate.getTime()
         );
         const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

         // Get payment details
         const payment = await this.getPaymentByBookingId(bookingId);

         return {
            id: booking.id,
            booking_reference: booking.booking_reference,
            room: {
               id: booking.room_id,
               room_number: booking.room_number,
               room_type: {
                  id: booking.room_type_id,
                  name: booking.room_type_name,
                  price_per_night: parseFloat(booking.price_per_night),
                  bed_type: booking.bed_type,
                  number_of_beds: booking.number_of_beds,
                  description: booking.room_type_description,
                  reviews_count: booking.room_type_reviews_count,
                  average_rating: booking.room_type_average_rating,
                  main_image_url: booking.room_type_main_image_url,
                  main_image_public_id: booking.room_type_main_image_public_id,
               },
            },
            hotel: {
               id: booking.hotel_id,
               name: booking.hotel_name,
               logo_url: booking.logo_url,
               location: booking.hotel_location,
               description: booking.hotel_description,
               contact_number: booking.hotel_contact_number,
               profile_pic_url: booking.hotel_profile_pic_url,
               reviews_count: booking.hotel_reviews_count,
               average_rating: booking.hotel_average_rating,
            },
            user: {
               id: booking.user_id,
               first_name: booking.first_name,
               last_name: booking.last_name,
               phone_number: booking.phone_number,
               email: booking.email,
               profile_pic_url: booking.profile_pic_url,
            },
            check_in: booking.check_in,
            check_out: booking.check_out,
            actual_check_out: booking.actual_check_out
               ? booking.actual_check_out
               : null,
            status: booking.status,
            nights: nights,
            total_amount: parseFloat(booking.total_amount),
            payment: payment || null,
            created_at: booking.created_at,
         };
      } catch (error) {
         throw new AppError(
            "Error fetching booking details",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get booking details with hotel rating and room type rating with review count by joining reviews table
   static async getBookingDetailsByReference(bookingReference) {
      const query = `
         SELECT
            b.id,
            b.booking_reference,
            b.check_in,
            b.check_out,
            b.actual_check_out,
            b.status,
            b.total_amount,
            b.created_at,

            r.id AS room_id,
            r.room_number,

            rt.id AS room_type_id,
            rt.name AS room_type_name,
            rt.price_per_night,
            rt.bed_type,
            rt.number_of_beds,
            rt.description AS room_type_description,

            h.id AS hotel_id,
            h.name AS hotel_name,
            h.description AS hotel_description,
            h.location AS hotel_location,
            h.profile_pic_url AS hotel_profile_pic_url,
            h.contact_info AS hotel_contact_number,

            -- Room Type Reviews
            COALESCE(rt_reviews.review_count, 0) AS room_type_reviews_count,
            COALESCE(rt_reviews.avg_rating, 0) AS room_type_average_rating,

            -- Hotel Reviews
            COALESCE(h_reviews.review_count, 0) AS hotel_reviews_count,
            COALESCE(h_reviews.avg_rating, 0) AS hotel_average_rating,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.phone_number,
            u.email,
            u.profile_pic_url

         FROM bookings b
         JOIN rooms r ON b.room_id = r.id
         JOIN room_types rt ON r.room_type_id = rt.id
         JOIN hotels h ON rt.hotel_id = h.id
         JOIN users u ON b.user_id = u.id

         -- Room Type review aggregation
         LEFT JOIN (
            SELECT
               room_type_id,
               COUNT(*) AS review_count,
               ROUND(AVG(rating), 1) AS avg_rating
            FROM reviews
            GROUP BY room_type_id
         ) rt_reviews ON rt.id = rt_reviews.room_type_id

         -- Hotel review aggregation
         LEFT JOIN (
            SELECT
               hotel_id,
               COUNT(*) AS review_count,
               ROUND(AVG(rating), 1) AS avg_rating
            FROM reviews
            GROUP BY hotel_id
         ) h_reviews ON h.id = h_reviews.hotel_id

         WHERE b.booking_reference = ?;
      `;

      try {
         const [rows] = await pool.execute(query, [bookingReference]);

         if (rows.length === 0) {
            return null;
         }

         const booking = rows[0];

         const checkInDate = new Date(booking.check_in);
         const checkOutDate = new Date(booking.check_out);
         const timeDiff = Math.abs(
            checkOutDate.getTime() - checkInDate.getTime()
         );
         const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

         return {
            id: booking.id,
            booking_reference: booking.booking_reference,
            room: {
               id: booking.room_id,
               room_number: booking.room_number,
               room_type: {
                  id: booking.room_type_id,
                  name: booking.room_type_name,
                  price_per_night: parseFloat(booking.price_per_night),
                  bed_type: booking.bed_type,
                  number_of_beds: booking.number_of_beds,
                  description: booking.room_type_description,
                  reviews_count: booking.room_type_reviews_count,
                  average_rating: booking.room_type_average_rating,
               },
            },
            hotel: {
               id: booking.hotel_id,
               name: booking.hotel_name,
               logo_url: booking.logo_url,
               location: booking.hotel_location,
               description: booking.hotel_description,
               contact_number: booking.hotel_contact_number,
               profile_pic_url: booking.hotel_profile_pic_url,
               reviews_count: booking.hotel_reviews_count,
               average_rating: booking.hotel_average_rating,
            },
            user: {
               id: booking.user_id,
               first_name: booking.first_name,
               last_name: booking.last_name,
               phone_number: booking.phone_number,
               email: booking.email,
               profile_pic_url: booking.profile_pic_url,
            },
            check_in: booking.check_in,
            check_out: booking.check_out,
            actual_check_out: booking.actual_check_out
               ? booking.actual_check_out
               : null,
            status: booking.status,
            nights: nights,
            total_amount: parseFloat(booking.total_amount),
            created_at: booking.created_at,
         };
      } catch (error) {
         throw new AppError(
            "Error fetching booking details",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get payment details
   static async getPaymentByBookingId(bookingId) {
      const query = `
         SELECT
            p.id,
            p.booking_id,
            p.total_amount,
            p.payment_method,
            p.status,
            p.created_at,
            p.updated_at
         FROM
            payments p
         WHERE
            p.booking_id = ?;
      `;

      try {
         const [rows] = await pool.execute(query, [bookingId]);

         if (rows.length === 0) {
            return null;
         }

         return rows[0];
      } catch (error) {
         throw new AppError(
            "Error fetching payment details",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Cancel booking
   static async cancelBooking(id) {
      const query = `DELETE FROM bookings WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, [id]);

         if (result.affectedRows === 0) {
            return null;
         }

         return { id };
      } catch (error) {
         throw new AppError(
            "Error cancelling booking",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user bookings with pagination
   static async getUserBookings(id, status, page, limit) {
      let values = [id];
      let query = `
         SELECT
            b.id,
            b.booking_reference,
            h.name AS hotel_name,
            rt.name AS room_type,
            r.room_number,
            b.check_in,
            b.check_out,
            b.status,
            b.total_amount,
            b.created_at,
            b.updated_at
         FROM
            bookings b
         JOIN
            rooms r ON b.room_id = r.id
         JOIN
            room_types rt ON r.room_type_id = rt.id
         JOIN
            hotels h ON rt.hotel_id = h.id
         JOIN
            users u ON b.user_id = u.id
         WHERE
            b.user_id = ?`;
      if (status) {
         query += ` AND b.status = ?`;
         values.push(status);
      }
      query += ` ORDER BY b.created_at DESC`;

      const offset = (page - 1) * limit;
      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      try {
         const [rows] = await pool.execute(query, values);

         return rows;
      } catch (error) {
         throw new AppError(
            "Error fetching user bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count user bookings
   static async countUserBookings(id, status) {
      let values = [id];
      let query = `SELECT COUNT(*) AS count FROM bookings WHERE user_id = ?`;
      if (status) {
         query += ` AND status = ?`;
         values.push(status);
      }
      try {
         const [rows] = await pool.execute(query, values);
         if (rows.length === 0) {
            return 0;
         }

         return rows[0].count;
      } catch (error) {
         throw new AppError(
            "Error counting user bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel bookings
   static async getHotelBookings(
      id,
      search,
      check_in,
      check_out,
      status,
      page,
      limit
   ) {
      let values = [id];
      let query = `SELECT
         b.id,
         b.booking_reference,
         b.check_in,
         b.check_out,
         b.actual_check_out,
         b.status,
         b.total_amount,
         b.created_at,
         b.updated_at,
         r.id AS room_id,
         r.room_number,
         rt.id AS room_type_id,
         rt.name AS room_type_name,
         rt.price_per_night,
         h.id AS hotel_id,
         h.name AS hotel_name,
         h.location AS hotel_location,
         u.id AS user_id,
         u.first_name,
         u.last_name,
         u.email
      FROM
         bookings b
      JOIN
         rooms r ON b.room_id = r.id
      JOIN
         room_types rt ON r.room_type_id = rt.id
      JOIN
         hotels h ON rt.hotel_id = h.id
      JOIN
         users u ON b.user_id = u.id
      WHERE
         h.id = ?`;
      if (search) {
         query += ` AND (b.booking_reference LIKE ? OR h.name LIKE ? OR r.room_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }
      if (check_in) {
         query += ` AND b.check_in = ?`;
         values.push(check_in);
      }
      if (check_out) {
         query += ` AND b.check_out = ?`;
         values.push(check_out);
      }
      if (status) {
         query += ` AND b.status = ?`;
         values.push(status);
      }
      const offset = (page - 1) * limit;

      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      try {
         const [rows] = await pool.execute(query, values);

         return rows;
      } catch (error) {
         throw new AppError(
            "Error fetching hotel bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count hotel bookings
   static async countHotelBookings(id, search, check_in, check_out, status) {
      let values = [id];
      let query = `SELECT
         COUNT(*) AS count 
         FROM bookings b 
         JOIN rooms r ON b.room_id = r.id 
         JOIN room_types rt ON r.room_type_id = rt.id 
         JOIN hotels h ON rt.hotel_id = h.id 
         JOIN users u ON b.user_id = u.id 
         WHERE h.id = ?`;
      if (search) {
         query += ` AND (b.booking_reference LIKE ? OR h.name LIKE ? OR r.room_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }
      if (check_in) {
         query += ` AND b.check_in = ?`;
         values.push(check_in);
      }
      if (check_out) {
         query += ` AND b.check_out = ?`;
         values.push(check_out);
      }
      if (status) {
         query += ` AND b.status = ?`;
         values.push(status);
      }
      try {
         const [rows] = await pool.execute(query, values);
         if (rows.length === 0) {
            return 0;
         }

         return rows[0].count;
      } catch (error) {
         throw new AppError(
            "Error counting hotel bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count all bookings
   static async countAllBookings(search, check_in, check_out, status) {
      let values = [];
      let query = `SELECT
         COUNT(*) AS count 
         FROM bookings b 
         JOIN rooms r ON b.room_id = r.id 
         JOIN room_types rt ON r.room_type_id = rt.id 
         JOIN hotels h ON rt.hotel_id = h.id 
         JOIN users u ON b.user_id = u.id 
         WHERE 1=1`;
      if (search) {
         query += ` AND (b.booking_reference LIKE ? OR h.name LIKE ? OR r.room_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }
      if (check_in) {
         query += ` AND b.check_in = ?`;
         values.push(check_in);
      }
      if (check_out) {
         query += ` AND b.check_out = ?`;
         values.push(check_out);
      }
      if (status) {
         query += ` AND b.status = ?`;
         values.push(status);
      }
      try {
         const [rows] = await pool.execute(query, values);
         if (rows.length === 0) {
            return 0;
         }

         return rows[0].count;
      } catch (error) {
         throw new AppError(
            "Error counting all bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all bookings
   static async getAllBookings(
      search,
      check_in,
      check_out,
      status,
      page,
      limit
   ) {
      let values = [];
      let query = `SELECT
         b.id,
         b.booking_reference,
         b.check_in,
         b.check_out,
         b.actual_check_out,
         b.status,
         b.total_amount,
         b.created_at,
         b.updated_at,
         r.id AS room_id,
         r.room_number,
         rt.id AS room_type_id,
         rt.name AS room_type_name,
         rt.price_per_night,
         h.id AS hotel_id,
         h.name AS hotel_name,
         h.location AS hotel_location,
         u.id AS user_id,
         u.first_name,
         u.last_name,
         u.phone_number,
         u.email,
         u.profile_pic_url
      FROM
         bookings b
      JOIN
         rooms r ON b.room_id = r.id
      JOIN
         room_types rt ON r.room_type_id = rt.id
      JOIN
         hotels h ON rt.hotel_id = h.id
      JOIN
         users u ON b.user_id = u.id
      WHERE
         1=1`;
      if (search) {
         query += ` AND (b.booking_reference LIKE ? OR h.name LIKE ? OR r.room_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ?)`;
         values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
         );
      }
      if (check_in) {
         query += ` AND b.check_in = ?`;
         values.push(check_in);
      }
      if (check_out) {
         query += ` AND b.check_out = ?`;
         values.push(check_out);
      }
      if (status) {
         query += ` AND b.status = ?`;
         values.push(status);
      }
      const offset = (page - 1) * limit;

      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
      try {
         const [rows] = await pool.execute(query, values);

         return rows;
      } catch (error) {
         throw new AppError(
            "Error getting bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add review to booking
   static async addReviewToBooking(
      hotel_id,
      booking_id,
      room_type_id,
      rating,
      comment
   ) {
      const query = `INSERT INTO reviews (hotel_id, booking_id, room_type_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)`;
      const values = [hotel_id, booking_id, room_type_id, rating, comment];

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { hotel_id, booking_id, room_type_id, rating, comment };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("booking_id")) {
               throw new AppError(
                  "Review already exists for this booking",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update booking status with booking reference
   static async updateBookingStatusWithBookingReference(reference, status) {
      const query = `UPDATE bookings SET status = ? WHERE booking_reference = ?`;
      const values = [status, reference];

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { reference, status };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count all bookings
   static async getAllBookingsCount(status) {
      let query = `SELECT COUNT(*) AS count FROM bookings`;
      let values = [];
      if (status) {
         query += ` WHERE status = ?`;
         values.push(status);
      }

      try {
         const [rows] = await pool.execute(query, values);
         if (rows.length === 0) {
            return 0;
         }

         return rows[0].count;
      } catch (error) {
         throw new AppError(
            "Error counting hotel bookings",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get total revenue
   static async getTotalRevenue() {
      const query = `SELECT SUM(total_amount) AS total_revenue FROM bookings WHERE status = 'paid'`;

      try {
         const [rows] = await pool.execute(query);
         if (rows.length === 0) {
            return 0;
         }

         return rows[0].total_revenue;
      } catch (error) {
         throw new AppError(
            "Error getting total revenue",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default BookingModel;
