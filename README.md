# Marketplace Template API

A production-ready REST API template for marketplace applications built with **NestJS** and **Prisma ORM**.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v10
- **ORM**: [Prisma](https://www.prisma.io/) v5
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger / OpenAPI
- **Language**: TypeScript

## Features

- 🔐 **Authentication**: JWT-based auth with register/login endpoints
- 👤 **Users**: Role-based user management (BUYER, SELLER, ADMIN)
- 📦 **Products**: Full CRUD with filtering, search, and pagination
- 🗂️ **Categories**: Product categorization
- 🛒 **Orders**: Order creation with stock management and status tracking
- 📄 **Swagger Docs**: Auto-generated API documentation
- 🐳 **Docker**: Ready-to-use PostgreSQL setup

## Project Structure

```
src/
├── auth/           # Authentication (JWT, strategies, guards)
├── users/          # User management
├── products/       # Product CRUD with filtering
├── categories/     # Product categories
├── orders/         # Order management
├── prisma/         # Prisma service and module
└── common/         # Shared utilities (filters)
prisma/
└── schema.prisma   # Database schema
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace_template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the database**
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Start the application**
   ```bash
   npm run start:dev
   ```

## API Documentation

Once running, visit: **http://localhost:3000/api/docs**

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get JWT token |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/users | List all users | Admin |
| GET | /api/users/me | Get current user profile | Required |
| GET | /api/users/:id | Get user by ID | Admin |
| PATCH | /api/users/:id | Update user | Required |
| DELETE | /api/users/:id | Delete user | Admin |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/categories | Create category | Admin |
| GET | /api/categories | List all categories | Public |
| GET | /api/categories/:id | Get category | Public |
| PATCH | /api/categories/:id | Update category | Admin |
| DELETE | /api/categories/:id | Delete category | Admin |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/products | Create product | Seller/Admin |
| GET | /api/products | List products with filters | Public |
| GET | /api/products/:id | Get product | Public |
| PATCH | /api/products/:id | Update product | Owner/Admin |
| DELETE | /api/products/:id | Delete product | Owner/Admin |

**Product filters**: `categoryId`, `sellerId`, `minPrice`, `maxPrice`, `search`, `page`, `limit`

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/orders | Create order | Required |
| GET | /api/orders | List orders | Required |
| GET | /api/orders/:id | Get order | Owner/Admin |
| PATCH | /api/orders/:id/status | Update status | Seller/Admin |

## User Roles

| Role | Permissions |
|------|-------------|
| BUYER | Create orders, view products/categories |
| SELLER | BUYER + Create/manage own products, update order status |
| ADMIN | Full access to all resources |

## Running Tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Database Schema

```
User ─── Product (seller)
  │         │
  │      Category
  │
  └─── Order ─── OrderItem ─── Product
```

## License

MIT
