from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from .models import Driver
from .serializers import (
    DriverSerializer,
    DriverCreateUpdateSerializer,
    DriverSummarySerializer
)


class DriverViewSet(viewsets.ModelViewSet):
    """ViewSet for Driver CRUD operations"""
    
    queryset = Driver.objects.select_related('created_by').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'license_type']
    search_fields = ['driver_id', 'first_name', 'last_name', 'email', 'license_number']
    ordering_fields = ['driver_id', 'created_at', 'safety_score', 'license_expiry_date']
    
    def get_serializer_class(self):
        if self.action == 'available':
            return DriverSummarySerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DriverCreateUpdateSerializer
        return DriverSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available drivers for trip assignment"""
        drivers = self.queryset.filter(
            status__in=[Driver.Status.ON_DUTY, Driver.Status.OFF_DUTY],
            license_expiry_date__gte=timezone.now().date()
        )
        serializer = DriverSummarySerializer(drivers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_licenses(self, request):
        """Get drivers with licenses expiring soon"""
        days = int(request.query_params.get('days', 30))
        expiry_threshold = timezone.now().date() + timedelta(days=days)
        
        drivers = self.queryset.filter(
            license_expiry_date__lte=expiry_threshold,
            license_expiry_date__gte=timezone.now().date()
        ).order_by('license_expiry_date')
        
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get driver statistics"""
        stats = {
            'total': self.queryset.count(),
            'on_duty': self.queryset.filter(status=Driver.Status.ON_DUTY).count(),
            'off_duty': self.queryset.filter(status=Driver.Status.OFF_DUTY).count(),
            'on_trip': self.queryset.filter(status=Driver.Status.ON_TRIP).count(),
            'suspended': self.queryset.filter(status=Driver.Status.SUSPENDED).count(),
            'expired_licenses': self.queryset.filter(
                license_expiry_date__lt=timezone.now().date()
            ).count(),
            'expiring_soon': self.queryset.filter(
                license_expiry_date__gte=timezone.now().date(),
                license_expiry_date__lte=timezone.now().date() + timedelta(days=30)
            ).count(),
        }
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a driver"""
        driver = self.get_object()
        
        if driver.status == Driver.Status.ON_TRIP:
            return Response(
                {'error': 'Cannot suspend a driver who is currently on a trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver.status = Driver.Status.SUSPENDED
        driver.save()
        
        serializer = self.get_serializer(driver)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a suspended driver"""
        driver = self.get_object()
        
        if not driver.is_license_valid:
            return Response(
                {'error': 'Cannot reactivate driver with expired license'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if driver.status == Driver.Status.SUSPENDED:
            driver.status = Driver.Status.OFF_DUTY
            driver.save()
        
        serializer = self.get_serializer(driver)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_safety_score(self, request, pk=None):
        """Update driver's safety score"""
        driver = self.get_object()
        score = request.data.get('safety_score')
        
        if score is None:
            return Response(
                {'error': 'safety_score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            score = int(score)
            if not 0 <= score <= 100:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'safety_score must be an integer between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver.safety_score = score
        driver.save()
        
        serializer = self.get_serializer(driver)
        return Response(serializer.data)
