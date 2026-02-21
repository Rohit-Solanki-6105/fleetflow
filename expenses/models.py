from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class FuelExpense(models.Model):
    """Model for fuel expenses"""
    
    # Expense Information
    expense_id = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='fuel_expenses'
    )
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fuel_expenses',
        help_text="Associated trip (optional)"
    )
    
    # Fuel Details
    date = models.DateField(db_index=True)
    fuel_type = models.CharField(
        max_length=20,
        choices=[
            ('DIESEL', 'Diesel'),
            ('PETROL', 'Petrol'),
            ('ELECTRIC', 'Electric'),
            ('CNG', 'CNG'),
            ('LPG', 'LPG'),
        ]
    )
    liters = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    price_per_liter = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Location
    fuel_station = models.CharField(max_length=200)
    location = models.CharField(max_length=255, blank=True)
    
    # Odometer
    odometer_reading_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Additional
    receipt_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    receipt_image = models.ImageField(
        upload_to='fuel_receipts/',
        blank=True,
        null=True
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fuel_expenses'
    )
    
    class Meta:
        db_table = 'fuel_expenses'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['vehicle', '-date']),
            models.Index(fields=['-date']),
        ]
    
    def __str__(self):
        return f"{self.expense_id} - {self.vehicle.vehicle_id} - {self.date}"
    
    def save(self, *args, **kwargs):
        """Auto-generate expense_id if not provided"""
        if not self.expense_id:
            # Get the last fuel expense
            last_expense = FuelExpense.objects.order_by('-id').first()
            if last_expense and last_expense.expense_id.startswith('FUEL-'):
                try:
                    last_number = int(last_expense.expense_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.expense_id = f'FUEL-{new_number:06d}'
            
        # Auto-calculate total cost
        if self.liters and self.price_per_liter:
            self.total_cost = self.liters * self.price_per_liter
        super().save(*args, **kwargs)


class OtherExpense(models.Model):
    """Model for other operational expenses"""
    
    class ExpenseType(models.TextChoices):
        TOLL = 'TOLL', _('Toll')
        PARKING = 'PARKING', _('Parking')
        CLEANING = 'CLEANING', _('Cleaning')
        INSURANCE = 'INSURANCE', _('Insurance')
        REGISTRATION = 'REGISTRATION', _('Registration')
        FINE = 'FINE', _('Fine/Penalty')
        TIRE_REPLACEMENT = 'TIRE_REPLACEMENT', _('Tire Replacement')
        ACCESSORIES = 'ACCESSORIES', _('Accessories')
        OTHER = 'OTHER', _('Other')
    
    # Expense Information
    expense_id = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='other_expenses'
    )
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='other_expenses'
    )
    
    # Expense Details
    expense_type = models.CharField(
        max_length=20,
        choices=ExpenseType.choices
    )
    date = models.DateField(db_index=True)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    description = models.TextField()
    vendor = models.CharField(max_length=200, blank=True)
    
    # Additional
    receipt_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    receipt_image = models.ImageField(
        upload_to='expense_receipts/',
        blank=True,
        null=True
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_other_expenses'
    )
    
    class Meta:
        db_table = 'other_expenses'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['vehicle', '-date']),
            models.Index(fields=['expense_type', '-date']),
        ]
    
    def __str__(self):
        return f"{self.expense_id} - {self.vehicle.vehicle_id} - {self.expense_type}"
    
    def save(self, *args, **kwargs):
        """Auto-generate expense_id if not provided"""
        if not self.expense_id:
            # Get the last other expense
            last_expense = OtherExpense.objects.order_by('-id').first()
            if last_expense and last_expense.expense_id.startswith('EXP-'):
                try:
                    last_number = int(last_expense.expense_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.expense_id = f'EXP-{new_number:06d}'
        super().save(*args, **kwargs)
