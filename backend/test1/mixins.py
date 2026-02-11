from rest_framework.decorators import action
from rest_framework.response import Response

class SoftDeleteViewSetMixin:
    """Mixin to add soft delete operations to viewsets"""
    
    def get_queryset(self):
        """Override to only return non-deleted objects by default"""
        if self.action == 'deleted':
            return self.queryset.model.get_deleted_objects()
        return self.queryset.model.get_active_objects()
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete an instance"""
        instance = self.get_object()
        instance.soft_delete()
        return Response({
            'status': 'success',
            'message': f'{self.queryset.model.__name__} soft deleted successfully',
            'deleted_at': instance.deleted_at
        })
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted instance"""
        # Get from deleted objects
        instance = self.queryset.model.get_deleted_objects().filter(pk=pk).first()
        if not instance:
            return Response({
                'status': 'error',
                'message': f'{self.queryset.model.__name__} not found or not deleted'
            }, status=404)
        
        instance.restore()
        return Response({
            'status': 'success',
            'message': f'{self.queryset.model.__name__} restored successfully'
        })
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Get all deleted instances"""
        queryset = self.queryset.model.get_deleted_objects()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)