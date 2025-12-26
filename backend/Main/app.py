from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'development':
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
            'DATABASE_URL', 
            'sqlite:///great_east_trade.db'
        )
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['JWT_SECRET_KEY'] = os.getenv(
            'JWT_SECRET_KEY', 
            'your-secret-key-change-in-production'
        )
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
        app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
        app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']  # Accept tokens from both headers and cookies
        app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF for simplicity
        app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
        app.config['JWT_COOKIE_HTTPONLY'] = True  # Prevent XSS attacks
        app.config['JWT_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
        app.config['JWT_REFRESH_COOKIE_NAME'] = 'refresh_token'  # Name of the refresh token cookie
        app.config['JWT_REFRESH_COOKIE_PATH'] = '/'  # Path for refresh token cookie
        app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'  # Name of the access token cookie
        app.config['JWT_ACCESS_COOKIE_PATH'] = '/'  # Path for access token cookie
        app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'products')
        app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
        app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    # CORS configuration - allow credentials (cookies) from frontend
    CORS(app, 
         supports_credentials=True,
         origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # Add your frontend URLs
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         automatic_options=True)  # Automatically handle OPTIONS requests
    
    # Import all models to ensure they're registered with SQLAlchemy
    from Models.users import User
    from Models.admin import Admin
    from Models.customers import Customer
    from Models.products import Category, Product, ProductImage, Order, OrderItem, Delivery, DeliveryUpdate
    
    # Register blueprints
    from Routes.auth import auth_bp
    from Routes.users import users_bp
    from Routes.admin import admin_bp
    from Routes.customers import customers_bp
    from Routes.products import products_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Add JWT error handlers for better debugging
    @jwt.unauthorized_loader
    def custom_unauthorized_response(err_str):
        print(f"JWT Unauthorized: {err_str}")
        print(f"Request cookies: {list(request.cookies.keys())}")
        print(f"Request Authorization header: {request.headers.get('Authorization', 'None')}")
        return jsonify({"error": "Missing or invalid token", "message": err_str}), 401

    @jwt.invalid_token_loader
    def custom_invalid_token_loader(err_str):
        print(f"JWT Invalid Token: {err_str}")
        print(f"Request cookies: {list(request.cookies.keys())}")
        print(f"Request Authorization header: {request.headers.get('Authorization', 'None')}")
        return jsonify({"error": "Invalid token", "message": err_str}), 422

    @jwt.expired_token_loader
    def custom_expired_token_callback(jwt_header, jwt_payload):
        print(f"JWT Expired Token")
        return jsonify({"error": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def custom_revoked_token_callback(jwt_header, jwt_payload):
        print(f"JWT Revoked Token")
        return jsonify({"error": "Token has been revoked"}), 401
    
    return app

