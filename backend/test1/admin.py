from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.db import models
from . import models
from .models import User , Userprofile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
   add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "usable_password", "password1", "password2", "email", "first_name","last_name"),
            },
        ),
    )
@admin.register(Userprofile)
class UserprofileAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name',]
    list_per_page = 10
    list_select_related = ['user']
    search_fields =['user__first_name__istartswith', 'user__last_name__istartswith']

# @admin.register(models.User)
# class User(admin.ModelAdmin):
#     list_display = [
#         'id',
#         'name','user_name',
#         'password', 
#         'email',
#         'phone',
#         'user_type',
#         'archive',
#         'create_at',
#         'update_at'
#         ]

@admin.register(models.Unit)
class Unit(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'weighing_price',
        'create_at',
        'update_at'
        ]

@admin.register(models.Mineral)
class Mineral(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'unit_price',
        'mineral_description',
        'create_at', 
        'update_at', 
        'unit'
        ]

@admin.register(models.VehicleType)
class VehicleType(admin.ModelAdmin):
    list_display = [
        'id',
        'truck_name',
        'excel_count',
        'tire_count',
        'allow_weight_ton',
        'create_at',
        'update_at',
        'deleted_at',
        ]

@admin.register(models.Vehicle)
class Vehicle(admin.ModelAdmin):
    list_display = [
        'id',
        'car_name',
        'plate_number',
        'driver_name',
        'empty_weight',
        'status',
        'create_at',
        'update_at',
        'vehicle_type',
        

    ]
    list_filter = ['status', 'vehicle_type']
    search_fields = ['car_name', 'plate_number', 'driver_name']

@admin.register(models.Company)
class Company(admin.ModelAdmin):
    list_display = [
        'id',
        'company_name',
        'leader_name',
        'phone',
        'TIN_number',
        'status',
        'licence_number',
        'create_at',
        'update_at',
        'user',
        
    ]
    search_fields = ['company_name', 'TIN_number', 'leader_name']
    filter_horizontal = ['vehicle']

@admin.register(models.Scale)
class Scale(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'location',
        'province_id',
        'system_type',
        'status',
        'create_at',
        'update_at',

    ]
    list_filter = ['status', 'province_id', 'system_type']
    search_fields = ['name', 'location']

@admin.register(models.Maktoob)
class Maktoob(admin.ModelAdmin):
    list_display = [
        'id',
        'maktoob_type',
        'maktoob_number',
        'sadir_date',
        'source',
        'start_date',
        'end_date',
        'description',
        'create_at',
        'update_at',
        'user',
        'company'
    ]
    list_filter = ['maktoob_type', 'sadir_date']
    search_fields = ['maktoob_number', 'source']



@admin.register(models.Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'area',
        'mineral_amount',
        'mineral_total_price',
        'royalty_receipt_number',
        'weighing_total_price',
        'haq_wazan_receipt_number',
        'create_at',
        'update_at',
        'company',
        'maktoob',
        'mineral',
        'scale',
        'unit',
        'user',
    ]
    list_filter = ['company', 'mineral', 'scale']
    search_fields = [
        'royalty_receipt_number',
        'haq_wazan_receipt_number'
    ]




@admin.register(models.Weight)
class Weight(admin.ModelAdmin):
    list_display = [
        'id',
        'second_weight',
        'mineral_net_weight',
        'control_weight',
        'area',
        'discharge_place',
        'bill_number',
        'vehicle',
        'scale',
        'mineral',
        'unit',
        'purchase',
        'user',
        'create_at',
        'update_at'
    ]
    list_filter = ['scale', 'mineral', 'vehicle']
    search_fields = ['bill_number']



@admin.register(models.Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'remaining_mineral_amount',
        'company_type',
        'count_90days',
        'create_at',
        'update_at',
        'mineral',
        'company',
    ]
    list_filter = ['company_type']
    search_fields = ['purchase__id']



@admin.register(models.Momp)
class MompAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'E_name',
        'momp',
        'momp_province',
        'scale_name',
        'note',
        'developed_by',
        'status',
        'scale',
        'create_at',
        'update_at',
    ]
    list_filter = ['status', 'momp_province', 'scale_name']
    search_fields = ['name_en', 'momp']
