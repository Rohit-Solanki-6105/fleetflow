#!/usr/bin/env python
"""
Quick script to create a superuser for FleetFlow
Run: python create_superuser.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fleetflow.settings')
django.setup()

from accounts.models import User

def create_superuser():
    print("=" * 50)
    print("FleetFlow Superuser Creation")
    print("=" * 50)
    
    email = input("Email address: ").strip()
    first_name = input("First name: ").strip()
    last_name = input("Last name: ").strip()
    password = input("Password: ").strip()
    
    try:
        if User.objects.filter(email=email).exists():
            print(f"\n❌ Error: User with email {email} already exists!")
            return
        
        user = User.objects.create_superuser(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role='ADMIN'
        )
        
        print(f"\n✅ Superuser created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.get_full_name()}")
        print(f"   Role: {user.role}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        print("\nYou can now login at http://localhost:3000/login")
        
    except Exception as e:
        print(f"\n❌ Error creating superuser: {str(e)}")

if __name__ == "__main__":
    create_superuser()
