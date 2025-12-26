# Great East Trade - Flask Marketplace API

A Flask-based online marketplace application with JWT authentication, SQLAlchemy ORM, and delivery tracking.

## Features

- **User Authentication**: JWT-based authentication for admins and customers
- **User Management**: Separate admin and customer profiles linked to a central users table
- **Product Management**: CRUD operations for products (admin only)
- **Order Management**: Customers can create orders, admins can manage them
- **Delivery Tracking**: Complete delivery tracking system with status updates

## Database Structure

- **Users**: Base authentication table (stores both admins and customers)
- **Admins**: Admin profiles (foreign key to users)
- **Customers**: Customer profiles (foreign key to users)
- **Categories**: Product categories with descriptions
- **Products**: Marketplace products (with main image and category foreign key)
- **ProductImages**: Multiple images for each product
- **Orders**: Customer orders (with payment confirmation message)
- **OrderItems**: Products in each order
- **Deliveries**: Delivery tracking information
- **DeliveryUpdates**: Delivery status history

## Setup Instructions

1. **Create and activate virtual environment**:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

3. **Set environment variables** (optional):
Create a `.env` file in the backend directory:
```
DATABASE_URL=sqlite:///great_east_trade.db
JWT_SECRET_KEY=your-secret-key-change-in-production
FLASK_DEBUG=True
PORT=5000
```

4. **Run the application**:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (admin or customer)
- `POST /login` - Login and get JWT tokens
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /<id>` - Get user by ID
- `PUT /<id>` - Update user

### Admin (`/api/admin`)
- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile
- `GET /all` - Get all admins

### Customers (`/api/customers`)
- `GET /profile` - Get customer profile
- `PUT /profile` - Update customer profile
- `GET /orders` - Get customer's orders
- `GET /orders/<id>/tracking` - Track order delivery
- `GET /all` - Get all customers (admin only)

### Products (`/api/products`)
All product-related routes including categories, orders, and deliveries:

**Categories:**
- `GET /categories` - Get all categories (public, inactive only visible to admins)
- `GET /categories/<id>` - Get category by ID
- `POST /categories` - Create category (admin only)
- `PUT /categories/<id>` - Update category (admin only)
- `DELETE /categories/<id>` - Delete category (admin only)

**Products:**
- `GET /` - Get all products (public)
- `GET /<id>` - Get product by ID
- `POST /` - Create product (admin only)
- `PUT /<id>` - Update product (admin only)
- `DELETE /<id>` - Delete product (admin only)
- `POST /<id>/images` - Add image to product (admin only)
- `DELETE /<id>/images/<image_id>` - Delete product image (admin only)

**Orders:**
- `POST /orders` - Create order (customer only)
- `GET /orders/<id>` - Get order by ID
- `PUT /orders/<id>/status` - Update order status: pending, on_transit, delivered (admin only)
- `PUT /orders/<id>/payment` - Update payment status with confirmation message (admin only)
- `GET /orders/all` - Get all orders (admin only)

**Deliveries:**
- `POST /deliveries/order/<id>` - Create delivery for order (admin only, requires payment to be paid)
- `GET /deliveries/<id>` - Get delivery by ID
- `GET /deliveries/tracking/<tracking_number>` - Track delivery by tracking number
- `POST /deliveries/<id>/update` - Update delivery status: pending, on_transit, delivered (admin only)
- `GET /deliveries/all` - Get all deliveries (admin only)

## Example Usage

### Register a Customer
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA"
}
```

### Register an Admin
```bash
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "first_name": "Admin",
  "last_name": "User",
  "phone": "+1234567890",
  "department": "Management"
}
```

### Login
```bash
POST /api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

Response includes `access_token` and `refresh_token`. Use `access_token` in Authorization header:
```
Authorization: Bearer <access_token>
```

## Key Features

### Payment & Delivery Flow
1. Customer creates an order (status: `pending`)
2. Customer must pay for the order
3. Admin updates payment status to `paid` and adds confirmation message/reference
4. Admin creates delivery for the order (only after payment is confirmed)
5. Order status changes to `on_transit` when delivery is created
6. Admin updates delivery status as it progresses
7. When delivery status is `delivered`, order status automatically updates to `delivered`

### Product Images
- Each product has a main image (`main_image_url`)
- Products can have multiple additional images stored in `ProductImages` table
- Images can be added/removed by admins

### Categories
- Products are organized by categories
- Categories have descriptions
- Categories can be activated/deactivated

## Notes

- All endpoints except product/category listing require JWT authentication
- Use refresh token to get new access tokens when they expire
- Admin endpoints require admin role
- Customer endpoints require customer role
- Delivery tracking allows customers to monitor their order deliveries in real-time
- **Payment must be confirmed before delivery can be created**
- Order statuses: `pending`, `on_transit`, `delivered`, `cancelled`
- Delivery statuses: `pending`, `on_transit`, `delivered`

