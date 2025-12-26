from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from Main.app import db
from Models.users import User
from Models.admin import Admin
from Models.customers import Customer
from datetime import datetime
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (admin or customer) - only requires email and password"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Default role to customer if not provided
    role = data.get('role', 'customer')
    if role not in ['admin', 'customer']:
        return jsonify({'error': 'role must be either "admin" or "customer"'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    try:
        # Generate username from email prefix
        email_prefix = data['email'].split('@')[0].lower()
        # Sanitize username - remove special characters, keep only alphanumeric
        username = ''.join(c for c in email_prefix if c.isalnum())
        
        # If username is empty after sanitization, use a default
        if not username:
            username = f'user{datetime.utcnow().timestamp()}'
        
        # Ensure username is unique by appending number if needed
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f'{base_username}{counter}'
            counter += 1
        
        # Generate first_name and last_name from email prefix for customers
        if role == 'customer':
            # Use email prefix as first name
            first_name = email_prefix.capitalize().replace('_', ' ').replace('.', ' ')
            # Split and take first part if multiple words
            first_name = first_name.split()[0] if first_name.split() else 'Customer'
            last_name = 'User'
        else:
            # For admin, require first_name and last_name
            if 'first_name' not in data or 'last_name' not in data:
                return jsonify({'error': 'first_name and last_name are required for admin'}), 400
            first_name = data['first_name']
            last_name = data['last_name']
        
        # Create user
        user = User(
            username=username,
            email=data['email'],
            role=role
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Get user.id
        
        # Create profile based on role
        if role == 'admin':
            admin = Admin(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                phone=data.get('phone'),
                department=data.get('department')
            )
            db.session.add(admin)
        
        elif role == 'customer':
            customer = Customer(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                phone=data.get('phone'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                zip_code=data.get('zip_code'),
                country=data.get('country')
            )
            db.session.add(customer)
        
        db.session.commit()
        
        # Generate tokens - identity MUST be a string (Flask-JWT-Extended requirement)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Create response with JSON data
        response = make_response(jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }))
        
        # Set tokens as HTTP-only cookies
        from datetime import timedelta
        ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24  # 24 hours
        REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=REFRESH_TOKEN_MAX_AGE,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax'
        )
        response.set_cookie(
            'access_token_cookie',
            access_token,
            max_age=ACCESS_TOKEN_MAX_AGE,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax'
        )
        
        return response, 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT tokens - uses email and password"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403
    
    # Generate tokens - identity MUST be a string (Flask-JWT-Extended requirement)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Create response with JSON data
    response = make_response(jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }))
    
    # Set tokens as HTTP-only cookies
    ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24  # 24 hours
    REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
    
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=REFRESH_TOKEN_MAX_AGE,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite='Lax',
        path='/'
    )
    response.set_cookie(
        'access_token_cookie',
        access_token,
        max_age=ACCESS_TOKEN_MAX_AGE,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite='Lax',
        path='/'
    )
    
    return response, 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)  # Accept refresh token from headers or cookies (JWT_TOKEN_LOCATION handles this)
def refresh():
    """Refresh access token - accepts refresh token from cookies or Authorization header"""
    try:
        # Debug: Log request info
        print(f"Refresh request - Cookies: {list(request.cookies.keys())}")
        print(f"Refresh request - Headers: {request.headers.get('Authorization', 'None')}")
        
        current_user_id = get_jwt_identity()
        print(f"Refresh - User ID from token: {current_user_id}")
        
        # get_jwt_identity() returns a string, convert to int for database query
        user = User.query.get(int(current_user_id))
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Generate tokens - identity MUST be a string (Flask-JWT-Extended requirement)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Create response with JSON data
        response = make_response(jsonify({
            'user': user.to_dict(),
            'access_token': access_token
        }))
        
        # Update cookies with new tokens
        ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24  # 24 hours
        REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=REFRESH_TOKEN_MAX_AGE,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        response.set_cookie(
            'access_token_cookie',
            access_token,
            max_age=ACCESS_TOKEN_MAX_AGE,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        
        return response, 200
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Refresh token error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to refresh token', 'details': str(e)}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Add profile data
    if user.role == 'admin' and user.admin_profile:
        user_data['admin_profile'] = user.admin_profile.to_dict()
    elif user.role == 'customer' and user.customer_profile:
        user_data['customer_profile'] = user.customer_profile.to_dict()
    
    return jsonify(user_data), 200

