# models.py - FIXED VERSION
from django.contrib import admin
from django.db import models
from django.contrib.auth.models import AbstractUser  
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

class SoftDeleteModel(models.Model):
    """Abstract base model for soft delete functionality"""
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the instance"""
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
        
        # Call cascade soft delete
        self.cascade_soft_delete()
    
    def cascade_soft_delete(self):
        """Override this method in child classes to handle cascade delete"""
        pass
    
    def restore(self):
        """Restore a soft-deleted instance"""
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])
        
        # Call cascade restore
        self.cascade_restore()
    
    def cascade_restore(self):
        """Override this method in child classes to handle cascade restore"""
        pass
    
    @property
    def is_deleted(self):
        """Check if instance is soft-deleted"""
        return self.deleted_at is not None
    
    @classmethod
    def get_active_objects(cls):
        """Get only non-deleted objects"""
        return cls.objects.filter(deleted_at__isnull=True)
    
    @classmethod
    def get_deleted_objects(cls):
        """Get only deleted objects"""
        return cls.objects.filter(deleted_at__isnull=False)

# Add this tracking model BEFORE your other models
class DeletedRelationship(models.Model):
    """Track relationships that were broken during soft delete"""
    model_name = models.CharField(max_length=255)  # e.g., 'Company'
    model_id = models.IntegerField()
    related_model = models.CharField(max_length=255)  # e.g., 'Vehicle'
    related_id = models.IntegerField()
    relationship_type = models.CharField(max_length=50)  # 'many_to_many', 'foreign_key', etc.
    deleted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['model_name', 'model_id']),
            models.Index(fields=['related_model', 'related_id']),
        ]
        verbose_name = "Deleted Relationship"
        verbose_name_plural = "Deleted Relationships"
    
    def __str__(self):
        return f"{self.model_name}.{self.model_id} -> {self.related_model}.{self.related_id}"

class User(AbstractUser):
    email = models.EmailField(unique=True)

class Userprofile(models.Model):
    phone = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'
    
    @admin.display(ordering='user__first_name')
    def first_name(self):
        return self.user.first_name
    
    @admin.display(ordering='user__last_name')
    def last_name(self):
        return self.user.last_name
    
    class Meta:
        ordering = ['user__first_name', 'user__last_name']
        permissions = [
            ('view_history', 'Can view history')
        ]

class Unit(SoftDeleteModel):
    name = models.CharField(max_length=255)  
    weighing_price = models.IntegerField()
    create_at = models.DateField(auto_now_add=True)  
    update_at = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    def cascade_soft_delete(self):
        """Soft delete related minerals"""
        from django.utils import timezone
        # Soft delete all minerals that have this unit
        Mineral.objects.filter(unit=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related minerals"""
        # Restore minerals that were deleted because of this unit
        Mineral.objects.filter(unit=self, deleted_at__isnull=False).update(deleted_at=None)

