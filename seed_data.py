#!/usr/bin/env python
"""
Seed script to populate FleetFlow with sample data
Run: python seed_data.py
"""
import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fleetflow.settings')
django.setup()

from accounts.models import User
from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip

def seed_data():
    print("=" * 50)
    print("FleetFlow Sample Data Seeder")
    print("=" * 50)
    
    # Get or create admin user
    admin, created = User.objects.get_or_create(
        email='admin@fleetflow.com',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"✅ Created admin user: admin@fleetflow.com / admin123")
    else:
        print(f"ℹ️  Admin user already exists")
    
    # Create sample vehicles
    vehicles_data = [
        {
            'vehicle_id': 'VH-101',
            'name': 'Volvo FH16 101',
            'vehicle_type': 'TRUCK',
            'make': 'Volvo',
            'model': 'FH16',
            'year': 2022,
            'license_plate': 'XYZ-1234',
            'vin': 'VLV1234567890101',
            'max_capacity_kg': Decimal('24000.00'),
            'fuel_capacity_liters': Decimal('500.00'),
            'status': 'AVAILABLE'
        },
        {
            'vehicle_id': 'VH-102',
            'name': 'Scania R500 102',
            'vehicle_type': 'TRUCK',
            'make': 'Scania',
            'model': 'R500',
            'year': 2021,
            'license_plate': 'ABC-9876',
            'vin': 'SCA9876543210102',
            'max_capacity_kg': Decimal('24000.00'),
            'fuel_capacity_liters': Decimal('480.00'),
            'status': 'AVAILABLE'
        },
        {
            'vehicle_id': 'VH-103',
            'name': 'Mercedes-Benz Actros 103',
            'vehicle_type': 'TRUCK',
            'make': 'Mercedes-Benz',
            'model': 'Actros',
            'year': 2023,
            'license_plate': 'LMN-4567',
            'vin': 'MER4567890123103',
            'max_capacity_kg': Decimal('18000.00'),
            'fuel_capacity_liters': Decimal('400.00'),
            'status': 'AVAILABLE'
        },
        {
            'vehicle_id': 'VH-104',
            'name': 'MAN TGX 104',
            'vehicle_type': 'TRUCK',
            'make': 'MAN',
            'model': 'TGX',
            'year': 2022,
            'license_plate': 'PQR-3321',
            'vin': 'MAN3321987654104',
            'max_capacity_kg': Decimal('20000.00'),
            'fuel_capacity_liters': Decimal('450.00'),
            'status': 'AVAILABLE'
        },
        {
            'vehicle_id': 'VH-105',
            'name': 'DAF XF 105',
            'vehicle_type': 'TRUCK',
            'make': 'DAF',
            'model': 'XF',
            'year': 2020,
            'license_plate': 'DEF-8899',
            'vin': 'DAF8899112233105',
            'max_capacity_kg': Decimal('22000.00'),
            'fuel_capacity_liters': Decimal('460.00'),
            'status': 'IN_SHOP'
        }
    ]
    
    created_vehicles = []
    for veh_data in vehicles_data:
        vehicle, created = Vehicle.objects.get_or_create(
            vehicle_id=veh_data['vehicle_id'],
            defaults={**veh_data, 'created_by': admin}
        )
        if created:
            print(f"✅ Created vehicle: {vehicle.vehicle_id} - {vehicle.make} {vehicle.model}")
        else:
            print(f"ℹ️  Vehicle already exists: {vehicle.vehicle_id}")
        created_vehicles.append(vehicle)
    
    # Create sample drivers
    drivers_data = [
        {
            'driver_id': 'DR-001',
            'first_name': 'Alex',
            'last_name': 'Mercer',
            'email': 'alex.mercer@fleetflow.com',
            'phone_number': '+1-555-0101',
            'date_of_birth': datetime(1985, 5, 15).date(),
            'address': '123 Main St, New York, NY 10001',
            'license_number': 'DL123456789',
            'license_type': 'CDL-A',
            'license_expiry_date': datetime.now().date() + timedelta(days=365),
            'license_state': 'New York',
            'hire_date': datetime(2020, 3, 1).date(),
            'status': 'ON_DUTY'
        },
        {
            'driver_id': 'DR-002',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'email': 'sarah.connor@fleetflow.com',
            'phone_number': '+1-555-0102',
            'date_of_birth': datetime(1990, 8, 22).date(),
            'address': '456 Oak Ave, Chicago, IL 60601',
            'license_number': 'DL987654321',
            'license_type': 'CDL-A',
            'license_expiry_date': datetime.now().date() + timedelta(days=400),
            'license_state': 'Illinois',
            'hire_date': datetime(2019, 6, 15).date(),
            'status': 'ON_TRIP'
        },
        {
            'driver_id': 'DR-003',
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@fleetflow.com',
            'phone_number': '+1-555-0103',
            'date_of_birth': datetime(1988, 12, 10).date(),
            'address': '789 Pine Rd, Los Angeles, CA 90001',
            'license_number': 'DL456789123',
            'license_type': 'CDL-B',
            'license_expiry_date': datetime.now().date() + timedelta(days=300),
            'license_state': 'California',
            'hire_date': datetime(2021, 1, 20).date(),
            'status': 'OFF_DUTY'
        },
        {
            'driver_id': 'DR-004',
            'first_name': 'Emma',
            'last_name': 'Davis',
            'email': 'emma.davis@fleetflow.com',
            'phone_number': '+1-555-0104',
            'date_of_birth': datetime(1992, 3, 5).date(),
            'address': '321 Elm St, Boston, MA 02101',
            'license_number': 'DL789123456',
            'license_type': 'CDL-A',
            'license_expiry_date': datetime.now().date() + timedelta(days=450),
            'license_state': 'Massachusetts',
            'hire_date': datetime(2018, 9, 10).date(),
            'status': 'ON_DUTY'
        }
    ]
    
    created_drivers = []
    for drv_data in drivers_data:
        driver, created = Driver.objects.get_or_create(
            driver_id=drv_data['driver_id'],
            defaults={**drv_data, 'created_by': admin}
        )
        if created:
            print(f"✅ Created driver: {driver.driver_id} - {driver.first_name} {driver.last_name}")
        else:
            print(f"ℹ️  Driver already exists: {driver.driver_id}")
        created_drivers.append(driver)
    
    # Create sample trips
    trips_data = [
        {
            'trip_id': 'TRP-9001',
            'vehicle': created_vehicles[0],
            'driver': created_drivers[0],
            'pickup_location': 'New York, NY',
            'pickup_address': '123 Main St, New York, NY 10001',
            'dropoff_location': 'Boston, MA',
            'dropoff_address': '456 Harbor St, Boston, MA 02101',
            'cargo_weight_kg': Decimal('15000.00'),
            'cargo_description': 'Electronics and machinery parts',
            'scheduled_pickup_time': datetime.now() + timedelta(hours=2),
            'scheduled_delivery_time': datetime.now() + timedelta(hours=8),
            'status': 'DISPATCHED'
        },
        {
            'trip_id': 'TRP-9002',
            'vehicle': created_vehicles[1],
            'driver': created_drivers[1],
            'pickup_location': 'Chicago, IL',
            'pickup_address': '789 Lake Shore Dr, Chicago, IL 60611',
            'dropoff_location': 'Detroit, MI',
            'dropoff_address': '321 Michigan Ave, Detroit, MI 48201',
            'cargo_weight_kg': Decimal('18000.00'),
            'cargo_description': 'Automotive parts',
            'scheduled_pickup_time': datetime.now() - timedelta(hours=5),
            'scheduled_delivery_time': datetime.now() + timedelta(hours=1),
            'status': 'IN_PROGRESS'
        },
        {
            'trip_id': 'TRP-9003',
            'vehicle': created_vehicles[2],
            'driver': created_drivers[2],
            'pickup_location': 'Los Angeles, CA',
            'pickup_address': '100 Sunset Blvd, Los Angeles, CA 90001',
            'dropoff_location': 'San Francisco, CA',
            'dropoff_address': '200 Market St, San Francisco, CA 94102',
            'cargo_weight_kg': Decimal('12000.00'),
            'cargo_description': 'Consumer goods',
            'scheduled_pickup_time': datetime.now() + timedelta(days=1),
            'scheduled_delivery_time': datetime.now() + timedelta(days=1, hours=6),
            'status': 'DRAFT'
        }
    ]
    
    for trip_data in trips_data:
        trip, created = Trip.objects.get_or_create(
            trip_id=trip_data['trip_id'],
            defaults={**trip_data, 'created_by': admin}
        )
        if created:
            print(f"✅ Created trip: {trip.trip_id} - {trip.pickup_location} → {trip.dropoff_location}")
        else:
            print(f"ℹ️  Trip already exists: {trip.trip_id}")
    
    print("\n" + "=" * 50)
    print("✅ Sample data seeding completed!")
    print("=" * 50)
    print("\nLogin Credentials:")
    print("  Email: admin@fleetflow.com")
    print("  Password: admin123")
    print("\nSummary:")
    print(f"  Vehicles: {Vehicle.objects.count()}")
    print(f"  Drivers: {Driver.objects.count()}")
    print(f"  Trips: {Trip.objects.count()}")
    print("\nStart the servers and login at http://localhost:3000/login")

if __name__ == "__main__":
    seed_data()
