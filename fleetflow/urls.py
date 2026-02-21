"""
URL configuration for fleetflow project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Import ViewSets
from accounts.views import UserViewSet
from vehicles.views import VehicleViewSet
from drivers.views import DriverViewSet
from trips.views import TripViewSet
from maintenance.views import MaintenanceRecordViewSet
from expenses.views import FuelExpenseViewSet, OtherExpenseViewSet
from analytics.views import (
    DashboardAnalyticsView,
    FleetPerformanceView,
    FinancialReportView,
    DriverPerformanceView
)

# Create router and register ViewSets
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'trips', TripViewSet)
router.register(r'maintenance', MaintenanceRecordViewSet)
router.register(r'fuel-expenses', FuelExpenseViewSet)
router.register(r'other-expenses', OtherExpenseViewSet)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Analytics Endpoints
    path('api/analytics/dashboard/', DashboardAnalyticsView.as_view(), name='analytics-dashboard'),
    path('api/analytics/fleet-performance/', FleetPerformanceView.as_view(), name='analytics-fleet'),
    path('api/analytics/financial/', FinancialReportView.as_view(), name='analytics-financial'),
    path('api/analytics/driver-performance/', DriverPerformanceView.as_view(), name='analytics-drivers'),
    
    # API Router
    path('api/', include(router.urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
