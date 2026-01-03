#!/usr/bin/env python3
"""
Helper script to convert Firebase ServiceAccountKey.json to .env format
Run this script to generate the FIREBASE_CREDENTIALS_JSON value for your .env file
"""
import json
import os

def convert_json_to_env_string(json_file_path):
    """Convert JSON file to a single-line string suitable for .env file"""
    try:
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        
        # Convert back to JSON string (single line, with escaped newlines)
        json_string = json.dumps(data, separators=(',', ':'))
        
        return json_string
    except FileNotFoundError:
        print(f"Error: File '{json_file_path}' not found")
        return None
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON file - {e}")
        return None

if __name__ == "__main__":
    # Default to ServiceAccountKey.json in current directory
    json_file = os.path.join(os.path.dirname(__file__), 'ServiceAccountKey.json')
    
    if not os.path.exists(json_file):
        print(f"Error: {json_file} not found")
        print("Please ensure ServiceAccountKey.json is in the backend directory")
        exit(1)
    
    env_string = convert_json_to_env_string(json_file)
    
    if env_string:
        print("\n" + "="*80)
        print("Add this line to your backend/.env file:")
        print("="*80)
        print(f"FIREBASE_CREDENTIALS_JSON={env_string}")
        print("="*80)
        print("\nNote: Make sure .env is in your .gitignore file!")
        print("="*80 + "\n")

