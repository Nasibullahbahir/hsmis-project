from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenRefreshView  # ADD THIS IMPORT

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='users')
router.register('userprofiles', views.UserProfileViewSet, basename='userprofiles')
router.register('units', views.UnitViewSet, basename='units')
router.register('minerals', views.MineralViewSet, basename='minerals')
router.register('vehicle-types', views.VehicleTypeViewSet, basename='vehicle-types')
router.register('vehicles', views.VehicleViewSet, basename='vehicles')
router.register('companies', views.CompanyViewSet, basename='companies')
router.register('scales', views.ScaleViewSet, basename='scales')
router.register('maktoobs', views.MaktoobViewSet, basename='maktoobs')
router.register('purchases', views.PurchaseViewSet, basename='purchases')
router.register('weights', views.WeightViewSet, basename='weights')
router.register('balances', views.BalanceViewSet, basename='balances')
router.register('momps', views.MompViewSet, basename='momps')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login_view, name='login'),
    path('test-login/', views.test_login, name='test-login'),
    path('test-users/', views.test_users_endpoint, name='test-users'),
    path('health/', views.health_check, name='health-check'),
    
    # Token endpoints
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Cascade delete testing
    path('test-cascade-delete/<int:pk>/', views.test_cascade_delete, name='test-cascade-delete'),
    path('check-company-relationships/<int:pk>/', views.check_company_relationships, name='check-company-relationships'),
    
    # Deleted records management
    path('deleted-counts/', views.get_all_deleted_counts, name='deleted-counts'),
    path('bulk-restore/', views.bulk_restore, name='bulk-restore'),
    path('bulk-permanent-delete/', views.bulk_permanent_delete, name='bulk-permanent-delete'),
    
    # Test endpoints
    path('create-test-deleted/', views.create_test_deleted_records, name='create-test-deleted'),
    path('test-restore-company/<int:pk>/', views.test_restore_company_with_vehicles, name='test-restore-company'),
    
    # Balance management endpoints
    path('balance-transactions/<int:company_id>/', views.balance_transactions, name='balance-transactions'),
    path('recalculate-balances/', views.recalculate_balances, name='recalculate-balances'),
    path('current-balance/<int:company_id>/<int:mineral_id>/', views.get_current_balance, name='get-current-balance'),
    
    # Debug endpoints
    path('debug-balance/', views.debug_balance_system, name='debug-balance'),
    path('debug-balance/<int:company_id>/<int:mineral_id>/', views.debug_balance_system, name='debug-balance-detail'),
    
    # Validation endpoints
    path('validate-weight/', views.validate_weight_addition, name='validate-weight'),
    path('weights/check-available/', views.WeightViewSet.as_view({'post': 'check_available'}), name='weight-check-available'),
    
    # Test and monitoring endpoints
    path('test-balance-update/', views.test_balance_update, name='test-balance-update'),
    path('monitor-balances/', views.monitor_balance_updates, name='monitor-balances'),
    
    # Balance management endpoints
    path('company-mineral-balance/<int:company_id>/<int:mineral_id>/', views.get_company_mineral_balance, name='company-mineral-balance'),
    path('fix-duplicate-balances/', views.fix_duplicate_balances, name='fix-duplicate-balances'),
    path('list-all-balances/', views.list_all_balances, name='list-all-balances'),
    
    # Balance recalculation actions
    path('purchases/<int:pk>/recalc-balance/', views.PurchaseViewSet.as_view({'post': 'recalc_balance'}), name='purchase-recalc-balance'),
    path('weights/<int:pk>/recalc-balance/', views.WeightViewSet.as_view({'post': 'recalc_balance'}), name='weight-recalc-balance'),
]