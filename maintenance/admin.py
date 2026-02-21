from django.contrib import admin
from .models import MaintenanceRecord


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    """Admin configuration for MaintenanceRecord model"""
    
    list_display = [
        'record_id', 'vehicle', 'maintenance_type', 'service_provider',
        'scheduled_date', 'status', 'total_cost', 'created_at'
    ]
    list_filter = ['status', 'maintenance_type', 'scheduled_date']
    search_fields = [
        'record_id', 'description', 'service_provider',
        'vehicle__vehicle_id'
    ]
    readonly_fields = ['created_at', 'updated_at', 'total_cost']
    
    fieldsets = (
        ('Record Information', {
            'fields': ('record_id', 'vehicle', 'status')
        }),
        ('Maintenance Details', {
            'fields': ('maintenance_type', 'description', 'service_provider', 'technician_name')
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'completed_date', 'odometer_reading_km')
        }),
        ('Cost', {
            'fields': ('labor_cost', 'parts_cost', 'total_cost')
        }),
        ('Additional Info', {
            'fields': ('notes', 'attachments', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
