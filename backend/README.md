# TractNest Pro Backend

A comprehensive business management system backend built with Node.js, Express, and MySQL.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with business isolation
- **Business Management**: Multi-tenant business support
- **Subscription Management**: Flexible subscription plans with billing cycles
- **Sales Tracking**: Comprehensive sales management system
- **Payment Processing**: Payment history and tracking
- **Communication System**: Internal messaging between users
- **Pricing Configuration**: Dynamic pricing management for owner

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=tractnest_pro
   DB_USER=root
   DB_PASSWORD=your_mysql_password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   ```

4. **Set up MySQL database**
   ```sql
   CREATE DATABASE tractnest_pro;
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password`: Bcrypt hashed password
- `name`: Full name
- `email`: Email address
- `phone`: Phone number
- `role`: Enum (owner, admin, user)
- `status`: Enum (active, inactive, suspended, blocked)
- `access_level`: Enum (full, standard, limited)
- `is_blocked`: Boolean
- `blocked_by`: Foreign key to users
- `blocked_at`: Timestamp
- `blocked_reason`: Text
- `last_login`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Businesses Table
- `id`: Primary key
- `business_id`: Unique business identifier
- `name`: Business name
- `type`: Enum (retail, wholesale, manufacturing, etc.)
- `address`: Business address
- `phone`: Business phone
- `email`: Business email
- `owner_id`: Foreign key to users
- `status`: Enum (active, inactive, suspended)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Subscriptions Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `plan`: Enum (premium)
- `status`: Enum (active, inactive, trial, expired, cancelled, suspended)
- `amount`: Decimal
- `billing_cycle`: Enum (weekly, monthly, annually)
- `next_payment`: Timestamp
- `start_date`: Timestamp
- `end_date`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Sales Table
- `id`: Primary key
- `business_id`: Foreign key to businesses
- `user_id`: Foreign key to users
- `customer_name`: Customer name
- `customer_email`: Customer email
- `customer_phone`: Customer phone
- `product_name`: Product name
- `quantity`: Integer
- `unit_price`: Decimal
- `total_amount`: Decimal
- `payment_method`: Enum (cash, card, mobile_money, bank_transfer)
- `status`: Enum (completed, pending, cancelled, refunded)
- `sale_date`: Timestamp
- `notes`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Payments Table
- `id`: Primary key
- `subscription_id`: Foreign key to subscriptions
- `user_id`: Foreign key to users
- `amount`: Decimal
- `method`: Enum (credit_card, bank_transfer, paypal, mobile_money, cryptocurrency)
- `status`: Enum (pending, completed, failed, cancelled, refunded)
- `transaction_id`: String
- `payment_date`: Timestamp
- `description`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Messages Table
- `id`: Primary key
- `sender_id`: Foreign key to users
- `recipient_id`: Foreign key to users
- `subject`: String
- `content`: Text
- `status`: Enum (sent, delivered, read, archived)
- `message_type`: Enum (notification, payment, subscription, general)
- `read_at`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (owner only)
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (with business isolation)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (owner only)
- `PATCH /api/users/:id/status` - Update user status (owner only)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (owner only)
- `GET /api/subscriptions/my-subscription` - Get user's subscription
- `POST /api/subscriptions` - Create subscription (owner only)
- `PUT /api/subscriptions/:id` - Update subscription
- `PATCH /api/subscriptions/:id/cancel` - Cancel subscription

### Sales
- `GET /api/sales` - Get all sales (with business isolation)
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Business
- `GET /api/business` - Get all businesses
- `POST /api/business` - Create business
- `PUT /api/business/:id` - Update business

### Payments
- `GET /api/payments` - Get all payments (owner only)
- `GET /api/payments/my-payments` - Get user's payments
- `POST /api/payments` - Create payment record

### Pricing
- `GET /api/pricing` - Get pricing configuration
- `PUT /api/pricing` - Update pricing (owner only)

### Communications
- `GET /api/communications` - Get user's messages
- `POST /api/communications` - Send message
- `PATCH /api/communications/:id/read` - Mark message as read

## Default Users

The system comes with a default owner user:
- **Username**: `bachawa`
- **Password**: `bachawa@1999`
- **Role**: `owner`

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection (Sequelize ORM)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### Database Migrations
The database schema is automatically created when the server starts. Tables are created if they don't exist.

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return consistent JSON responses with error messages.

## Logging

The application uses Morgan for HTTP request logging and console logging for application events.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
