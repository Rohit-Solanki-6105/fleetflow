from rest_framework import serializers
from .models import FuelExpense, OtherExpense
from vehicles.serializers import VehicleSummarySerializer


class FuelExpenseSerializer(serializers.ModelSerializer):
    """Serializer for FuelExpense model"""
    
    vehicle_details = VehicleSummarySerializer(source='vehicle', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = FuelExpense
        fields = [
            'id', 'expense_id', 'vehicle', 'vehicle_details', 'trip',
            'date', 'fuel_type', 'liters', 'price_per_liter', 'total_cost',
            'fuel_station', 'location', 'odometer_reading_km',
            'receipt_number', 'notes', 'receipt_image',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_cost', 'created_at', 'updated_at', 'created_by']


class FuelExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating fuel expenses"""
    
    class Meta:
        model = FuelExpense
        fields = [
            'expense_id', 'vehicle', 'trip', 'date', 'fuel_type',
            'liters', 'price_per_liter', 'fuel_station', 'location',
            'odometer_reading_km', 'receipt_number', 'notes', 'receipt_image'
        ]


class OtherExpenseSerializer(serializers.ModelSerializer):
    """Serializer for OtherExpense model"""
    
    vehicle_details = VehicleSummarySerializer(source='vehicle', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = OtherExpense
        fields = [
            'id', 'expense_id', 'vehicle', 'vehicle_details', 'trip',
            'expense_type', 'date', 'amount', 'description', 'vendor',
            'receipt_number', 'notes', 'receipt_image',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class OtherExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating other expenses"""
    
    class Meta:
        model = OtherExpense
        fields = [
            'expense_id', 'vehicle', 'trip', 'expense_type', 'date',
            'amount', 'description', 'vendor', 'receipt_number',
            'notes', 'receipt_image'
        ]
