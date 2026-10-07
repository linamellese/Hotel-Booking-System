/**
 *
 * Database Schema
 *
 */

// Users Table
const usersTableQuery = `CREATE TABLE IF NOT EXISTS users (
          id CHAR(24) PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone_number VARCHAR(20),
          password_hash VARCHAR(255) NOT NULL,
          profile_pic_url VARCHAR(255),
          profile_pic_public_id VARCHAR(255),
          role ENUM('customer','hotel_owner','admin','super_admin') DEFAULT 'customer',
          status ENUM('active','inactive','banned') DEFAULT 'active',
          is_email_verified TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (email),
          UNIQUE (phone_number)
      )`;

// Hotels Table
const hotelsTableQuery = `CREATE TABLE IF NOT EXISTS hotels (
          id CHAR(24) PRIMARY KEY,
          owner_id CHAR(24) NOT NULL,
          name VARCHAR(150) NOT NULL,
          location VARCHAR(255) NOT NULL,
          contact_info VARCHAR(100),
          description TEXT,
          business_license VARCHAR(255) NOT NULL,
          business_license_public_id VARCHAR(255),
          profile_pic_url VARCHAR(255),
          profile_pic_public_id VARCHAR(255),
          status ENUM('pending','approved','rejected') DEFAULT 'pending',
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (business_license),
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )`;

// Room Types Table
const roomTypesTableQuery = `CREATE TABLE IF NOT EXISTS room_types (
          id CHAR(24) PRIMARY KEY,
          hotel_id CHAR(24) NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          bed_type VARCHAR(50) NOT NULL,
          number_of_beds INT NOT NULL,
          price_per_night DECIMAL(10,2) NOT NULL,
          main_image_url VARCHAR(255),
          main_image_public_id VARCHAR(255),
          status ENUM('active','inactive') DEFAULT 'inactive',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (hotel_id, name),
          FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )`;

// Rooms Table
const roomsTableQuery = `CREATE TABLE IF NOT EXISTS rooms (
          id CHAR(24) PRIMARY KEY,
          room_type_id CHAR(24) NOT NULL,
          room_number VARCHAR(50) NOT NULL,
          floor VARCHAR(100),
          status ENUM('available','booked','maintenance') DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (room_type_id, room_number),
          FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
      )`;

// Bookings Table
const bookingsTableQuery = `CREATE TABLE IF NOT EXISTS bookings (
          id CHAR(24) PRIMARY KEY,
          room_id CHAR(24) NOT NULL,
          user_id CHAR(24) NOT NULL,
          check_in DATE NOT NULL,
          check_out DATE NOT NULL,
          actual_check_out DATE,
          total_amount DECIMAL(10,2) NOT NULL,
          status ENUM('pending','paid','cancelled') DEFAULT 'pending',
          booking_reference VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (booking_reference),
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`;

// Payments Table
const paymentsTableQuery = `CREATE TABLE IF NOT EXISTS payments (
          id CHAR(24) PRIMARY KEY,
          booking_id CHAR(24) NOT NULL,
          currency VARCHAR(10) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          platform_fee DECIMAL(10,2),
          hotel_fee DECIMAL(10,2),
          payment_gateway ENUM('chapa','other') DEFAULT 'chapa',
          payment_method VARCHAR(50),
          status ENUM('pending','success','refunded','reversed','failed','cancelled') DEFAULT 'pending',
          transaction_reference VARCHAR(50),
          checkout_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (booking_id),
          UNIQUE (transaction_reference),
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )`;

// Amenities Table
const amenitiesTableQuery = `CREATE TABLE IF NOT EXISTS amenities (
          id CHAR(24) PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          icon_url TEXT NOT NULL,
          icon_public_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`;

// Room Types Amenities Table
const roomTypesAmenitiesTableQuery = `CREATE TABLE IF NOT EXISTS room_type_amenities (
          id CHAR(24) PRIMARY KEY,
          room_type_id CHAR(24) NOT NULL,
          amenity_id CHAR(24) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE (room_type_id, amenity_id),
          FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
          FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
      )`;

// Room Type Images Table
const roomTypeImagesTableQuery = `CREATE TABLE IF NOT EXISTS room_type_images (
          id CHAR(24) PRIMARY KEY,
          room_type_id CHAR(24) NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          image_public_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
      )`;

// Reviews Table
const reviewsTableQuery = `CREATE TABLE IF NOT EXISTS reviews (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hotel_id CHAR(24) NOT NULL,
          booking_id CHAR(24) NOT NULL UNIQUE,
          room_type_id CHAR(24) NOT NULL,
          rating INT,
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
      )`;

// Email Logs Table
const emailLogsTableQuery = `CREATE TABLE IF NOT EXISTS email_logs (
          id CHAR(24) PRIMARY KEY,
          to_email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          email_type ENUM(
            'email_verification',
            'password_reset',
            'password_changed',
            'booking_confirmation',
            'hotel_approved',
            'hotel_rejected',
            'other'
          ) NOT NULL,
          status ENUM('pending','sent','failed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`;

// Refresh Tokens Table
const refreshTokensTableQuery = `CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id CHAR(24) NOT NULL,
          refresh_token TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`;

// Wishlists Table
const wishlistsTableQuery = `CREATE TABLE IF NOT EXISTS wishlists (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id CHAR(24) NOT NULL,
          room_type_id CHAR(24) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, room_type_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
      )`;

// Bed Types Table
const bedTypesTableQuery = `CREATE TABLE IF NOT EXISTS bed_types (
          id CHAR(24) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`;

// Hotel Bank Details Table
const hotelBankDetailsTableQuery = `CREATE TABLE IF NOT EXISTS hotel_bank_details (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hotel_id CHAR(24) NOT NULL UNIQUE,
          bank_name VARCHAR(100) NOT NULL,
          account_number VARCHAR(50) NOT NULL,
          account_holder_name VARCHAR(150) NOT NULL,
          swift_code VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )`;

// Enable Event Scheduler
const enableEventSchedulerQuery = `SET GLOBAL event_scheduler = ON;`;

// Drop Delete Expired Bookings Event
const dropDeleteExpiredBookingsEventQuery = `DROP EVENT IF EXISTS delete_expired_bookings;`;

// Create Delete Expired Bookings Event
const createDeleteExpiredBookingsEventQuery = `CREATE EVENT delete_expired_bookings
          ON SCHEDULE EVERY 1 MINUTE
          STARTS CURRENT_TIMESTAMP
          ON COMPLETION PRESERVE
          ENABLE
          DO
          DELETE FROM bookings
          WHERE status = 'pending'
            AND created_at < NOW() - INTERVAL 1 HOUR;
       `;

// Export the queries
const engdaMarefyaDB = {
   usersTableQuery,
   hotelsTableQuery,
   roomTypesTableQuery,
   roomsTableQuery,
   bookingsTableQuery,
   paymentsTableQuery,
   amenitiesTableQuery,
   roomTypesAmenitiesTableQuery,
   roomTypeImagesTableQuery,
   reviewsTableQuery,
   emailLogsTableQuery,
   refreshTokensTableQuery,
   wishlistsTableQuery,
   bedTypesTableQuery,
   hotelBankDetailsTableQuery,
   enableEventSchedulerQuery,
   dropDeleteExpiredBookingsEventQuery,
   createDeleteExpiredBookingsEventQuery,
};

export default engdaMarefyaDB;
