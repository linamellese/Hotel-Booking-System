import pool from "../../../config/db.js";
import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";

class HotelModel {
   // Create a new hotel
   static async create(hotelData) {
      const {
         id,
         owner_id,
         name,
         location,
         latitude,
         longitude,
         contact_info,
         description,
         business_license,
         business_license_public_id,
         profile_pic_url,
         profile_pic_public_id,
      } = hotelData;
      const query = `INSERT INTO hotels (id, owner_id, name, location, latitude, longitude, contact_info, description, business_license, business_license_public_id, profile_pic_url, profile_pic_public_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
         id,
         owner_id,
         name,
         location,
         latitude,
         longitude,
         contact_info,
         description,
         business_license,
         business_license_public_id,
         profile_pic_url,
         profile_pic_public_id,
      ];

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, ...hotelData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("business_license")) {
               throw new AppError(
                  "Hotel already exists with this business license",
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

   // Approve hotel
   static async updateHotelStatus(id, status, rejection_reason) {
      let query;
      let values = [];
      if (!rejection_reason) {
         query = `UPDATE hotels SET status = ? WHERE id = ?`;
         values = [status, id];
      } else {
         query = `UPDATE hotels SET status = ?, rejection_reason = ? WHERE id = ?`;
         values = [status, rejection_reason, id];
      }

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, status, rejection_reason };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update hotel
   static async updateHotel(id, updateData) {
      const allowedFields = [
         "name",
         "location",
         "latitude",
         "longitude",
         "contact_info",
         "description",
         "profile_pic_url",
         "profile_pic_public_id",
         "business_license",
         "business_license_public_id",
      ];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE hotels SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            throw new AppError(
               "Hotel not found or no changes made",
               HTTP_STATUS.NOT_FOUND
            );
         }
         return { id, ...updateData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("business_license")) {
               throw new AppError(
                  "Another hotel already exists with this business license",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error during hotel update",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Create room type for a hotel
   static async createRoomType(roomTypeData) {
      const {
         id,
         hotel_id,
         name,
         description,
         price_per_night,
         main_image_url,
         main_image_public_id,
         bed_type,
         number_of_beds,
      } = roomTypeData;
      const query = `INSERT INTO room_types (id, hotel_id, name, description, price_per_night, main_image_url, main_image_public_id, bed_type, number_of_beds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
         id,
         hotel_id,
         name,
         description,
         price_per_night,
         main_image_url,
         main_image_public_id,
         bed_type,
         number_of_beds,
      ];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { ...roomTypeData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("name")) {
               throw new AppError(
                  "Room type already exists with this name for the hotel",
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

   // get room type by id with reviews
   static async getRoomTypeById(id) {
      const query = `
         SELECT
            rt.id,
            rt.hotel_id,
            rt.name,
            rt.description,
            rt.price_per_night,
            rt.main_image_url,
            rt.main_image_public_id,
            rt.status,
            rt.bed_type,
            rt.number_of_beds,
            rt.created_at,
            rt.updated_at,
            h.name AS hotel_name,
            h.location AS hotel_location,
            h.latitude,
            h.longitude,
            h.contact_info,
            h.description AS hotel_description,
            h.profile_pic_url,
            COUNT(r.id) AS reviews_count,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
         FROM room_types AS rt
         JOIN hotels AS h ON rt.hotel_id = h.id
         LEFT JOIN reviews AS r ON rt.id = r.room_type_id
         WHERE rt.id = ?
         GROUP BY rt.id`;
      try {
         const [rows] = await pool.execute(query, [id]);
         if (rows.length === 0) {
            return null;
         }

         return rows[0];
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // update room type
   static async updateRoomType(id, updateData) {
      const allowedFields = [
         "name",
         "description",
         "price_per_night",
         "main_image_url",
         "main_image_public_id",
         "bed_type",
         "number_of_beds",
         "status",
      ];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE room_types SET ${setClause.join(
         ", "
      )} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, ...updateData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("name")) {
               throw new AppError(
                  "Another room type already exists with this name for the hotel",
                  HTTP_STATUS.BAD_REQUEST
               );
            }
         }
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error during room type update",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Create Amenities
   static async createAmenity(amenityData) {
      const { id, name, icon_url, icon_public_id } = amenityData;

      const query = `INSERT INTO amenities (id, name, icon_url, icon_public_id)
        VALUES (?, ?, ?, ?)`;
      const values = [id, name, icon_url, icon_public_id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { ...amenityData };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("name")) {
               throw new AppError(
                  "Amenity already exists with this name",
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

   // get amenities
   static async getAmenities() {
      const query = `SELECT id, name, icon_url, icon_public_id
        FROM amenities`;
      try {
         const [rows] = await pool.execute(query);

         return rows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // create bed type
   static async createBedType(id, name) {
      const query = `INSERT INTO bed_types (id, name)
        VALUES (?, ?)`;
      const values = [id, name];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, name };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("name")) {
               throw new AppError(
                  "Bed type already exists with this name",
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

   // update bed type
   static async updateBedType(id, name) {
      const query = `UPDATE bed_types SET name = ? WHERE id = ?`;
      const values = [name, id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, name };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("name")) {
               throw new AppError(
                  "Bed type already exists with this name",
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

   // delete bed type
   static async deleteBedType(id) {
      const query = `DELETE FROM bed_types WHERE id = ?`;
      const values = [id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get bed types
   static async getBedTypes() {
      const query = `SELECT id, name
        FROM bed_types`;
      try {
         const [rows] = await pool.execute(query);

         return rows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // add room type amenities
   static async addRoomTypeAmenity(amenityData) {
      const { id, room_type_id, amenity_id } = amenityData;
      const query = `INSERT INTO room_type_amenities (id, room_type_id, amenity_id)
        VALUES (?, ?, ?)`;
      const values = [id, room_type_id, amenity_id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return amenityData;
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(
               "Room type amenities already added with this name for the room type",
               HTTP_STATUS.BAD_REQUEST
            );
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // add room type rooms
   static async addRoomTypeRoom(roomData) {
      const { id, room_type_id, room_number } = roomData;
      const query = `INSERT INTO rooms (id, room_type_id, room_number)
        VALUES (?, ?, ?)`;
      const values = [id, room_type_id, room_number];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return roomData;
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(
               "Room already added with this room number for the room type",
               HTTP_STATUS.BAD_REQUEST
            );
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get hotel by id
   static async getHotelById(hotelId) {
      const query = `
            SELECT
               h.id,
               h.name,
               h.location,
               h.latitude,
               h.longitude,
               h.contact_info,
               h.description,
               h.business_license,
               h.business_license_public_id,
               h.profile_pic_url,
               h.profile_pic_public_id,
               h.status,
               h.owner_id,
               u.first_name,
               u.last_name,
               u.email,
               u.phone_number,
               h.created_at,
               h.updated_at
            FROM hotels h
            JOIN users u ON h.owner_id = u.id
            WHERE h.id = ?`;
      try {
         const [hotelRows] = await pool.execute(query, [hotelId]);
         if (hotelRows.length === 0) {
            return null;
         }

         return hotelRows[0];
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get hotels room types
   static async getHotelRoomTypes(hotelId, status = null) {
      let query = `SELECT id, name, description, price_per_night, main_image_url, status
          FROM room_types
          WHERE hotel_id = ?`;
      let values = [hotelId];
      if (status !== null) {
         query += " AND status = ?";
         values.push(status);
      }
      try {
         // Fetch room types for the hotel
         const [roomTypeRows] = await pool.execute(query, values);

         return roomTypeRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get room types amenities
   static async getRoomTypeAmenities(roomTypeId) {
      const query = `SELECT a.id, a.name, a.icon_url
          FROM amenities a
          JOIN room_type_amenities rta ON a.id = rta.amenity_id
          WHERE rta.room_type_id = ?`;
      const values = [roomTypeId];
      try {
         const [amenityRows] = await pool.execute(query, values);

         return amenityRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get room types rooms
   static async getRoomTypeRooms(roomTypeId, status = null) {
      let query = `SELECT id, room_number, status
          FROM rooms
          WHERE room_type_id = ?`;
      let values = [roomTypeId];
      if (status !== null) {
         query += " AND status = ?";
         values.push(status);
      }
      try {
         const [roomRows] = await pool.execute(query, values);

         return roomRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add room type images
   static async addRoomTypeImage(id, roomTypeId, image_url, image_public_id) {
      const query = `INSERT INTO room_type_images (id, room_type_id, image_url, image_public_id)
        VALUES (?, ?, ?, ?)`;
      const values = [id, roomTypeId, image_url, image_public_id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id, roomTypeId, image_url, image_public_id };
      } catch (error) {
         if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(
               "Room type image already added with this image url for the room type",
               HTTP_STATUS.BAD_REQUEST
            );
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get room types images
   static async getRoomTypeImages(roomTypeId) {
      const query = `SELECT id, image_url, image_public_id
          FROM room_type_images
          WHERE room_type_id = ?`;
      const values = [roomTypeId];
      try {
         const [imageRows] = await pool.execute(query, values);

         return imageRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotels by owner id
   static async getHotelsByOwnerId(ownerId) {
      const query = `SELECT id, owner_id, name, location,latitude,longitude, contact_info, description, business_license, profile_pic_url
          FROM hotels
          WHERE owner_id = ?`;
      const values = [ownerId];
      try {
         const [hotelRows] = await pool.execute(query, values);
         if (hotelRows.length === 0) {
            return null; // No hotels found for the owner
         }

         return hotelRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update room type room status
   static async updateRoomTypeRoomStatus({ room_id, status }) {
      if (!["available", "booked", "maintenance"].includes(status)) {
         throw new AppError(
            "Invalid status. Status must be 'available', 'booked' or 'maintenance'.",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const query = `UPDATE rooms SET status = ? WHERE id = ?`;
      const values = [status, room_id];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { room_id, status };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete image from a room type
   static async deleteRoomTypeImage(imageId) {
      const query = `DELETE FROM room_type_images WHERE id = ?`;
      const values = [imageId];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { imageId };
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all hotels
   static async getAllHotels(search, status, page, limit) {
      const offset = (page - 1) * limit;

      // add hotel owner info
      let query = `
        SELECT h.id, h.owner_id, h.name, h.location, h.latitude, h.longitude, h.contact_info, h.description, h.business_license, h.profile_pic_url, h.status, h.created_at, o.first_name, o.last_name, o.email ,o.phone_number,o.profile_pic_url as owner_profile_pic_url
        FROM hotels h
        JOIN users o ON h.owner_id = o.id
    `;

      const values = [];

      if (search) {
         query += ` WHERE name LIKE ? OR location LIKE ? OR description LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?`;
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

      if (status) {
         query += ` WHERE h.status = ?`;
         values.push(status);
      }

      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      try {
         const [hotelRows] = await pool.execute(query, values);

         return hotelRows;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count all hotels with search
   static async countAllHotels(search, status) {
      let query = `SELECT COUNT(*) as count FROM hotels`;
      const values = [];

      if (search) {
         query += ` WHERE name LIKE ? OR location LIKE ? OR description LIKE ?`;
         values.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
         query += ` WHERE status = ?`;
         values.push(status);
      }

      try {
         const [hotelRows] = await pool.execute(query, values);

         if (hotelRows.length === 0) {
            return 0;
         }

         return hotelRows[0].count;
      } catch (error) {
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all room types with filter, pagination, search, and rating order
   static async getAllRoomTypes(
      search,
      location,
      minPrice,
      maxPrice,
      bedType,
      numberOfBeds,
      page = 1,
      limit = 10
   ) {
      page = Number(page) > 0 ? Number(page) : 1;
      limit = Number(limit) > 0 ? Number(limit) : 10;
      const offset = (page - 1) * limit;

      let query = `
      SELECT 
         rt.*,
         h.name AS hotel_name,
         h.location AS hotel_location,
         COUNT(r.id) AS reviews_count,
         ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
      FROM room_types rt
      JOIN hotels h ON rt.hotel_id = h.id
      LEFT JOIN reviews r ON rt.id = r.room_type_id
   `;

      const values = [];
      const conditions = [];

      conditions.push(`h.status = 'approved'`);
      conditions.push(`rt.status = 'active'`);

      if (search) {
         conditions.push(`(h.name LIKE ? OR h.location LIKE ?)`);
         values.push(`%${search}%`, `%${search}%`);
      }

      if (location) {
         conditions.push(`h.location LIKE ?`);
         values.push(`%${location}%`);
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
         conditions.push(`rt.price_per_night BETWEEN ? AND ?`);
         values.push(minPrice, maxPrice);
      } else if (minPrice !== undefined) {
         conditions.push(`rt.price_per_night >= ?`);
         values.push(minPrice);
      } else if (maxPrice !== undefined) {
         conditions.push(`rt.price_per_night <= ?`);
         values.push(maxPrice);
      }

      if (bedType) {
         conditions.push(`rt.bed_type = ?`);
         values.push(bedType);
      }

      if (numberOfBeds !== undefined) {
         conditions.push(`rt.number_of_beds = ?`);
         values.push(numberOfBeds);
      }

      query += `
      WHERE ${conditions.join(" AND ")}
      GROUP BY rt.id
      ORDER BY average_rating DESC
      LIMIT ${limit} OFFSET ${offset}
   `;

      try {
         const [rows] = await pool.execute(query, values);
         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count all room types with filter, pagination and search
   static async countAllRoomTypes(
      search,
      location,
      minPrice,
      maxPrice,
      bedType,
      numberOfBeds
   ) {
      let query = `
         SELECT COUNT(*) AS count
         FROM room_types rt
         JOIN hotels h ON rt.hotel_id = h.id
      `;
      const values = [];
      const conditions = [];

      if (search) {
         conditions.push(`(h.location LIKE ? OR h.name LIKE ?)`);
         values.push(`%${search}%`, `%${search}%`);
      }

      if (location) {
         conditions.push(`h.location LIKE ?`);
         values.push(`%${location}%`);
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
         conditions.push(`rt.price_per_night BETWEEN ? AND ?`);
         values.push(minPrice, maxPrice);
      } else if (minPrice !== undefined) {
         conditions.push(`rt.price_per_night >= ?`);
         values.push(minPrice);
      } else if (maxPrice !== undefined) {
         conditions.push(`rt.price_per_night <= ?`);
         values.push(maxPrice);
      }

      if (bedType) {
         conditions.push(`rt.bed_type = ?`);
         values.push(bedType);
      }

      if (numberOfBeds !== undefined) {
         conditions.push(`rt.number_of_beds = ?`);
         values.push(numberOfBeds);
      }

      if (conditions.length > 0) {
         query += ` WHERE ` + conditions.join(` AND `);
      }

      query += ` AND rt.status = 'active'`;

      try {
         const [roomTypeRows] = await pool.execute(query, values);

         if (roomTypeRows.length === 0) {
            return 0;
         }

         return roomTypeRows[0].count;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update amenities
   static async updateAmenity(id, updateData) {
      const allowedFields = ["name", "icon_url", "icon_public_id"];

      const setClause = [];
      const values = [];

      allowedFields.forEach((field) => {
         if (updateData[field] !== undefined) {
            setClause.push(`${field} = ?`);
            values.push(updateData[field]);
         }
      });

      if (setClause.length === 0) {
         throw new AppError(
            "No valid fields to update",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      setClause.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE amenities SET ${setClause.join(", ")} WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return {
            id,
            ...updateData,
         };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to update amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete amenities
   static async removeAmenity(id) {
      const query = `DELETE FROM amenities WHERE id = ?`;

      try {
         const [result] = await pool.execute(query, [id]);
         if (result.affectedRows === 0) {
            return null;
         }

         return { id };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }

         throw new AppError(
            "Failed to delete amenities. Please try again.",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get room price
   static async getRoomPrice(roomId) {
      // join with rooms table to get room_type_id
      const query = `
         SELECT rt.price_per_night
         FROM room_types rt
         JOIN rooms r ON rt.id = r.room_type_id
         WHERE r.id = ?`;
      try {
         const [rows] = await pool.execute(query, [roomId]);
         if (rows.length === 0) {
            throw new AppError("Room not found", HTTP_STATUS.NOT_FOUND);
         }
         return rows[0].price_per_night;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get available rooms for a room type
   static async getAvailableRooms(roomTypeId, checkIn, checkOut) {
      const query = `
         SELECT r.id, r.room_number, r.floor
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.id
         WHERE rt.id = ?
         AND r.status = 'available'
         AND NOT EXISTS (
            SELECT 1
            FROM bookings b
            WHERE b.room_id = r.id
            AND (
               ? < b.check_out
               AND ? > b.check_in
            )
         );
      `;
      try {
         const [rows] = await pool.execute(query, [
            roomTypeId,
            checkIn,
            checkOut,
         ]);
         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Toggle room type in wishlist add or remove
   static async toggleWishlist(roomTypeId, userId) {
      const addQuery = `
         INSERT INTO wishlists (room_type_id, user_id)
         VALUES (?, ?)
      `;
      const removeQuery = `
         DELETE FROM wishlists
         WHERE room_type_id = ?
         AND user_id = ?
      `;
      try {
         const [result] = await pool.execute(removeQuery, [roomTypeId, userId]);
         if (result.affectedRows > 0) {
            return false;
         }
         const [result2] = await pool.execute(addQuery, [roomTypeId, userId]);
         if (result2.affectedRows > 0) {
            return true;
         }
         throw new AppError(
            "Failed to toggle wishlist. Please try again.",
            HTTP_STATUS.BAD_REQUEST
         );
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Check if room type is in wishlist
   static async checkIfRoomTypeInWishlist(roomTypeId, userId) {
      const query = `
         SELECT 1
         FROM wishlists
         WHERE room_type_id = ?
         AND user_id = ?
      `;
      try {
         const [rows] = await pool.execute(query, [roomTypeId, userId]);
         return rows.length > 0;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get reviews for a room type
   static async getRoomTypeReviews(roomTypeId, page, limit, sort) {
      const SORT_MAP = {
         relevant: "r.rating DESC, r.created_at DESC",
         newest: "r.created_at DESC",
         oldest: "r.created_at ASC",
         highest: "r.rating DESC",
         lowest: "r.rating ASC",
      };
      const orderBy = SORT_MAP[sort] || SORT_MAP.relevant;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const offset = (parsedPage - 1) * parsedLimit;

      const query = `
         SELECT r.id, r.rating, r.comment, u.id as user_id, u.first_name, u.last_name, u.profile_pic_url, r.created_at, r.updated_at
         FROM reviews r
         JOIN room_types rt ON r.room_type_id = rt.id
         JOIN bookings b ON r.booking_id = b.id
         JOIN users u ON b.user_id = u.id
         WHERE rt.id = ?
         ORDER BY ${orderBy}
         LIMIT ${parsedLimit} OFFSET ${offset}
      `;
      try {
         const [rows] = await pool.execute(query, [roomTypeId]);

         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Count reviews for a room type
   static async countRoomTypeReviews(roomTypeId) {
      const query = `
         SELECT COUNT(*) as count
         FROM reviews r
         JOIN room_types rt ON r.room_type_id = rt.id
         WHERE rt.id = ?
      `;
      try {
         const [rows] = await pool.execute(query, [roomTypeId]);

         return rows[0].count;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user wishlist
   static async getUserWishlist(userId) {
      const query = `
         SELECT 
            rt.*,
            h.name AS hotel_name,
            h.location AS hotel_location,
            COUNT(r.id) AS reviews_count,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
         FROM room_types rt
         JOIN hotels h 
            ON rt.hotel_id = h.id
         JOIN wishlists w 
            ON w.room_type_id = rt.id
         LEFT JOIN reviews r 
            ON rt.id = r.room_type_id
         WHERE w.user_id = ?
         GROUP BY rt.id, h.id
         ORDER BY rt.created_at DESC;
      `;
      try {
         const [rows] = await pool.execute(query, [userId]);

         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get user hotels
   static async getMyHotels(userId) {
      const query = `
         SELECT 
            h.*,
            hd.bank_name,
            hd.account_number,
            hd.account_holder_name,
            COUNT(rt.id) AS room_types_count,
            COUNT(r.id) AS reviews_count,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
         FROM hotels h
         LEFT JOIN hotel_bank_details hd ON h.id = hd.hotel_id
         LEFT JOIN room_types rt ON h.id = rt.hotel_id
         LEFT JOIN reviews r ON rt.id = r.room_type_id
         WHERE h.owner_id = ?
         GROUP BY h.id
         ORDER BY h.created_at DESC;
      `;
      try {
         const [rows] = await pool.execute(query, [userId]);
         if (rows.length === 0) {
            return [];
         }
         return rows[0];
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Add bank details
   static async addBankDetails(
      hotelId,
      bankName,
      accountNumber,
      accountHolderName
   ) {
      const query = `INSERT INTO hotel_bank_details (hotel_id, bank_name, account_number, account_holder_name)
         VALUES (?, ?, ?, ?)`;
      const values = [hotelId, bankName, accountNumber, accountHolderName];
      try {
         const [result] = await pool.execute(query, values);
         if (result.affectedRows === 0) {
            return null;
         }

         return { hotelId, bankName, accountNumber, accountHolderName };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all room types by hotel id
   static async getAllRoomTypesByHotelId(hotelId) {
      const query = `
         SELECT 
            rt.*,
            COUNT(r.id) AS reviews_count,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating
         FROM room_types rt
         LEFT JOIN reviews r ON rt.id = r.room_type_id
         WHERE rt.hotel_id = ?
         GROUP BY rt.id
         ORDER BY rt.created_at DESC;
      `;
      try {
         const [rows] = await pool.execute(query, [hotelId]);

         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete room type amenities
   static async deleteRoomTypeAmenities(roomTypeId, amenityId) {
      const query = `DELETE FROM room_type_amenities WHERE room_type_id = ? AND amenity_id = ?`;
      try {
         const [result] = await pool.execute(query, [roomTypeId, amenityId]);
         if (result.affectedRows === 0) {
            return null;
         }

         return { roomTypeId, amenityId };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Delete room type room
   static async deleteRoomTypeRoom(room_type_id, room_id) {
      const query = `DELETE FROM rooms WHERE room_type_id = ? AND id = ?`;
      try {
         const [result] = await pool.execute(query, [room_type_id, room_id]);
         if (result.affectedRows === 0) {
            return null;
         }

         return { room_type_id, room_id };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Update bank details
   static async updateBankDetails(
      hotelId,
      bankName,
      accountNumber,
      accountHolderName
   ) {
      const query = `UPDATE hotel_bank_details SET bank_name = ?, account_number = ?, account_holder_name = ? WHERE hotel_id = ?`;
      try {
         const [result] = await pool.execute(query, [
            bankName,
            accountNumber,
            accountHolderName,
            hotelId,
         ]);
         if (result.affectedRows === 0) {
            return null;
         }

         return { hotelId, bankName, accountNumber, accountHolderName };
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel analytics
   static async getHotelAnalytics(hotelId) {
      const query = `WITH
            current_bookings AS (
               SELECT
                  COUNT(b.id) AS total_bookings,
                  COALESCE(SUM(b.total_amount), 0) AS total_revenue
               FROM room_types rt
               JOIN rooms r ON r.room_type_id = rt.id
               JOIN bookings b ON b.room_id = r.id
               WHERE rt.hotel_id = ?
               AND b.status = 'paid'
               AND b.created_at >= CURDATE() - INTERVAL 30 DAY
            ),

            current_ratings AS (
               SELECT
                  ROUND(AVG(rv.rating), 1) AS avg_rating
               FROM reviews rv
               WHERE rv.hotel_id = ?
               AND rv.created_at >= CURDATE() - INTERVAL 30 DAY
            ),

            previous_bookings AS (
               SELECT
                  COUNT(b.id) AS previous_total_bookings,
                  COALESCE(SUM(b.total_amount), 0) AS previous_revenue
               FROM room_types rt
               JOIN rooms r ON r.room_type_id = rt.id
               JOIN bookings b ON b.room_id = r.id
               WHERE rt.hotel_id = ?
               AND b.status = 'paid'
               AND b.created_at >= CURDATE() - INTERVAL 60 DAY
               AND b.created_at <  CURDATE() - INTERVAL 30 DAY
            ),

            previous_ratings AS (
               SELECT
                  ROUND(AVG(rv.rating), 1) AS previous_avg_rating
               FROM reviews rv
               WHERE rv.hotel_id = ?
               AND rv.created_at >= CURDATE() - INTERVAL 60 DAY
               AND rv.created_at <  CURDATE() - INTERVAL 30 DAY
            )

            SELECT
               h.id AS hotel_id,
               h.name AS hotel_name,

               cb.total_bookings,
               cb.total_revenue,

               /* Booking % change */
               CASE
                  WHEN pb.previous_total_bookings = 0 THEN 0
                  ELSE ROUND(
                     ((cb.total_bookings - pb.previous_total_bookings) / pb.previous_total_bookings) * 100,
                     2
                  )
               END AS booking_change_percent,

               /* Revenue % change */
               CASE
                  WHEN pb.previous_revenue = 0 THEN 0
                  ELSE ROUND(
                     ((cb.total_revenue - pb.previous_revenue) / pb.previous_revenue) * 100,
                     2
                  )
               END AS revenue_change_percent,

               COALESCE(cr.avg_rating, 0) AS avg_rating,

               /* Rating % change */
               CASE
                  WHEN pr.previous_avg_rating IS NULL
                     OR pr.previous_avg_rating = 0
                     OR cr.avg_rating IS NULL
                  THEN 0
                  ELSE ROUND(
                     ((cr.avg_rating - pr.previous_avg_rating) / pr.previous_avg_rating) * 100,
                     2
                  )
               END AS rating_change_percent

            FROM hotels h
            CROSS JOIN current_bookings cb
            CROSS JOIN previous_bookings pb
            CROSS JOIN current_ratings cr
            CROSS JOIN previous_ratings pr
            WHERE h.id = ?;
         `;

      try {
         const [rows] = await pool.execute(query, [
            hotelId,
            hotelId,
            hotelId,
            hotelId,
            hotelId,
         ]);
         if (rows.length === 0) {
            return null;
         }

         return rows[0];
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get all hotels count
   static async getAllHotelsCount(status) {
      let query = `SELECT COUNT(*) AS count FROM hotels`;
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
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // get room type image by image id
   static async getRoomTypeImageById(imageId) {
      const query = `SELECT * FROM room_type_images WHERE id = ?`;
      try {
         const [rows] = await pool.execute(query, [imageId]);
         if (rows.length === 0) {
            return null;
         }

         return rows[0];
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }

   // Get hotel location for search suggestions
   static async getHotelsLocation(search) {
      const query = `SELECT id,location FROM hotels WHERE status = 'approved' AND location LIKE ?`;
      try {
         const [rows] = await pool.execute(query, [`%${search}%`]);

         return rows;
      } catch (error) {
         if (error instanceof AppError) {
            throw error;
         }
         throw new AppError(
            "Internal server error",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
         );
      }
   }
}

export default HotelModel;
