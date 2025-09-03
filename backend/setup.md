# TractNest Pro Backend Setup Guide

## Prerequisites

1. **MySQL Server** (v8.0 or higher)
2. **Node.js** (v14 or higher)
3. **npm** or **yarn**

## MySQL Setup

### 1. Install MySQL Server
- Download and install MySQL Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- During installation, set a root password (remember this password)

### 2. Create Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE tractnest_pro;
```

### 3. Configure Environment Variables
Edit the `.env` file in the backend directory and update the database password:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tractnest_pro
DB_USER=root
DB_PASSWORD=your_mysql_root_password_here
```

Replace `your_mysql_root_password_here` with the password you set during MySQL installation.

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```

The server should start successfully and you should see:
```
✅ Database connection established successfully.
✅ Database synchronized successfully.
✅ Default data initialized successfully.
🚀 Server is running on port 5000
```

### 3. Test the API
Visit: http://localhost:5000/health

You should see a JSON response indicating the server is running.

## Default Login Credentials

Once the server is running, you can login with:
- **Username**: `bachawa`
- **Password**: `bachawa@1999`
- **Role**: `owner`

## Troubleshooting

### MySQL Connection Issues
1. Make sure MySQL server is running
2. Verify the password in the `.env` file matches your MySQL root password
3. Check if MySQL is running on the default port (3306)

### Port Already in Use
If port 5000 is already in use, change the PORT in the `.env` file:
```env
PORT=5001
```

### Database Permission Issues
If you get permission errors, you may need to:
1. Create a new MySQL user with proper permissions
2. Or use a different MySQL user account

## API Endpoints

Once running, the API will be available at:
- Base URL: http://localhost:5000/api
- Health Check: http://localhost:5000/health
- Authentication: http://localhost:5000/api/auth
- Users: http://localhost:5000/api/users
- Sales: http://localhost:5000/api/sales
- Subscriptions: http://localhost:5000/api/subscriptions

## Frontend Connection

The frontend is configured to connect to the backend at `http://localhost:5000`. Make sure both frontend and backend are running:

1. **Backend**: `npm run dev` (port 5000)
2. **Frontend**: `npm run dev` (port 5173)
