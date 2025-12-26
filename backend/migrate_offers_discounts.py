import sys
from flask import Flask
from Main.app import create_app, db
from sqlalchemy import text, inspect

def column_exists(engine, table_name, column_name):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return any(c['name'] == column_name for c in columns)

def table_exists(engine, table_name):
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def migrate_offers_and_discounts():
    app = create_app('development')
    
    with app.app_context():
        print("Starting database migration for offers and discounts...")
        print()
        
        # Create offers table if it doesn't exist
        if not table_exists(db.engine, 'offers'):
            print("Creating 'offers' table...")
            db.session.execute(text("""
                CREATE TABLE offers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    start_date DATETIME NOT NULL,
                    end_date DATETIME NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("  ✓ 'offers' table created")
        else:
            print("  → 'offers' table already exists")
        
        print()
        print("Adding columns to 'products' table...")
        print()
        
        # Add columns to products table
        columns_to_add = [
            {
                'name': 'is_featured',
                'definition': 'is_featured BOOLEAN NOT NULL DEFAULT 0',
                'description': 'Featured product flag (Boolean, default=False)'
            },
            {
                'name': 'discount_percentage',
                'definition': 'discount_percentage NUMERIC(5, 2)',
                'description': 'Discount percentage (Numeric, nullable)'
            },
            {
                'name': 'discount_start_date',
                'definition': 'discount_start_date DATETIME',
                'description': 'Discount start date (DateTime, nullable)'
            },
            {
                'name': 'discount_end_date',
                'definition': 'discount_end_date DATETIME',
                'description': 'Discount end date (DateTime, nullable)'
            },
            {
                'name': 'offer_id',
                'definition': 'offer_id INTEGER',
                'description': 'Associated offer ID (Integer, nullable, Foreign Key)'
            }
        ]
        
        added_columns = []
        existing_columns = []
        
        try:
            for column_info in columns_to_add:
                column_name = column_info['name']
                column_def = column_info['definition']
                description = column_info['description']
                
                if column_exists(db.engine, 'products', column_name):
                    print(f"  → {column_name}: already exists (skipping)")
                    existing_columns.append(column_name)
                else:
                    print(f"  → {column_name}: adding column...")
                    db.session.execute(text(f'ALTER TABLE products ADD COLUMN {column_def}'))
                    added_columns.append(column_name)
            
            # Add foreign key constraint for offer_id if it doesn't exist
            # Note: SQLite doesn't support adding foreign key constraints after table creation
            # So we'll skip this step for SQLite, but document it for other databases
            print()
            print("  → Foreign key constraint: SQLite doesn't support adding FK constraints after table creation")
            print("    If using PostgreSQL/MySQL, add: ALTER TABLE products ADD CONSTRAINT fk_offer FOREIGN KEY (offer_id) REFERENCES offers(id)")
            
            db.session.commit()
            
            print()
            print("Migration Summary:")
            if added_columns:
                print(f"  ✓ Successfully added columns: {', '.join(added_columns)}")
            else:
                print("  ✓ No new columns were added.")
            
            if existing_columns:
                print(f"  ℹ️ Columns already existed: {', '.join(existing_columns)}")
            
            print("Database migration completed successfully.")
            return True
        
        except Exception as e:
            db.session.rollback()
            print(f"\nError during migration: {e}")
            print("Database migration rolled back.")
            return False

if __name__ == '__main__':
    success = migrate_offers_and_discounts()
    sys.exit(0 if success else 1)

