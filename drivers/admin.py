from django.contrib import admin
from .models import Driver


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    """Admin configuration for Driver model"""
    
    list_display = [
        'driver_id', 'get_full_name', 'email', 'status',
        'license_expiry_date', 'safety_score', 'total_trips_completed'
    ]
    list_filter = ['status', 'license_type', 'license_expiry_date', 'hire_date']
    search_fields = ['driver_id', 'first_name', 'last_name', 'email', 'license_number']
    readonly_fields = [
        'created_at', 'updated_at', 'total_trips_completed', 
        'total_distance_km', 'is_license_valid', 'days_until_license_expiry',
        'completion_rate'
    ]
    
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'driver_id', 'first_name', 'last_name', 'email',
                'phone_number', 'date_of_birth', 'address', 'photo'
            )
        }),
        ('License Information', {
            'fields': (
                'license_number', 'license_type', 'license_expiry_date',
                'license_state', 'is_license_valid', 'days_until_license_expiry'
            )
        }),
        ('Employment', {
            'fields': ('hire_date', 'status')
        }),
        ('Performance', {
            'fields': (
                'safety_score', 'total_trips_completed', 'total_distance_km',
                'completion_rate'
            )
        }),
        ('Additional Info', {
            'fields': ('notes', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Name'
