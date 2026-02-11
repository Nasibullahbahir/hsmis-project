# serializers.py - FIXED VERSION
from rest_framework import serializers
from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BasedUserCreateSerializer
from .models import Unit, Mineral, VehicleType, Vehicle, Company, Scale, Maktoob, Purchase, Weight, Balance, Momp, Userprofile
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses
        data.update({
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'is_staff': self.user.is_staff,
                'is_superuser': self.user.is_superuser,
                'is_active': self.user.is_active
            }
        })
        return data

# Simple UserCreateSerializer without password confirmation
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'default': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        # Create user instance
        user = User.objects.create(**validated_data)
        
        # Set password (hashed)
        if password:
            user.set_password(password)
            user.save()
        
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    class Meta:
        model = Userprofile
        fields = ['id', 'user_id', 'phone', 'birth_date']

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'
        read_only_fields = ['deleted_at']

class MineralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mineral
        fields = '__all__'
        read_only_fields = ['deleted_at']

class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = '__all__'
        read_only_fields = ['deleted_at']

class CompanySerializer(serializers.ModelSerializer):
    create_at = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ('update_at', 'user', 'deleted_at')
    
    def create(self, validated_data):
        # Automatically set the current user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        # Set create_at to current time if not provided
        if 'create_at' not in validated_data or not validated_data['create_at']:
            validated_data['create_at'] = timezone.now().date()
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Automatically update the update_at field
        validated_data['update_at'] = timezone.now().date()
        return super().update(instance, validated_data)

# SIMPLE VehicleSerializer that works with frontend
class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type_excel_count = serializers.SerializerMethodField()
    vehicle_type_tire_count = serializers.SerializerMethodField()
    vehicle_type_allow_weight_ton = serializers.SerializerMethodField()
    
    # For writing/updating, accept vehicle_type as ID
    vehicle_type = serializers.PrimaryKeyRelatedField(
        queryset=VehicleType.objects.filter(deleted_at__isnull=True),
        required=False,
        allow_null=True
    )
    
    companies = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Company.objects.filter(deleted_at__isnull=True),
        required=False
    )
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'car_name', 'plate_number', 'driver_name',
            'empty_weight', 'vehicle_type', 'vehicle_type_excel_count',
            'vehicle_type_tire_count', 'vehicle_type_allow_weight_ton',
            'status', 'companies', 'deleted_at', 'create_at', 'update_at'
        ]
        read_only_fields = ['deleted_at', 'create_at', 'update_at']
    
    def get_vehicle_type_excel_count(self, obj):
        """Get excel count"""
        if obj.vehicle_type:
            return obj.vehicle_type.excel_count
        return None
    
    def get_vehicle_type_tire_count(self, obj):
        """Get tire count"""
        if obj.vehicle_type:
            return obj.vehicle_type.tire_count
        return None
    
    def get_vehicle_type_allow_weight_ton(self, obj):
        """Get allow weight ton"""
        if obj.vehicle_type:
            return obj.vehicle_type.allow_weight_ton
        return None
    
    def to_representation(self, instance):
        """Custom representation for frontend"""
        representation = super().to_representation(instance)
        
        # Add vehicle_type as ID if it exists
        if instance.vehicle_type:
            representation['vehicle_type'] = instance.vehicle_type.id
        else:
            representation['vehicle_type'] = None
        
        return representation

class ScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scale
        fields = '__all__'
        read_only_fields = ['deleted_at']

class MaktoobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maktoob
        fields = '__all__'
        read_only_fields = ['deleted_at']

class PurchaseSerializer(serializers.ModelSerializer):
    current_balance = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ['deleted_at', 'balance_updated']
    
    def get_current_balance(self, obj):
        """Get current balance for display"""
        try:
            if obj.pk and obj.company and obj.mineral:
                # Get the ONE balance record
                balance = Balance.objects.filter(
                    company=obj.company,
                    mineral=obj.mineral,
                    deleted_at__isnull=True
                ).first()
                
                if balance:
                    return balance.remaining_mineral_amount
        except Exception as e:
            print(f"Error getting current balance: {str(e)}")
        
        return 0

class WeightSerializer(serializers.ModelSerializer):
    purchase_mineral_amount = serializers.IntegerField(source='purchase.mineral_amount', read_only=True, allow_null=True)
    current_balance = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Weight
        fields = '__all__'
        read_only_fields = ['deleted_at', 'balance_updated']
    
    def get_current_balance(self, obj):
        """Get current balance for display"""
        try:
            if obj.pk and obj.purchase and obj.mineral:
                # Get the ONE balance record
                balance = Balance.objects.filter(
                    company=obj.purchase.company,
                    mineral=obj.mineral,
                    deleted_at__isnull=True
                ).first()
                
                if balance:
                    return balance.remaining_mineral_amount
        except Exception as e:
            print(f"Error getting current balance: {str(e)}")
        
        return 0
    
    def validate(self, data):
        """Validate that weight doesn't exceed available balance"""
        # Call parent validation
        data = super().validate(data)
        
        # Check if this is a new weight
        if not self.instance:  # New weight being created
            purchase = data.get('purchase')
            mineral = data.get('mineral')
            mineral_net_weight = data.get('mineral_net_weight', 0)
            
            if purchase and mineral and mineral_net_weight > 0:
                # Get current balance (ONE record)
                balance = Balance.objects.filter(
                    company=purchase.company,
                    mineral=mineral,
                    deleted_at__isnull=True
                ).first()
                
                current_balance = balance.remaining_mineral_amount if balance else 0
                
                # Check if weight exceeds balance
                if mineral_net_weight > current_balance:
                    raise serializers.ValidationError({
                        'mineral_net_weight': f'Insufficient mineral balance. Available: {current_balance}, Required: {mineral_net_weight}'
                    })
        
        return data

class BalanceSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    mineral_name = serializers.CharField(source='mineral.name', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Balance
        fields = [
            'id', 'remaining_mineral_amount', 'company_type', 
            'count_90days', 'create_at', 'update_at',
            'company', 'mineral', 'company_name', 'mineral_name',
            'status', 'deleted_at'
        ]
        read_only_fields = ['deleted_at', 'create_at', 'update_at']
    
    def get_status(self, obj):
        return obj.get_balance_status()

class MompSerializer(serializers.ModelSerializer):
    class Meta:
        model = Momp
        fields = '__all__'
        read_only_fields = ['deleted_at']