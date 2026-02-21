from django.contrib import admin
from .models import FuelExpense, OtherExpense


@admin.register(FuelExpense)
class FuelExpenseAdmin(admin.ModelAdmin):
    """Admin configuration for FuelExpense model"""
    
    list_display = [
        'expense_id', 'vehicle', 'date', 'fuel_type',
        'liters', 'total_cost', 'fuel_station'
    ]
    list_filter = ['fuel_type', 'date']
    search_fields = ['expense_id', 'vehicle__vehicle_id', 'fuel_station', 'receipt_number']
    readonly_fields = ['created_at', 'updated_at', 'total_cost']
    
    fieldsets = (
        ('Expense Information', {
            'fields': ('expense_id', 'vehicle', 'trip', 'date')
        }),
        ('Fuel Details', {
            'fields': ('fuel_type', 'liters', 'price_per_liter', 'total_cost')
        }),
        ('Location', {
            'fields': ('fuel_station', 'location', 'odometer_reading_km')
        }),
        ('Additional Info', {
            'fields': ('receipt_number', 'notes', 'receipt_image', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OtherExpense)
class OtherExpenseAdmin(admin.ModelAdmin):
    """Admin configuration for OtherExpense model"""
    
    list_display = [
        'expense_id', 'vehicle', 'expense_type', 'date',
        'amount', 'vendor'
    ]
    list_filter = ['expense_type', 'date']
    search_fields = ['expense_id', 'vehicle__vehicle_id', 'description', 'vendor', 'receipt_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Expense Information', {
            'fields': ('expense_id', 'vehicle', 'trip', 'expense_type', 'date')
        }),
        ('Details', {
            'fields': ('amount', 'description', 'vendor')
        }),
        ('Additional Info', {
            'fields': ('receipt_number', 'notes', 'receipt_image', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
