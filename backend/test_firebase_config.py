#!/usr/bin/env python3
"""
Test script to verify Firebase credentials are being loaded from .env file
"""
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 80)
print("Testing Firebase Credentials Configuration")
print("=" * 80)

# Check if FIREBASE_CREDENTIALS_JSON is set
firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS_JSON')

if firebase_creds_json:
    print("✓ FIREBASE_CREDENTIALS_JSON environment variable is set")
    print(f"  Length: {len(firebase_creds_json)} characters")
    
    # Try to parse it as JSON
    try:
        cred_dict = json.loads(firebase_creds_json)
        print("✓ JSON is valid")
        print(f"  Project ID: {cred_dict.get('project_id', 'Not found')}")
        print(f"  Client Email: {cred_dict.get('client_email', 'Not found')}")
        print(f"  Type: {cred_dict.get('type', 'Not found')}")
        
        # Check if private key exists
        if cred_dict.get('private_key'):
            print("✓ Private key is present")
            pk = cred_dict.get('private_key', '')
            if pk.startswith('-----BEGIN PRIVATE KEY-----'):
                print("✓ Private key format is correct")
            else:
                print("⚠ Warning: Private key format may be incorrect")
        else:
            print("✗ Private key is missing")
            
        print("\n" + "=" * 80)
        print("SUCCESS: Firebase credentials are properly configured!")
        print("=" * 80)
        
    except json.JSONDecodeError as e:
        print(f"✗ ERROR: Invalid JSON format - {e}")
        print("=" * 80)
        exit(1)
    except Exception as e:
        print(f"✗ ERROR: {e}")
        print("=" * 80)
        exit(1)
else:
    print("✗ FIREBASE_CREDENTIALS_JSON environment variable is NOT set")
    print("\nPlease ensure:")
    print("1. You have a .env file in the backend directory")
    print("2. The .env file contains FIREBASE_CREDENTIALS_JSON=...")
    print("3. The .env file is in the correct format")
    print("=" * 80)
    exit(1)

