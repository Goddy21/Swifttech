# Swift Technologies — Node.js Backend API

Express + PostgreSQL REST API for the Swift Technologies e-commerce platform.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Install dependencies
```bash
cd swifttech-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your DB credentials and JWT secret
```

### 3. Create the database
```bash
psql -U postgres -c "CREATE DATABASE swifttech_db;"
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. Seed sample data (optional)
```bash
npm run seed
# Creates admin user: admin@swifttech.co.ke / admin1234
# Creates 6 sample products
```

### 6. Start the server
```bash
npm run dev      # development (auto-reload)
npm start        # production
```

Server runs at `http://localhost:3001`

---

## API Reference

### Base URL
```
http://localhost:3001/api
```

### Authentication
All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes

| Method | Endpoint         | Auth | Description              |
|--------|-----------------|------|--------------------------|
| POST   | /auth/register  | No   | Create new account       |
| POST   | /auth/login     | No   | Login, receive JWT token |
| GET    | /auth/me        | Yes  | Get current user profile |
| PUT    | /auth/me        | Yes  | Update profile/password  |

**Register** `POST /api/auth/register`
```json
{ "email": "user@example.com", "password": "secret123", "name": "John Kamau" }
```

**Login** `POST /api/auth/login`
```json
{ "email": "user@example.com", "password": "secret123" }
```
Response: `{ "token": "eyJ...", "user": { "id", "email", "name", "role" } }`

---

### 📦 Product Routes

| Method | Endpoint                      | Auth         | Description           |
|--------|-------------------------------|-------------|----------------------|
| GET    | /products                     | No           | List/filter products  |
| GET    | /products/:id                 | No           | Get product by ID     |
| GET    | /products/categories/summary  | No           | Category counts       |
| POST   | /products                     | Admin        | Create product        |
| PUT    | /products/:id                 | Admin        | Update product        |
| DELETE | /products/:id                 | Admin        | Delete product        |

**List products** — query params:
- `status` — active | draft | archived
- `category` — electronics | home_appliances | machinery | tools | components
- `featured` — true | false
- `search` — search name, brand, description
- `min_price`, `max_price`
- `sort` — `-created_date` | `created_date` | `price` | `-price` | `name`
- `limit`, `offset` — pagination

**Create product** `POST /api/products` (Admin)
```json
{
  "name": "Samsung 55\" Smart TV",
  "price": 85000,
  "original_price": 95000,
  "category": "electronics",
  "brand": "Samsung",
  "sku": "ST-TV-001",
  "stock": 10,
  "images": ["https://example.com/image.jpg"],
  "specs": [{ "label": "Screen Size", "value": "55\"" }],
  "featured": true,
  "status": "active"
}
```

---

### 🛒 Cart Routes (Auth required)

| Method | Endpoint    | Description             |
|--------|------------|-------------------------|
| GET    | /cart       | Get user's cart         |
| POST   | /cart       | Add item to cart        |
| PUT    | /cart/:id   | Update item quantity    |
| DELETE | /cart/:id   | Remove item             |
| DELETE | /cart/clear | Clear entire cart       |

**Add to cart** `POST /api/cart`
```json
{ "product_id": "uuid", "quantity": 2 }
```

---

### 📋 Order Routes (Auth required)

| Method | Endpoint              | Auth   | Description             |
|--------|-----------------------|--------|-------------------------|
| GET    | /orders               | User   | Get user's orders       |
| GET    | /orders/:id           | User   | Get single order        |
| POST   | /orders               | User   | Place order from cart   |
| PUT    | /orders/:id/status    | Admin  | Update order status     |
| GET    | /orders/admin/all     | Admin  | List all orders         |

**Place order** `POST /api/orders`
```json
{
  "shipping_name": "John Kamau",
  "shipping_email": "john@example.co.ke",
  "shipping_address": "Moi Avenue, 2nd Floor",
  "shipping_city": "Nairobi",
  "shipping_zip": "00100",
  "shipping_country": "Kenya",
  "notes": "Call before delivery"
}
```
> Items are auto-pulled from the user's cart. Cart is cleared on success.

**Order statuses:** `pending` → `processing` → `shipped` → `delivered` | `cancelled`

---

### 📸 Upload Routes (Auth required)

| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| POST   | /upload           | Upload image file(s)   |
| DELETE | /upload/:filename | Delete uploaded file   |

**Upload** `POST /api/upload` — multipart/form-data, field name: `file`

Response:
```json
{ "file_url": "http://localhost:3001/uploads/uuid.jpg" }
```

Uploaded files are served statically at `/uploads/filename`.

---

## Connecting Your Frontend

Update your `SwiftTechClient.js` to point at this backend.

### Example Axios setup:
```js
const API_BASE = 'http://localhost:3001/api';

// Login and store token
const { token } = await axios.post(`${API_BASE}/auth/login`, { email, password });
localStorage.setItem('token', token);

// Authenticated request
const { data } = await axios.get(`${API_BASE}/products`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

---

## Database Schema

```
users         — id, email, password_hash, name, role, created_at
products      — id, name, description, price, original_price, category,
                subcategory, brand, sku, stock, weight, dimensions,
                images (JSONB), specs (JSONB), featured, status, created_date
cart_items    — id, user_id, product_id, quantity, product_name,
                product_price, product_image
orders        — id, user_id, items (JSONB), total, status,
                shipping_*, notes, created_date
```

---

## Environment Variables

| Variable         | Default               | Description                   |
|------------------|-----------------------|-------------------------------|
| PORT             | 3001                  | Server port                   |
| DB_HOST          | localhost             | PostgreSQL host                |
| DB_PORT          | 5432                  | PostgreSQL port                |
| DB_NAME          | swifttech_db          | Database name                  |
| DB_USER          | postgres              | DB user                        |
| DB_PASSWORD      | —                     | DB password (required)         |
| JWT_SECRET       | —                     | JWT signing key (required)     |
| JWT_EXPIRES_IN   | 7d                    | Token expiry                   |
| CORS_ORIGIN      | http://localhost:5173 | Allowed frontend origin(s)     |
| UPLOAD_DIR       | uploads               | Directory for file uploads     |
| MAX_FILE_SIZE    | 10485760              | Max upload size in bytes (10MB)|

---

## Health Check
```
GET /health
→ { "status": "ok", "db": "connected", "timestamp": "..." }
```
