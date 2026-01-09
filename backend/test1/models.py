from django.db import models
from django.contrib.auth.models import User  


class Unit(models.Model):
    name = models.CharField(max_length=255)  
    weighing_price = models.IntegerField()
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)

class Mineral(models.Model):
    name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    mineral_description = models.TextField()
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='minerals')

class VehicleType(models.Model):
    truck_name = models.CharField(max_length=255)
    excel_count = models.IntegerField() 
    tire_count = models.IntegerField() 
    allow_weight_ton = models.IntegerField()  
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)

class Vehicle(models.Model):
    car_name = models.CharField(max_length=255)  
    plate_number = models.CharField(max_length=50)
    driver_name = models.CharField(max_length=200)
    empty_weight = models.IntegerField()
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    vehicle_type = models.ForeignKey(VehicleType, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')

class Company(models.Model):
    company_name = models.CharField(max_length=255)
    leader_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    company_type = models.CharField(max_length=100)
    TIN_number = models.CharField(max_length=50, unique=True)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    vehicle = models.ManyToManyField(Vehicle, blank=True, related_name='companies')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='companies')

class Scale(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    province_id = models.CharField(max_length=255)
    system_type = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)

class Maktoob(models.Model):
    maktoob_type = models.CharField(max_length=255)
    maktoob_number = models.IntegerField()  
    sadir_date = models.DateField()
    source = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_maktoobs')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_maktoobs')

class Purchase(models.Model):
    area = models.CharField(max_length=255)
    mineral_amount = models.IntegerField() 
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    mineral_total_price = models.DecimalField(max_digits=12, decimal_places=2)
    royalty_receipt_number = models.IntegerField() 
    weighing_total_price = models.IntegerField()  
    haq_wazan_receipt_number = models.IntegerField()  
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_purchases')
    maktoob = models.ForeignKey(Maktoob, on_delete=models.SET_NULL, null=True, blank=True, related_name='maktoob_purchases')
    mineral = models.ForeignKey(Mineral, on_delete=models.SET_NULL, null=True, blank=True, related_name='mineral_purchases')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_purchases')
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='scale_purchases')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='unit_purchases')

class Weight(models.Model):
    second_weight = models.IntegerField()  
    mineral_net_weight = models.IntegerField()  
    control_weight = models.IntegerField()  
    transfor_type = models.CharField(max_length=255)
    area = models.CharField(max_length=255)
    discharge_place = models.CharField(max_length=255)
    bill_number = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicle_weights')
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='scale_weights')
    mineral = models.ForeignKey(Mineral, on_delete=models.SET_NULL, null=True, blank=True, related_name='mineral_weights')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='unit_weights')
    purchase = models.ForeignKey(Purchase, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_weights')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_weights')

class Balance(models.Model):
    mineral_amount = models.IntegerField()  
    company_type = models.CharField(max_length=255)
    count_90days = models.IntegerField()  
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    purchase = models.ForeignKey(Purchase, on_delete=models.SET_NULL, null=True, blank=True, related_name='balances')

class Momp(models.Model):
    E_name = models.CharField(max_length=255)
    momp = models.CharField(max_length=255)
    momp_province = models.CharField(max_length=255)
    scale_name = models.CharField(max_length=255)
    note = models.TextField()
    developed_by = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now_add=True)
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='momp')

class AuditLog(models.Model):  
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    db_user_id = models.IntegerField()
    table_name = models.CharField(max_length=255)
    record_id = models.IntegerField()  
    old_data = models.JSONField(null=True, blank=True)  
    new_data = models.JSONField(null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)