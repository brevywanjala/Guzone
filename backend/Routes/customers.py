from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Main.app import db
from Models.users import User
from Models.customers import Customer
from Models.products import Order, Delivery

customers_bp = Blueprint('customers', __name__)

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

@customers_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_customer_profile():
    """Get current customer's profile"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'customer':
        return jsonify({'error': 'Customer access required'}), 403
    
    customer = Customer.query.filter_by(user_id=int(current_user_id)).first()
    if not customer:
        return jsonify({'error': 'Customer profile not found'}), 404
    
    return jsonify(customer.to_dict()), 200

@customers_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_customer_profile():
    """Update current customer's profile"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'customer':
        return jsonify({'error': 'Customer access required'}), 403
    
    customer = Customer.query.filter_by(user_id=int(current_user_id)).first()
    if not customer:
        return jsonify({'error': 'Customer profile not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'first_name' in data:
            customer.first_name = data['first_name']
        if 'last_name' in data:
            customer.last_name = data['last_name']
        if 'phone' in data:
            customer.phone = data['phone']
        if 'address' in data:
            customer.address = data['address']
        if 'city' in data:
            customer.city = data['city']
        if 'state' in data:
            customer.state = data['state']
        if 'zip_code' in data:
            customer.zip_code = data['zip_code']
        if 'country' in data:
            customer.country = data['country']
        
        db.session.commit()
        return jsonify({'message': 'Customer profile updated successfully', 'customer': customer.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_customer_orders():
    """Get current customer's orders"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'customer':
        return jsonify({'error': 'Customer access required'}), 403
    
    customer = Customer.query.filter_by(user_id=int(current_user_id)).first()
    if not customer:
        return jsonify({'error': 'Customer profile not found'}), 404
    
    orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders]), 200

@customers_bp.route('/orders/<int:order_id>/tracking', methods=['GET'])
@jwt_required()
def track_order(order_id):
    """Track delivery for a specific order"""
    current_user_id = get_jwt_identity()
    # get_jwt_identity() returns a string, convert to int for database query
    current_user = User.query.get(int(current_user_id))
    
    if not current_user or current_user.role != 'customer':
        return jsonify({'error': 'Customer access required'}), 403
    
    customer = Customer.query.filter_by(user_id=int(current_user_id)).first()
    if not customer:
        return jsonify({'error': 'Customer profile not found'}), 404
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.customer_id != customer.id:
        return jsonify({'error': 'Access denied'}), 403
    
    deliveries = Delivery.query.filter_by(order_id=order_id).all()
    return jsonify({
        'order': order.to_dict(),
        'deliveries': [delivery.to_dict() for delivery in deliveries]
    }), 200

@customers_bp.route('/all', methods=['GET'])
@admin_required
def get_all_customers():
    """Get all customers (admin only)"""
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers]), 200

