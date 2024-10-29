from django.db import models
from django.forms import model_to_dict
from django.db import models
import json

class EnTipoCatalogo(models.Model):
    cod_tipo_catalogo = models.CharField(primary_key=True, max_length=8, verbose_name="Código del Tipo Catálogo")
    nombre = models.CharField(max_length=60)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    # def toJSON(self):
    #     item = model_to_dict(self)
    #     return item

    def toJSON(self):
        return {
            'cod_tipo_catalogo': self.cod_tipo_catalogo,
            'nombre': self.nombre,
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"en_tipo_catalogo'


class EnCatalogo(models.Model):
    cod_catalogo = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=60)
    cod_tipo_catalogo = models.ForeignKey(EnTipoCatalogo, models.DO_NOTHING, db_column='cod_tipo_catalogo')
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    def toJSON(self):
        return {
            'cod_catalogo': self.cod_catalogo,
            'nombre': self.nombre,
            'cod_tipo_catalogo': self.cod_tipo_catalogo.nombre
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"en_catalogo'


class EnPersona(models.Model):
    cod_persona = models.BigIntegerField(primary_key=True)
    tipo_persona = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='tipo_persona')
    primer_nombre = models.CharField(max_length=25, blank=True, null=True)
    segundo_nombre = models.CharField(max_length=25, blank=True, null=True)
    apellido_paterno = models.CharField(max_length=25, blank=True, null=True)
    apellido_materno = models.CharField(max_length=25, blank=True, null=True)
    nombres = models.CharField(max_length=200, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    estado_civil = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='estado_civil',
                                     related_name='enpersona_estado_civil_set', blank=True, null=True)
    genero = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='genero',
                               related_name='enpersona_genero_set', blank=True, null=True)
    cod_pais_nace = models.CharField(max_length=8, blank=True, null=True)
    cod_lugar_nace = models.CharField(max_length=8, blank=True, null=True)
    cod_pais_nacionalidad = models.CharField(max_length=8, blank=True, null=True)
    cod_ocupacion = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_ocupacion',
                                      related_name='enpersona_cod_ocupacion_set', blank=True, null=True)
    cod_profesion = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_profesion',
                                      related_name='enpersona_cod_profesion_set', blank=True, null=True)
    estado = models.SmallIntegerField()
    observaciones = models.CharField(max_length=200, blank=True, null=True)
    separacion_bienes = models.CharField(max_length=1, blank=True, null=True)
    tipo_vivienda = models.CharField(max_length=3, blank=True, null=True)
    num_cargas = models.SmallIntegerField(blank=True, null=True)
    nro_hijos = models.SmallIntegerField(blank=True, null=True)
    nombre_comercial = models.CharField(max_length=100, blank=True, null=True)
    cod_conyuge = models.ForeignKey('self', models.DO_NOTHING, db_column='cod_conyuge', blank=True, null=True)
    nombre_arrendatario_vivienda = models.CharField(max_length=80, blank=True, null=True)
    telefono_arrendatario_vivienda = models.CharField(max_length=20, blank=True, null=True)
    tipo_local = models.CharField(max_length=3, blank=True, null=True)
    nombre_arrendatario_local = models.CharField(max_length=80, blank=True, null=True)
    telefono_arrendatario_local = models.CharField(max_length=80, blank=True, null=True)
    fecha_establecido_negocio = models.DateField(blank=True, null=True)
    fecha_inicio_actividad_econ = models.DateField(blank=True, null=True)
    codigo_referencia = models.CharField(max_length=20, blank=True, null=True)
    clase_contribuyente = models.CharField(max_length=10, blank=True, null=True)
    obligado_contribuyente = models.CharField(max_length=2, blank=True, null=True)
    actividad_economica = models.CharField(max_length=2000, blank=True, null=True)
    cod_empresa_caja_chica = models.CharField(max_length=8, blank=True, null=True)
    tipo_persona_sri = models.CharField(max_length=8, blank=True, null=True)

    def __str__(self):
        return str(self.cod_persona)

    def toJSON(self):
        return {
            'cod_persona': self.cod_persona,
            'primer_nombre': self.primer_nombre,
            'segundo_nombre': self.segundo_nombre,
            'apellido_paterno': self.apellido_paterno,
            'apellido_materno': self.apellido_materno,
            'nombres': self.nombres,
            'fecha_nacimiento': self.fecha_nacimiento.strftime('%Y-%m-%d') if self.fecha_nacimiento else None,
            'estado': self.estado,
            'observaciones': self.observaciones,
            # Otros campos...
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"en_persona'


class EnPais(models.Model):
    cod_pais = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=60)
    codigo_telefono = models.CharField(max_length=10, blank=True, null=True)
    gentilicio = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    codigo_sri = models.CharField(max_length=20, blank=True, null=True)
    convenio_doble_tributacion = models.CharField(max_length=2)
    certificado_origen = models.CharField(max_length=1, blank=True, null=True)
    certificado_euro = models.CharField(max_length=1, blank=True, null=True)

    def toJSON(self):
        return {
            'cod_pais': self.cod_pais,
            'nombre': self.nombre,
            'codigo_telefono': self.codigo_telefono,
            'gentilicio': self.gentilicio,
            'audit_usuario_ing': self.audit_usuario_ing,
            'audit_fecha_ing': self.audit_fecha_ing,

        }

    class Meta:
        managed = False
        db_table = 'icl\".\"en_pais'


