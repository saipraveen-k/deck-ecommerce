# DECK. E-Commerce

A premium, scalable clothing brand e-commerce platform built with **Next.js**, **Express.js**, and **PostgreSQL**.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons
- **Backend**: Express.js + Prisma ORM + Socket.io
- **Database**: PostgreSQL
- **Authentication**: Custom JWT (HTTP-only cookies) + Two-Factor Authentication (2FA) for Admins
- **Payments**: Razorpay Integration
- **Real-time**: Socket.io for instant stock updates
- **Security**:
    - **Admin 2FA**: Google Authenticator (TOTP)
    - **Hidden Admin Route**: Access via `CTRL + ALT + A` or `/deck-control`
    - **Password Hashing**: Bcrypt

## 🚀 Features

### Customer
- **Authentication**: Register/Login, Profile Management.
- **Shopping**: Product browsing with filters, Variant selection (Size/Color).
- **Cart**: Add/Remove items, Update quantity.
- **Checkout**: Razorpay payment integration (Test Mode).
- **Orders**: Order history tracking.

### Admin
- **Hidden Access**: Secret key combination (`CTRL + ALT + A`) or hidden route.
- **Security**: 2FA protected dashboard.
- **Dashboard**: Sales overview, Order stats.
- **Inventory**: Real-time stock management (updates frontend instantly).
- **Product Management**: Create products, manage variants.

## �️ Project Structure

```bash
deck-ecommerce/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   │   ├── src/app/       # Pages (Home, Product, Cart, Admin)
│   │   └── src/store/     # Zustand State (Auth)
│   └── backend/           # Express + Prisma
│       ├── src/controllers/
│       ├── src/routes/
│       └── prisma/        # Database Schema
├── package.json
└── README.md
```

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL Database
- Razorpay Test Credentials (Optional for payment testing)

### 2. Setup Backend

```bash
cd apps/backend

# Install Dependencies
npm install

# Configure Environment
cp .env.example .env
# Update .env with your PostgreSQL DATABASE_URL

# Run Migrations & Seed
npx prisma migrate dev --name init

# Start Server
npm start
```

### 3. Setup Frontend

```bash
cd apps/frontend

# Install Dependencies
npm install

# Start Dev Server
npm run dev
```

### 4. Admin Access
- Go to `http://localhost:3000/deck-login`
- Press `CTRL + ALT + A` OR enter password `#deckmaster`
- You will be redirected to `/deck-control`
- **Initial Setup**: Create a user with `role: 'ADMIN'` in database manually (or use seed script if available)
- Login -> Setup 2FA -> Access Dashboard

## � Environment Variables

**Backend (`apps/backend/.env`)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/deck_db?schema=public"
JWT_SECRET="your_jwt_secret"
ADMIN_JWT_SECRET="your_admin_secret"
FRONTEND_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_rzp_secret"
```

**Frontend (`apps/frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```
