from rest_framework import serializers
from django.utils import timezone
from .models import Driver


class DriverSerializer(serializers.ModelSerializer):
    """Serializer for Driver model"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_license_valid = serializers.ReadOnlyField()
    is_available_for_trip = serializers.ReadOnlyField()
    days_until_license_expiry = serializers.ReadOnlyField()
    completion_rate = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Driver
        fields = [
            'id', 'driver_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'date_of_birth', 'address',
            'license_number', 'license_type', 'license_expiry_date', 'license_state',
            'hire_date', 'status', 'safety_score', 'total_trips_completed',
            'total_distance_km', 'is_license_valid', 'is_available_for_trip',
            'days_until_license_expiry', 'completion_rate', 'notes', 'photo',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_trips_completed', 'total_distance_km',
            'created_at', 'updated_at', 'created_by'
        ]
    
    def validate_license_expiry_date(self, value):
        """Ensure license expiry date is not in the past"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "License expiry date cannot be in the past."
            )
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if self.instance:
            if Driver.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
                raise serializers.ValidationError("This email is already registered.")
        else:
            if Driver.objects.filter(email=value).exists():
                raise serializers.ValidationError("This email is already registered.")
        return value.lower()


class DriverCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating drivers"""
    
    class Meta:
        model = Driver
        fields = [
            'driver_id', 'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'address', 'license_number', 'license_type',
            'license_expiry_date', 'license_state', 'hire_date', 'status',
            'safety_score', 'notes', 'photo'
        ]
        read_only_fields = ['driver_id']
    
    def validate_status(self, value):
        """Prevent status changes that violate business rules"""
        if self.instance and self.instance.status == Driver.Status.ON_TRIP:
            if value != Driver.Status.ON_TRIP:
                # Check if there's an active trip
                if self.instance.trips.filter(status__in=['DRAFT', 'DISPATCHED']).exists():
                    raise serializers.ValidationError(
                        "Cannot change status while driver has active trips."
                    )
        return value


class DriverSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns and listings"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_license_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = Driver
        fields = [
            'id', 'driver_id', 'full_name', 'status',
            'is_license_valid', 'safety_score'
        ]
