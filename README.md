Inventory Reservation System

A simple inventory reservation system built with Next.js and Supabase that allows users to reserve products from different warehouse zones. The application supports stock reservations, reservation expiry handling, and inventory management across multiple warehouses.

Features
View products across multiple warehouse zones
Real-time inventory availability
Reserve products with quantity selection
Reservation confirmation and release flow
Automatic reservation expiry after 10 minutes
Multi-warehouse inventory management
Simple responsive UI using Tailwind CSS
Supabase PostgreSQL backend
Tech Stack
Next.js (App Router)
React
Tailwind CSS
Supabase
PostgreSQL
Project Structure
app/
 ├── api/
 │    ├── products/
 │    ├── reservations/
 │    └── cron/
 ├── products/
 ├── reservations/
 └── lib/

Database Design

The project uses four main tables:

Table	Purpose
products	Stores product information
warehouses	Stores warehouse/zone details
inventory	Tracks stock per warehouse
reservations	Stores active and completed reservations
Reservation Flow
User selects a product
User selects a warehouse zone
User chooses quantity
Stock is reserved temporarily
Reservation is stored with an expiry timestamp
User can confirm the reservation
If not confirmed within 10 minutes, the reservation expires automatically
Expiry Mechanism

Each reservation is created with an expires_at timestamp.

Example:

Reservation created at 10:00 AM
Expiry time set to 10:10 AM

If the user does not confirm the reservation within 10 minutes:

reserved stock is released
reservation status becomes RELEASED

A cron API periodically checks for expired reservations and updates inventory accordingly.

How Reservation Works Internally

When a reservation is created:

reserved_stock increases
available stock decreases temporarily
reservation status is set to PENDING

When reservation is confirmed:

total_stock decreases permanently
reservation status becomes CONFIRMED

When reservation expires or is released:

reserved stock is returned
reservation status becomes RELEASED
Running Locally
1. Clone the repository
git clone <your-repo-url>
cd inventory-reservation-system
2. Install dependencies
npm install
Environment Variables

Create a .env.local file in the root directory.

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CRON_SECRET=your_secret
Database Setup

Open the Supabase SQL Editor and run the schema SQL file.

This will:

create tables
create indexes
create reservation functions
insert seed data
Seed Data

The project includes:

laptops
smartphones
TVs
multiple warehouse zones across India

Example warehouse zones:

Delhi
Bangalore
Mumbai
Kolkata
Hyderabad
Start Development Server
npm run dev

Open:

http://localhost:3000
API Routes
Route	Purpose
/api/products	Fetch products and inventory
/api/reservations	Create reservation
/api/cron/expire	Expire pending reservations
Trade-offs / Simplifications

This project intentionally keeps the backend architecture simple for readability and easier understanding.

Some trade-offs made:

Minimal backend abstraction
Limited concurrency handling
Simple reservation expiry logic
Basic error handling
No advanced caching or queue systems
Simple polling/realtime updates
No authentication layer
Improvements With More Time

If expanded further, possible improvements include:

Authentication and user accounts
Admin dashboard
Better concurrency protection
Reservation analytics
Payment integration
Advanced inventory reporting
Optimistic UI updates
Improved warehouse allocation logic
Better mobile responsiveness
Screenshots / Demo

Add screenshots or deployment link here.
