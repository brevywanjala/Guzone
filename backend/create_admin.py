#!/usr/bin/env python
"""
Script to create admin accounts for Great East Trade application.

Usage:
    python create_admin.py
    
The script will prompt you for all required information interactively.
You can retry if any errors occur.
"""

import sys
import getpass
import platform

# Import msvcrt for Windows password input with asterisks
if platform.system() == 'Windows':
    import msvcrt
else:
    import termios
    import tty

from Main.app import create_app, db
from Models.users import User
from Models.admin import Admin


def get_password_with_asterisks(prompt="Password: "):
    """
    Get password input with asterisks displayed for each character typed.
    Works on both Windows and Unix-like systems.
    """
    password = []
    sys.stdout.write(prompt)
    sys.stdout.flush()
    
    if platform.system() == 'Windows':
        # Windows implementation using msvcrt
        while True:
            char = msvcrt.getch()
            if char == b'\r' or char == b'\n':  # Enter key
                sys.stdout.write('\n')
                sys.stdout.flush()
                break
            elif char == b'\x08':  # Backspace
                if len(password) > 0:
                    password.pop()
                    sys.stdout.write('\b \b')  # Move back, overwrite with space, move back again
                    sys.stdout.flush()
            else:
                password.append(char.decode('utf-8'))
                sys.stdout.write('*')
                sys.stdout.flush()
    else:
        # Unix/Linux/Mac implementation
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            while True:
                char = sys.stdin.read(1)
                if char == '\r' or char == '\n':  # Enter key
                    sys.stdout.write('\n')
                    break
                elif char == '\x7f' or char == '\b':  # Backspace
                    if len(password) > 0:
                        password.pop()
                        sys.stdout.write('\b \b')
                        sys.stdout.flush()
                elif char == '\x03':  # Ctrl+C
                    raise KeyboardInterrupt
                else:
                    password.append(char)
                    sys.stdout.write('*')
                    sys.stdout.flush()
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    
    return ''.join(password)


def create_admin_user(email, password, first_name, last_name, phone=None, department=None):
    """
    Create an admin user account.
    
    Args:
        email: Admin email address
        password: Admin password
        first_name: Admin first name
        last_name: Admin last name
        phone: Optional phone number
        department: Optional department
    
    Returns:
        tuple: (success: bool, message: str, user_dict: dict or None)
    """
    app = create_app('development')
    
    with app.app_context():
        try:
            # Check if email already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return False, f"Error: Email '{email}' is already registered.", None
            
            # Generate username from email prefix
            email_prefix = email.split('@')[0].lower()
            username = ''.join(c for c in email_prefix if c.isalnum())
            
            if not username:
                from datetime import datetime
                username = f'admin{int(datetime.utcnow().timestamp())}'
            
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f'{base_username}{counter}'
                counter += 1
            
            # Create user
            user = User(
                username=username,
                email=email,
                role='admin'
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.flush()  # Get user.id
            
            # Create admin profile
            admin = Admin(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                department=department
            )
            
            db.session.add(admin)
            db.session.commit()
            
            # Extract user data before the context closes
            user_dict = {
                'email': user.email,
                'username': user.username,
                'role': user.role
            }
            
            return True, f"Admin account created successfully!", user_dict
            
        except Exception as e:
            db.session.rollback()
            return False, f"Error creating admin account: {str(e)}", None


def get_user_input():
    """Get user input for admin account creation with validation and retry."""
    print("\n=== Create Admin Account ===\n")
    print("Enter the following information (or press Ctrl+C to cancel):\n")
    
    # Get email with validation
    while True:
        email = input("Email: ").strip()
        if not email:
            print("✗ Error: Email is required. Please try again.\n")
            continue
        if '@' not in email or '.' not in email.split('@')[-1]:
            print("✗ Error: Please enter a valid email address.\n")
            continue
        break
    
    # Get password with validation and confirmation
    while True:
        password = get_password_with_asterisks("Password (min 6 characters): ").strip()
        if not password:
            print("✗ Error: Password is required. Please try again.\n")
            continue
        if len(password) < 6:
            print("✗ Error: Password must be at least 6 characters long. Please try again.\n")
            continue
        
        confirm_password = get_password_with_asterisks("Confirm Password: ").strip()
        if password != confirm_password:
            print("✗ Error: Passwords do not match. Please try again.\n")
            continue
        break
    
    # Get first name
    while True:
        first_name = input("First Name: ").strip()
        if not first_name:
            print("✗ Error: First name is required. Please try again.\n")
            continue
        break
    
    # Get last name
    while True:
        last_name = input("Last Name: ").strip()
        if not last_name:
            print("✗ Error: Last name is required. Please try again.\n")
            continue
        break
    
    # Get optional phone
    phone_input = input("Phone (optional, press Enter to skip): ").strip()
    phone = phone_input if phone_input else None
    
    # Get optional department
    dept_input = input("Department (optional, press Enter to skip): ").strip()
    department = dept_input if dept_input else None
    
    return email, password, first_name, last_name, phone, department


def main():
    """Main function to create admin account interactively with retry capability."""
    while True:
        try:
            # Get user input
            email, password, first_name, last_name, phone, department = get_user_input()
            
            # Create admin account
            print("\nCreating admin account...")
            success, message, user_dict = create_admin_user(email, password, first_name, last_name, phone, department)
            
            if success:
                print(f"\n✓ {message}\n")
                print("=" * 50)
                print("Admin Account Details:")
                print("=" * 50)
                print(f"  Email:      {user_dict['email']}")
                print(f"  Username:   {user_dict['username']}")
                print(f"  Name:       {first_name} {last_name}")
                if phone:
                    print(f"  Phone:      {phone}")
                if department:
                    print(f"  Department: {department}")
                print(f"  Role:       {user_dict['role']}")
                print("=" * 50)
                print(f"\n✓ You can now login with email: {email}\n")
                break  # Success, exit the retry loop
            else:
                # Error occurred, show message and ask if user wants to retry
                print(f"\n✗ {message}\n")
                retry = input("Would you like to try again? (y/n): ").strip().lower()
                if retry not in ['y', 'yes']:
                    print("\nCancelled. Exiting...\n")
                    sys.exit(1)
                print()  # Empty line before retry
                continue  # Retry the loop
                
        except KeyboardInterrupt:
            print("\n\nCancelled by user. Exiting...\n")
            sys.exit(0)
        except Exception as e:
            print(f"\n✗ Unexpected error: {str(e)}\n")
            retry = input("Would you like to try again? (y/n): ").strip().lower()
            if retry not in ['y', 'yes']:
                print("\nExiting...\n")
                sys.exit(1)
            print()  # Empty line before retry
            continue


if __name__ == '__main__':
    main()

