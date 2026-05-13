# Inventory Reservation System

A simple inventory reservation system built using **Next.js**, **Supabase**, and **PostgreSQL**.  
The application allows users to reserve products from different warehouse zones while managing inventory availability in real time.

---

# Features

- Multi-warehouse inventory management
- Product reservation system
- Reservation expiry handling
- Real-time inventory updates
- Warehouse-wise stock availability
- Reservation confirmation and release flow
- Responsive UI with Tailwind CSS

---

# Tech Stack

| Technology | Usage |
|---|---|
| Next.js | Frontend + API Routes |
| React | UI Components |
| Tailwind CSS | Styling |
| Supabase | Backend + Database |
| PostgreSQL | Data Storage |

---

# Database Design

The project uses four main tables:

| Table | Purpose |
|---|---|
| `products` | Stores product details |
| `warehouses` | Stores warehouse/zone information |
| `inventory` | Tracks stock per warehouse |
| `reservations` | Stores reservation details |

---

# Reservation Flow

1. User selects a product
2. User selects a warehouse
3. User chooses quantity
4. Inventory is temporarily reserved
5. Reservation is created with a 10-minute expiry
6. User can confirm the reservation
7. If no action is taken, reservation expires automatically

---

# How Reservation Works

When a reservation is created:

- `reserved_stock` increases
- available stock decreases temporarily
- reservation status becomes `PENDING`

When reservation is confirmed:

- `total_stock` decreases permanently
- reservation status becomes `CONFIRMED`

When reservation expires or is released:

- reserved stock is restored
- reservation status becomes `RELEASED`

---

# Expiry Mechanism

Each reservation contains an `expires_at` timestamp.

Example:

- Reservation created at `10:00 AM`
- Expires automatically at `10:10 AM`

A cron API periodically checks for expired reservations and releases reserved stock back into inventory.

### Expiry Process

```txt
PENDING → EXPIRED → STOCK RELEASED
```

This prevents inventory from remaining locked when users abandon reservations.

---

# Running The Project Locally

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd inventory-reservation-system
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CRON_SECRET=your_secret_key
```

---

## 4. Run Database Schema

Open the **Supabase SQL Editor** and run the schema SQL file.

This will:

- Create all tables
- Create indexes
- Create reservation functions
- Insert seed data

---

## 5. Start Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# API Routes

| Route | Purpose |
|---|---|
| `/api/products` | Fetch all products and inventory |
| `/api/reservations` | Create reservations |
| `/api/cron/expire` | Expire old reservations |

---

# Sample Data Included

### Products

- MacBook Air M3
- Dell XPS 15
- iPhone 15 Pro
- Samsung Galaxy S24 Ultra
- Sony Bravia TV
- LG OLED TV

### Warehouses

- Delhi
- Bangalore
- Mumbai
- Kolkata
- Hyderabad

---

# Trade-offs / Simplifications

This project intentionally keeps the backend architecture simple for readability and easier understanding.

### Simplifications Made

- Minimal backend abstraction
- Basic reservation logic
- Simple cron-based expiry handling
- Limited concurrency protection
- Basic error handling
- No authentication system
- No advanced caching or queues

---

# Improvements With More Time

Possible future improvements:

- Authentication & user accounts
- Admin dashboard
- Better concurrency handling
- Reservation analytics
- Payment integration
- Advanced inventory reports
- Better warehouse allocation strategies
- Optimistic UI updates
- Improved mobile responsiveness

---

# Folder Structure

```txt
app/
├── api/
│   ├── products/
│   ├── reservations/
│   └── cron/
├── products/
├── reservations/
├── lib/
└── globals.css
```

---

# License

This project is created for educational and demonstration purposes.
