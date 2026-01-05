"""
Test script to verify DATABASE_URL is being read correctly from .env
"""
import os
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

# Get DATABASE_URL
database_url = os.getenv('DATABASE_URL')

if database_url:
    # Mask password for security
    masked_url = re.sub(r':([^:@]+)@', r':****@', database_url)
    print(f"✅ DATABASE_URL found in environment")
    print(f"   Connection string (masked): {masked_url}")
    print(f"   Protocol: {database_url.split('://')[0] if '://' in database_url else 'unknown'}")
    
    # Check if it's PostgreSQL
    if database_url.startswith('postgresql://'):
        print(f"   Database type: PostgreSQL")
        # Extract connection details
        try:
            # Parse the connection string
            # Format: postgresql://user:password@host:port/database
            match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', database_url)
            if match:
                user, password, host, port, database = match.groups()
                print(f"   Host: {host}")
                print(f"   Port: {port}")
                print(f"   Database: {database}")
                print(f"   User: {user}")
                print(f"   Password: {'****' if password else 'NOT SET'}")
        except Exception as e:
            print(f"   Error parsing connection string: {e}")
    elif database_url.startswith('sqlite'):
        print(f"   Database type: SQLite")
    else:
        print(f"   Database type: Unknown")
else:
    print("❌ DATABASE_URL not found in environment variables")
    print("   Make sure you have a .env file in the backend directory with DATABASE_URL set")

# Test if psycopg2 is available (needed for PostgreSQL)
try:
    import psycopg2
    print(f"\n✅ psycopg2 is installed (version: {psycopg2.__version__ if hasattr(psycopg2, '__version__') else 'unknown'})")
except ImportError:
    print(f"\n❌ psycopg2 is NOT installed")
    print("   Install it with: pip install psycopg2-binary")

print("\n" + "="*50)
print("To test the actual database connection, run:")
print("  python -c \"from Main.app import create_app, db; app = create_app(); app.app_context().push(); db.engine.connect()\"")
print("="*50)

