# API Routes

This directory contains all API service functions using Axios for making HTTP requests to the backend.

## Structure

- `axiosConfig.ts` - Base Axios instance with interceptors for authentication and error handling
- `authApi.ts` - Authentication endpoints (login, register, refresh token)
- `productsApi.ts` - Product management endpoints
- `categoriesApi.ts` - Category management endpoints
- `ordersApi.ts` - Order management endpoints
- `customersApi.ts` - Customer profile and order endpoints
- `deliveriesApi.ts` - Delivery tracking endpoints
- `index.ts` - Central export file

## Usage

### Import API functions

```typescript
import { authApi, productsApi, ordersApi } from "@/apiRoutes";
```

### Example: Login

```typescript
import { authApi } from "@/apiRoutes";

try {
  const response = await authApi.login({
    username: "user@example.com",
    password: "password123"
  });
  // Handle success
} catch (error) {
  // Handle error
}
```

### Example: Get Products

```typescript
import { productsApi } from "@/apiRoutes";

const products = await productsApi.getProducts();
```

### Example: Create Order

```typescript
import { ordersApi } from "@/apiRoutes";

const order = await ordersApi.createOrder({
  items: [
    { product_id: 1, quantity: 2 }
  ],
  shipping_address: "123 Main St"
});
```

## Features

- **Automatic Token Injection**: Access tokens are automatically added to requests via interceptors
- **Token Refresh**: Automatically refreshes expired tokens
- **Error Handling**: Centralized error handling with proper error messages
- **TypeScript Support**: Full TypeScript types for all API responses

## Configuration

The API base URL is configured via environment variable:
- `VITE_API_URL` - Defaults to `http://localhost:5000/api` if not set

Set in `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

