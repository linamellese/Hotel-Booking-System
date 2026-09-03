# Engda Marefya (Backend) - Hotel Booking Distributed System

**Engda Marefya** is a robust and distributed Hotel Room Reservation System backend API built with **Node.js** and **Express**. It provides a comprehensive set of features for managing users, hotels, bookings, payments, and reviews, designed to serve the Ethiopian hospitality market.

## 🚀 Features

### User Management

-  **Role-Based Access Control (RBAC)**: Support for Customers, Hotel Owners, Admins, and Super Admins.
-  **Secure Authentication**: JWT-based authentication with refresh token rotation.
-  **Profile Management**: User profiles with profile picture upload.
-  **Wishlist**: Users can save their favorite room types.

### Hotel & Room Management

-  **Hotel Registration**: Hotel owners can register their businesses (pending admin approval).
-  **Room Management**: Manage room types, amenities, images, and individual room units.
-  **Availability**: Real-time room status tracking (Available, Booked, Maintenance).
-  **Location Services**: Geolocation support for hotels.

### Booking & Reservations

-  **Booking Workflow**: Seamless booking process with check-in/check-out dates.
-  **Status Tracking**: Pending, Paid status management.
-  **Duplicate Prevention**: Logic to prevent double bookings.

### Payments & Financials

-  **Chapa Integration**: Secure payment processing using Chapa (Ethiopian payment gateway).
-  **Transaction History**: Comprehensive logs of all payments and transactions.

### Notifications & Engagement

-  **Email Notifications**: Automated emails for verification, password resets, booking confirmations, and status updates.
-  **Reviews & Ratings**: Guests can leave reviews for hotels they've booked.

### System Architecture

-  **Distributed Database Support**: Configurable to work with multiple database hosts for high availability.
-  **Media Management**: Cloudinary integration for scalable image storage.
-  **Security**: Rate limiting, secure headers, and input validation.

## 🛠️ Tech Stack

-  **Runtime**: [Node.js](https://nodejs.org/)
-  **Framework**: [Express.js](https://expressjs.com/)
-  **Database**: [MySQL](https://www.mysql.com/) (using `mysql2`)
-  **Payment Gateway**: [Chapa](https://chapa.co/)
-  **Image Hosting**: [Cloudinary](https://cloudinary.com/)
-  **Email Service**: [Nodemailer](https://nodemailer.com/) (SMTP)
-  **Logging**: Morgan, Winston

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

-  **Node.js** (v14 or higher)
-  **MySQL** installed and running
-  **Chapa Account** (for payments)
-  **Cloudinary Account** (for image storage)
-  **SMTP Server** (e.g., Gmail) for emails

## ⚙️ Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/codermiki/engda-marefya-backend.git
   cd engda-marefya-backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and configure the following variables:

   ```env
   # Server Configuration
   PORT=9000
   NODE_ENV=development

   # Database Configuration (Supports multiple hosts for distributed setup)
   DB_HOSTS=localhost,192.168.1.10
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=engda_marefya_db

   # JWT Authentication
   JWT_SECRET=your_jwt_strong_secret
   JWT_EXPIRES_IN=30d
   JWT_ISSUER=engda-marefya-api
   JWT_AUDIENCE=engda-marefya-client

   # Chapa Payment Gateway
   CHAPA_SECRET_KEY=your_chapa_secret_key

   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Service (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   EMAIL_FROM=noreply@engda-marefya.com

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   The system includes an installation endpoint to set up the database schema create super admin at system installation.

   Start the server first:

   ```bash
   npm run dev
   ```

   Then trigger the installation via API (Postman/Curl):

   ```bash
   POST http://localhost:9000/api/v1/install
   Content-Type: application/json
   Request Body:
   {
      "first_name":"Super",
      "last_name":"Admin",
      "email":"superadmin@gmail.com",
      "password":"StrongPassword@2025!"
   }
   ```

   _Note: This will create the necessary tables and add super admin at system installation._

## 🚀 Running the Server

To run the application in development mode with live reloading:

```bash
npm run dev
```

To run in production mode:

```bash
npm start
```

## 📚 API Documentation

Base URL: `/api/v1`

### Key Endpoints

-  **Auth**: `/auth`
-  **Users**: `/users`
-  **Hotels**: `/hotels`
-  **Bookings**: `/bookings`
-  **Payments**: `/payments`
-  **Admin**: `/admin`

### View API documentation at Postman

-  [https://documenter.getpostman.com/view/44435746/2sB3dMyBNF](https://documenter.getpostman.com/view/44435746/2sB3dMyBNF)

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
