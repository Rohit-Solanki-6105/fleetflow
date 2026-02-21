from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Trip(models.Model):
    """Model for trip dispatches"""
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        DISPATCHED = 'DISPATCHED', _('Dispatched')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    # Trip Identification
    trip_id = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    
    # Assignment
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.PROTECT,
        related_name='trips'
    )
    driver = models.ForeignKey(
        'drivers.Driver',
        on_delete=models.PROTECT,
        related_name='trips'
    )
    
    # Route Information
    pickup_location = models.CharField(max_length=255)
    pickup_address = models.TextField()
    pickup_coordinates = models.CharField(max_length=100, blank=True)
    
    dropoff_location = models.CharField(max_length=255)
    dropoff_address = models.TextField()
    dropoff_coordinates = models.CharField(max_length=100, blank=True)
    
    # Cargo Details
    cargo_description = models.TextField()
    cargo_weight_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Cargo weight in kilograms"
    )
    cargo_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Estimated cargo value"
    )
    
    # Schedule
    scheduled_pickup_time = models.DateTimeField()
    scheduled_delivery_time = models.DateTimeField()
    actual_pickup_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    
    # Trip Metrics
    estimated_distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    actual_distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    
    start_odometer_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    end_odometer_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    
    # Additional Information
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_trips'
    )
    
    class Meta:
        db_table = 'trips'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['vehicle', 'status']),
            models.Index(fields=['driver', 'status']),
            models.Index(fields=['scheduled_pickup_time']),
        ]
    
    def __str__(self):
        return f"{self.trip_id} - {self.pickup_location} to {self.dropoff_location}"
    
    def clean(self):
        """Validate trip data before saving"""
        errors = {}
        
        # Validate cargo weight against vehicle capacity
        if self.vehicle and self.cargo_weight_kg > self.vehicle.max_capacity_kg:
            errors['cargo_weight_kg'] = f"Cargo weight ({self.cargo_weight_kg}kg) exceeds vehicle capacity ({self.vehicle.max_capacity_kg}kg)"
        
        # Validate scheduled times
        if self.scheduled_delivery_time <= self.scheduled_pickup_time:
            errors['scheduled_delivery_time'] = "Delivery time must be after pickup time"
        
        # Validate actual times if provided
        if self.actual_pickup_time and self.actual_delivery_time:
            if self.actual_delivery_time <= self.actual_pickup_time:
                errors['actual_delivery_time'] = "Actual delivery time must be after actual pickup time"
        
        # Validate odometer readings
        if self.start_odometer_km and self.end_odometer_km:
            if self.end_odometer_km <= self.start_odometer_km:
                errors['end_odometer_km'] = "End odometer must be greater than start odometer"
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Auto-generate trip_id if not provided and validate"""
        if not self.trip_id:
            # Get the last trip
            last_trip = Trip.objects.order_by('-id').first()
            if last_trip and last_trip.trip_id.startswith('TRP-'):
                try:
                    last_number = int(last_trip.trip_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.trip_id = f'TRP-{new_number:06d}'
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def duration_hours(self):
        """Calculate trip duration in hours"""
        if self.actual_pickup_time and self.actual_delivery_time:
            delta = self.actual_delivery_time - self.actual_pickup_time
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    @property
    def is_delayed(self):
        """Check if trip is delayed"""
        if self.status == self.Status.COMPLETED and self.actual_delivery_time:
            return self.actual_delivery_time > self.scheduled_delivery_time
        elif self.status == self.Status.DISPATCHED:
            return timezone.now() > self.scheduled_pickup_time
        return False
    
    @property
    def calculated_distance_km(self):
        """Get actual or estimated distance"""
        return self.actual_distance_km or self.estimated_distance_km