class EnOrgGeo(models.Model):
    cod_pais = models.ForeignKey(EnPais, models.DO_NOTHING, db_column='cod_pais')
    cod_org = models.IntegerField(
        primary_key=True)  # The composite primary key (cod_org, cod_pais) found, that is not supported. The first column is selected.
    nombre = models.CharField(max_length=60)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_org_geo'
        unique_together = (('cod_org', 'cod_pais'),)


class EnGeo(models.Model):
    cod_pais = models.CharField(max_length=8)
    cod_lugar = models.CharField(primary_key=True,
                                 max_length=8)  # The composite primary key (cod_lugar, cod_pais) found, that is not supported. The first column is selected.
    nombre = models.CharField(max_length=100)
    cod_org = models.ForeignKey(EnOrgGeo, models.DO_NOTHING, db_column='cod_org')
    cod_sri = models.CharField(max_length=8, blank=True, null=True)
    cod_pais_padre = models.CharField(max_length=8, blank=True, null=True)
    cod_lugar_padre = models.ForeignKey('self', models.DO_NOTHING, db_column='cod_lugar_padre', blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    cod_icl = models.CharField(max_length=20, blank=True, null=True)
    cod_icl_parroquia = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_geo'
        unique_together = (('cod_lugar', 'cod_pais'),)


class AdEmpresa(models.Model):
    cod_empresa = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=60)
    estado = models.IntegerField()
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona', blank=True, null=True)
    logo = models.BinaryField(blank=True, null=True)
    nro_establecimientos_activos = models.IntegerField(blank=True, null=True)
    nro_resolucion_contrib_esp = models.IntegerField(blank=True, null=True)
    fecha_nro_resolucion = models.DateField(blank=True, null=True)
    nombre_archivo_firma = models.CharField(max_length=60, blank=True, null=True)
    clave_firma = models.CharField(max_length=256, blank=True, null=True)
    fecha_caduca_firma = models.DateField(blank=True, null=True)
    cod_rol = models.CharField(max_length=8, blank=True, null=True)
    crm = models.CharField(max_length=1)

    def __str__(self):
        return self.nombre

    class Meta:
        managed = False
        db_table = 'icl\".\"ad_empresa'


class EnDireccionesXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    cod_direccion = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_direccion')
    calle = models.CharField(max_length=200)
    numero = models.CharField(max_length=10, blank=True, null=True)
    interseccion = models.CharField(max_length=80, blank=True, null=True)
    referencia = models.CharField(max_length=200, blank=True, null=True)
    barrio = models.CharField(max_length=80, blank=True, null=True)
    cod_pais = models.CharField(max_length=8)
    cod_lugar = models.ForeignKey(EnGeo, models.DO_NOTHING, db_column='cod_lugar')
    principal = models.CharField(max_length=1, blank=True, null=True)
    coordenada_x = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)
    coordenada_y = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_direcciones_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnElectronicosXPersona(models.Model):
    cod_persona = models.OneToOneField(EnPersona, models.DO_NOTHING, db_column='cod_persona',
                                       primary_key=True)  # The composite primary key (cod_persona, secuencia) found, that is not supported. The first column is selected.
    secuencia = models.IntegerField()
    cod_catalogo = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_catalogo')
    contacto = models.CharField(max_length=800)
    principal = models.CharField(max_length=1, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_electronicos_x_persona'
        unique_together = (('cod_persona', 'secuencia'),)


class EnTelefonosXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    cod_telefono = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_telefono')
    telefono = models.CharField(max_length=100)
    principal = models.CharField(max_length=1, blank=True, null=True)
    extension = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_telefonos_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnIdentificacionesXPersona(models.Model):
    cod_persona = models.OneToOneField(EnPersona, models.DO_NOTHING, db_column='cod_persona',
                                       primary_key=True)  # The composite primary key (cod_persona, cod_identificacion) found, that is not supported. The first column is selected.
    cod_identificacion = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_identificacion')
    identificacion = models.CharField(max_length=20)
    principal = models.CharField(max_length=1)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_identificaciones_x_persona'
        unique_together = (('cod_persona', 'cod_identificacion'), ('identificacion', 'cod_identificacion'),)


class EnTipoDigital(models.Model):
    cod_tipo_digital = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=100)
    extension = models.CharField(max_length=200)
    estado = models.SmallIntegerField()
    cod_tipo_archivo = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='cod_tipo_archivo')
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien creo la relacion')
    audit_fecha_ing = models.DateTimeField(blank=True, null=True,
                                           db_comment='Campo que indica cuando fue creada la relacion en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien realizo la ultima actualizacion de la relacion')
    audit_fecha_mod = models.DateTimeField(blank=True, null=True,
                                           db_comment='Campo que indica cuando fue realizada la ultima actualizacion a los datos de la relacion en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_tipo_digital'


class EnDigitalesXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    cod_tipo_digital = models.ForeignKey(EnTipoDigital, models.DO_NOTHING, db_column='cod_tipo_digital')
    archivo = models.BinaryField(blank=True, null=True)
    descripcion = models.CharField(max_length=1000, blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien cre¾ la relaci¾n')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue creada la relaci¾n en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien realiz¾ la ·ltima actualizaci¾n de la relaci¾n')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue realizada la ·ltima actualizaci¾n a los datos de la relaci¾n en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    extension = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_digitales_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnRefPersonalesXPersona(models.Model):
    cod_persona = models.IntegerField()
    secuencia = models.IntegerField(primary_key=True)
    nombre_ref_personal = models.CharField(max_length=100)
    parentesco = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='parentesco')
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien cre¾ la relaci¾n')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue creada la relaci¾n en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien realiz¾ la ·ltima actualizaci¾n de la relaci¾n')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue realizada la ·ltima actualizaci¾n a los datos de la relaci¾n en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_ref_personales_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnRefLaboralesXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.BigIntegerField(primary_key=True)
    empresa_labora = models.CharField(max_length=60)
    sueldo = models.DecimalField(max_digits=22, decimal_places=8)
    fecha_ingreso = models.DateField()
    fecha_salida = models.DateField(blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien creo la relacion')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue creada la relacion en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien realizo la ultima actualizacion de la relacion')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue realizada la ultima actualizacion a los datos de la relacion en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_ref_laborales_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnRefBancariasXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.BigIntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    # cod_entidad = models.ForeignKey('TsEntidadFinanciera', models.DO_NOTHING, db_column='cod_entidad')
    tipo_cuenta = models.ForeignKey(EnCatalogo, models.DO_NOTHING, db_column='tipo_cuenta')
    nro_cuenta = models.CharField(max_length=30)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien creo la relacion')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue creada la relacion en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien realizo la ultima actualizacion de la relacion')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue realizada la ultima actualizacion a los datos de la relacion en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    obtenido_credito = models.CharField(max_length=1, blank=True, null=True)
    monto_credito = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)
    fecha_apertura_cuenta = models.DateField(blank=True, null=True)
    cupo = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_ref_bancarias_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnRefComercialesXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    nombre_comercio = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=22, decimal_places=8)
    fecha_ult_compra = models.DateField(blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien cre¾ la relaci¾n')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue creada la relaci¾n en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicaci¾n quien realiz¾ la ·ltima actualizaci¾n de la relaci¾n')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cußndo fue realizada la ·ltima actualizaci¾n a los datos de la relaci¾n en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    telefono_comercio = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_ref_comerciales_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnBienesXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    tipo_bien = models.CharField(max_length=3)
    avaluo = models.DecimalField(max_digits=22, decimal_places=8)
    hipotecado = models.CharField(max_length=1)
    institucion_hipoteca = models.CharField(max_length=50, blank=True, null=True)
    secuencia_digital = models.ForeignKey(EnDigitalesXPersona, models.DO_NOTHING, db_column='secuencia_digital',
                                          blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien creo la relacion')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue creada la relacion en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el usuario de aplicacion quien realizo la ultima actualizacion de la relacion')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue realizada la ultima actualizacion a los datos de la relacion en el sistema')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_bienes_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnVehiculosXPersona(models.Model):
    cod_persona = models.ForeignKey(EnPersona, models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.IntegerField(
        primary_key=True)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    marca = models.CharField(max_length=30, blank=True, null=True)
    modelo = models.CharField(max_length=30, blank=True, null=True)
    anio = models.IntegerField()
    avaluo = models.DecimalField(max_digits=22, decimal_places=8)
    prendado = models.CharField(max_length=1)
    institucion_prendado = models.CharField(max_length=50, blank=True, null=True)
    secuencia_digital = models.ForeignKey(EnDigitalesXPersona, models.DO_NOTHING, db_column='secuencia_digital',
                                          blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el Usuario que realizo la ultima modificacion del registro. ')
    audit_fecha_ing = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue creado el registro en el sistema')
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True,
                                    db_comment='Campo que indica la IP donde fue creado el registro')
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True,
                                         db_comment='Campo que indica el Usuario que realizo la ultima modificacion del registro. ')
    audit_fecha_mod = models.DateField(blank=True, null=True,
                                       db_comment='Campo que indica cuando fue realizada la ultima actualizacion del registro.')
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True,
                                    db_comment='Campo que indica la IP donde se realizo la ultima actualizacion')
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=150, blank=True, null=True)
    observaciones = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_vehiculos_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnGarantiasXPersona(models.Model):
    cod_persona = models.ForeignKey('EnPersona', models.DO_NOTHING, db_column='cod_persona')
    secuencia = models.DecimalField(primary_key=True, max_digits=10,
                                    decimal_places=0)  # The composite primary key (secuencia, cod_persona) found, that is not supported. The first column is selected.
    tipo_garantia = models.CharField(max_length=3)
    monto = models.DecimalField(max_digits=22, decimal_places=8)
    fecha_inicio = models.DateField()
    fecha_vencimiento = models.DateField()
    reserva_dominio = models.CharField(max_length=1)
    secuencia_digital = models.ForeignKey(EnDigitalesXPersona, models.DO_NOTHING, db_column='secuencia_digital',
                                          blank=True, null=True)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    observaciones = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'icl\".\"en_garantias_x_persona'
        unique_together = (('secuencia', 'cod_persona'),)