class Mineral(SoftDeleteModel):
    name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    mineral_description = models.TextField()
    create_at = models.DateField(auto_now_add=True)  
    update_at = models.DateField(null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='minerals')
    
    def __str__(self):
        return self.name
    
    def cascade_soft_delete(self):
        """Soft delete related purchases and weights"""
        from django.utils import timezone
        # Soft delete related purchases
        Purchase.objects.filter(mineral=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Soft delete related weights
        Weight.objects.filter(mineral=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related purchases and weights"""
        # Restore related purchases
        Purchase.objects.filter(mineral=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related weights
        Weight.objects.filter(mineral=self, deleted_at__isnull=False).update(deleted_at=None)

class VehicleType(SoftDeleteModel):
    truck_name = models.CharField(max_length=255)
    excel_count = models.IntegerField() 
    tire_count = models.IntegerField() 
    allow_weight_ton = models.IntegerField()  
    create_at = models.DateField(auto_now_add=True) 
    update_at = models.DateField(auto_now=True)
    
    def __str__(self):
        return self.truck_name
    
    def cascade_soft_delete(self):
        """Soft delete related vehicles"""
        from django.utils import timezone
        Vehicle.objects.filter(vehicle_type=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related vehicles"""
        Vehicle.objects.filter(vehicle_type=self, deleted_at__isnull=False).update(deleted_at=None)

class Vehicle(SoftDeleteModel):
    car_name = models.CharField(max_length=255)  
    plate_number = models.CharField(max_length=50)
    driver_name = models.CharField(max_length=200)
    empty_weight = models.IntegerField()
    create_at = models.DateField(auto_now_add=True) 
    update_at = models.DateField(auto_now=True)  
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    vehicle_type = models.ForeignKey(VehicleType, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    
    def __str__(self):
        return f"{self.car_name} - {self.plate_number}"

    class Meta:
        permissions = [
            ('cancel_vehicle' , 'Can cancel vehicle')
        ]
    
    def cascade_soft_delete(self):
        """Soft delete related weights"""
        from django.utils import timezone
        Weight.objects.filter(vehicle=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related weights"""
        Weight.objects.filter(vehicle=self, deleted_at__isnull=False).update(deleted_at=None)
    
    def get_company_count(self):
        """Get count of active companies this vehicle is linked to"""
        return self.companies.filter(deleted_at__isnull=True).count()

class Company(SoftDeleteModel):
    company_name = models.CharField(max_length=255)
    leader_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    licence_number = models.CharField(max_length=255)
    TIN_number = models.CharField(max_length=50, unique=True)
    company_type = models.CharField(max_length=255, default='General')  # ADD THIS FIELD
    create_at = models.DateField(auto_now_add=True)  
    update_at = models.DateField(auto_now=True) 
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    vehicle = models.ManyToManyField(Vehicle, blank=True, related_name='companies')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='companies')
    
    def __str__(self):
        return self.company_name
    
    def cascade_soft_delete(self):
        """Soft delete related maktoobs, purchases, and vehicles in the many-to-many"""
        from django.utils import timezone
        
        # Soft delete related maktoobs
        Maktoob.objects.filter(company=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Soft delete related purchases
        Purchase.objects.filter(company=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Soft delete related weights (through purchases)
        Weight.objects.filter(purchase__company=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Track and soft delete related vehicles
        company_vehicles = list(self.vehicle.all())
        
        # Store the vehicle relationships before clearing
        for vehicle in company_vehicles:
            # Track this relationship
            DeletedRelationship.objects.create(
                model_name='Company',
                model_id=self.id,
                related_model='Vehicle',
                related_id=vehicle.id,
                relationship_type='many_to_many',
            )
            
            # Count how many companies this vehicle is linked to (excluding deleted companies)
            company_count = vehicle.companies.filter(deleted_at__isnull=True).count()
            
            # If this is the only active company for this vehicle, soft delete the vehicle
            if company_count <= 1:
                vehicle.soft_delete()
        
        # Clear the many-to-many relationship
        self.vehicle.clear()
        
        # Soft delete related balances
        Balance.objects.filter(company=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related maktoobs, purchases, and vehicles"""
        # Restore related maktoobs
        Maktoob.objects.filter(company=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related purchases
        Purchase.objects.filter(company=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related weights
        Weight.objects.filter(purchase__company=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related balances
        Balance.objects.filter(company=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore vehicles using the tracking
        deleted_relationships = DeletedRelationship.objects.filter(
            model_name='Company',
            model_id=self.id,
            related_model='Vehicle',
        )
        
        for relationship in deleted_relationships:
            try:
                vehicle = Vehicle.objects.get(id=relationship.related_id)
                
                # Add the vehicle back to the relationship
                self.vehicle.add(vehicle)
                
                # If the vehicle was soft-deleted and this was its only company, restore it
                if vehicle.is_deleted:
                    # Check if it's safe to restore (no other active companies)
                    active_company_count = vehicle.companies.filter(deleted_at__isnull=True).count()
                    if active_company_count == 0:
                        vehicle.restore()
                
                # Delete the tracking record
                relationship.delete()
                
            except Vehicle.DoesNotExist:
                # Vehicle might have been hard deleted, skip it
                pass
    
    def get_related_vehicles_info(self):
        """Get information about related vehicles"""
        vehicles_info = []
        for vehicle in self.vehicle.all():
            vehicles_info.append({
                'id': vehicle.id,
                'name': vehicle.car_name,
                'plate_number': vehicle.plate_number,
                'is_deleted': vehicle.is_deleted,
                'deleted_at': vehicle.deleted_at,
            })
        return vehicles_info
    
    def get_tracked_vehicle_ids(self):
        """Get IDs of vehicles that were tracked as related to this company"""
        return list(DeletedRelationship.objects.filter(
            model_name='Company',
            model_id=self.id,
            related_model='Vehicle',
        ).values_list('related_id', flat=True))

class Scale(SoftDeleteModel):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    province_id = models.CharField(max_length=255)
    system_type = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True) 
    update_at = models.DateField(auto_now=True) 
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    
    def __str__(self):
        return f"{self.name} - {self.location}"
    
    def cascade_soft_delete(self):
        """Soft delete related purchases, weights, and momps"""
        from django.utils import timezone
        # Soft delete related purchases
        Purchase.objects.filter(scale=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Soft delete related weights
        Weight.objects.filter(scale=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
        
        # Soft delete related momps
        Momp.objects.filter(scale=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related purchases, weights, and momps"""
        # Restore related purchases
        Purchase.objects.filter(scale=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related weights
        Weight.objects.filter(scale=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Restore related momps
        Momp.objects.filter(scale=self, deleted_at__isnull=False).update(deleted_at=None)

class Maktoob(SoftDeleteModel):
    maktoob_type = models.CharField(max_length=255)
    maktoob_number = models.IntegerField()  
    sadir_date = models.DateField()
    source = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)  
    update_at = models.DateField(auto_now=True)  
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_maktoobs')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_maktoobs')
    
    def __str__(self):
        return f"{self.maktoob_type} - {self.maktoob_number}"
    
    def cascade_soft_delete(self):
        """Soft delete related purchases"""
        from django.utils import timezone
        Purchase.objects.filter(maktoob=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def cascade_restore(self):
        """Restore related purchases"""
        Purchase.objects.filter(maktoob=self, deleted_at__isnull=False).update(deleted_at=None)



class Purchase(SoftDeleteModel):
    area = models.CharField(max_length=255)
    mineral_amount = models.IntegerField() 
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    mineral_total_price = models.DecimalField(max_digits=12, decimal_places=2)
    royalty_receipt_number = models.IntegerField() 
    weighing_total_price = models.IntegerField()  
    haq_wazan_receipt_number = models.IntegerField()  
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now=True) 
    balance_updated = models.BooleanField(default=False)  # ADD THIS FIELD
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_purchases')
    maktoob = models.ForeignKey(Maktoob, on_delete=models.SET_NULL, null=True, blank=True, related_name='maktoob_purchases')
    mineral = models.ForeignKey(Mineral, on_delete=models.SET_NULL, null=True, blank=True, related_name='mineral_purchases')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_purchases')
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='scale_purchases')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='unit_purchases')
    
    def __str__(self):
        return f"Purchase #{self.id} - {self.area}"
    
    def save(self, *args, **kwargs):
        # Check if this is a new purchase (not updated)
        is_new = self.pk is None
        
        # Call the original save method
        super().save(*args, **kwargs)
        
        # If this is a new purchase, update the balance
        if is_new and self.company and self.mineral and self.mineral_amount:
            self.update_balance()
    
    # === MOVE THIS METHOD INSIDE THE CLASS ===
    def update_balance(self):
        """Update the balance table when a purchase is created"""
        try:
            if not self.company or not self.mineral or not self.mineral_amount:
                return
            
            # Get or create ONE balance record for this company-mineral combination
            balance, created = Balance.objects.get_or_create(
                company=self.company,
                mineral=self.mineral,
                deleted_at__isnull=True,
                defaults={
                    'remaining_mineral_amount': 0,
                    'company_type': self.company.company_type,
                }
            )
            
            # Add the purchase amount to the balance
            balance.remaining_mineral_amount += self.mineral_amount
            balance.save()
            
            # Mark that this purchase has been accounted for in balance
            self.balance_updated = True
            self.save(update_fields=['balance_updated'])
            
            print(f"✅ Purchase {self.id}: Added {self.mineral_amount} to {self.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
            
        except Exception as e:
            print(f"❌ Error updating balance for purchase {self.id}: {str(e)}")
            # Re-raise the exception to prevent silent failures
            raise
    
    def cascade_soft_delete(self):
        """Soft delete related weights and reverse balance update"""
        from django.utils import timezone
        
        # First, reverse the balance update
        self.reverse_balance_update()
        
        # Then soft delete related weights
        Weight.objects.filter(purchase=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def reverse_balance_update(self):
        """Reverse the balance update when purchase is deleted"""
        try:
            if not self.company or not self.mineral or not self.mineral_amount:
                return
                
            # Find the balance for this company and mineral
            balance = Balance.objects.filter(
                company=self.company,
                mineral=self.mineral,
                deleted_at__isnull=True
            ).first()
            
            if balance and self.balance_updated:
                # Subtract the mineral amount from the balance
                balance.remaining_mineral_amount -= self.mineral_amount
                balance.save()
                
                print(f"🗑️ Purchase {self.id} deleted: Subtracted {self.mineral_amount} from {self.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
                
        except Exception as e:
            print(f"❌ Error reversing balance for purchase {self.id}: {str(e)}")
    
    def cascade_restore(self):
        """Restore related weights and reapply balance update"""
        # Restore related weights
        Weight.objects.filter(purchase=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Reapply balance update
        self.update_balance()



def update_balance(self):
    """Update the balance table when a purchase is created"""
    try:
        if not self.company or not self.mineral or not self.mineral_amount:
            return
        
        # Get or create ONE balance record for this company-mineral combination
        balance, created = Balance.objects.get_or_create(
            company=self.company,
            mineral=self.mineral,
            deleted_at__isnull=True,
            defaults={
                'remaining_mineral_amount': 0,
                'company_type': self.company.company_type,
            }
        )
        
        # Add the purchase amount to the balance
        balance.remaining_mineral_amount += self.mineral_amount
        balance.save()
        
        # Mark that this purchase has been accounted for in balance
        self.balance_updated = True
        self.save(update_fields=['balance_updated'])
        
        print(f"✅ Purchase {self.id}: Added {self.mineral_amount} to {self.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
        
    except Exception as e:
        print(f"❌ Error updating balance for purchase {self.id}: {str(e)}")
        # Re-raise the exception to prevent silent failures
        raise
    def cascade_soft_delete(self):
        """Soft delete related weights and reverse balance update"""
        from django.utils import timezone
        
        # First, reverse the balance update
        self.reverse_balance_update()
        
        # Then soft delete related weights
        Weight.objects.filter(purchase=self, deleted_at__isnull=True).update(deleted_at=timezone.now())
    
    def reverse_balance_update(self):
        """Reverse the balance update when purchase is deleted"""
        try:
            if not self.company or not self.mineral or not self.mineral_amount:
                return
                
            # Find the balance for this company and mineral
            balance = Balance.objects.filter(
                company=self.company,
                mineral=self.mineral,
                deleted_at__isnull=True
            ).first()
            
            if balance and self.balance_updated:
                # Subtract the mineral amount from the balance
                balance.remaining_mineral_amount -= self.mineral_amount
                balance.save()
                
                print(f"🗑️ Purchase {self.id} deleted: Subtracted {self.mineral_amount} from {self.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
                
        except Exception as e:
            print(f"❌ Error reversing balance for purchase {self.id}: {str(e)}")
    
    def cascade_restore(self):
        """Restore related weights and reapply balance update"""
        # Restore related weights
        Weight.objects.filter(purchase=self, deleted_at__isnull=False).update(deleted_at=None)
        
        # Reapply balance update
        self.update_balance()

class Weight(SoftDeleteModel):
    second_weight = models.IntegerField()  
    mineral_net_weight = models.IntegerField()  
    control_weight = models.IntegerField()  
    area = models.CharField(max_length=255)
    discharge_place = models.CharField(max_length=255)
    bill_number = models.CharField(max_length=255)
    balance_updated = models.BooleanField(default=False)  # ADD THIS FIELD
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicle_weights')
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='scale_weights')
    mineral = models.ForeignKey(Mineral, on_delete=models.SET_NULL, null=True, blank=True, related_name='mineral_weights')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name='unit_weights')
    purchase = models.ForeignKey(Purchase, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_weights')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_weights')
    
    def __str__(self):
        return f"Weight #{self.id}"
    
    def save(self, *args, **kwargs):
        # Check if this is a new weight (not updated)
        is_new = self.pk is None
        
        # Call the original save method
        super().save(*args, **kwargs)
        
        # If this is a new weight, update the balance
        if is_new and self.purchase and self.mineral_net_weight and self.purchase.company and self.mineral:
            self.update_balance()
    
    def update_balance(self):
        """Update the balance table when weight is created"""
        try:
            if not self.purchase or not self.mineral_net_weight:
                return
            
            # Get or create ONE balance record for this company-mineral combination
            balance, created = Balance.objects.get_or_create(
                company=self.purchase.company,
                mineral=self.mineral,
                deleted_at__isnull=True,
                defaults={
                    'remaining_mineral_amount': 0,
                    'company_type': self.purchase.company.company_type,
                }
            )
            
            # Subtract the net weight from the balance
            balance.remaining_mineral_amount -= self.mineral_net_weight
            balance.save()
            
            # Mark that this weight has been accounted for in balance
            self.balance_updated = True
            self.save(update_fields=['balance_updated'])
            
            print(f"⚖️ Weight {self.id}: Subtracted {self.mineral_net_weight} from {self.purchase.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
            
        except Exception as e:
            print(f"❌ Error updating balance for weight {self.id}: {str(e)}")
    
    def cascade_soft_delete(self):
        """Soft delete and reverse balance update"""
        from django.utils import timezone
        
        # First, reverse the balance update
        self.reverse_balance_update()
        
        # Then mark as deleted
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
    
    def reverse_balance_update(self):
        """Reverse the balance update when weight is deleted"""
        try:
            if not self.purchase or not self.mineral_net_weight:
                return
            
            # Find the balance for this company and mineral
            balance = Balance.objects.filter(
                company=self.purchase.company,
                mineral=self.mineral,
                deleted_at__isnull=True
            ).first()
            
            if balance and self.balance_updated:
                # Add back the net weight to the balance
                balance.remaining_mineral_amount += self.mineral_net_weight
                balance.save()
                
                print(f"🗑️ Weight {self.id} deleted: Added back {self.mineral_net_weight} to {self.purchase.company.company_name}'s {self.mineral.name} balance. New total: {balance.remaining_mineral_amount}")
            
        except Exception as e:
            print(f"❌ Error reversing balance for weight {self.id}: {str(e)}")
    
    def cascade_restore(self):
        """Restore and reapply balance update"""
        # Restore the record
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])
        
        # Reapply balance update
        if self.mineral_net_weight:
            self.update_balance()

class Balance(SoftDeleteModel):
    remaining_mineral_amount = models.IntegerField(default=0)  
    company_type = models.CharField(max_length=255)
    count_90days = models.IntegerField(default=90)  
    create_at = models.DateField(auto_now_add=True) 
    update_at = models.DateField(auto_now=True)
    
    # Company and mineral are required and unique together
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company_balances')
    mineral = models.ForeignKey(Mineral, on_delete=models.CASCADE, related_name='mineral_balances')
    
    class Meta:
        unique_together = ['company', 'mineral']
        verbose_name = "Balance"
        verbose_name_plural = "Balances"
    
    def __str__(self):
        return f"{self.company.company_name} - {self.mineral.name}: {self.remaining_mineral_amount}"
    
    def save(self, *args, **kwargs):
        # Set company_type from company if not set
        if not self.company_type and self.company:
            self.company_type = self.company.company_type
        
        super().save(*args, **kwargs)
    
    def get_balance_status(self):
        """Get the balance status"""
        if self.remaining_mineral_amount > 0:
            return "POSITIVE"
        elif self.remaining_mineral_amount == 0:
            return "ZERO"
        else:
            return "NEGATIVE"

class Momp(SoftDeleteModel):
    E_name = models.CharField(max_length=255)
    momp = models.CharField(max_length=255)
    momp_province = models.CharField(max_length=255)
    scale_name = models.CharField(max_length=255)
    note = models.TextField()
    developed_by = models.CharField(max_length=255)
    create_at = models.DateField(auto_now_add=True)
    update_at = models.DateField(auto_now=True)  
    STATUS_CHOICES = [
        (1, 'Active'),
        (2, 'Inactive'),
    ]
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    scale = models.ForeignKey(Scale, on_delete=models.SET_NULL, null=True, blank=True, related_name='momp')
    
    def __str__(self):
        return f"{self.E_name}"

class AuditLog(SoftDeleteModel):  
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
    
    def __str__(self):
        return f"Audit #{self.id}"

# Create a separate model to track cascade deletions
class CascadeDeletionLog(models.Model):
    """Track which items were deleted because of cascade"""
    deleted_by_model = models.CharField(max_length=255)
    deleted_by_id = models.IntegerField()
    cascade_model = models.CharField(max_length=255)
    cascade_id = models.IntegerField()
    deleted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['deleted_by_model', 'deleted_by_id']),
            models.Index(fields=['cascade_model', 'cascade_id']),
        ]
    
    def __str__(self):
        return f"{self.deleted_by_model}.{self.deleted_by_id} -> {self.cascade_model}.{self.cascade_id}"