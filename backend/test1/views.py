# views.py - FIXED VERSION
from .models import Unit, Mineral, VehicleType, Vehicle, Company, Scale, Maktoob, Purchase, Weight, Balance, Momp, Userprofile, DeletedRelationship
from .serializers import UserSerializer, UserCreateSerializer, UnitSerializer, MineralSerializer, VehicleTypeSerializer, VehicleSerializer, ScaleSerializer, CompanySerializer, MaktoobSerializer, PurchaseSerializer, WeightSerializer, BalanceSerializer, MompSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework.viewsets import ModelViewSet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, DjangoModelPermissions
from .permissions import IsAdminOrReadOnly, FullDjangoModelPermissions, viewUserprofileHistoryPermission
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import OrderingFilter
from rest_framework import filters
from django.db import transaction
import traceback
from django.utils import timezone
from django.db.models import Sum, F
import traceback
import logging
from rest_framework.decorators import api_view, permission_classes, action

# Add these imports at the top
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()

# Add at the top with other imports
import logging

logger = logging.getLogger(__name__)

# Add this test view
@api_view(['POST'])
@permission_classes([AllowAny])
def test_login(request):
    logger.info(f"Test login received: {request.data}")
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        return Response({'message': 'Authentication successful', 'user': user.username})
    else:
        return Response({'message': 'Authentication failed'}, status=400)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Or create a simple login view
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

