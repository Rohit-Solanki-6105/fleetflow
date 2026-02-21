from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Driver(models.Model):
    """Model for fleet drivers"""
    
    class Status(models.TextChoices):
        ON_DUTY = 'ON_DUTY', _('On Duty')
        OFF_DUTY = 'OFF_DUTY', _('Off Duty')
        ON_TRIP = 'ON_TRIP', _('On Trip')
        SUSPENDED = 'SUSPENDED', _('Suspended')
    
    # Personal Information
    driver_id = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    address = models.TextField(blank=True)
    
    # License Information
    license_number = models.CharField(max_length=50, unique=True, db_index=True)
    license_type = models.CharField(
        max_length=20,
        help_text="License category (e.g., CDL-A, CDL-B, Class C)"
    )
    license_expiry_date = models.DateField(db_index=True)
    license_state = models.CharField(max_length=50)
    
    # Employment
    hire_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OFF_DUTY,
        db_index=True
    )
    
    # Performance Metrics
    safety_score = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Safety score out of 100"
    )
    total_trips_completed = models.IntegerField(default=0)
    total_distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Additional
    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='drivers/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_drivers'
    )
    
    class Meta:
        db_table = 'drivers'
        ordering = ['driver_id']
        indexes = [
            models.Index(fields=['status', 'license_expiry_date']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.driver_id} - {self.get_full_name()}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_license_valid(self):
        """Check if driver's license is still valid"""
        return self.license_expiry_date >= timezone.now().date()
    
    @property
    def is_available_for_trip(self):
        """Check if driver can be assigned to a trip"""
        return (
            self.status in [self.Status.ON_DUTY, self.Status.OFF_DUTY] and
            self.is_license_valid
        )
    
    @property
    def days_until_license_expiry(self):
        """Calculate days until license expires"""
        delta = self.license_expiry_date - timezone.now().date()
        return delta.days
    
    @property
    def completion_rate(self):
        """Calculate trip completion rate"""
        total_trips = self.trips.count()
        if total_trips == 0:
            return 100.0
        completed = self.trips.filter(status='COMPLETED').count()
        return round((completed / total_trips) * 100, 2)
    
    def save(self, *args, **kwargs):
        """Auto-generate driver_id if not provided"""
        if not self.driver_id:
            # Get the last driver
            last_driver = Driver.objects.order_by('-id').first()
            if last_driver and last_driver.driver_id.startswith('DRV-'):
                try:
                    last_number = int(last_driver.driver_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.driver_id = f'DRV-{new_number:06d}'
        super().save(*args, **kwargs)
