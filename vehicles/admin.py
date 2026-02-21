from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Admin configuration for Vehicle model"""
    
    list_display = [
        'vehicle_id', 'name', 'vehicle_type', 'license_plate',
        'status', 'max_capacity_kg', 'current_odometer_km', 'created_at'
    ]
    list_filter = ['status', 'vehicle_type', 'created_at']
    search_fields = ['vehicle_id', 'name', 'license_plate', 'make', 'model']
    readonly_fields = ['created_at', 'updated_at', 'total_maintenance_cost', 'total_fuel_cost']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vehicle_id', 'name', 'vehicle_type', 'make', 'model', 'year')
        }),
        ('Identification', {
            'fields': ('license_plate', 'vin')
        }),
        ('Specifications', {
            'fields': ('max_capacity_kg', 'fuel_capacity_liters')
        }),
        ('Operational', {
            'fields': ('current_odometer_km', 'status')
        }),
        ('Financial', {
            'fields': ('acquisition_cost', 'acquisition_date', 'total_maintenance_cost', 'total_fuel_cost')
        }),
        ('Additional Info', {
            'fields': ('notes', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