# Add test endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def test_users_endpoint(request):
    users = User.objects.all()
    data = UserSerializer(users, many=True).data
    return Response({
        'count': len(data),
        'users': data,
        'message': 'Test endpoint working'
    })

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Soft Delete Mixin for ViewSets
class SoftDeleteViewSetMixin:
    """Mixin to add soft delete operations to viewsets"""
    
    def get_queryset(self):
        """Override to only return non-deleted objects by default"""
        if self.action == 'deleted':
            # Return only deleted objects for the 'deleted' action
            return self.queryset.model.get_deleted_objects()
        # Return only active (non-deleted) objects by default
        return self.queryset.model.get_active_objects()
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete an instance"""
        try:
            instance = self.get_object()
            with transaction.atomic():
                instance.soft_delete()
            return Response({
                'status': 'success',
                'message': f'{self.queryset.model.__name__} soft deleted successfully',
                'deleted_at': instance.deleted_at,
                'id': instance.id
            })
        except Exception as e:
            logger.error(f"Error soft deleting {self.queryset.model.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'status': 'error',
                'message': f'Failed to soft delete: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted instance"""
        try:
            # Get from deleted objects
            instance = self.queryset.model.get_deleted_objects().filter(pk=pk).first()
            if not instance:
                return Response({
                    'status': 'error',
                    'message': f'{self.queryset.model.__name__} not found or not deleted'
                }, status=status.HTTP_404_NOT_FOUND)
            
            with transaction.atomic():
                instance.restore()
            return Response({
                'status': 'success',
                'message': f'{self.queryset.model.__name__} restored successfully',
                'id': instance.id
            })
        except Exception as e:
            logger.error(f"Error restoring {self.queryset.model.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'status': 'error',
                'message': f'Failed to restore: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        """Permanently delete an instance (only works on deleted records)"""
        try:
            # Get from deleted objects
            instance = self.queryset.model.get_deleted_objects().filter(pk=pk).first()
            if not instance:
                return Response({
                    'status': 'error',
                    'message': f'{self.queryset.model.__name__} not found or not deleted'
                }, status=status.HTTP_404_NOT_FOUND)
            
            with transaction.atomic():
                # Perform hard delete
                instance.delete()
            return Response({
                'status': 'success',
                'message': f'{self.queryset.model.__name__} permanently deleted',
                'id': pk
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error hard deleting {self.queryset.model.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'status': 'error',
                'message': f'Failed to permanently delete: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Get all deleted instances - NO PAGINATION for deleted records"""
        queryset = self.queryset.model.get_deleted_objects()
        
        # For Company, include related vehicles in the query
        if self.queryset.model.__name__ == 'Company':
            queryset = queryset.prefetch_related('vehicle')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'data': serializer.data
        })
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        try:
            with transaction.atomic():
                instance.soft_delete()
        except Exception as e:
            logger.error(f"Error in perform_destroy for {self.queryset.model.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            raise

class UserViewSet(ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    pagination_class = CustomPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'username', 'first_name', 'email', 'is_active', 'date_joined']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

class UserProfileViewSet(ModelViewSet):
    queryset = Userprofile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True)
    def history(self, request, pk):
        return Response('ok')

    @action(detail=False, methods=['GET', 'PUT'])
    def me(self, request):
        (userprofile, created) = Userprofile.objects.get_or_create(user_id=request.user.id)
        if request.method == 'GET':
            serializer = UserProfileSerializer(userprofile)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = UserProfileSerializer(userprofile, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class UnitViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

class MineralViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Mineral.objects.all()
    serializer_class = MineralSerializer
    permission_classes = [IsAuthenticated]

class VehicleTypeViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = VehicleType.objects.all()
    serializer_class = VehicleTypeSerializer
    permission_classes = [IsAuthenticated]

class VehicleViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active vehicles with vehicle_type prefetched
        if self.action == 'deleted':
            return Vehicle.get_deleted_objects().select_related('vehicle_type').prefetch_related('companies')
        return Vehicle.get_active_objects().select_related('vehicle_type').prefetch_related('companies')
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()

class CompanyViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active companies by default
        if self.action == 'deleted':
            return Company.get_deleted_objects().prefetch_related('vehicle', 'user')
        return Company.get_active_objects().prefetch_related('vehicle', 'user')
    
    def get_serializer_context(self):
        # Pass request to serializer context
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()
    
    @action(detail=True, methods=['get'])
    def related_vehicles(self, request, pk=None):
        """Get all vehicles related to this company (including deleted ones)"""
        try:
            company = self.get_object()
            vehicles = company.vehicle.all()
            serializer = VehicleSerializer(vehicles, many=True)
            return Response({
                'status': 'success',
                'count': vehicles.count(),
                'vehicles': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def restore_with_vehicles(self, request, pk=None):
        """Restore company and all its related vehicles"""
        try:
            # Get from deleted objects
            company = Company.get_deleted_objects().filter(pk=pk).first()
            if not company:
                return Response({
                    'status': 'error',
                    'message': 'Company not found or not deleted'
                }, status=status.HTTP_404_NOT_FOUND)
            
            restored_vehicles = []
            
            with transaction.atomic():
                # Get tracked relationships
                deleted_relationships = DeletedRelationship.objects.filter(
                    model_name='Company',
                    model_id=company.id,
                    related_model='Vehicle',
                )
                
                for relationship in deleted_relationships:
                    try:
                        vehicle = Vehicle.objects.get(id=relationship.related_id)
                        
                        # Add vehicle back to company
                        company.vehicle.add(vehicle)
                        
                        # If vehicle is deleted, restore it
                        if vehicle.is_deleted:
                            # Check if this vehicle should be restored
                            # (only restore if no other active companies exist)
                            other_active_companies = vehicle.companies.filter(
                                deleted_at__isnull=True
                            ).exclude(id=company.id).count()
                            
                            if other_active_companies == 0:
                                vehicle.restore()
                                restored_vehicles.append({
                                    'id': vehicle.id,
                                    'name': vehicle.car_name,
                                    'plate_number': vehicle.plate_number
                                })
                        
                        # Delete the tracking record
                        relationship.delete()
                        
                    except Vehicle.DoesNotExist:
                        # Vehicle was hard deleted, skip it
                        pass
                
                # Now restore the company
                company.restore()
            
            return Response({
                'status': 'success',
                'message': 'Company and related vehicles restored successfully',
                'company_id': company.id,
                'company_name': company.company_name,
                'restored_vehicles': restored_vehicles,
                'restored_vehicle_count': len(restored_vehicles)
            })
        except Exception as e:
            logger.error(f"Error restoring company with vehicles: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to restore: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def vehicle_relationships(self, request, pk=None):
        """Get information about vehicle relationships for a company"""
        try:
            company = self.get_object()
            
            # Get tracked relationships
            tracked_relationships = DeletedRelationship.objects.filter(
                model_name='Company',
                model_id=company.id,
                related_model='Vehicle',
            )
            
            tracked_vehicle_ids = [r.related_id for r in tracked_relationships]
            
            # Get current vehicles
            current_vehicles = company.vehicle.all()
            
            response_data = {
                'company': {
                    'id': company.id,
                    'name': company.company_name,
                    'is_deleted': company.is_deleted,
                },
                'current_vehicles': [
                    {
                        'id': v.id,
                        'name': v.car_name,
                        'plate_number': v.plate_number,
                        'is_deleted': v.is_deleted,
                        'is_current': True,
                    }
                    for v in current_vehicles
                ],
                'tracked_vehicles': tracked_vehicle_ids,
            }
            
            return Response({
                'status': 'success',
                'data': response_data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScaleViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Scale.objects.all()
    serializer_class = ScaleSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()

class MaktoobViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Maktoob.objects.all()
    serializer_class = MaktoobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.action == 'deleted':
            return Maktoob.get_deleted_objects().select_related('company', 'user')
        return Maktoob.get_active_objects().select_related('company', 'user')
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()

class PurchaseViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active purchases with related data
        if self.action == 'deleted':
            return Purchase.get_deleted_objects().select_related(
                'company', 'maktoob', 'mineral', 'user', 'scale', 'unit'
            )
        return Purchase.get_active_objects().select_related(
            'company', 'maktoob', 'mineral', 'user', 'scale', 'unit'
        )
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()

class WeightViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Weight.objects.all().order_by('-id')
    serializer_class = WeightSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active weights with related data
        if self.action == 'deleted':
            return Weight.get_deleted_objects().select_related(
                'vehicle', 'scale', 'mineral', 'unit', 'purchase', 'user'
            )
        return Weight.get_active_objects().select_related(
            'vehicle', 'scale', 'mineral', 'unit', 'purchase', 'user'
        )
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()
    
    def create(self, request, *args, **kwargs):
        """Override create to provide better error messages"""
        try:
            return super().create(request, *args, **kwargs)
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def check_available(self, request):
        """Check if weight can be added without exceeding balance"""
        try:
            purchase_id = request.data.get('purchase')
            mineral_id = request.data.get('mineral')
            weight_amount = int(request.data.get('mineral_net_weight', 0))
            
            if not purchase_id or not mineral_id:
                return Response({
                    'status': 'error',
                    'message': 'Purchase and mineral are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            purchase = Purchase.objects.get(id=purchase_id)
            mineral = Mineral.objects.get(id=mineral_id)
            
            # Get current balance
            balance = Balance.objects.filter(
                company=purchase.company,
                mineral=mineral,
                deleted_at__isnull=True
            ).first()
            
            current_balance = balance.remaining_mineral_amount if balance else 0
            
            # Check if weight can be added
            can_add = weight_amount <= current_balance
            remaining_after = current_balance - weight_amount
            
            return Response({
                'status': 'success',
                'can_add': can_add,
                'current_balance': current_balance,
                'requested_weight': weight_amount,
                'remaining_after': remaining_after if can_add else current_balance,
                'message': f'Can add weight: {can_add}. Available: {current_balance}, Required: {weight_amount}'
            })
            
        except Purchase.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Purchase not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Mineral.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Mineral not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error checking available weight: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to check: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BalanceViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Balance.objects.all()
    serializer_class = BalanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active balances with related data
        if self.action == 'deleted':
            return Balance.get_deleted_objects().select_related(
                'purchase', 'company', 'mineral'
            )
        
        queryset = Balance.get_active_objects().select_related(
            'purchase', 'company', 'mineral'
        )
        
        # Add filtering options
        company_id = self.request.query_params.get('company_id')
        mineral_id = self.request.query_params.get('mineral_id')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if mineral_id:
            queryset = queryset.filter(mineral_id=mineral_id)
            
        return queryset
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def company_report(self, request):
        """Get balance report by company"""
        company_id = request.query_params.get('company_id')
        
        if company_id:
            balances = Balance.get_active_objects().filter(
                company_id=company_id
            ).select_related('company', 'mineral')
        else:
            balances = Balance.get_active_objects().select_related('company', 'mineral')
        
        # Group by company and mineral
        report = {}
        for balance in balances:
            company_name = balance.company.company_name if balance.company else 'Unknown'
            mineral_name = balance.mineral.name if balance.mineral else 'Unknown'
            
            key = f"{company_name} - {mineral_name}"
            
            if key not in report:
                report[key] = {
                    'company': company_name,
                    'company_id': balance.company.id if balance.company else None,
                    'mineral': mineral_name,
                    'mineral_id': balance.mineral.id if balance.mineral else None,
                    'total_remaining': 0,
                    'balances': []
                }
            
            report[key]['total_remaining'] += balance.remaining_mineral_amount
            report[key]['balances'].append({
                'id': balance.id,
                'remaining_amount': balance.remaining_mineral_amount,
                'purchase_id': balance.purchase.id if balance.purchase else None,
                'create_at': balance.create_at
            })
        
        return Response({
            'status': 'success',
            'report': list(report.values())
        })
    
    @action(detail=False, methods=['get'])
    def mineral_report(self, request):
        """Get balance report by mineral"""
        mineral_id = request.query_params.get('mineral_id')
        
        if mineral_id:
            balances = Balance.get_active_objects().filter(
                mineral_id=mineral_id
            ).select_related('company', 'mineral')
        else:
            balances = Balance.get_active_objects().select_related('company', 'mineral')
        
        # Group by mineral
        report = {}
        for balance in balances:
            mineral_name = balance.mineral.name if balance.mineral else 'Unknown'
            
            if mineral_name not in report:
                report[mineral_name] = {
                    'mineral': mineral_name,
                    'mineral_id': balance.mineral.id if balance.mineral else None,
                    'total_remaining': 0,
                    'companies': []
                }
            
            report[mineral_name]['total_remaining'] += balance.remaining_mineral_amount
            
            # Check if company already in list
            company_exists = False
            for company_data in report[mineral_name]['companies']:
                if company_data['company_id'] == balance.company.id:
                    company_data['amount'] += balance.remaining_mineral_amount
                    company_exists = True
                    break
            
            if not company_exists and balance.company:
                report[mineral_name]['companies'].append({
                    'company': balance.company.company_name,
                    'company_id': balance.company.id,
                    'amount': balance.remaining_mineral_amount
                })
        
        return Response({
            'status': 'success',
            'report': list(report.values())
        })
    
    @action(detail=False, methods=['get'])
    def low_balance(self, request):
        """Get balances that are running low"""
        threshold = int(request.query_params.get('threshold', 100))
        
        low_balances = Balance.get_active_objects().filter(
            remaining_mineral_amount__lte=threshold
        ).select_related('company', 'mineral')
        
        serializer = self.get_serializer(low_balances, many=True)
        
        return Response({
            'status': 'success',
            'count': low_balances.count(),
            'threshold': threshold,
            'balances': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def check_available(self, request):
        """Check available mineral amount for a company"""
        company_id = request.query_params.get('company_id')
        mineral_id = request.query_params.get('mineral_id')
        
        if not company_id or not mineral_id:
            return Response({
                'status': 'error',
                'message': 'Both company_id and mineral_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get total balance for this company and mineral
            balances = Balance.get_active_objects().filter(
                company_id=company_id,
                mineral_id=mineral_id
            )
            
            total_available = sum(balance.remaining_mineral_amount for balance in balances)
            
            # Get company and mineral info
            company = Company.objects.get(id=company_id)
            mineral = Mineral.objects.get(id=mineral_id)
            
            return Response({
                'status': 'success',
                'company': company.company_name,
                'mineral': mineral.name,
                'total_available': total_available,
                'balance_count': balances.count(),
                'balances': [
                    {
                        'id': balance.id,
                        'remaining': balance.remaining_mineral_amount,
                        'purchase_id': balance.purchase.id if balance.purchase else None
                    }
                    for balance in balances
                ]
            })
            
        except (Company.DoesNotExist, Mineral.DoesNotExist) as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error checking available mineral: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to check available mineral: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MompViewSet(SoftDeleteViewSetMixin, ModelViewSet):
    queryset = Momp.objects.all()
    serializer_class = MompSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get active momps with related data
        if self.action == 'deleted':
            return Momp.get_deleted_objects().select_related('scale')
        return Momp.get_active_objects().select_related('scale')
    
    def perform_destroy(self, instance):
        """Override destroy to use soft delete"""
        instance.soft_delete()

# Debug endpoint to test cascade delete
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_cascade_delete(request, pk):
    """Test cascade delete for a company"""
    try:
        from django.utils import timezone
        
        company = Company.objects.get(pk=pk)
        
        # Check related objects before deletion
        before_data = {
            'company': {
                'id': company.id,
                'name': company.company_name,
                'deleted': company.is_deleted
            },
            'vehicles': {
                'count': company.vehicle.filter(deleted_at__isnull=True).count(),
                'list': list(company.vehicle.filter(deleted_at__isnull=True).values_list('id', 'car_name'))
            },
            'maktoobs': {
                'count': Maktoob.objects.filter(company=company, deleted_at__isnull=True).count(),
                'list': list(Maktoob.objects.filter(company=company, deleted_at__isnull=True).values_list('id', 'maktoob_type'))
            },
            'purchases': {
                'count': Purchase.objects.filter(company=company, deleted_at__isnull=True).count(),
                'list': list(Purchase.objects.filter(company=company, deleted_at__isnull=True).values_list('id', 'area'))
            }
        }
        
        # Soft delete the company
        with transaction.atomic():
            company.soft_delete()
        
        # Check related objects after deletion
        after_data = {
            'company_deleted': company.is_deleted,
            'company_deleted_at': company.deleted_at,
            'vehicles_deleted': {
                'count': company.vehicle.filter(deleted_at__isnull=False).count(),
                'list': list(company.vehicle.filter(deleted_at__isnull=False).values_list('id', 'car_name', 'deleted_at'))
            },
            'maktoobs_deleted': {
                'count': Maktoob.objects.filter(company=company, deleted_at__isnull=False).count(),
                'list': list(Maktoob.objects.filter(company=company, deleted_at__isnull=False).values_list('id', 'maktoob_type', 'deleted_at'))
            },
            'purchases_deleted': {
                'count': Purchase.objects.filter(company=company, deleted_at__isnull=False).count(),
                'list': list(Purchase.objects.filter(company=company, deleted_at__isnull=False).values_list('id', 'area', 'deleted_at'))
            }
        }
        
        return Response({
            'status': 'success',
            'message': 'Company cascade delete test completed',
            'before': before_data,
            'after': after_data,
            'company_id': company.id
        })
        
    except Company.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Company with id {pk} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in test_cascade_delete: {str(e)}")
        logger.error(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': f'Failed to test cascade delete: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Debug endpoint to check relationships
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_company_relationships(request, pk):
    """Check all relationships for a company"""
    try:
        company = Company.objects.get(pk=pk)
        
        # Get all related data
        data = {
            'company': {
                'id': company.id,
                'name': company.company_name,
                'is_deleted': company.is_deleted
            },
            'vehicles': {
                'total': Vehicle.objects.filter(companies=company).count(),
                'active': Vehicle.objects.filter(companies=company, deleted_at__isnull=True).count(),
                'deleted': Vehicle.objects.filter(companies=company, deleted_at__isnull=False).count(),
                'list': list(Vehicle.objects.filter(companies=company, deleted_at__isnull=True).values('id', 'car_name', 'plate_number', 'deleted_at'))
            },
            'maktoobs': {
                'total': Maktoob.objects.filter(company=company).count(),
                'active': Maktoob.objects.filter(company=company, deleted_at__isnull=True).count(),
                'deleted': Maktoob.objects.filter(company=company, deleted_at__isnull=False).count(),
                'list': list(Maktoob.objects.filter(company=company, deleted_at__isnull=True).values('id', 'maktoob_type', 'maktoob_number', 'deleted_at'))
            },
            'purchases': {
                'total': Purchase.objects.filter(company=company).count(),
                'active': Purchase.objects.filter(company=company, deleted_at__isnull=True).count(),
                'deleted': Purchase.objects.filter(company=company, deleted_at__isnull=False).count(),
                'list': list(Purchase.objects.filter(company=company, deleted_at__isnull=True).values('id', 'area', 'mineral_amount', 'deleted_at'))
            }
        }
        
        return Response({
            'status': 'success',
            'data': data
        })
        
    except Company.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Company with id {pk} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in check_company_relationships: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# New endpoints for deleted records management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_deleted_counts(request):
    """Get counts of all deleted records for each model"""
    try:
        from django.db.models import Count
        
        counts = {
            'companies': {
                'count': Company.get_deleted_objects().count(),
                'model_name': 'Company'
            },
            'vehicles': {
                'count': Vehicle.get_deleted_objects().count(),
                'model_name': 'Vehicle'
            },
            'maktoobs': {
                'count': Maktoob.get_deleted_objects().count(),
                'model_name': 'Maktoob'
            },
            'purchases': {
                'count': Purchase.get_deleted_objects().count(),
                'model_name': 'Purchase'
            },
            'units': {
                'count': Unit.get_deleted_objects().count(),
                'model_name': 'Unit'
            },
            'minerals': {
                'count': Mineral.get_deleted_objects().count(),
                'model_name': 'Mineral'
            },
            'vehicle_types': {
                'count': VehicleType.get_deleted_objects().count(),
                'model_name': 'Vehicle Type'
            },
            'scales': {
                'count': Scale.get_deleted_objects().count(),
                'model_name': 'Scale'
            },
            'weights': {
                'count': Weight.get_deleted_objects().count(),
                'model_name': 'Weight'
            },
            'balances': {
                'count': Balance.get_deleted_objects().count(),
                'model_name': 'Balance'
            },
            'momps': {
                'count': Momp.get_deleted_objects().count(),
                'model_name': 'MOMP'
            },
        }
        
        total_deleted = sum(item['count'] for item in counts.values())
        
        return Response({
            'status': 'success',
            'total_deleted': total_deleted,
            'counts': counts,
            'message': 'Deleted records counts retrieved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error getting deleted counts: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to get deleted counts: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_restore(request):
    """Bulk restore deleted records"""
    try:
        model_name = request.data.get('model')
        record_ids = request.data.get('ids', [])
        
        if not model_name or not record_ids:
            return Response({
                'status': 'error',
                'message': 'Model name and record IDs are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Map model names to actual models
        model_map = {
            'companies': Company,
            'vehicles': Vehicle,
            'maktoobs': Maktoob,
            'purchases': Purchase,
            'units': Unit,
            'minerals': Mineral,
            'vehicle-types': VehicleType,
            'scales': Scale,
            'weights': Weight,
            'balances': Balance,
            'momps': Momp,
        }
        
        model_class = model_map.get(model_name)
        if not model_class:
            return Response({
                'status': 'error',
                'message': f'Invalid model name: {model_name}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get deleted records
        deleted_records = model_class.get_deleted_objects().filter(id__in=record_ids)
        
        restored_count = 0
        with transaction.atomic():
            for record in deleted_records:
                record.restore()
                restored_count += 1
        
        return Response({
            'status': 'success',
            'message': f'Successfully restored {restored_count} records',
            'restored_count': restored_count,
            'total_requested': len(record_ids)
        })
        
    except Exception as e:
        logger.error(f"Error in bulk restore: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to bulk restore: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_permanent_delete(request):
    """Bulk permanently delete records"""
    try:
        model_name = request.data.get('model')
        record_ids = request.data.get('ids', [])
        
        if not model_name or not record_ids:
            return Response({
                'status': 'error',
                'message': 'Model name and record IDs are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Map model names to actual models
        model_map = {
            'companies': Company,
            'vehicles': Vehicle,
            'maktoobs': Maktoob,
            'purchases': Purchase,
            'units': Unit,
            'minerals': Mineral,
            'vehicle-types': VehicleType,
            'scales': Scale,
            'weights': Weight,
            'balances': Balance,
            'momps': Momp,
        }
        
        model_class = model_map.get(model_name)
        if not model_class:
            return Response({
                'status': 'error',
                'message': f'Invalid model name: {model_name}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get deleted records
        deleted_records = model_class.get_deleted_objects().filter(id__in=record_ids)
        
        deleted_count = 0
        with transaction.atomic():
            for record in deleted_records:
                record.delete()  # This performs hard delete
                deleted_count += 1
        
        return Response({
            'status': 'success',
            'message': f'Successfully permanently deleted {deleted_count} records',
            'deleted_count': deleted_count,
            'total_requested': len(record_ids)
        })
        
    except Exception as e:
        logger.error(f"Error in bulk permanent delete: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to bulk delete: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Simple endpoint to test if the backend is working
from django.utils import timezone

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'message': 'Django backend is running'
    })

# Test endpoint to create some deleted records for testing
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_test_deleted_records(request):
    """Create test deleted records for debugging"""
    try:
        from django.utils import timezone
        
        test_data = []
        
        # Create a test company and soft delete it
        test_company, created = Company.objects.get_or_create(
            company_name="Test Company for Deletion",
            defaults={
                'leader_name': 'Test Leader',
                'phone': '1234567890',
                'company_type': 'Test',
                'TIN_number': 'TEST123',
                'status': 1,
                'user': request.user
            }
        )
        
        if created:
            # Create a test vehicle
            test_vehicle, vehicle_created = Vehicle.objects.get_or_create(
                car_name="Test Vehicle",
                plate_number="TEST-001",
                defaults={
                    'driver_name': 'Test Driver',
                    'empty_weight': 1000,
                    'status': 1
                }
            )
            
            # Link vehicle to company
            test_company.vehicle.add(test_vehicle)
            
            # Soft delete the company (which should also track and potentially soft delete the vehicle)
            test_company.soft_delete()
            
            test_data.append({
                'model': 'Company',
                'id': test_company.id,
                'name': test_company.company_name,
                'deleted_at': test_company.deleted_at,
                'vehicle_linked': test_vehicle.id
            })
            
            # Check if vehicle was also soft deleted
            test_vehicle.refresh_from_db()
            if test_vehicle.is_deleted:
                test_data.append({
                    'model': 'Vehicle',
                    'id': test_vehicle.id,
                    'name': test_vehicle.car_name,
                    'deleted_at': test_vehicle.deleted_at,
                    'deleted_because_of_company': True
                })
        
        return Response({
            'status': 'success',
            'message': f'Created {len(test_data)} test deleted records',
            'test_records': test_data,
            'total_deleted_companies': Company.get_deleted_objects().count(),
            'total_deleted_vehicles': Vehicle.get_deleted_objects().count()
        })
        
    except Exception as e:
        logger.error(f"Error creating test deleted records: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to create test records: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Test endpoint to restore company with vehicles
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_restore_company_with_vehicles(request, pk):
    """Test restoring a company with its vehicles"""
    try:
        # Get the deleted company
        company = Company.get_deleted_objects().filter(pk=pk).first()
        if not company:
            return Response({
                'status': 'error',
                'message': 'Company not found or not deleted'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get tracked relationships before restoration
        tracked_relationships = DeletedRelationship.objects.filter(
            model_name='Company',
            model_id=company.id,
            related_model='Vehicle',
        )
        
        tracked_vehicle_ids = [r.related_id for r in tracked_relationships]
        
        # Get vehicle status before restoration
        vehicles_before = []
        for vehicle_id in tracked_vehicle_ids:
            try:
                vehicle = Vehicle.objects.get(id=vehicle_id)
                vehicles_before.append({
                    'id': vehicle.id,
                    'name': vehicle.car_name,
                    'is_deleted': vehicle.is_deleted,
                })
            except Vehicle.DoesNotExist:
                pass
        
        # Restore company with vehicles
        restored_vehicles = []
        
        with transaction.atomic():
            # Restore the company (this will trigger cascade_restore)
            company.restore()
            
            # Check which vehicles were restored
            for vehicle_id in tracked_vehicle_ids:
                try:
                    vehicle = Vehicle.objects.get(id=vehicle_id)
                    if not vehicle.is_deleted:
                        restored_vehicles.append({
                            'id': vehicle.id,
                            'name': vehicle.car_name,
                        })
                except Vehicle.DoesNotExist:
                    pass
        
        return Response({
            'status': 'success',
            'message': 'Company restoration test completed',
            'company_id': company.id,
            'company_name': company.company_name,
            'vehicles_before': vehicles_before,
            'vehicles_restored': restored_vehicles,
            'tracked_vehicle_count': len(tracked_vehicle_ids),
            'restored_vehicle_count': len(restored_vehicles)
        })
        
    except Exception as e:
        logger.error(f"Error in test_restore_company_with_vehicles: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to test restoration: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def balance_transactions(request, company_id):
    """Get all transactions (purchases and weights) affecting a company's balance"""
    try:
        company = Company.objects.get(id=company_id)
        
        # Get all purchases for this company
        purchases = Purchase.get_active_objects().filter(
            company=company
        ).select_related('mineral')
        
        # Get all weights for this company (through purchases)
        weights = Weight.get_active_objects().filter(
            purchase__company=company
        ).select_related('purchase', 'mineral')
        
        # Get current balances for all minerals
        balances = Balance.get_active_objects().filter(
            company=company
        ).select_related('mineral')
        
        transactions = []
        
        # Add purchases as positive transactions
        for purchase in purchases:
            transactions.append({
                'type': 'PURCHASE',
                'id': purchase.id,
                'date': purchase.create_at,
                'mineral': purchase.mineral.name if purchase.mineral else 'Unknown',
                'mineral_id': purchase.mineral.id if purchase.mineral else None,
                'amount': purchase.mineral_amount,
                'action': 'ADDED',
                'description': f'Purchase from {purchase.area}',
                'reference': f'Purchase #{purchase.id}'
            })
        
        # Add weights as negative transactions
        for weight in weights:
            transactions.append({
                'type': 'WEIGHT',
                'id': weight.id,
                'date': weight.create_at,
                'mineral': weight.mineral.name if weight.mineral else 'Unknown',
                'mineral_id': weight.mineral.id if weight.mineral else None,
                'amount': weight.mineral_net_weight,
                'action': 'SUBTRACTED',
                'description': f'Weight transfer: {weight.transfor_type}',
                'reference': f'Weight #{weight.id}'
            })
        
        # Sort transactions by date (newest first)
        transactions.sort(key=lambda x: x['date'], reverse=True)
        
        # Calculate current balance for each mineral
        mineral_balances = {}
        for transaction in transactions:
            mineral = transaction['mineral']
            amount = transaction['amount']
            
            if mineral not in mineral_balances:
                mineral_balances[mineral] = {
                    'mineral_name': mineral,
                    'mineral_id': transaction['mineral_id'],
                    'current_balance': 0,
                    'total_added': 0,
                    'total_subtracted': 0
                }
            
            if transaction['action'] == 'ADDED':
                mineral_balances[mineral]['current_balance'] += amount
                mineral_balances[mineral]['total_added'] += amount
            else:
                mineral_balances[mineral]['current_balance'] -= amount
                mineral_balances[mineral]['total_subtracted'] += amount
        
        # Add actual balance from database
        actual_balances = []
        for balance in balances:
            actual_balances.append({
                'mineral': balance.mineral.name if balance.mineral else 'Unknown',
                'remaining': balance.remaining_mineral_amount,
                'status': balance.get_balance_status()
            })
        
        return Response({
            'status': 'success',
            'company': {
                'id': company.id,
                'name': company.company_name
            },
            'calculated_balances': list(mineral_balances.values()),
            'actual_balances': actual_balances,
            'transactions': transactions,
            'total_transactions': len(transactions),
            'total_purchases': purchases.count(),
            'total_weights': weights.count()
        })
        
    except Company.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Company with id {company_id} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting balance transactions: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to get transactions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_balances(request):
    """Recalculate all balances from scratch (useful for fixing data issues) - SINGLE FUNCTION"""
    try:
        with transaction.atomic():
            # Get all companies and minerals
            companies = Company.get_active_objects().all()
            minerals = Mineral.get_active_objects().all()
            
            # Clear all existing balances (soft delete)
            Balance.get_active_objects().update(deleted_at=timezone.now())
            
            # Create new balances based on purchases and weights
            for company in companies:
                for mineral in minerals:
                    # Calculate total purchases for this company+mineral
                    total_purchases = Purchase.get_active_objects().filter(
                        company=company,
                        mineral=mineral
                    ).aggregate(total=Sum('mineral_amount'))['total'] or 0
                    
                    # Calculate total weights for this company+mineral
                    total_weights = Weight.get_active_objects().filter(
                        purchase__company=company,
                        mineral=mineral
                    ).aggregate(total=Sum('mineral_net_weight'))['total'] or 0
                    
                    # Calculate net balance
                    net_balance = total_purchases - total_weights
                    
                    # Only create balance if there are transactions
                    if total_purchases > 0 or total_weights > 0:
                        # Get the most recent purchase for reference
                        recent_purchase = Purchase.get_active_objects().filter(
                            company=company,
                            mineral=mineral
                        ).order_by('-create_at').first()
                        
                        Balance.objects.create(
                            remaining_mineral_amount=net_balance,
                            company_type=company.company_type,
                            count_90days=90,
                            purchase=recent_purchase,
                            company=company,
                            mineral=mineral
                        )
                        
                        # Update balance_updated flags for purchases
                        Purchase.get_active_objects().filter(
                            company=company,
                            mineral=mineral
                        ).update(balance_updated=True)
                        
                        # Update balance_updated flags for weights
                        Weight.get_active_objects().filter(
                            purchase__company=company,
                            mineral=mineral
                        ).update(balance_updated=True)
        
        return Response({
            'status': 'success',
            'message': 'Balances recalculated successfully',
            'companies_processed': companies.count(),
            'minerals_processed': minerals.count(),
            'active_balances': Balance.get_active_objects().count()
        })
        
    except Exception as e:
        logger.error(f"Error recalculating balances: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to recalculate balances: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_balance(request, company_id, mineral_id):
    """Get current balance for a specific company and mineral"""
    try:
        company = Company.objects.get(id=company_id)
        mineral = Mineral.objects.get(id=mineral_id)
        
        # Get all active balances for this company and mineral
        balances = Balance.get_active_objects().filter(
            company=company,
            mineral=mineral
        )
        
        total_balance = sum(balance.remaining_mineral_amount for balance in balances)
        
        # Get recent transactions
        recent_purchases = Purchase.get_active_objects().filter(
            company=company,
            mineral=mineral
        ).order_by('-create_at')[:5]
        
        recent_weights = Weight.get_active_objects().filter(
            purchase__company=company,
            mineral=mineral
        ).order_by('-create_at')[:5]
        
        return Response({
            'status': 'success',
            'company': {
                'id': company.id,
                'name': company.company_name
            },
            'mineral': {
                'id': mineral.id,
                'name': mineral.name
            },
            'current_balance': total_balance,
            'balance_count': balances.count(),
            'recent_purchases': [
                {
                    'id': p.id,
                    'amount': p.mineral_amount,
                    'date': p.create_at,
                    'area': p.area
                }
                for p in recent_purchases
            ],
            'recent_weights': [
                {
                    'id': w.id,
                    'amount': w.mineral_net_weight,
                    'date': w.create_at,
                    'type': w.transfor_type
                }
                for w in recent_weights
            ]
        })
        
    except (Company.DoesNotExist, Mineral.DoesNotExist) as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting current balance: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to get current balance: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_balance_system(request, company_id=None, mineral_id=None):
    """Debug endpoint to check balance calculations"""
    try:
        debug_info = {
            'balances': [],
            'purchases': [],
            'weights': [],
            'calculations': []
        }
        
        if company_id and mineral_id:
            # Specific company and mineral
            company = Company.objects.get(id=company_id)
            mineral = Mineral.objects.get(id=mineral_id)
            
            # Get balance
            balance = Balance.objects.filter(
                company=company,
                mineral=mineral,
                deleted_at__isnull=True
            ).first()
            
            # Get all purchases
            purchases = Purchase.get_active_objects().filter(
                company=company,
                mineral=mineral
            )
            
            # Get all weights
            weights = Weight.get_active_objects().filter(
                purchase__company=company,
                mineral=mineral
            )
            
            total_purchases = sum(p.mineral_amount for p in purchases)
            total_weights = sum(w.mineral_net_weight for w in weights)
            calculated_balance = total_purchases - total_weights
            
            debug_info['company'] = company.company_name
            debug_info['mineral'] = mineral.name
            debug_info['purchases'] = [
                {
                    'id': p.id,
                    'amount': p.mineral_amount,
                    'balance_updated': p.balance_updated
                }
                for p in purchases
            ]
            debug_info['weights'] = [
                {
                    'id': w.id,
                    'amount': w.mineral_net_weight,
                    'balance_updated': w.balance_updated
                }
                for w in weights
            ]
            debug_info['calculations'] = {
                'total_purchases': total_purchases,
                'total_weights': total_weights,
                'calculated_balance': calculated_balance,
                'actual_balance': balance.remaining_mineral_amount if balance else 0,
                'match': (calculated_balance == (balance.remaining_mineral_amount if balance else 0))
            }
            
        else:
            # All balances
            balances = Balance.get_active_objects().select_related('company', 'mineral')
            for balance in balances:
                # Calculate expected balance
                purchases = Purchase.get_active_objects().filter(
                    company=balance.company,
                    mineral=balance.mineral
                )
                weights = Weight.get_active_objects().filter(
                    purchase__company=balance.company,
                    mineral=balance.mineral
                )
                
                total_purchases = sum(p.mineral_amount for p in purchases)
                total_weights = sum(w.mineral_net_weight for w in weights)
                calculated_balance = total_purchases - total_weights
                
                debug_info['balances'].append({
                    'id': balance.id,
                    'company': balance.company.company_name,
                    'mineral': balance.mineral.name,
                    'actual_balance': balance.remaining_mineral_amount,
                    'calculated_balance': calculated_balance,
                    'match': calculated_balance == balance.remaining_mineral_amount,
                    'purchase_count': purchases.count(),
                    'weight_count': weights.count()
                })
        
        return Response({
            'status': 'success',
            'debug_info': debug_info
        })
        
    except Exception as e:
        logger.error(f"Error in debug balance system: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Debug failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_weight_addition(request):
    """Validate if a weight can be added without exceeding balance"""
    try:
        serializer = WeightSerializer(data=request.data)
        
        if serializer.is_valid():
            # Extract validated data
            data = serializer.validated_data
            purchase = data.get('purchase')
            mineral = data.get('mineral')
            mineral_net_weight = data.get('mineral_net_weight', 0)
            
            if purchase and mineral:
                # Get current balance
                balance = Balance.objects.filter(
                    company=purchase.company,
                    mineral=mineral,
                    deleted_at__isnull=True
                ).first()
                
                current_balance = balance.remaining_mineral_amount if balance else 0
                
                if mineral_net_weight <= current_balance:
                    return Response({
                        'status': 'success',
                        'message': 'Weight can be added',
                        'current_balance': current_balance,
                        'remaining_after': current_balance - mineral_net_weight
                    })
                else:
                    return Response({
                        'status': 'error',
                        'message': f'Insufficient balance. Available: {current_balance}, Required: {mineral_net_weight}',
                        'current_balance': current_balance,
                        'required': mineral_net_weight,
                        'deficit': mineral_net_weight - current_balance
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Purchase and mineral are required'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error validating weight addition: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Validation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_balance_update(request):
    """Test endpoint to verify balance updates work"""
    try:
        # Create test company and mineral if they don't exist
        test_company, created = Company.objects.get_or_create(
            company_name="TEST Balance Company",
            defaults={
                'leader_name': 'Test Leader',
                'phone': '1234567890',
                'company_type': 'Test',
                'TIN_number': 'BALTEST001',
                'status': 1,
                'user': request.user
            }
        )
        
        test_mineral, created = Mineral.objects.get_or_create(
            name="TEST Mineral",
            defaults={
                'unit_price': 100.00,
                'mineral_description': 'Test mineral for balance testing',
                'unit': Unit.objects.first()
            }
        )
        
        results = []
        
        # TEST 1: Create a purchase
        print("\n=== TEST 1: Creating Purchase ===")
        purchase1 = Purchase.objects.create(
            area="Test Area 1",
            mineral_amount=1000,
            unit_price=50.00,
            mineral_total_price=50000.00,
            royalty_receipt_number=1001,
            weighing_total_price=500,
            haq_wazan_receipt_number=2001,
            company=test_company,
            mineral=test_mineral,
            user=request.user
        )
        
        # Check balance after purchase
        balance1 = Balance.objects.filter(company=test_company, mineral=test_mineral).first()
        results.append({
            'test': 'Purchase Creation',
            'purchase_amount': 1000,
            'balance_after': balance1.remaining_mineral_amount if balance1 else 0,
            'expected': 1000,
            'passed': balance1.remaining_mineral_amount == 1000 if balance1 else False
        })
        
        # TEST 2: Create a weight (subtract from balance)
        print("\n=== TEST 2: Creating Weight ===")
        weight1 = Weight.objects.create(
            mineral_net_weight=300,
            second_weight=1300,
            control_weight=1000,
            transfor_type="Test Transfer",
            area="Test Area",
            discharge_place="Test Discharge",
            bill_number="BIL001",
            purchase=purchase1,
            mineral=test_mineral,
            vehicle=Vehicle.objects.first(),
            user=request.user
        )
        
        # Check balance after weight
        balance1.refresh_from_db()
        results.append({
            'test': 'Weight Creation',
            'weight_amount': 300,
            'balance_after': balance1.remaining_mineral_amount,
            'expected': 700,  # 1000 - 300
            'passed': balance1.remaining_mineral_amount == 700
        })
        
        # TEST 3: Create another purchase (add more)
        print("\n=== TEST 3: Creating Second Purchase ===")
        purchase2 = Purchase.objects.create(
            area="Test Area 2",
            mineral_amount=500,
            unit_price=60.00,
            mineral_total_price=30000.00,
            royalty_receipt_number=1002,
            weighing_total_price=600,
            haq_wazan_receipt_number=2002,
            company=test_company,
            mineral=test_mineral,
            user=request.user
        )
        
        # Check balance after second purchase
        balance1.refresh_from_db()
        results.append({
            'test': 'Second Purchase',
            'purchase_amount': 500,
            'balance_after': balance1.remaining_mineral_amount,
            'expected': 1200,  # 700 + 500
            'passed': balance1.remaining_mineral_amount == 1200
        })
        
        # TEST 4: Create another weight (go to zero)
        print("\n=== TEST 4: Creating Weight to Reach Zero ===")
        weight2 = Weight.objects.create(
            mineral_net_weight=1200,
            second_weight=2200,
            control_weight=1000,
            transfor_type="Test Transfer 2",
            area="Test Area 2",
            discharge_place="Test Discharge 2",
            bill_number="BIL002",
            purchase=purchase2,
            mineral=test_mineral,
            vehicle=Vehicle.objects.first(),
            user=request.user
        )
        
        # Check balance after weight (should be zero)
        balance1.refresh_from_db()
        results.append({
            'test': 'Weight to Zero',
            'weight_amount': 1200,
            'balance_after': balance1.remaining_mineral_amount,
            'expected': 0,  # 1200 - 1200
            'passed': balance1.remaining_mineral_amount == 0
        })
        
        # TEST 5: Update a purchase amount
        print("\n=== TEST 5: Updating Purchase Amount ===")
        purchase1.mineral_amount = 1500  # Increase from 1000 to 1500
        purchase1.save()
        
        # Check balance after update (should increase by 500)
        balance1.refresh_from_db()
        results.append({
            'test': 'Update Purchase',
            'old_amount': 1000,
            'new_amount': 1500,
            'balance_after': balance1.remaining_mineral_amount,
            'expected': 500,  # 0 + (1500 - 1000)
            'passed': balance1.remaining_mineral_amount == 500
        })
        
        # TEST 6: Delete a weight (should add back to balance)
        print("\n=== TEST 6: Deleting Weight ===")
        weight1.delete()
        
        # Check balance after delete (should add back 300)
        balance1.refresh_from_db()
        results.append({
            'test': 'Delete Weight',
            'deleted_weight': 300,
            'balance_after': balance1.remaining_mineral_amount,
            'expected': 800,  # 500 + 300
            'passed': balance1.remaining_mineral_amount == 800
        })
        
        passed_tests = sum(1 for r in results if r['passed'])
        total_tests = len(results)
        
        return Response({
            'status': 'success',
            'message': f'Balance update tests completed: {passed_tests}/{total_tests} passed',
            'company_id': test_company.id,
            'mineral_id': test_mineral.id,
            'final_balance': balance1.remaining_mineral_amount,
            'test_results': results,
            'summary': {
                'passed': passed_tests,
                'failed': total_tests - passed_tests,
                'total': total_tests
            }
        })
        
    except Exception as e:
        logger.error(f"Error in test_balance_update: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Test failed: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monitor_balance_updates(request):
    """Monitor balance updates in real-time"""
    # Get recent purchases and weights
    recent_purchases = Purchase.objects.order_by('-create_at')[:10]
    recent_weights = Weight.objects.order_by('-create_at')[:10]
    
    # Get balances
    balances = Balance.objects.all().select_related('company', 'mineral')[:20]
    
    return Response({
        'status': 'monitoring',
        'timestamp': timezone.now(),
        'recent_purchases': [
            {
                'id': p.id,
                'company': p.company.company_name if p.company else 'N/A',
                'mineral': p.mineral.name if p.mineral else 'N/A',
                'amount': p.mineral_amount,
                'balance_updated': p.balance_updated,
                'created': p.create_at
            }
            for p in recent_purchases
        ],
        'recent_weights': [
            {
                'id': w.id,
                'purchase_id': w.purchase.id if w.purchase else None,
                'mineral': w.mineral.name if w.mineral else 'N/A',
                'amount': w.mineral_net_weight,
                'balance_updated': w.balance_updated,
                'created': w.create_at
            }
            for w in recent_weights
        ],
        'current_balances': [
            {
                'id': b.id,
                'company': b.company.company_name if b.company else 'N/A',
                'mineral': b.mineral.name if b.mineral else 'N/A',
                'balance': b.remaining_mineral_amount,
                'status': 'POSITIVE' if b.remaining_mineral_amount > 0 else 'ZERO' if b.remaining_mineral_amount == 0 else 'NEGATIVE'
            }
            for b in balances
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company_mineral_balance(request, company_id, mineral_id):
    """Get the single balance record for a company-mineral combination"""
    try:
        company = Company.objects.get(id=company_id)
        mineral = Mineral.objects.get(id=mineral_id)
        
        # Get the ONE balance record for this company-mineral
        balance = Balance.objects.filter(
            company=company,
            mineral=mineral,
            deleted_at__isnull=True
        ).first()
        
        if not balance:
            # Create a new balance with zero amount if it doesn't exist
            balance = Balance.objects.create(
                remaining_mineral_amount=0,
                company_type=company.company_type,
                company=company,
                mineral=mineral
            )
        
        # Get related purchases and weights for this balance
        purchases = Purchase.get_active_objects().filter(
            company=company,
            mineral=mineral
        ).order_by('-create_at')
        
        weights = Weight.get_active_objects().filter(
            purchase__company=company,
            mineral=mineral
        ).order_by('-create_at')
        
        serializer = BalanceSerializer(balance)
        
        return Response({
            'status': 'success',
            'balance': serializer.data,
            'company': {
                'id': company.id,
                'name': company.company_name
            },
            'mineral': {
                'id': mineral.id,
                'name': mineral.name
            },
            'summary': {
                'total_purchases': purchases.count(),
                'total_weights': weights.count(),
                'purchase_amount': sum(p.mineral_amount for p in purchases),
                'weight_amount': sum(w.mineral_net_weight for w in weights),
                'calculated_balance': sum(p.mineral_amount for p in purchases) - sum(w.mineral_net_weight for w in weights)
            },
            'recent_purchases': [
                {
                    'id': p.id,
                    'amount': p.mineral_amount,
                    'date': p.create_at,
                    'area': p.area
                }
                for p in purchases[:5]
            ],
            'recent_weights': [
                {
                    'id': w.id,
                    'amount': w.mineral_net_weight,
                    'date': w.create_at,
                    'type': w.transfor_type
                }
                for w in weights[:5]
            ]
        })
        
    except (Company.DoesNotExist, Mineral.DoesNotExist) as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting company-mineral balance: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to get balance: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fix_duplicate_balances(request):
    """Fix duplicate balance records (merge them into one)"""
    try:
        from django.db.models import Count
        
        # Find all duplicate balances
        duplicates = Balance.objects.values('company', 'mineral').annotate(
            count=Count('id')
        ).filter(count__gt=1, deleted_at__isnull=True)
        
        fixed_count = 0
        
        with transaction.atomic():
            for dup in duplicates:
                company_id = dup['company']
                mineral_id = dup['mineral']
                
                # Get all active balances for this company-mineral combination
                balances = Balance.objects.filter(
                    company_id=company_id,
                    mineral_id=mineral_id,
                    deleted_at__isnull=True
                )
                
                if balances.count() > 1:
                    # Calculate total remaining amount
                    total_remaining = sum(b.remaining_mineral_amount for b in balances)
                    
                    # Keep the first one
                    first_balance = balances.first()
                    
                    # Update first balance with total
                    first_balance.remaining_mineral_amount = total_remaining
                    first_balance.save()
                    
                    # Soft delete other balances
                    other_balances = balances.exclude(id=first_balance.id)
                    other_balances.update(deleted_at=timezone.now())
                    
                    fixed_count += other_balances.count()
                    
                    print(f"Fixed {other_balances.count()} duplicate balances for company {company_id}, mineral {mineral_id}")
        
        return Response({
            'status': 'success',
            'message': f'Fixed {fixed_count} duplicate balance records',
            'fixed_count': fixed_count,
            'duplicate_groups': len(duplicates)
        })
        
    except Exception as e:
        logger.error(f"Error fixing duplicate balances: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to fix duplicates: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_balances(request):
    """List all balance records (one per company-mineral)"""
    try:
        balances = Balance.get_active_objects().select_related('company', 'mineral')
        
        # Organize by company
        company_balances = {}
        for balance in balances:
            company_name = balance.company.company_name
            
            if company_name not in company_balances:
                company_balances[company_name] = {
                    'company_id': balance.company.id,
                    'company_name': company_name,
                    'minerals': [],
                    'total_balance': 0
                }
            
            company_balances[company_name]['minerals'].append({
                'mineral_id': balance.mineral.id,
                'mineral_name': balance.mineral.name,
                'remaining_amount': balance.remaining_mineral_amount,
                'status': balance.get_balance_status()
            })
            company_balances[company_name]['total_balance'] += balance.remaining_mineral_amount
        
        return Response({
            'status': 'success',
            'total_balances': balances.count(),
            'company_balances': list(company_balances.values()),
            'message': f'Found {balances.count()} unique company-mineral balances'
        })
        
    except Exception as e:
        logger.error(f"Error listing all balances: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'Failed to list balances: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)