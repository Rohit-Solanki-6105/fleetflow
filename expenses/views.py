from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Avg, Count
from datetime import datetime, timedelta
from .models import FuelExpense, OtherExpense
from .serializers import (
    FuelExpenseSerializer,
    FuelExpenseCreateUpdateSerializer,
    OtherExpenseSerializer,
    OtherExpenseCreateUpdateSerializer
)


class FuelExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for FuelExpense CRUD operations"""
    
    queryset = FuelExpense.objects.select_related(
        'vehicle', 'trip', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vehicle', 'fuel_type', 'date']
    search_fields = ['expense_id', 'fuel_station', 'receipt_number']
    ordering_fields = ['expense_id', 'date', 'total_cost']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FuelExpenseCreateUpdateSerializer
        return FuelExpenseSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get fuel expense statistics"""
        stats = {
            'total_expenses': self.queryset.count(),
            'total_cost': self.queryset.aggregate(Sum('total_cost'))['total_cost__sum'] or 0,
            'total_liters': self.queryset.aggregate(Sum('liters'))['liters__sum'] or 0,
            'avg_price_per_liter': self.queryset.aggregate(Avg('price_per_liter'))['price_per_liter__avg'] or 0,
            'by_fuel_type': {}
        }
        
        # Aggregate by fuel type
        for fuel_choice in FuelExpense._meta.get_field('fuel_type').choices:
            fuel_type = fuel_choice[0]
            type_stats = self.queryset.filter(fuel_type=fuel_type).aggregate(
                count=Count('id'),
                total_cost=Sum('total_cost'),
                total_liters=Sum('liters')
            )
            stats['by_fuel_type'][fuel_type] = type_stats
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get fuel expenses aggregated by vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        
        if vehicle_id:
            expenses = self.queryset.filter(vehicle__id=vehicle_id)
        else:
            return Response({'error': 'vehicle_id parameter is required'}, status=400)
        
        stats = {
            'total_cost': expenses.aggregate(Sum('total_cost'))['total_cost__sum'] or 0,
            'total_liters': expenses.aggregate(Sum('liters'))['liters__sum'] or 0,
            'avg_cost_per_fill': expenses.aggregate(Avg('total_cost'))['total_cost__avg'] or 0,
            'expense_count': expenses.count()
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def monthly_trend(self, request):
        """Get monthly fuel expense trend"""
        months = int(request.query_params.get('months', 6))
        
        from django.utils import timezone
        start_date = timezone.now().date() - timedelta(days=months * 30)
        
        expenses = self.queryset.filter(date__gte=start_date).order_by('date')
        
        # Group by month
        monthly_data = {}
        for expense in expenses:
            month_key = expense.date.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {
                    'total_cost': 0,
                    'total_liters': 0,
                    'count': 0
                }
            monthly_data[month_key]['total_cost'] += float(expense.total_cost)
            monthly_data[month_key]['total_liters'] += float(expense.liters)
            monthly_data[month_key]['count'] += 1
        
        return Response(monthly_data)


class OtherExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for OtherExpense CRUD operations"""
    
    queryset = OtherExpense.objects.select_related(
        'vehicle', 'trip', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vehicle', 'expense_type', 'date']
    search_fields = ['expense_id', 'description', 'vendor', 'receipt_number']
    ordering_fields = ['expense_id', 'date', 'amount']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OtherExpenseCreateUpdateSerializer
        return OtherExpenseSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get other expense statistics"""
        stats = {
            'total_expenses': self.queryset.count(),
            'total_amount': self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
            'by_type': {}
        }
        
        # Aggregate by expense type
        for expense_choice in OtherExpense.ExpenseType.choices:
            expense_type = expense_choice[0]
            type_stats = self.queryset.filter(expense_type=expense_type).aggregate(
                count=Count('id'),
                total_amount=Sum('amount')
            )
            stats['by_type'][expense_type] = type_stats
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get other expenses aggregated by vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        
        if vehicle_id:
            expenses = self.queryset.filter(vehicle__id=vehicle_id)
        else:
            return Response({'error': 'vehicle_id parameter is required'}, status=400)
        
        stats = {
            'total_amount': expenses.aggregate(Sum('amount'))['amount__sum'] or 0,
            'expense_count': expenses.count(),
            'by_type': {}
        }
        
        for expense_choice in OtherExpense.ExpenseType.choices:
            expense_type = expense_choice[0]
            amount = expenses.filter(expense_type=expense_type).aggregate(
                Sum('amount')
            )['amount__sum'] or 0
            stats['by_type'][expense_type] = amount
        
        return Response(stats)
