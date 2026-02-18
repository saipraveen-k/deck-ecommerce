# ⚡ Quick Start Guide - DECK.

Follow these steps to get the system running locally.

## 1. Database Setup
Ensure **PostgreSQL** is running. Create a database name `deck_ecommerce`.

## 2. Backend Setup (`apps/backend`)

1. Navigate to backend:
   ```bash
   cd apps/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```bash
   # Create .env file
   DATABASE_URL="postgresql://postgres:password@localhost:5432/deck_ecommerce"
   JWT_SECRET="secret"
   ADMIN_JWT_SECRET="admin_secret"
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="rzp_secret"
   ```
4. Initialize Database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Start Server:
   ```bash
   npm start
   # API running at http://localhost:4000
   ```

## 3. Frontend Setup (`apps/frontend`)

1. Navigate to frontend:
   ```bash
   cd apps/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
   ```
4. Start App:
   ```bash
   npm run dev
   # App running at http://localhost:3000
   ```

## 4. How to Login as Admin

Since the Admin login is hidden:
1. Go to Login Page (`/deck-login`).
2. Press `CTRL + ALT + A` on your keyboard.
3. You will be redirected to `/deck-control`.
4. (First time) You need an admin user in DB. You can manually update a customer user to 'ADMIN' role in database.
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
5. Login with email/password.
6. Scan QR Code with Google Authenticator Application.
7. Enter OTP to access Dashboard.