class EnCatalogoXEmpresa(models.Model):
    cod_empresa = models.ForeignKey(AdEmpresa, models.DO_NOTHING, db_column='cod_empresa')
    cod_catalogo = models.CharField(primary_key=True,
                                    max_length=8)  # The composite primary key (cod_catalogo, cod_empresa) found, that is not supported. The first column is selected.
    nombre = models.CharField(max_length=100)
    cod_tipo_catalogo = models.ForeignKey(EnTipoCatalogo, models.DO_NOTHING, db_column='cod_tipo_catalogo')

    class Meta:
        managed = False
        db_table = 'icl\".\"en_catalogo_x_empresa'
        unique_together = (('cod_catalogo', 'cod_empresa'),)


class AdUsuarioEmpresa(models.Model):
    cod_empresa = models.CharField(primary_key=True, max_length=8)
    cod_usuario = models.CharField(max_length=30)
    estado = models.DecimalField(max_digits=1, decimal_places=0,
                                 db_comment='Campo que identifica si el usuario por empresa se encuentra disponible o no.')
    porc_sobregiro_credito = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)
    autorizacion_egresos_caja = models.CharField(max_length=1)
    apertura_caja_requerido = models.CharField(max_length=1)

    def __str__(self):
        emp = AdEmpresa.objects.get(cod_empresa=self.cod_empresa)
        return emp.nombre

    class Meta:
        managed = False
        db_table = 'icl\".\"ad_usuario_empresa'
        unique_together = (('cod_empresa', 'cod_usuario'),)
        db_table_comment = 'La tabla AD_usuario_x_empresa, permite registrar las relaciones de todos los usuarios quienes  van a estar disponibles para una determinado empresa'


class VtTiposDocumentacion(models.Model):
    cod_tipo_documentacion = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=80)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    def toJSON(self):
        return {
            'cod_tipo_documentacion': self.cod_tipo_documentacion,
            'nombre': self.nombre

        }

    class Meta:
        managed = False
        db_table = 'icl\".\"vt_tipos_documentacion'


