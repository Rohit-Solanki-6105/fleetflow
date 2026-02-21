from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    
    is_available_for_trip = serializers.ReadOnlyField()
    total_maintenance_cost = serializers.ReadOnlyField()
    total_fuel_cost = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_id', 'name', 'vehicle_type', 'make', 'model', 'year',
            'license_plate', 'vin', 'max_capacity_kg', 'fuel_capacity_liters',
            'current_odometer_km', 'status', 'acquisition_cost', 'acquisition_date',
            'notes', 'is_available_for_trip', 'total_maintenance_cost', 
            'total_fuel_cost', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def validate_license_plate(self, value):
        """Validate license plate uniqueness"""
        if self.instance:
            # Update scenario
            if Vehicle.objects.exclude(pk=self.instance.pk).filter(license_plate=value).exists():
                raise serializers.ValidationError("This license plate is already registered.")
        else:
            # Create scenario
            if Vehicle.objects.filter(license_plate=value).exists():
                raise serializers.ValidationError("This license plate is already registered.")
        return value.upper()


class VehicleCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = [
            'vehicle_id', 'name', 'vehicle_type', 'make', 'model', 'year',
            'license_plate', 'vin', 'max_capacity_kg', 'fuel_capacity_liters',
            'current_odometer_km', 'status', 'acquisition_cost', 'acquisition_date',
            'notes'
        ]
    
    def validate_status(self, value):
        """Prevent status changes that violate business rules"""
        if self.instance and self.instance.status == Vehicle.Status.ON_TRIP:
            if value != Vehicle.Status.ON_TRIP:
                # Check if there's an active trip
                if self.instance.trips.filter(status__in=['DRAFT', 'DISPATCHED']).exists():
                    raise serializers.ValidationError(
                        "Cannot change status while vehicle has active trips."
                    )
        return value


class VehicleSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns and listings"""
    
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_id', 'name', 'vehicle_type', 'status', 'max_capacity_kg']
