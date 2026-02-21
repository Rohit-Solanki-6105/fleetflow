from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vehicle
from .serializers import (
    VehicleSerializer, 
    VehicleCreateUpdateSerializer,
    VehicleSummarySerializer
)


class VehicleViewSet(viewsets.ModelViewSet):
    """ViewSet for Vehicle CRUD operations"""
    
    queryset = Vehicle.objects.select_related('created_by').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'vehicle_type']
    search_fields = ['vehicle_id', 'name', 'license_plate', 'make', 'model']
    ordering_fields = ['vehicle_id', 'created_at', 'current_odometer_km']
    
    def get_serializer_class(self):
        if self.action == 'list_available':
            return VehicleSummarySerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return VehicleCreateUpdateSerializer
        return VehicleSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available vehicles for trip assignment"""
        vehicles = self.queryset.filter(status=Vehicle.Status.AVAILABLE)
        serializer = VehicleSummarySerializer(vehicles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vehicle statistics"""
        stats = {
            'total': self.queryset.count(),
            'available': self.queryset.filter(status=Vehicle.Status.AVAILABLE).count(),
            'on_trip': self.queryset.filter(status=Vehicle.Status.ON_TRIP).count(),
            'in_shop': self.queryset.filter(status=Vehicle.Status.IN_SHOP).count(),
            'retired': self.queryset.filter(status=Vehicle.Status.RETIRED).count(),
            'by_type': {}
        }
        
        # Count by vehicle type
        for vtype in Vehicle.VehicleType.choices:
            stats['by_type'][vtype[0]] = self.queryset.filter(
                vehicle_type=vtype[0]
            ).count()
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def retire(self, request, pk=None):
        """Retire a vehicle"""
        vehicle = self.get_object()
        
        if vehicle.status == Vehicle.Status.ON_TRIP:
            return Response(
                {'error': 'Cannot retire a vehicle that is currently on a trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vehicle.status = Vehicle.Status.RETIRED
        vehicle.save()
        
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a retired vehicle"""
        vehicle = self.get_object()
        
        if vehicle.status == Vehicle.Status.RETIRED:
            vehicle.status = Vehicle.Status.AVAILABLE
            vehicle.save()
        
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)
