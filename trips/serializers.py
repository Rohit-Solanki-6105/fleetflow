from rest_framework import serializers
from django.utils import timezone
from .models import Trip
from vehicles.serializers import VehicleSummarySerializer
from drivers.serializers import DriverSummarySerializer


class TripSerializer(serializers.ModelSerializer):
    """Serializer for Trip model"""
    
    vehicle_details = VehicleSummarySerializer(source='vehicle', read_only=True)
    driver_details = DriverSummarySerializer(source='driver', read_only=True)
    duration_hours = serializers.ReadOnlyField()
    is_delayed = serializers.ReadOnlyField()
    calculated_distance_km = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Trip
        fields = [
            'id', 'trip_id', 'vehicle', 'vehicle_details', 'driver', 'driver_details',
            'pickup_location', 'pickup_address', 'pickup_coordinates',
            'dropoff_location', 'dropoff_address', 'dropoff_coordinates',
            'cargo_description', 'cargo_weight_kg', 'cargo_value',
            'scheduled_pickup_time', 'scheduled_delivery_time',
            'actual_pickup_time', 'actual_delivery_time',
            'estimated_distance_km', 'actual_distance_km', 'calculated_distance_km',
            'start_odometer_km', 'end_odometer_km',
            'status', 'duration_hours', 'is_delayed', 'notes',
            'cancellation_reason', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class TripCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating trips with validation"""
    
    class Meta:
        model = Trip
        fields = [
            'trip_id', 'vehicle', 'driver',
            'pickup_location', 'pickup_address', 'pickup_coordinates',
            'dropoff_location', 'dropoff_address', 'dropoff_coordinates',
            'cargo_description', 'cargo_weight_kg', 'cargo_value',
            'scheduled_pickup_time', 'scheduled_delivery_time',
            'estimated_distance_km', 'notes'
        ]
        read_only_fields = ['trip_id']
    
    def validate(self, data):
        """Validate trip creation business rules"""
        vehicle = data.get('vehicle')
        driver = data.get('driver')
        cargo_weight = data.get('cargo_weight_kg')
        
        # Validate vehicle availability
        if not vehicle.is_available_for_trip:
            raise serializers.ValidationError({
                'vehicle': f'Vehicle {vehicle.vehicle_id} is not available (Status: {vehicle.get_status_display()})'
            })
        
        # Validate cargo weight
        if cargo_weight > vehicle.max_capacity_kg:
            raise serializers.ValidationError({
                'cargo_weight_kg': f'Cargo weight ({cargo_weight}kg) exceeds vehicle capacity ({vehicle.max_capacity_kg}kg)'
            })
        
        # Validate driver availability
        if not driver.is_available_for_trip:
            if not driver.is_license_valid:
                raise serializers.ValidationError({
                    'driver': f'Driver {driver.driver_id} has an expired license'
                })
            raise serializers.ValidationError({
                'driver': f'Driver {driver.driver_id} is not available (Status: {driver.get_status_display()})'
            })
        
        # Validate schedule times
        scheduled_pickup = data.get('scheduled_pickup_time')
        scheduled_delivery = data.get('scheduled_delivery_time')
        
        if scheduled_pickup < timezone.now():
            raise serializers.ValidationError({
                'scheduled_pickup_time': 'Pickup time cannot be in the past'
            })
        
        if scheduled_delivery <= scheduled_pickup:
            raise serializers.ValidationError({
                'scheduled_delivery_time': 'Delivery time must be after pickup time'
            })
        
        return data


class TripUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating trips"""
    
    class Meta:
        model = Trip
        fields = [
            'pickup_location', 'pickup_address', 'pickup_coordinates',
            'dropoff_location', 'dropoff_address', 'dropoff_coordinates',
            'cargo_description', 'cargo_weight_kg', 'cargo_value',
            'scheduled_pickup_time', 'scheduled_delivery_time',
            'estimated_distance_km', 'notes'
        ]
    
    def validate(self, data):
        """Only allow updates for draft trips"""
        if self.instance.status != Trip.Status.DRAFT:
            raise serializers.ValidationError(
                "Can only update trips in DRAFT status"
            )
        return data


class TripDispatchSerializer(serializers.Serializer):
    """Serializer for dispatching a trip"""
    
    start_odometer_km = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )


class TripCompleteSerializer(serializers.Serializer):
    """Serializer for completing a trip"""
    
    end_odometer_km = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    actual_distance_km = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        required=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class TripCancelSerializer(serializers.Serializer):
    """Serializer for cancelling a trip"""
    
    cancellation_reason = serializers.CharField(required=True)
