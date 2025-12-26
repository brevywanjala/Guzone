from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from Main.app import db
from Models.users import User
from Models.customers import Customer
from Models.products import Product, Category, ProductImage, Order, OrderItem, Delivery, DeliveryUpdate, Offer
from datetime import datetime, timedelta
from sqlalchemy import or_, func
import uuid
import os
from werkzeug.utils import secure_filename

products_bp = Blueprint('products', __name__)

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

# ==================== CATEGORY ROUTES ====================

@products_bp.route('/categories', methods=['GET'])
@jwt_required(optional=True)
def get_categories():
    """Get all categories (public, but shows inactive only to admins)"""
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(current_user_id)
        is_admin = current_user and current_user.role == 'admin'
    
    # Admins can see all categories, others only active
    if is_admin:
        categories = Category.query.all()
    else:
        categories = Category.query.filter_by(is_active=True).all()
    
    return jsonify([category.to_dict() for category in categories]), 200

@products_bp.route('/categories/<int:category_id>', methods=['GET'])
@jwt_required(optional=True)
def get_category(category_id):
    """Get category by ID"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(current_user_id)
        is_admin = current_user and current_user.role == 'admin'
    
    # Non-admins can't see inactive categories
    if not category.is_active and not is_admin:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify(category.to_dict()), 200

@products_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    """Create a new category (admin only)"""
    data = request.get_json()
    
    if 'name' not in data:
        return jsonify({'error': 'name is required'}), 400
    
    # Check if category name already exists
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Category name already exists'}), 400
    
    try:
        category = Category(
            name=data['name'],
            description=data.get('description'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({'message': 'Category created successfully', 'category': category.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    """Update a category (admin only)"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            # Check if new name already exists
            existing = Category.query.filter_by(name=data['name']).first()
            if existing and existing.id != category_id:
                return jsonify({'error': 'Category name already exists'}), 400
            category.name = data['name']
        
        if 'description' in data:
            category.description = data['description']
        
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        return jsonify({'message': 'Category updated successfully', 'category': category.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    """Delete a category (admin only)"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if category has products
    if category.products:
        return jsonify({'error': 'Cannot delete category with associated products'}), 400
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== OFFER ROUTES ====================

@products_bp.route('/offers', methods=['GET'])
@jwt_required(optional=True)
def get_offers():
    """Get all offers (public, but shows inactive only to admins)"""
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(int(current_user_id))
        is_admin = current_user and current_user.role == 'admin'
    
    # Admins can see all offers, others only active
    if is_admin:
        offers = Offer.query.all()
    else:
        offers = Offer.query.filter_by(is_active=True).all()
    
    return jsonify([offer.to_dict() for offer in offers]), 200

@products_bp.route('/offers/<int:offer_id>', methods=['GET'])
@jwt_required(optional=True)
def get_offer(offer_id):
    """Get offer by ID"""
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'error': 'Offer not found'}), 404
    
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(int(current_user_id))
        is_admin = current_user and current_user.role == 'admin'
    
    # Non-admins can't see inactive offers
    if not offer.is_active and not is_admin:
        return jsonify({'error': 'Offer not found'}), 404
    
    return jsonify(offer.to_dict()), 200

@products_bp.route('/offers', methods=['POST'])
@admin_required
def create_offer():
    """Create a new offer (admin only)"""
    data = request.get_json()
    
    required_fields = ['name', 'start_date', 'end_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        if start_date >= end_date:
            return jsonify({'error': 'End date must be after start date'}), 400
        
        offer = Offer(
            name=data['name'],
            description=data.get('description'),
            start_date=start_date,
            end_date=end_date,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(offer)
        db.session.commit()
        
        return jsonify({'message': 'Offer created successfully', 'offer': offer.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/offers/<int:offer_id>', methods=['PUT'])
@admin_required
def update_offer(offer_id):
    """Update an offer (admin only)"""
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'error': 'Offer not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            offer.name = data['name']
        if 'description' in data:
            offer.description = data['description']
        if 'start_date' in data:
            offer.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in data:
            offer.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        if 'is_active' in data:
            offer.is_active = data['is_active']
        
        # Validate dates
        if offer.start_date >= offer.end_date:
            return jsonify({'error': 'End date must be after start date'}), 400
        
        db.session.commit()
        return jsonify({'message': 'Offer updated successfully', 'offer': offer.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/offers/<int:offer_id>', methods=['DELETE'])
@admin_required
def delete_offer(offer_id):
    """Delete an offer (admin only)"""
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'error': 'Offer not found'}), 404
    
    # Check if offer has products
    if offer.products:
        return jsonify({'error': 'Cannot delete offer with associated products'}), 400
    
    try:
        db.session.delete(offer)
        db.session.commit()
        return jsonify({'message': 'Offer deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== PRODUCT ROUTES ====================

@products_bp.route('/', methods=['GET'])
@products_bp.route('', methods=['GET'])  # Handle both with and without trailing slash
@jwt_required(optional=True)
def get_products():
    """
    Get products with search, pagination, and filtering
    Query parameters:
    - search: search query (searches in name, description, category)
    - page: page number (default: 1)
    - per_page: items per page (default: 20, max: 100)
    - category_id: filter by category ID (optional)
    """
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(current_user_id)
        is_admin = current_user and current_user.role == 'admin'
    
    # Get query parameters
    search_query = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
    category_id = request.args.get('category_id', type=int)
    
    # Base query - admins see all, others only active
    if is_admin:
        query = Product.query
    else:
        query = Product.query.filter_by(is_active=True)
    
    # Filter by category if provided
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    # Apply search if provided
    if search_query:
        search_term = f'%{search_query}%'
        # Search in product name, description, category name, and supplier name
        query = query.outerjoin(Category).filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Category.name.ilike(search_term),
                Product.supplier_name.ilike(search_term)
            )
        ).distinct()
    
    # Order by featured first, then by creation date
    query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
    
    # Pagination
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # If search query exists, apply fuzzy matching and limit to top 10
    products_list = pagination.items
    if search_query:
        products_list = _apply_fuzzy_search(products_list, search_query)
        # Limit to top 10 results for search
        products_list = products_list[:10]
        # Update pagination info
        total_results = len(products_list)
    else:
        total_results = pagination.total
    
    return jsonify({
        'products': [product.to_dict() for product in products_list],
        'total': total_results,
        'page': page,
        'per_page': per_page,
        'pages': 1 if search_query else pagination.pages  # For search, we only return top 10
    }), 200


def _levenshtein_distance(s1, s2):
    """Calculate Levenshtein distance between two strings"""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]


def _string_similarity(s1, s2):
    """Calculate similarity score between two strings (0-1, where 1 is identical)"""
    if not s1 or not s2:
        return 0.0
    
    s1_lower = s1.lower()
    s2_lower = s2.lower()
    
    # Exact match
    if s1_lower == s2_lower:
        return 1.0
    
    # Contains match
    if s1_lower in s2_lower or s2_lower in s1_lower:
        return 0.9
    
    # Calculate similarity using Levenshtein distance
    longer = max(len(s1), len(s2))
    distance = _levenshtein_distance(s1_lower, s2_lower)
    similarity = (longer - distance) / longer if longer > 0 else 0.0
    
    return similarity


def _score_product(product, search_query):
    """Score a product based on search query relevance"""
    query_lower = search_query.lower()
    query_words = query_lower.split()
    max_score = 0.0
    
    # Search in product name (highest weight)
    name_score = _string_similarity(query_lower, product.name.lower())
    if name_score > 0.6:  # Only count if similarity is reasonable
        max_score = max(max_score, name_score * 1.0)
    
    # Check word-by-word matching in name
    name_words = product.name.lower().split()
    for query_word in query_words:
        for name_word in name_words:
            word_score = _string_similarity(query_word, name_word)
            if word_score > 0.7:  # At least 70% similar
                max_score = max(max_score, word_score * 0.9)
    
    # Search in description (medium weight)
    if product.description:
        desc_score = _string_similarity(query_lower, product.description.lower())
        if desc_score > 0.6:
            max_score = max(max_score, desc_score * 0.8)
        
        # Word-by-word in description
        desc_words = product.description.lower().split()
        for query_word in query_words:
            for desc_word in desc_words:
                word_score = _string_similarity(query_word, desc_word)
                if word_score > 0.7:
                    max_score = max(max_score, word_score * 0.7)
    
    # Search in category name (lower weight)
    if product.category:
        cat_score = _string_similarity(query_lower, product.category.name.lower())
        if cat_score > 0.6:
            max_score = max(max_score, cat_score * 0.6)
    
    # Search in supplier name (lower weight)
    if product.supplier_name:
        supplier_score = _string_similarity(query_lower, product.supplier_name.lower())
        if supplier_score > 0.6:
            max_score = max(max_score, supplier_score * 0.6)
    
    return max_score


def _apply_fuzzy_search(products, search_query):
    """Apply fuzzy search to products and return sorted by relevance"""
    if not search_query:
        return products
    
    # Score each product
    scored_products = []
    for product in products:
        score = _score_product(product, search_query)
        if score > 0.5:  # Only include products with at least 50% match
            scored_products.append((score, product))
    
    # Sort by score (descending)
    scored_products.sort(key=lambda x: x[0], reverse=True)
    
    # Return just the products
    return [product for _, product in scored_products]

@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required(optional=True)
def get_product(product_id):
    """Get product by ID"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    current_user_id = get_jwt_identity()
    is_admin = False
    
    if current_user_id:
        current_user = User.query.get(current_user_id)
        is_admin = current_user and current_user.role == 'admin'
    
    # Non-admins can't see inactive products
    if not product.is_active and not is_admin:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify(product.to_dict()), 200

@products_bp.route('/', methods=['POST'])
@products_bp.route('', methods=['POST'])  # Handle both with and without trailing slash
@admin_required
def create_product():
    """Create a new product (admin only)"""
    data = request.get_json()
    
    required_fields = ['name', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        # Validate category if provided
        category_id = data.get('category_id')
        if category_id:
            category = Category.query.get(category_id)
            if not category:
                return jsonify({'error': 'Category not found'}), 404
        
        # Validate offer if provided
        offer_id = data.get('offer_id')
        if offer_id:
            offer = Offer.query.get(offer_id)
            if not offer:
                return jsonify({'error': 'Offer not found'}), 404
        
        # Parse discount dates if provided
        discount_start_date = None
        discount_end_date = None
        if data.get('discount_start_date'):
            discount_start_date = datetime.fromisoformat(data['discount_start_date'].replace('Z', '+00:00'))
        if data.get('discount_end_date'):
            discount_end_date = datetime.fromisoformat(data['discount_end_date'].replace('Z', '+00:00'))
        
        product = Product(
            name=data['name'],
            description=data.get('description'),
            price=data['price'],
            stock_quantity=data.get('stock_quantity', 0),
            category_id=category_id,
            main_image_url=data.get('main_image_url'),
            sku=data.get('sku'),
            is_active=data.get('is_active', True),
            minimum_order=data.get('minimum_order', 1),
            unit_term=data.get('unit_term', 'units'),
            item_location=data.get('item_location'),
            supplier_name=data.get('supplier_name'),
            is_featured=data.get('is_featured', False),
            discount_percentage=data.get('discount_percentage'),
            discount_start_date=discount_start_date,
            discount_end_date=discount_end_date,
            offer_id=offer_id
        )
        
        db.session.add(product)
        db.session.flush()  # Get product.id
        
        # Add product images if provided
        if 'images' in data and data['images']:
            for idx, image_data in enumerate(data['images']):
                product_image = ProductImage(
                    product_id=product.id,
                    image_url=image_data.get('image_url'),
                    alt_text=image_data.get('alt_text'),
                    display_order=image_data.get('display_order', idx)
                )
                db.session.add(product_image)
        
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully', 'product': product.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    """Update a product (admin only)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        if 'category_id' in data:
            category_id = data['category_id']
            if category_id:
                category = Category.query.get(category_id)
                if not category:
                    return jsonify({'error': 'Category not found'}), 404
            product.category_id = category_id
        if 'main_image_url' in data:
            product.main_image_url = data['main_image_url']
        if 'sku' in data:
            product.sku = data['sku']
        if 'is_active' in data:
            product.is_active = data['is_active']
        if 'minimum_order' in data:
            product.minimum_order = data['minimum_order']
        if 'unit_term' in data:
            product.unit_term = data['unit_term']
        if 'item_location' in data:
            product.item_location = data['item_location']
        if 'supplier_name' in data:
            product.supplier_name = data['supplier_name']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'discount_percentage' in data:
            product.discount_percentage = data.get('discount_percentage')
        if 'discount_start_date' in data:
            if data['discount_start_date']:
                product.discount_start_date = datetime.fromisoformat(data['discount_start_date'].replace('Z', '+00:00'))
            else:
                product.discount_start_date = None
        if 'discount_end_date' in data:
            if data['discount_end_date']:
                product.discount_end_date = datetime.fromisoformat(data['discount_end_date'].replace('Z', '+00:00'))
            else:
                product.discount_end_date = None
        if 'offer_id' in data:
            offer_id = data.get('offer_id')
            if offer_id:
                offer = Offer.query.get(offer_id)
                if not offer:
                    return jsonify({'error': 'Offer not found'}), 404
            product.offer_id = offer_id
        
        # Handle image updates if provided
        if 'images' in data and isinstance(data['images'], list):
            # Delete existing images not in the new list
            existing_image_urls = {img.image_url for img in product.images}
            new_image_urls = {img.get('image_url') for img in data['images'] if img.get('image_url')}
            
            # Remove images that are no longer in the list
            for img in product.images[:]:
                if img.image_url not in new_image_urls:
                    db.session.delete(img)
            
            # Add or update images
            for idx, image_data in enumerate(data['images']):
                image_url = image_data.get('image_url')
                if not image_url:
                    continue
                
                # Check if image already exists
                existing_img = ProductImage.query.filter_by(
                    product_id=product_id,
                    image_url=image_url
                ).first()
                
                if existing_img:
                    # Update existing image
                    existing_img.alt_text = image_data.get('alt_text', existing_img.alt_text)
                    existing_img.display_order = image_data.get('display_order', idx)
                else:
                    # Create new image
                    product_image = ProductImage(
                        product_id=product_id,
                        image_url=image_url,
                        alt_text=image_data.get('alt_text'),
                        display_order=image_data.get('display_order', idx)
                    )
                    db.session.add(product_image)
        
        db.session.commit()
        return jsonify({'message': 'Product updated successfully', 'product': product.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    """Delete a product (admin only)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@products_bp.route('/upload-image', methods=['POST'])
@admin_required
def upload_product_image():
    """Upload a product image (admin only)"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Create upload directory if it doesn't exist
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate secure filename
        filename = secure_filename(file.filename)
        # Add timestamp to avoid conflicts
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f"{timestamp}_{filename}"
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        # Return relative URL that can be served by Flask
        image_url = f"/api/products/uploads/{filename}"
        
        return jsonify({'message': 'Image uploaded successfully', 'image_url': image_url}), 201
    
    return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'}), 400

@products_bp.route('/uploads/<filename>')
def serve_uploaded_image(filename):
    """Serve uploaded product images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@products_bp.route('/<int:product_id>/images', methods=['POST'])
@admin_required
def add_product_image(product_id):
    """Add an image to a product (admin only)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.get_json()
    
    if 'image_url' not in data:
        return jsonify({'error': 'image_url is required'}), 400
    
    try:
        # Get max display_order to append at end
        max_order = db.session.query(db.func.max(ProductImage.display_order)).filter_by(product_id=product_id).scalar() or 0
        
        product_image = ProductImage(
            product_id=product_id,
            image_url=data['image_url'],
            alt_text=data.get('alt_text'),
            display_order=data.get('display_order', max_order + 1)
        )
        
        db.session.add(product_image)
        db.session.commit()
        
        return jsonify({'message': 'Image added successfully', 'image': product_image.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>/images/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_product_image(product_id, image_id):
    """Delete a product image (admin only)"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    product_image = ProductImage.query.filter_by(id=image_id, product_id=product_id).first()
    if not product_image:
        return jsonify({'error': 'Image not found'}), 404
    
    try:
        # Delete the physical file if it's a local upload
        image_url = product_image.image_url
        if image_url and image_url.startswith('/api/products/uploads/'):
            filename = os.path.basename(image_url)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Warning: Could not delete file {filepath}: {e}")
        
        db.session.delete(product_image)
        db.session.commit()
        return jsonify({'message': 'Image deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ORDER ROUTES ====================

@products_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order (customer only)"""
    print("=" * 50)
    print("DEBUG: create_order - Starting order creation")
    print("=" * 50)
    
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG: current_user_id from JWT: {current_user_id} (type: {type(current_user_id)})")
        
        # get_jwt_identity() returns a string, convert to int for database query
        current_user = User.query.get(int(current_user_id))
        print(f"DEBUG: current_user found: {current_user is not None}, role: {current_user.role if current_user else 'None'}")
        
        if not current_user or current_user.role != 'customer':
            print(f"DEBUG: Access denied - user: {current_user is not None}, role: {current_user.role if current_user else 'None'}")
            return jsonify({'error': 'Customer access required'}), 403
        
        customer = Customer.query.filter_by(user_id=int(current_user_id)).first()
        print(f"DEBUG: customer found: {customer is not None}, customer_id: {customer.id if customer else 'None'}")
        
        if not customer:
            print("DEBUG: Customer profile not found")
            return jsonify({'error': 'Customer profile not found'}), 404
        
        data = request.get_json()
        print(f"DEBUG: Request data received: {data}")
        
        if not data:
            print("DEBUG: No JSON data in request")
            return jsonify({'error': 'Request body is required'}), 400
        
        if 'items' not in data or not data['items']:
            print(f"DEBUG: Missing or empty items - items: {data.get('items')}")
            return jsonify({'error': 'Order items are required'}), 400
        
        if 'shipping_address' not in data:
            print(f"DEBUG: Missing shipping_address - data keys: {list(data.keys())}")
            return jsonify({'error': 'Shipping address is required'}), 400
        
        print(f"DEBUG: Processing {len(data['items'])} items")
        
        # Note: Payment must be completed before delivery can be initiated
        # Admin will update payment_status to 'paid' with confirmation message
        
        # Generate unique order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        print(f"DEBUG: Generated order_number: {order_number}")
        
        # Calculate total and create order items
        total_amount = 0
        order_items = []
        
        for idx, item_data in enumerate(data['items']):
            print(f"DEBUG: Processing item {idx + 1}/{len(data['items'])}: {item_data}")
            
            if 'product_id' not in item_data or 'quantity' not in item_data:
                print(f"DEBUG: Item {idx + 1} missing required fields - item_data: {item_data}")
                return jsonify({'error': 'Each item must have product_id and quantity'}), 400
            
            product_id = item_data['product_id']
            print(f"DEBUG: Looking up product_id: {product_id} (type: {type(product_id)})")
            
            product = Product.query.get(product_id)
            if not product:
                print(f"DEBUG: Product {product_id} not found in database")
                return jsonify({'error': f'Product {product_id} not found'}), 404
            
            print(f"DEBUG: Product found - name: {product.name}, price: {product.price}, stock: {product.stock_quantity}, active: {product.is_active}")
            
            if not product.is_active:
                print(f"DEBUG: Product {product.name} is not active")
                return jsonify({'error': f'Product {product.name} is not available'}), 400
            
            quantity = item_data['quantity']
            print(f"DEBUG: Requested quantity: {quantity}, Available stock: {product.stock_quantity}")
            
            if quantity > product.stock_quantity:
                print(f"DEBUG: Insufficient stock - requested: {quantity}, available: {product.stock_quantity}")
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
            try:
                unit_price = float(product.price)
                subtotal = unit_price * quantity
                total_amount += subtotal
                print(f"DEBUG: Item {idx + 1} - unit_price: {unit_price}, quantity: {quantity}, subtotal: {subtotal}, total so far: {total_amount}")
            except (ValueError, TypeError) as price_error:
                print(f"DEBUG: Error converting price to float - price: {product.price}, error: {str(price_error)}")
                return jsonify({'error': f'Invalid price for product {product.name}'}), 400
            
            order_item = OrderItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )
            order_items.append(order_item)
            print(f"DEBUG: Created OrderItem for product {product.id}")
            
            # Update product stock
            product.stock_quantity -= quantity
            print(f"DEBUG: Updated stock for product {product.id} - new stock: {product.stock_quantity}")
        
        print(f"DEBUG: Total amount calculated: {total_amount}")
        print(f"DEBUG: Number of order items: {len(order_items)}")
        
        # Create order
        print(f"DEBUG: Creating Order object...")
        order = Order(
            customer_id=customer.id,
            order_number=order_number,
            total_amount=total_amount,
            shipping_address=data['shipping_address'],
            payment_method=data.get('payment_method'),
            notes=data.get('notes')
        )
        print(f"DEBUG: Order object created - customer_id: {customer.id}, order_number: {order_number}")
        
        db.session.add(order)
        print("DEBUG: Order added to session")
        
        db.session.flush()  # Get order.id
        print(f"DEBUG: Order flushed, order.id: {order.id}")
        
        # Add order items
        print(f"DEBUG: Adding {len(order_items)} order items to session...")
        for idx, order_item in enumerate(order_items):
            order_item.order_id = order.id
            db.session.add(order_item)
            print(f"DEBUG: Added order item {idx + 1} with order_id: {order.id}")
        
        print("DEBUG: Committing transaction...")
        db.session.commit()
        print(f"DEBUG: Transaction committed successfully! Order ID: {order.id}")
        
        order_dict = order.to_dict()
        print(f"DEBUG: Order dict created, returning response")
        
        return jsonify({'message': 'Order created successfully', 'order': order_dict}), 201
    
    except Exception as e:
        import traceback
        print("=" * 50)
        print("DEBUG: EXCEPTION in create_order")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        print("=" * 50)
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get order by ID"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Customers can only view their own orders, admins can view all
    if current_user.role == 'customer':
        customer = Customer.query.filter_by(user_id=current_user_id).first()
        if not customer or order.customer_id != customer.id:
            return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(order.to_dict()), 200

@products_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    """Update order status (admin only)"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'status is required'}), 400
    
    valid_statuses = ['pending', 'on_transit', 'delivered', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    try:
        order.status = data['status']
        
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        
        db.session.commit()
        return jsonify({'message': 'Order status updated successfully', 'order': order.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/orders/<int:order_id>/complete', methods=['POST'])
@jwt_required()
def complete_order(order_id):
    """Customer confirms payment completion - updates order status to pending"""
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
    
    # Ensure customer owns this order
    if order.customer_id != customer.id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    
    try:
        # Update order status to pending (customer confirms payment)
        order.status = 'pending'
        
        # Update shipping address if provided
        if 'shipping_address' in data and data['shipping_address']:
            order.shipping_address = data['shipping_address']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order confirmed successfully. Your order is now pending payment verification.',
            'order': order.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/orders/<int:order_id>/payment', methods=['PUT'])
@admin_required
def update_payment_status(order_id):
    """Update payment status with confirmation message (admin only)"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    if 'payment_status' not in data:
        return jsonify({'error': 'payment_status is required'}), 400
    
    valid_statuses = ['pending', 'paid', 'failed', 'refunded']
    if data['payment_status'] not in valid_statuses:
        return jsonify({'error': f'Invalid payment status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    try:
        order.payment_status = data['payment_status']
        
        # Add confirmation message if provided (especially when marking as paid)
        if 'payment_confirmation_message' in data:
            order.payment_confirmation_message = data['payment_confirmation_message']
        
        db.session.commit()
        return jsonify({'message': 'Payment status updated successfully', 'order': order.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/orders/all', methods=['GET'])
@admin_required
def get_all_orders():
    """Get all orders with pagination, filtering, and search (admin only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str).strip()
    date_from = request.args.get('date_from', '', type=str)
    date_to = request.args.get('date_to', '', type=str)
    
    # Base query
    query = Order.query
    
    # Search by product name (joins with OrderItem and Product)
    if search:
        query = query.join(OrderItem).join(Product).filter(
            Product.name.ilike(f'%{search}%')
        ).distinct()
    
    # Filter by date range
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(Order.created_at >= date_from_obj)
        except ValueError:
            return jsonify({'error': 'Invalid date_from format. Use YYYY-MM-DD'}), 400
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
            # Include the entire day by adding 1 day and using less than
            date_to_obj = date_to_obj + timedelta(days=1)
            query = query.filter(Order.created_at < date_to_obj)
        except ValueError:
            return jsonify({'error': 'Invalid date_to format. Use YYYY-MM-DD'}), 400
    
    # Order by creation date descending
    query = query.order_by(Order.created_at.desc())
    
    # Pagination
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return jsonify({
        'orders': [order.to_dict() for order in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    }), 200

# ==================== DELIVERY ROUTES ====================

@products_bp.route('/deliveries/order/<int:order_id>', methods=['POST'])
@admin_required
def create_delivery(order_id):
    """Create a delivery for an order (admin only) - requires payment to be paid"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Ensure payment is completed before creating delivery
    if order.payment_status != 'paid':
        return jsonify({'error': 'Payment must be completed before creating delivery'}), 400
    
    data = request.get_json()
    
    if 'carrier' not in data:
        return jsonify({'error': 'carrier is required'}), 400
    
    try:
        # Generate unique tracking number
        tracking_number = f"TRK-{uuid.uuid4().hex[:12].upper()}"
        
        delivery = Delivery(
            order_id=order_id,
            tracking_number=tracking_number,
            carrier=data['carrier'],
            status=data.get('status', 'pending'),
            estimated_delivery_date=datetime.fromisoformat(data['estimated_delivery_date']) if data.get('estimated_delivery_date') else None,
            current_location=data.get('current_location'),
            notes=data.get('notes')
        )
        
        db.session.add(delivery)
        db.session.flush()
        
        # Create initial delivery update
        initial_update = DeliveryUpdate(
            delivery_id=delivery.id,
            status=delivery.status,
            location=delivery.current_location,
            description=f'Delivery created for order {order.order_number}'
        )
        db.session.add(initial_update)
        
        # Update order status to on_transit if not already
        if order.status not in ['on_transit', 'delivered']:
            order.status = 'on_transit'
        
        db.session.commit()
        
        return jsonify({'message': 'Delivery created successfully', 'delivery': delivery.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/deliveries/<int:delivery_id>', methods=['GET'])
@jwt_required()
def get_delivery(delivery_id):
    """Get delivery by ID"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    delivery = Delivery.query.get(delivery_id)
    if not delivery:
        return jsonify({'error': 'Delivery not found'}), 404
    
    # Customers can only view deliveries for their own orders
    if current_user.role == 'customer':
        customer = Customer.query.filter_by(user_id=current_user_id).first()
        if not customer or delivery.order.customer_id != customer.id:
            return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(delivery.to_dict()), 200

@products_bp.route('/deliveries/tracking/<tracking_number>', methods=['GET'])
@jwt_required()
def track_delivery(tracking_number):
    """Track delivery by tracking number"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    delivery = Delivery.query.filter_by(tracking_number=tracking_number).first()
    if not delivery:
        return jsonify({'error': 'Delivery not found'}), 404
    
    # Customers can only track deliveries for their own orders
    if current_user.role == 'customer':
        customer = Customer.query.filter_by(user_id=current_user_id).first()
        if not customer or delivery.order.customer_id != customer.id:
            return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(delivery.to_dict()), 200

@products_bp.route('/deliveries/<int:delivery_id>/update', methods=['POST'])
@admin_required
def update_delivery_status(delivery_id):
    """Update delivery status and add tracking update (admin only)"""
    delivery = Delivery.query.get(delivery_id)
    if not delivery:
        return jsonify({'error': 'Delivery not found'}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'status is required'}), 400
    
    valid_statuses = ['pending', 'on_transit', 'delivered']
    if data['status'] not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    try:
        old_status = delivery.status
        delivery.status = data['status']
        
        if 'current_location' in data:
            delivery.current_location = data['current_location']
        
        if 'notes' in data:
            delivery.notes = data['notes']
        
        # If delivered, set actual delivery date
        if data['status'] == 'delivered' and not delivery.actual_delivery_date:
            delivery.actual_delivery_date = datetime.utcnow()
            # Update order status to delivered
            delivery.order.status = 'delivered'
        
        # Create delivery update
        update = DeliveryUpdate(
            delivery_id=delivery.id,
            status=data['status'],
            location=data.get('current_location', delivery.current_location),
            description=data.get('description', f'Status changed from {old_status} to {data["status"]}')
        )
        db.session.add(update)
        
        db.session.commit()
        
        return jsonify({'message': 'Delivery status updated successfully', 'delivery': delivery.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/deliveries/all', methods=['GET'])
@admin_required
def get_all_deliveries():
    """Get all deliveries (admin only)"""
    deliveries = Delivery.query.order_by(Delivery.created_at.desc()).all()
    return jsonify([delivery.to_dict() for delivery in deliveries]), 200
