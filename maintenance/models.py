from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class MaintenanceRecord(models.Model):
    """Model for vehicle maintenance records"""
    
    class MaintenanceType(models.TextChoices):
        PREVENTIVE = 'PREVENTIVE', _('Preventive Maintenance')
        REPAIR = 'REPAIR', _('Repair')
        INSPECTION = 'INSPECTION', _('Inspection')
        OIL_CHANGE = 'OIL_CHANGE', _('Oil Change')
        TIRE_SERVICE = 'TIRE_SERVICE', _('Tire Service')
        BRAKE_SERVICE = 'BRAKE_SERVICE', _('Brake Service')
        ENGINE_REPAIR = 'ENGINE_REPAIR', _('Engine Repair')
        OTHER = 'OTHER', _('Other')
    
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    # Record Information
    record_id = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='maintenance_records'
    )
    
    # Maintenance Details
    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices
    )
    description = models.TextField()
    
    # Service Provider
    service_provider = models.CharField(max_length=200)
    technician_name = models.CharField(max_length=100, blank=True)
    
    # Schedule
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    
    # Odometer
    odometer_reading_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Cost
    labor_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0
    )
    parts_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True
    )
    
    # Additional
    notes = models.TextField(blank=True)
    attachments = models.FileField(
        upload_to='maintenance_documents/',
        blank=True,
        null=True,
        help_text="Service receipts, invoices, etc."
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_maintenance_records'
    )
    
    class Meta:
        db_table = 'maintenance_records'
        ordering = ['-scheduled_date', '-created_at']
        indexes = [
            models.Index(fields=['vehicle', 'status']),
            models.Index(fields=['-scheduled_date']),
        ]
    
    def __str__(self):
        return f"{self.record_id} - {self.vehicle.vehicle_id} - {self.get_maintenance_type_display()}"
    
    @property
    def total_cost(self):
        """Calculate total maintenance cost"""
        return self.labor_cost + self.parts_cost
    
    def save(self, *args, **kwargs):
        """Auto-generate record_id if not provided"""
        if not self.record_id:
            # Get the last maintenance record
            last_record = MaintenanceRecord.objects.order_by('-id').first()
            if last_record and last_record.record_id.startswith('MNT-'):
                try:
                    last_number = int(last_record.record_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.record_id = f'MNT-{new_number:06d}'
        super().save(*args, **kwargs)
