from rest_framework import serializers
from .models import MaintenanceRecord
from vehicles.serializers import VehicleSummarySerializer


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceRecord model"""
    
    vehicle_details = VehicleSummarySerializer(source='vehicle', read_only=True)
    total_cost = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'record_id', 'vehicle', 'vehicle_details',
            'maintenance_type', 'description', 'service_provider',
            'technician_name', 'scheduled_date', 'completed_date',
            'odometer_reading_km', 'labor_cost', 'parts_cost', 'total_cost',
            'status', 'notes', 'attachments', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class MaintenanceRecordCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating maintenance records"""
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'record_id', 'vehicle', 'maintenance_type', 'description',
            'service_provider', 'technician_name', 'scheduled_date',
            'completed_date', 'odometer_reading_km', 'labor_cost',
            'parts_cost', 'status', 'notes', 'attachments'
        ]
        read_only_fields = ['record_id']
    
    def validate(self, data):
        """Validate maintenance record data"""
        status_val = data.get('status', self.instance.status if self.instance else None)
        completed_date = data.get('completed_date')
        scheduled_date = data.get('scheduled_date', self.instance.scheduled_date if self.instance else None)
        
        # If marking as completed, require completed_date
        if status_val == MaintenanceRecord.Status.COMPLETED and not completed_date:
            raise serializers.ValidationError({
                'completed_date': 'Completed date is required when status is COMPLETED'
            })
        
        # Completed date should not be before scheduled date
        if completed_date and scheduled_date and completed_date < scheduled_date:
            raise serializers.ValidationError({
                'completed_date': 'Completed date cannot be before scheduled date'
            })
        
        return data
