# Engda Marefya Hotel Booking System

Engda Marefya is a hotel room reservation system with a Node.js and Express backend API and a React frontend.

## Project Structure

- `backend/` - Express API, authentication, bookings, payments, reviews, and MySQL integration.
- `frontend/` - React and Vite web application.

## Requirements

- Node.js 14 or newer
- MySQL
- Backend service credentials configured in `backend/.env`

## Backend Setup

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set the database, JWT, payment, email, and media service values.

Start the backend in development mode:

```bash
npm run dev
```

The API runs on `http://localhost:9000` by default.

## Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will print the local frontend URL in the terminal.

For a production build:

```bash
npm run build
```

## Main Technologies

- Node.js, Express, and MySQL
- React and Vite
- JWT authentication
- Chapa payments
- Cloudinary media storage
