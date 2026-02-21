from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Vehicle(models.Model):
    """Model for fleet vehicles"""
    
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('Available')
        ON_TRIP = 'ON_TRIP', _('On Trip')
        IN_SHOP = 'IN_SHOP', _('In Shop')
        RETIRED = 'RETIRED', _('Retired')
    
    class VehicleType(models.TextChoices):
        TRUCK = 'TRUCK', _('Truck')
        VAN = 'VAN', _('Van')
        BIKE = 'BIKE', _('Bike')
        TRAILER = 'TRAILER', _('Trailer')
    
    # Basic Info
    vehicle_id = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField(validators=[MinValueValidator(1900)])
    
    # Identification
    license_plate = models.CharField(max_length=20, unique=True, db_index=True)
    vin = models.CharField(max_length=17, unique=True, blank=True, null=True)
    
    # Specifications
    max_capacity_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Maximum load capacity in kilograms"
    )
    fuel_capacity_liters = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    
    # Operational Data
    current_odometer_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True
    )
    
    # Financial
    acquisition_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    acquisition_date = models.DateField(null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_vehicles'
    )
    
    class Meta:
        db_table = 'vehicles'
        ordering = ['vehicle_id']
        indexes = [
            models.Index(fields=['status', 'vehicle_type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.vehicle_id} - {self.name}"
    
    @property
    def is_available_for_trip(self):
        """Check if vehicle can be assigned to a trip"""
        return self.status == self.Status.AVAILABLE
    
    @property
    def total_maintenance_cost(self):
        """Calculate total maintenance cost from related maintenance records"""
        return self.maintenance_records.aggregate(
            total=models.Sum('cost')
        )['total'] or 0
    
    @property
    def total_fuel_cost(self):
        """Calculate total fuel cost from related expense records"""
        return self.fuel_expenses.aggregate(
            total=models.Sum('total_cost')
        )['total'] or 0
