from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import Trip
from .serializers import (
    TripSerializer,
    TripCreateSerializer,
    TripUpdateSerializer,
    TripDispatchSerializer,
    TripCompleteSerializer,
    TripCancelSerializer
)
from vehicles.models import Vehicle
from drivers.models import Driver


class TripViewSet(viewsets.ModelViewSet):
    """ViewSet for Trip CRUD and dispatch operations"""
    
    queryset = Trip.objects.select_related(
        'vehicle', 'driver', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'vehicle', 'driver']
    search_fields = ['trip_id', 'pickup_location', 'dropoff_location']
    ordering_fields = ['trip_id', 'created_at', 'scheduled_pickup_time']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TripUpdateSerializer
        elif self.action == 'dispatch':
            return TripDispatchSerializer
        elif self.action == 'complete':
            return TripCompleteSerializer
        elif self.action == 'cancel':
            return TripCancelSerializer
        return TripSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def dispatch_trip(self, request, pk=None):
        """Dispatch a trip (change status from DRAFT to DISPATCHED)"""
        trip = self.get_object()
        
        if trip.status != Trip.Status.DRAFT:
            return Response(
                {'error': f'Cannot dispatch trip with status: {trip.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Update trip
            trip.status = Trip.Status.DISPATCHED
            trip.start_odometer_km = serializer.validated_data['start_odometer_km']
            trip.actual_pickup_time = timezone.now()
            trip.save()
            
            # Update vehicle and driver status
            trip.vehicle.status = Vehicle.Status.ON_TRIP
            trip.vehicle.save()
            
            trip.driver.status = Driver.Status.ON_TRIP
            trip.driver.save()
            
            return Response(TripSerializer(trip).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def complete(self, request, pk=None):
        """Complete a trip"""
        trip = self.get_object()
        
        if trip.status not in [Trip.Status.DISPATCHED, Trip.Status.IN_PROGRESS]:
            return Response(
                {'error': f'Cannot complete trip with status: {trip.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Update trip
            trip.status = Trip.Status.COMPLETED
            trip.end_odometer_km = serializer.validated_data['end_odometer_km']
            trip.actual_delivery_time = timezone.now()
            
            if 'actual_distance_km' in serializer.validated_data:
                trip.actual_distance_km = serializer.validated_data['actual_distance_km']
            else:
                # Calculate from odometer
                trip.actual_distance_km = trip.end_odometer_km - trip.start_odometer_km
            
            if 'notes' in serializer.validated_data:
                trip.notes = serializer.validated_data['notes']
            
            trip.save()
            
            # Update vehicle status and odometer
            trip.vehicle.status = Vehicle.Status.AVAILABLE
            trip.vehicle.current_odometer_km = trip.end_odometer_km
            trip.vehicle.save()
            
            # Update driver status and metrics
            trip.driver.status = Driver.Status.OFF_DUTY
            trip.driver.total_trips_completed += 1
            trip.driver.total_distance_km += trip.actual_distance_km
            trip.driver.save()
            
            return Response(TripSerializer(trip).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Cancel a trip"""
        trip = self.get_object()
        
        if trip.status == Trip.Status.COMPLETED:
            return Response(
                {'error': 'Cannot cancel a completed trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if trip.status == Trip.Status.CANCELLED:
            return Response(
                {'error': 'Trip is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Update trip
            old_status = trip.status
            trip.status = Trip.Status.CANCELLED
            trip.cancellation_reason = serializer.validated_data['cancellation_reason']
            trip.save()
            
            # Restore vehicle and driver status if they were dispatched
            if old_status in [Trip.Status.DISPATCHED, Trip.Status.IN_PROGRESS]:
                trip.vehicle.status = Vehicle.Status.AVAILABLE
                trip.vehicle.save()
                
                trip.driver.status = Driver.Status.OFF_DUTY
                trip.driver.save()
            
            return Response(TripSerializer(trip).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get trip statistics"""
        stats = {
            'total': self.queryset.count(),
            'draft': self.queryset.filter(status=Trip.Status.DRAFT).count(),
            'dispatched': self.queryset.filter(status=Trip.Status.DISPATCHED).count(),
            'in_progress': self.queryset.filter(status=Trip.Status.IN_PROGRESS).count(),
            'completed': self.queryset.filter(status=Trip.Status.COMPLETED).count(),
            'cancelled': self.queryset.filter(status=Trip.Status.CANCELLED).count(),
            'delayed': self.queryset.filter(
                status=Trip.Status.DISPATCHED,
                scheduled_pickup_time__lt=timezone.now()
            ).count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active (dispatched or in progress) trips"""
        trips = self.queryset.filter(
            status__in=[Trip.Status.DISPATCHED, Trip.Status.IN_PROGRESS]
        )
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)
