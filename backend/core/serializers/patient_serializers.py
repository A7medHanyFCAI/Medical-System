from rest_framework import serializers
from ..models.patient import Patient
from .user_serializers import UserProfileSerializer


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(required=False)
    
    class Meta:
        model = Patient
        fields = ["id", "user", "age", "contact"]
        read_only_fields = ["id"]
    
    def update(self, instance, validated_data):
        # Update patient fields
        for field in ['age', 'contact']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        
        # Update nested user (using UserProfileSerializer)
        user_data = validated_data.get('user')
        if user_data:
            self.fields['user'].update(instance.user, user_data)
        
        return instance