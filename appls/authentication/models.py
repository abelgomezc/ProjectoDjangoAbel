from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from appls.administracion.models import EnPersona


# Create your models here.
class AdUsuarioAccountManager(BaseUserManager):

    def create_superuser(self, cod_usuario, nombre, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(cod_usuario, nombre, password, **extra_fields)

    def create_user(self, cod_usuario, nombre, password, **extra_fields):
        if not cod_usuario:
            raise ValueError('Debe proporcionar un código de usuario')

        user = self.model(cod_usuario=cod_usuario, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save()
        return user


class AdUsuario(AbstractBaseUser, PermissionsMixin):
    cod_usuario = models.CharField(max_length=30, primary_key=True, verbose_name="User Code")
    nombre = models.CharField(max_length=60, verbose_name="name")
    pw_app = models.CharField(max_length=30, blank=True, null=True, verbose_name="PW_APP")
    pw_bd = models.CharField(max_length=30, blank=True, null=True, verbose_name="PW_DB")
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, related_name="AD_USUARIO_EN_PERSONA_FK",
                                    db_column='cod_persona')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)  # this false work on ui not in admin

    USERNAME_FIELD = 'cod_usuario'
    REQUIRED_FIELDS = ['nombre']

    objects = AdUsuarioAccountManager()

    def __str__(self):
        return self.nombre

    def toJSON(self):
        return {
            'cod_usuario': self.cod_usuario,
            'nombre': self.nombre,

        }
    class Meta:
        db_table = 'icl\".\"ad_usuario'

