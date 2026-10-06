# SelloraAI

SelloraAI is a full-stack digital marketplace platform where partners can create profiles, list digital products, receive payments, and track performance through AI-powered analytics. The platform includes a customer-facing storefront, partner dashboard, admin controls, and secure payment workflows.

## Overview

This project combines a React frontend with a TypeScript-based microservice backend. It is designed for a marketplace model where:

- Partners sell digital products or downloadable assets
- Admins manage partner onboarding and payouts
- Customers browse public partner profiles and product pages
- AI-generated insights help partners understand sales and performance trends

## Core Features

- Google authentication via Firebase
- Role-based access for admin and partner users
- Partner profile creation and public profile pages
- Product publishing and product management dashboard
- Public product discovery and storefront experience
- Secure payment processing with Razorpay
- Payout management and payment history
- AI analytics for revenue, sales trends, and product performance
- Redis-powered caching and request throttling
- MongoDB-backed services for users, products, and orders

## Tech Stack

### Frontend
- React + Vite
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Firebase client SDK
- Razorpay frontend integration
- Recharts for analytics visualization

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- Redis for caching and rate limiting
- Firebase Admin SDK
- Razorpay API integration
- Nodemailer for email notifications
- Groq + LangChain AI analytics pipeline

## Architecture

The project follows a lightweight microservice structure:

- `frontend/` — customer, partner, and admin web app
- `backend/gateway/` — API gateway and route orchestration
- `backend/services/auth/` — authentication, user/partner data, admin logic
- `backend/services/product/` — product catalog and public listing APIs
- `backend/services/order/` — payment flow and partner payout processing
- `backend/services/ai/` — AI analytics and insight generation
- `backend/shared/redis/` — shared Redis client configuration

## Project Structure

```text
SelloraAI/
├── backend/
│   ├── docker-compose.yml
│   ├── package.json
│   ├── gateway/
│   │   ├── .env
│   │   ├── package.json
│   │   └── src/
│   ├── services/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── order/
│   │   └── product/
│   └── shared/
│       └── redis/
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
├── README.md
└── .gitignore
```

## Prerequisites

Before running this project locally, make sure you have:

- Node.js 18+
- npm or pnpm
- MongoDB instance
- Redis server
- Firebase project configuration
- Razorpay account and keys
- Groq API key
- Docker (optional, for Redis)

## Environment Variables

### Gateway
Create `backend/gateway/.env`:

```env
PORT=8000
FRONTEND_URL="http://localhost:5173"
AUTH_SERVICE_URL="http://localhost:8001"
PRODUCT_SERVICE_URL="http://localhost:8002"
ORDER_SERVICE_URL="http://localhost:8003"
AI_SERVICE_URL="http://localhost:8004"
REDIS_URL="redis://localhost:6379"
```

### Auth Service
Create `backend/services/auth/.env`:

```env
PORT=8001
MONGODB_URL="your_mongodb_connection_string"
REDIS_URL="redis://localhost:6379"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### Product Service
Create `backend/services/product/.env`:

```env
PORT=8002
MONGODB_URL="your_mongodb_connection_string"
REDIS_URL="redis://localhost:6379"
```

### Order Service
Create `backend/services/order/.env`:

```env
PORT=8003
MONGODB_URL="your_mongodb_connection_string"
REDIS_URL="redis://localhost:6379"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
EMAIL_USER="your_email"
EMAIL_PASSWORD="your_email_app_password"
```

### AI Service
Create `backend/services/ai/.env`:

```env
PORT=8004
REDIS_URL="redis://localhost:6379"
GROQ_API_KEY="your_groq_api_key"
```

## Local Development Setup

### 1. Start Redis

Using Docker:

```bash
cd backend
docker compose up -d
```

This starts the Redis container defined in `backend/docker-compose.yml`.

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Each backend service runs independently, so install dependencies in each package:

```bash
cd backend/gateway
npm install

cd ../services/auth
npm install

cd ../product
npm install

cd ../order
npm install

cd ../ai
npm install
```

### 4. Run the services

Open separate terminals and run:

```bash
cd backend/gateway
npm run dev
```

```bash
cd backend/services/auth
npm run dev
```

```bash
cd backend/services/product
npm run dev
```

```bash
cd backend/services/order
npm run dev
```

```bash
cd backend/services/ai
npm run dev
```

```bash
cd frontend
npm run dev
```

The frontend should run on:

- http://localhost:5173

The backend gateway should run on:

- http://localhost:8000

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend services

```bash
cd backend/gateway
npm run build

cd ../services/auth
npm run build

cd ../product
npm run build

cd ../order
npm run build

cd ../ai
npm run build
```

## User Roles and Experience

### Customer
- Browse public partner profiles
- View partner products
- Purchase digital products through the marketplace

### Partner
- Sign in with Firebase
- Complete profile setup
- Add and manage products
- View sales performance and payouts
- Access AI-powered business insights

### Admin
- Manage partner activation and account status
- Review partner payments and payout history
- Monitor overall marketplace activity

## AI Analytics

The AI layer analyzes partner performance using product-level data and recent order activity. It provides:

- Total revenue and sales summary
- Product performance charts
- Sales and revenue trends over time
- AI-generated insights and recommendations
- Top-performing product suggestions
- Growth opportunities for improving conversions

## Notes

- The project is intended as a marketplace product and uses a modular service architecture for scalability.
- Sensitive credentials must be stored in `.env` files and should not be committed to version control.
- Redis is used for request caching, rate limiting, and performance improvements.

## License

This project is currently unlicensed. Add your preferred license if you plan to publish it publicly.

## Contributing

Contributions are welcome. Feel free to fork the project, open issues, and submit pull requests.

## Contact

For questions or collaboration opportunities, reach out through the repository or project maintainer contact information.
