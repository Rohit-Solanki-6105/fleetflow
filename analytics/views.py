from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Avg, Count, F, Q, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip
from maintenance.models import MaintenanceRecord
from expenses.models import FuelExpense, OtherExpense


class DashboardAnalyticsView(APIView):
    """Main dashboard analytics and KPIs"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard KPIs and summary statistics"""
        
        # Vehicle Stats
        vehicle_stats = {
            'total': Vehicle.objects.count(),
            'available': Vehicle.objects.filter(status=Vehicle.Status.AVAILABLE).count(),
            'on_trip': Vehicle.objects.filter(status=Vehicle.Status.ON_TRIP).count(),
            'in_shop': Vehicle.objects.filter(status=Vehicle.Status.IN_SHOP).count(),
            'utilization_rate': 0
        }
        
        if vehicle_stats['total'] > 0:
            vehicle_stats['utilization_rate'] = round(
                (vehicle_stats['on_trip'] / vehicle_stats['total']) * 100, 2
            )
        
        # Driver Stats
        driver_stats = {
            'total': Driver.objects.count(),
            'on_duty': Driver.objects.filter(status=Driver.Status.ON_DUTY).count(),
            'on_trip': Driver.objects.filter(status=Driver.Status.ON_TRIP).count(),
            'avg_safety_score': Driver.objects.aggregate(Avg('safety_score'))['safety_score__avg'] or 0,
            'expired_licenses': Driver.objects.filter(
                license_expiry_date__lt=timezone.now().date()
            ).count()
        }
        
        # Trip Stats
        trip_stats = {
            'total': Trip.objects.count(),
            'active': Trip.objects.filter(
                status__in=[Trip.Status.DISPATCHED, Trip.Status.IN_PROGRESS]
            ).count(),
            'completed_today': Trip.objects.filter(
                status=Trip.Status.COMPLETED,
                actual_delivery_time__date=timezone.now().date()
            ).count(),
            'pending_cargo_tons': 0
        }
        
        # Calculate pending cargo (draft trips)
        pending_cargo = Trip.objects.filter(
            status=Trip.Status.DRAFT
        ).aggregate(Sum('cargo_weight_kg'))['cargo_weight_kg__sum']
        
        if pending_cargo:
            trip_stats['pending_cargo_tons'] = round(float(pending_cargo) / 1000, 2)
        
        # Maintenance Alerts
        maintenance_stats = {
            'in_progress': MaintenanceRecord.objects.filter(
                status=MaintenanceRecord.Status.IN_PROGRESS
            ).count(),
            'scheduled_this_week': MaintenanceRecord.objects.filter(
                status=MaintenanceRecord.Status.SCHEDULED,
                scheduled_date__gte=timezone.now().date(),
                scheduled_date__lte=timezone.now().date() + timedelta(days=7)
            ).count(),
            'overdue': MaintenanceRecord.objects.filter(
                status=MaintenanceRecord.Status.SCHEDULED,
                scheduled_date__lt=timezone.now().date()
            ).count()
        }
        
        # Financial Summary (last 30 days)
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        fuel_costs = FuelExpense.objects.filter(
            date__gte=thirty_days_ago
        ).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        
        maintenance_costs = MaintenanceRecord.objects.filter(
            status=MaintenanceRecord.Status.COMPLETED,
            completed_date__gte=thirty_days_ago
        ).aggregate(
            total=Sum(F('labor_cost') + F('parts_cost'))
        )['total'] or 0
        
        other_costs = OtherExpense.objects.filter(
            date__gte=thirty_days_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        financial_stats = {
            'fuel_cost_30d': float(fuel_costs),
            'maintenance_cost_30d': float(maintenance_costs),
            'other_cost_30d': float(other_costs),
            'total_operational_cost_30d': float(fuel_costs) + float(maintenance_costs) + float(other_costs)
        }
        
        return Response({
            'vehicles': vehicle_stats,
            'drivers': driver_stats,
            'trips': trip_stats,
            'maintenance': maintenance_stats,
            'financial': financial_stats,
            'last_updated': timezone.now()
        })


class FleetPerformanceView(APIView):
    """Fleet performance metrics and analytics"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get fleet performance metrics"""
        
        # Get query parameters
        period_days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=period_days)
        
        # Fuel Efficiency
        fuel_data = FuelExpense.objects.filter(
            date__gte=start_date
        ).aggregate(
            total_liters=Sum('liters'),
            total_cost=Sum('total_cost'),
            avg_price=Avg('price_per_liter')
        )
        
        # Distance traveled
        distance_data = Trip.objects.filter(
            status=Trip.Status.COMPLETED,
            actual_delivery_time__date__gte=start_date
        ).aggregate(
            total_distance=Sum('actual_distance_km'),
            total_trips=Count('id')
        )
        
        # Calculate fuel efficiency (km per liter)
        fuel_efficiency = 0
        if fuel_data['total_liters'] and distance_data['total_distance']:
            fuel_efficiency = round(
                float(distance_data['total_distance']) / float(fuel_data['total_liters']), 2
            )
        
        # Vehicle utilization over time
        vehicles = Vehicle.objects.exclude(status=Vehicle.Status.RETIRED)
        vehicle_utilization = []
        
        for vehicle in vehicles[:10]:  # Top 10 for performance
            trips_count = Trip.objects.filter(
                vehicle=vehicle,
                status=Trip.Status.COMPLETED,
                actual_delivery_time__date__gte=start_date
            ).count()
            
            total_distance = Trip.objects.filter(
                vehicle=vehicle,
                status=Trip.Status.COMPLETED,
                actual_delivery_time__date__gte=start_date
            ).aggregate(Sum('actual_distance_km'))['actual_distance_km__sum'] or 0
            
            vehicle_utilization.append({
                'vehicle_id': vehicle.vehicle_id,
                'vehicle_name': vehicle.name,
                'trips_completed': trips_count,
                'total_distance_km': float(total_distance),
                'avg_distance_per_trip': float(total_distance / trips_count) if trips_count > 0 else 0
            })
        
        # Sort by trips completed
        vehicle_utilization.sort(key=lambda x: x['trips_completed'], reverse=True)
        
        return Response({
            'period_days': period_days,
            'fuel_efficiency_km_per_liter': fuel_efficiency,
            'fuel_data': fuel_data,
            'distance_data': distance_data,
            'vehicle_utilization': vehicle_utilization
        })