class VtTipoPrecio(models.Model):
    cod_empresa = models.CharField(max_length=8)
    cod_tipo_precio = models.CharField(primary_key=True,
                                       max_length=8)  # The composite primary key (cod_tipo_precio, cod_empresa) found, that is not supported. The first column is selected.
    nombre = models.CharField(max_length=100)
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)

    def toJSON(self):
        return {
            'cod_tipo_precio': self.cod_tipo_precio,
            'nombre': self.nombre

        }

    class Meta:
        managed = False
        db_table = 'icl\".\"vt_tipo_precio'
        unique_together = (('cod_tipo_precio', 'cod_empresa'),)


class VtTiposNegociacion(models.Model):
    cod_tipo_negociacion = models.CharField(max_length=8)
    nombre = models.CharField(max_length=80)
    cod_empresa = models.OneToOneField(AdEmpresa, models.DO_NOTHING, db_column='cod_empresa',
                                       primary_key=True)  # The composite primary key (cod_empresa, cod_tipo_negociacion) found, that is not supported. The first column is selected.
    tipo = models.CharField(max_length=3)
    estado = models.SmallIntegerField()
    plazo = models.DecimalField(max_digits=22, decimal_places=8, blank=True, null=True)
    cupo = models.DecimalField(max_digits=5, decimal_places=0, blank=True, null=True)

    def toJSON(self):
        return {
            'cod_tipo_negociacion': self.cod_tipo_negociacion,
            'nombre': self.nombre,
            'cupo': self.cupo,
            'tipo': self.tipo,
            'estado': self.estado,
            'plazo': self.plazo,

        }

    class Meta:
        managed = False
        db_table = 'icl\".\"vt_tipos_negociacion'
        unique_together = (('cod_empresa', 'cod_tipo_negociacion'),)


class VtCategorias(models.Model):
    cod_empresa = models.OneToOneField(AdEmpresa, models.DO_NOTHING, db_column='cod_empresa',
                                       primary_key=True)  # The composite primary key (cod_empresa, cod_categoria) found, that is not supported. The first column is selected.
    cod_categoria = models.CharField(max_length=8)
    nombre = models.CharField(max_length=80)
    estado = models.SmallIntegerField()

    def toJSON(self):
        return {
            'cod_categoria': self.cod_categoria,
            'nombre': self.nombre,
            'estado': self.estado,
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"vt_categorias'
        unique_together = (('cod_empresa', 'cod_categoria'),)


class VtTransportista(models.Model):
    cod_persona = models.OneToOneField(EnPersona, models.DO_NOTHING, db_column='cod_persona',
                                       primary_key=True)  # The composite primary key (cod_persona, cod_empresa) found, that is not supported. The first column is selected.
    estado = models.SmallIntegerField()
    audit_usuario_ing = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_ing = models.DateField(blank=True, null=True)
    audit_ip_ing = models.CharField(max_length=20, blank=True, null=True)
    audit_usuario_mod = models.CharField(max_length=30, blank=True, null=True)
    audit_fecha_mod = models.DateField(blank=True, null=True)
    audit_ip_mod = models.CharField(max_length=20, blank=True, null=True)
    cod_empresa = models.ForeignKey(AdEmpresa, models.DO_NOTHING, db_column='cod_empresa')

    def toJSON(self):
        return {
            'cod_persona': self.cod_persona,
            'estado': self.estado,
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"vt_transportista'
        unique_together = (('cod_persona', 'cod_empresa'),)


class AdRol(models.Model):
    cod_rol = models.CharField(primary_key=True, max_length=8,
                               db_comment='Campo que identifica el registro (el secuencial corresponde a la clave primaria)')
    nombre = models.CharField(max_length=60,
                              db_comment='Campo que define el nombre de los roles registrados en el sistema')
    descripcion = models.CharField(max_length=200, blank=True, null=True,
                                   db_comment='Breve descripcion de la funcion que cumple el modulo, como informacion para el sistema')
    estado = models.DecimalField(max_digits=1, decimal_places=0,
                                 db_comment='Campo que identifica si el rol se encuentra disponible o no')

    def toJSON(self):
        return {
            'cod_rol': self.cod_rol,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'estado': self.estado,
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"ad_rol'
        db_table_comment = 'La tabla roles, permite registrar todos los roles o permisos  que seran configurados en el sistema'


class AdModulo(models.Model):
    cod_modulo = models.CharField(primary_key=True, max_length=8)
    nombre = models.CharField(max_length=60)
    descripcion = models.CharField(max_length=200, blank=True, null=True)
    estado = models.SmallIntegerField()
    imagen = models.BinaryField(blank=True, null=True)

    def toJSON(self):
        return {
            'cod_modulo': self.cod_modulo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'estado': self.estado,
        }

    class Meta:
        managed = False
        db_table = 'icl\".\"ad_modulo'
