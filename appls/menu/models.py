from django.db import models


# Create your models here.
class AdPantallas(models.Model):
    cod_pantalla = models.CharField(primary_key=True, max_length=20)
    nombre_pantalla = models.CharField(max_length=80)
    ruta = models.CharField(max_length=800, blank=True, null=True)
    manual_proceso = models.CharField(max_length=4000, blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"ad_pantallas'
