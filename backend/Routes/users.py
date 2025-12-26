from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Main.app import db
from Models.users import User

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (admin only)"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    # Users can only view their own profile unless they're admin
    # Compare as integers since current_user_id is string from JWT
    if int(current_user_id) != user_id and current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Add profile data
    if user.role == 'admin' and user.admin_profile:
        user_data['admin_profile'] = user.admin_profile.to_dict()
    elif user.role == 'customer' and user.customer_profile:
        user_data['customer_profile'] = user.customer_profile.to_dict()
    
    return jsonify(user_data), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    # Users can only update their own profile unless they're admin
    # Compare as integers since current_user_id is string from JWT
    if int(current_user_id) != user_id and current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        if 'password' in data:
            user.set_password(data['password'])
        
        if 'is_active' in data and current_user.role == 'admin':
            user.is_active = data['is_active']
        
        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

