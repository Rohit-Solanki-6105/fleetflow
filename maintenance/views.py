from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, Count
from .models import MaintenanceRecord
from .serializers import (
    MaintenanceRecordSerializer,
    MaintenanceRecordCreateUpdateSerializer
)
from vehicles.models import Vehicle


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for MaintenanceRecord CRUD operations"""
    
    queryset = MaintenanceRecord.objects.select_related(
        'vehicle', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'maintenance_type', 'vehicle']
    search_fields = ['record_id', 'description', 'service_provider']
    ordering_fields = ['record_id', 'scheduled_date', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MaintenanceRecordCreateUpdateSerializer
        return MaintenanceRecordSerializer
    
    def perform_create(self, serializer):
        """Set created_by and update vehicle status if in progress"""
        maintenance = serializer.save(created_by=self.request.user)
        
        # If maintenance is in progress, set vehicle to IN_SHOP
        if maintenance.status == MaintenanceRecord.Status.IN_PROGRESS:
            maintenance.vehicle.status = Vehicle.Status.IN_SHOP
            maintenance.vehicle.save()
    
    def perform_update(self, serializer):
        """Update vehicle status based on maintenance status"""
        old_status = self.get_object().status
        maintenance = serializer.save()
        
        # Status change logic
        if old_status != maintenance.status:
            if maintenance.status == MaintenanceRecord.Status.IN_PROGRESS:
                # Set vehicle to IN_SHOP
                maintenance.vehicle.status = Vehicle.Status.IN_SHOP
                maintenance.vehicle.save()
            elif maintenance.status == MaintenanceRecord.Status.COMPLETED:
                # Check if there are other in-progress maintenance records
                other_in_progress = MaintenanceRecord.objects.filter(
                    vehicle=maintenance.vehicle,
                    status=MaintenanceRecord.Status.IN_PROGRESS
                ).exclude(id=maintenance.id).exists()
                
                if not other_in_progress:
                    # No other in-progress maintenance, set vehicle to AVAILABLE
                    maintenance.vehicle.status = Vehicle.Status.AVAILABLE
                    maintenance.vehicle.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get maintenance statistics"""
        stats = {
            'total': self.queryset.count(),
            'scheduled': self.queryset.filter(status=MaintenanceRecord.Status.SCHEDULED).count(),
            'in_progress': self.queryset.filter(status=MaintenanceRecord.Status.IN_PROGRESS).count(),
            'completed': self.queryset.filter(status=MaintenanceRecord.Status.COMPLETED).count(),
            'cancelled': self.queryset.filter(status=MaintenanceRecord.Status.CANCELLED).count(),
            'total_cost': self.queryset.filter(
                status=MaintenanceRecord.Status.COMPLETED
            ).aggregate(
                labor=Sum('labor_cost'),
                parts=Sum('parts_cost')
            ),
            'by_type': {}
        }
        
        # Count by maintenance type
        for mtype in MaintenanceRecord.MaintenanceType.choices:
            count = self.queryset.filter(maintenance_type=mtype[0]).count()
            stats['by_type'][mtype[0]] = count
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming scheduled maintenance"""
        days = int(request.query_params.get('days', 7))
        from django.utils import timezone
        from datetime import timedelta
        
        upcoming = self.queryset.filter(
            status=MaintenanceRecord.Status.SCHEDULED,
            scheduled_date__lte=timezone.now().date() + timedelta(days=days),
            scheduled_date__gte=timezone.now().date()
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue scheduled maintenance"""
        from django.utils import timezone
        
        overdue = self.queryset.filter(
            status=MaintenanceRecord.Status.SCHEDULED,
            scheduled_date__lt=timezone.now().date()
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def start(self, request, pk=None):
        """Start a scheduled maintenance"""
        maintenance = self.get_object()
        
        if maintenance.status != MaintenanceRecord.Status.SCHEDULED:
            return Response(
                {'error': 'Can only start maintenance with SCHEDULED status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        maintenance.status = MaintenanceRecord.Status.IN_PROGRESS
        maintenance.save()
        
        # Set vehicle to IN_SHOP
        maintenance.vehicle.status = Vehicle.Status.IN_SHOP
        maintenance.vehicle.save()
        
        serializer = self.get_serializer(maintenance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def complete(self, request, pk=None):
        """Complete a maintenance record"""
        maintenance = self.get_object()
        
        if maintenance.status not in [MaintenanceRecord.Status.SCHEDULED, MaintenanceRecord.Status.IN_PROGRESS]:
            return Response(
                {'error': 'Can only complete maintenance with SCHEDULED or IN_PROGRESS status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        maintenance.status = MaintenanceRecord.Status.COMPLETED
        maintenance.completed_date = timezone.now().date()
        maintenance.save()
        
        # Check if there are other in-progress maintenance records
        other_in_progress = MaintenanceRecord.objects.filter(
            vehicle=maintenance.vehicle,
            status=MaintenanceRecord.Status.IN_PROGRESS
        ).exclude(id=maintenance.id).exists()
        
        if not other_in_progress:
            # Set vehicle to AVAILABLE
            maintenance.vehicle.status = Vehicle.Status.AVAILABLE
            maintenance.vehicle.save()
        
        serializer = self.get_serializer(maintenance)
        return Response(serializer.data)
