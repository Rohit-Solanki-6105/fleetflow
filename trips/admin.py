from django.contrib import admin
from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Admin configuration for Trip model"""
    
    list_display = [
        'trip_id', 'vehicle', 'driver', 'pickup_location',
        'dropoff_location', 'status', 'scheduled_pickup_time', 'created_at'
    ]
    list_filter = ['status', 'scheduled_pickup_time', 'created_at']
    search_fields = [
        'trip_id', 'pickup_location', 'dropoff_location',
        'vehicle__vehicle_id', 'driver__driver_id'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'duration_hours',
        'is_delayed', 'calculated_distance_km'
    ]
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('trip_id', 'vehicle', 'driver', 'status')
        }),
        ('Route', {
            'fields': (
                'pickup_location', 'pickup_address', 'pickup_coordinates',
                'dropoff_location', 'dropoff_address', 'dropoff_coordinates'
            )
        }),
        ('Cargo', {
            'fields': ('cargo_description', 'cargo_weight_kg', 'cargo_value')
        }),
        ('Schedule', {
            'fields': (
                'scheduled_pickup_time', 'scheduled_delivery_time',
                'actual_pickup_time', 'actual_delivery_time', 'duration_hours', 'is_delayed'
            )
        }),
        ('Metrics', {
            'fields': (
                'estimated_distance_km', 'actual_distance_km', 'calculated_distance_km',
                'start_odometer_km', 'end_odometer_km'
            )
        }),
        ('Additional Info', {
            'fields': ('notes', 'cancellation_reason', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
