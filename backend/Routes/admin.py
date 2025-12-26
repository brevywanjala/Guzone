from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Main.app import db
from Models.users import User
from Models.admin import Admin

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        # get_jwt_identity() returns a string, convert to int for database query
        current_user = User.query.get(int(current_user_id))
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_admin_profile():
    """Get current admin's profile"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    admin = Admin.query.filter_by(user_id=int(current_user_id)).first()
    if not admin:
        return jsonify({'error': 'Admin profile not found'}), 404
    
    return jsonify(admin.to_dict()), 200

@admin_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_admin_profile():
    """Update current admin's profile"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    admin = Admin.query.filter_by(user_id=int(current_user_id)).first()
    if not admin:
        return jsonify({'error': 'Admin profile not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'first_name' in data:
            admin.first_name = data['first_name']
        if 'last_name' in data:
            admin.last_name = data['last_name']
        if 'phone' in data:
            admin.phone = data['phone']
        if 'department' in data:
            admin.department = data['department']
        
        db.session.commit()
        return jsonify({'message': 'Admin profile updated successfully', 'admin': admin.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/all', methods=['GET'])
@admin_required
def get_all_admins():
    """Get all admins"""
    admins = Admin.query.all()
    return jsonify([admin.to_dict() for admin in admins]), 200

