#!/usr/bin/env python
"""
Script to add new columns to the products table.

This script adds the following columns to the products table:
- minimum_order (Integer, default=1)
- unit_term (String(50), default='units')
- item_location (String(200))
- supplier_name (String(200))

Usage:
    python migrate_products.py

The script will check if columns already exist before adding them.
"""

import sys
import os

from Main.app import create_app, db
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError


def column_exists(engine, table_name, column_name):
    """
    Check if a column exists in a table.
    
    Args:
        engine: SQLAlchemy engine object
        table_name: Name of the table
        column_name: Name of the column to check
    
    Returns:
        bool: True if column exists, False otherwise
    """
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def add_column(table_name, column_definition):
    """
    Add a column to a table using raw SQL.
    
    Args:
        table_name: Name of the table
        column_definition: SQL column definition (e.g., "column_name INTEGER DEFAULT 1")
    """
    sql = f"ALTER TABLE {table_name} ADD COLUMN {column_definition}"
    db.session.execute(text(sql))
    db.session.commit()


def migrate_products_table():
    """
    Add new columns to the products table if they don't exist.
    """
    app = create_app('development')
    
    with app.app_context():
        try:
            print("=" * 60)
            print("Products Table Migration Script")
            print("=" * 60)
            print()
            
            # Check if products table exists
            inspector = inspect(db.engine)
            if 'products' not in inspector.get_table_names():
                print("✗ Error: 'products' table does not exist.")
                print("  Please run the application first to create the tables.")
                return False
            
            print("✓ Products table found")
            print()
            
            columns_to_add = [
                {
                    'name': 'minimum_order',
                    'definition': 'minimum_order INTEGER DEFAULT 1',
                    'description': 'Minimum order quantity (Integer, default=1)'
                },
                {
                    'name': 'unit_term',
                    'definition': 'unit_term VARCHAR(50) DEFAULT \'units\'',
                    'description': 'Unit term (String, default=\'units\')'
                },
                {
                    'name': 'item_location',
                    'definition': 'item_location VARCHAR(200)',
                    'description': 'Item location (String, nullable)'
                },
                {
                    'name': 'supplier_name',
                    'definition': 'supplier_name VARCHAR(200)',
                    'description': 'Supplier name (String, nullable)'
                }
            ]
            
            added_columns = []
            existing_columns = []
            
            print("Checking existing columns...")
            print()
            
            try:
                for column_info in columns_to_add:
                    column_name = column_info['name']
                    column_def = column_info['definition']
                    description = column_info['description']
                    
                    if column_exists(db.engine, 'products', column_name):
                        print(f"  → {column_name}: already exists (skipping)")
                        existing_columns.append(column_name)
                    else:
                        print(f"  → {column_name}: adding... ", end='', flush=True)
                        add_column('products', column_def)
                        print("✓")
                        added_columns.append(column_name)
                
                print()
                print("=" * 60)
                print("Migration Summary")
                print("=" * 60)
                
                if added_columns:
                    print(f"✓ Successfully added {len(added_columns)} column(s):")
                    for col in added_columns:
                        print(f"  - {col}")
                else:
                    print("ℹ No new columns were added.")
                
                if existing_columns:
                    print(f"\nℹ {len(existing_columns)} column(s) already existed:")
                    for col in existing_columns:
                        print(f"  - {col}")
                
                print()
                print("=" * 60)
                print("✓ Migration completed successfully!")
                print("=" * 60)
                
                return True
                
            except SQLAlchemyError as e:
                db.session.rollback()
                print(f"\n✗ Error during migration: {str(e)}")
                print("\nRolling back changes...")
                return False
                
        except OperationalError as e:
            print(f"✗ Database error: {str(e)}")
            print("\nPlease ensure:")
            print("  1. The database file exists")
            print("  2. You have write permissions")
            print("  3. The database is not locked by another process")
            return False
        except Exception as e:
            print(f"✗ Unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    success = migrate_products_table()
    sys.exit(0 if success else 1)

