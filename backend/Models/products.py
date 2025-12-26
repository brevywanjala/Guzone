from Main.app import db
from datetime import datetime

class Category(db.Model):
    """Category model for product categorization"""
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='category', lazy=True)
    
    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Category {self.name}>'

class Offer(db.Model):
    """Offer/Campaign model for managing sales campaigns (Black Friday, Christmas, etc.)"""
    __tablename__ = 'offers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # e.g., "Black Friday", "Christmas Sale", etc.
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='offer', lazy=True)
    
    def to_dict(self):
        """Convert offer to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Offer {self.name}>'

class Product(db.Model):
    """Product model for marketplace"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True, index=True)
    main_image_url = db.Column(db.String(500))  # Main product image
    sku = db.Column(db.String(100), unique=True, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    minimum_order = db.Column(db.Integer, default=1)  # Minimum order quantity
    unit_term = db.Column(db.String(50), default='units')  # units, bags, sacks, etc.
    item_location = db.Column(db.String(200))  # Location of the item
    supplier_name = db.Column(db.String(200))  # Supplier name
    is_featured = db.Column(db.Boolean, default=False, nullable=False)  # Featured product flag
    discount_percentage = db.Column(db.Numeric(5, 2), nullable=True)  # Discount percentage (0-100)
    discount_start_date = db.Column(db.DateTime, nullable=True)  # When discount starts
    discount_end_date = db.Column(db.DateTime, nullable=True)  # When discount ends
    offer_id = db.Column(db.Integer, db.ForeignKey('offers.id'), nullable=True, index=True)  # Associated offer/campaign
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan', order_by='ProductImage.display_order')
    
    def to_dict(self):
        """Convert product to dictionary"""
        # Calculate discounted price if discount is active
        discounted_price = None
        if self.discount_percentage and self.discount_start_date and self.discount_end_date:
            now = datetime.utcnow()
            if self.discount_start_date <= now <= self.discount_end_date:
                discount_amount = float(self.price) * (float(self.discount_percentage) / 100)
                discounted_price = round(float(self.price) - discount_amount, 2)
        
        # Sort images by display_order to ensure consistent ordering
        sorted_images = sorted(self.images, key=lambda img: img.display_order or 0)
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),  # Price is always required, convert to float
            'discounted_price': discounted_price,
            'stock_quantity': self.stock_quantity,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'main_image_url': self.main_image_url,
            'sku': self.sku,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'minimum_order': self.minimum_order if self.minimum_order is not None else 1,
            'unit_term': self.unit_term if self.unit_term else 'units',
            'item_location': self.item_location,
            'supplier_name': self.supplier_name,
            'discount_percentage': float(self.discount_percentage) if self.discount_percentage else None,
            'discount_start_date': self.discount_start_date.isoformat() if self.discount_start_date else None,
            'discount_end_date': self.discount_end_date.isoformat() if self.discount_end_date else None,
            'offer_id': self.offer_id,
            'offer': self.offer.to_dict() if self.offer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images': [img.to_dict() for img in sorted_images]
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'

class ProductImage(db.Model):
    """Product images model - stores multiple images for a product"""
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    image_url = db.Column(db.String(500), nullable=False)
    alt_text = db.Column(db.String(200))
    display_order = db.Column(db.Integer, default=0)  # For ordering images
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert product image to dictionary"""
        return {
            'id': self.id,
            'product_id': self.product_id,
            'image_url': self.image_url,
            'alt_text': self.alt_text,
            'display_order': self.display_order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ProductImage {self.id}>'

class Order(db.Model):
    """Order model for customer purchases"""
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False, index=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(50), default='pending', nullable=False)  # pending, on_transit, delivered, cancelled
    shipping_address = db.Column(db.Text, nullable=False)
    payment_status = db.Column(db.String(50), default='pending')  # pending, paid, failed, refunded
    payment_method = db.Column(db.String(50))
    payment_confirmation_message = db.Column(db.Text)  # Admin confirmation message/reference
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    deliveries = db.relationship('Delivery', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert order to dictionary"""
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'order_number': self.order_number,
            'total_amount': float(self.total_amount) if self.total_amount else None,
            'status': self.status,
            'shipping_address': self.shipping_address,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'payment_confirmation_message': self.payment_confirmation_message,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'order_items': [item.to_dict() for item in self.order_items],
            'deliveries': [delivery.to_dict() for delivery in self.deliveries]
        }
    
    def __repr__(self):
        return f'<Order {self.order_number}>'

class OrderItem(db.Model):
    """Order items model - products in an order"""
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else None,
            'subtotal': float(self.subtotal) if self.subtotal else None,
            'product': self.product.to_dict() if self.product else None
        }
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'

class Delivery(db.Model):
    """Delivery tracking model for order deliveries"""
    __tablename__ = 'deliveries'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    tracking_number = db.Column(db.String(100), unique=True, nullable=False, index=True)
    carrier = db.Column(db.String(100))  # e.g., 'FedEx', 'UPS', 'DHL'
    status = db.Column(db.String(50), default='pending', nullable=False)  # pending, on_transit, delivered
    estimated_delivery_date = db.Column(db.DateTime)
    actual_delivery_date = db.Column(db.DateTime)
    current_location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    delivery_updates = db.relationship('DeliveryUpdate', backref='delivery', lazy=True, cascade='all, delete-orphan', order_by='DeliveryUpdate.created_at')
    
    def to_dict(self):
        """Convert delivery to dictionary"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'tracking_number': self.tracking_number,
            'carrier': self.carrier,
            'status': self.status,
            'estimated_delivery_date': self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'current_location': self.current_location,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'delivery_updates': [update.to_dict() for update in self.delivery_updates]
        }
    
    def __repr__(self):
        return f'<Delivery {self.tracking_number}>'

class DeliveryUpdate(db.Model):
    """Delivery status updates/tracking history"""
    __tablename__ = 'delivery_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    delivery_id = db.Column(db.Integer, db.ForeignKey('deliveries.id'), nullable=False, index=True)
    status = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert delivery update to dictionary"""
        return {
            'id': self.id,
            'delivery_id': self.delivery_id,
            'status': self.status,
            'location': self.location,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<DeliveryUpdate {self.status}>'
