from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.decorators import api_view
from django.contrib.auth.models import User 
from rest_framework.response import Response
from .models import Unit ,Mineral ,VehicleType ,Vehicle, Company,Scale,Maktoob,Purchase , Weight ,Balance ,Momp
from .serializers import UserSerializer ,UnitSerializer ,MineralSerializer ,VehicleTypeSerializer ,VehicleSerializer, ScaleSerializer , CompanySerializer , MaktoobSerializer,PurchaseSerializer, WeightSerializer , BalanceSerializer, MompSerializer
from rest_framework import viewsets
from rest_framework import permissions






class UserViewSet(viewsets.ModelViewSet):
   queryset = User.objects.all()
   serializer_class = UserSerializer


class UnitViewSet(viewsets.ModelViewSet):
   queryset = Unit.objects.all()
   serializer_class = UnitSerializer


class MineralViewSet(viewsets.ModelViewSet):
   queryset = Mineral.objects.all()
   serializer_class = MineralSerializer

class VehicleTypeViewSet(viewsets.ModelViewSet):
   queryset = VehicleType.objects.all()
   serializer_class = VehicleTypeSerializer

class VehicleViewSet(viewsets.ModelViewSet):
   queryset = Vehicle.objects.all()
   serializer_class = VehicleSerializer

class CompanyViewSet(viewsets.ModelViewSet):
   queryset = Company.objects.all()
   serializer_class = CompanySerializer

class ScaleViewSet(viewsets.ModelViewSet):
   queryset = Scale.objects.all()
   serializer_class = ScaleSerializer


class MaktoobViewSet(viewsets.ModelViewSet):
   queryset = Maktoob.objects.all()
   serializer_class = MaktoobSerializer


class PurchaseViewSet(viewsets.ModelViewSet):
   queryset = Purchase.objects.all()
   serializer_class = PurchaseSerializer

class WeightViewSet(viewsets.ModelViewSet):
   queryset = Weight.objects.all()
   serializer_class = WeightSerializer


class BalanceViewSet(viewsets.ModelViewSet):
   queryset = Balance.objects.all()
   serializer_class = BalanceSerializer


class MompViewSet(viewsets.ModelViewSet):
   queryset = Momp.objects.all()
   serializer_class = MompSerializer