class FinancialReportView(APIView):
    """Financial reports and cost analysis"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get financial reports"""
        
        # Get query parameters
        period_days = int(request.query_params.get('days', 90))
        start_date = timezone.now().date() - timedelta(days=period_days)
        
        # Cost breakdown by vehicle
        vehicles = Vehicle.objects.all()
        vehicle_costs = []
        
        for vehicle in vehicles:
            fuel_cost = FuelExpense.objects.filter(
                vehicle=vehicle,
                date__gte=start_date
            ).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
            
            maintenance_cost = MaintenanceRecord.objects.filter(
                vehicle=vehicle,
                status=MaintenanceRecord.Status.COMPLETED,
                completed_date__gte=start_date
            ).aggregate(
                total=Sum(F('labor_cost') + F('parts_cost'))
            )['total'] or 0
            
            other_cost = OtherExpense.objects.filter(
                vehicle=vehicle,
                date__gte=start_date
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            total_cost = float(fuel_cost) + float(maintenance_cost) + float(other_cost)
            
            # Calculate ROI if acquisition cost is available
            roi = None
            if vehicle.acquisition_cost and vehicle.acquisition_cost > 0:
                # Revenue estimation would come from trip valuations
                # For now, we'll show cost-based metrics
                roi = {
                    'acquisition_cost': float(vehicle.acquisition_cost),
                    'operational_cost': total_cost,
                    'cost_per_km': 0
                }
                
                total_distance = Trip.objects.filter(
                    vehicle=vehicle,
                    status=Trip.Status.COMPLETED,
                    actual_delivery_time__date__gte=start_date
                ).aggregate(Sum('actual_distance_km'))['actual_distance_km__sum'] or 0
                
                if total_distance > 0:
                    roi['cost_per_km'] = round(total_cost / float(total_distance), 2)
            
            vehicle_costs.append({
                'vehicle_id': vehicle.vehicle_id,
                'vehicle_name': vehicle.name,
                'fuel_cost': float(fuel_cost),
                'maintenance_cost': float(maintenance_cost),
                'other_cost': float(other_cost),
                'total_cost': total_cost,
                'roi': roi
            })
        
        # Sort by total cost
        vehicle_costs.sort(key=lambda x: x['total_cost'], reverse=True)
        
        # Monthly trend
        monthly_costs = FuelExpense.objects.filter(
            date__gte=start_date
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            fuel_total=Sum('total_cost')
        ).order_by('month')
        
        return Response({
            'period_days': period_days,
            'vehicle_costs': vehicle_costs[:20],  # Top 20 by cost
            'monthly_trend': list(monthly_costs)
        })


class DriverPerformanceView(APIView):
    """Driver performance analytics"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get driver performance metrics"""
        
        period_days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=period_days)
        
        drivers = Driver.objects.all()
        driver_performance = []
        
        for driver in drivers:
            trips = Trip.objects.filter(
                driver=driver,
                status=Trip.Status.COMPLETED,
                actual_delivery_time__date__gte=start_date
            )
            
            trips_count = trips.count()
            total_distance = trips.aggregate(Sum('actual_distance_km'))['actual_distance_km__sum'] or 0
            
            # Calculate on-time delivery rate
            on_time_trips = trips.filter(
                actual_delivery_time__lte=F('scheduled_delivery_time')
            ).count()
            
            on_time_rate = 0
            if trips_count > 0:
                on_time_rate = round((on_time_trips / trips_count) * 100, 2)
            
            driver_performance.append({
                'driver_id': driver.driver_id,
                'driver_name': driver.get_full_name(),
                'safety_score': driver.safety_score,
                'trips_completed': trips_count,
                'total_distance_km': float(total_distance),
                'on_time_delivery_rate': on_time_rate,
                'license_valid': driver.is_license_valid,
                'license_expiry_days': driver.days_until_license_expiry
            })
        
        # Sort by trips completed
        driver_performance.sort(key=lambda x: x['trips_completed'], reverse=True)
        
        return Response({
            'period_days': period_days,
            'driver_performance': driver_performance
        })
