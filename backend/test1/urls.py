from django.urls import path , include
from rest_framework import routers
from .views import UserViewSet, UnitViewSet, MineralViewSet, VehicleTypeViewSet, VehicleViewSet , CompanyViewSet , ScaleViewSet, MaktoobViewSet, PurchaseViewSet , WeightViewSet, BalanceViewSet ,MompViewSet


router = routers.DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('units', UnitViewSet, basename='units')
router.register('minerals', MineralViewSet, basename='minerals')
router.register('vehicletype', VehicleTypeViewSet, basename='vehicletype')
router.register('vehicle', VehicleViewSet, basename='vehicle')
router.register('companies', CompanyViewSet, basename='companies')
router.register('scale', ScaleViewSet, basename='scale')
router.register('maktoob', MaktoobViewSet, basename='maktoob')
router.register('purchases', PurchaseViewSet, basename='purchase')
router.register('weight', WeightViewSet, basename='weight')
router.register('balance', BalanceViewSet, basename='balance')
router.register('momp', MompViewSet, basename='momp')


urlpatterns = [
    path('', include(router.urls))
] 
