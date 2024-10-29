class PkgVtTiposDocumentacion():

    def __init__(self):
        self.consultar = 'icl.PKG_VT_Tipos_Documentacion_Consultar'
        self.existe = 'SELECT icl.PKG_VT_Tipos_Documentacion_Existe(%s)'
        self.insertar = 'SELECT icl.PKG_VT_Tipos_Documentacion_Insertar(ARRAY[%s]::icl.VT_TIPOS_DOCUMENTACION_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_Tipos_Documentacion_Modificar(ARRAY[%s]::icl.VT_TIPOS_DOCUMENTACION_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_Tipos_Documentacion_Borrar(ARRAY[%s]::icl.VT_TIPOS_DOCUMENTACION_rec[])'


class PkgVtTiposPrecio():

    def __init__(self):
        self.consultar = 'icl.PKG_VT_Tipo_Precio_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_Tipo_Precio_Insertar(ARRAY[%s]::icl.VT_TIPO_PRECIO_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_Tipo_Precio_Modificar(ARRAY[%s]::icl.VT_TIPO_PRECIO_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_Tipo_Precio_Borrar(ARRAY[%s]::icl.VT_TIPO_PRECIO_rec[])'


class PkgVtTiposNegociacion():

    def __init__(self):
        self.consultar = 'icl.PKG_VT_Tipos_Negociacion_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_Tipos_Negociacion_Insertar(ARRAY[%s]::icl.VT_TIPOS_NEGOCIACION_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_Tipos_Negociacion_Modificar(ARRAY[%s]::icl.VT_TIPOS_NEGOCIACION_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_Tipos_Negociacion_Borrar(ARRAY[%s]::icl.VT_TIPOS_NEGOCIACION_rec[])'
        self.buscar_nom_tipo_negociacion = 'icl.PKG_VT_Tipos_Negociacio_buscar_nom_tipo_negociacion'
        self.tipo_negociacion = 'icl.PKG_VT_Tipos_Negociacio_tipo_negociacion'


class PkgVtCategorias():
    def __init__(self):
        self.consultar = 'icl.PKG_VT_Categorias_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_Categorias_Insertar(ARRAY[%s]::icl.VT_CATEGORIAS_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_Categorias_Modificar(ARRAY[%s]::icl.VT_CATEGORIAS_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_Categorias_Borrar(ARRAY[%s]::icl.VT_CATEGORIAS_rec[])'


class PkgVtPlacasVehiculos():
    def __init__(self):
        self.consultar = 'icl.PKG_VT_PLACAS_VEHICULOS_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_PLACAS_VEHICULOS_Insertar(ARRAY[%s]::icl.VT_PLACAS_VEHICULOS_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_PLACAS_VEHICULOS_Modificar(ARRAY[%s]::icl.VT_PLACAS_VEHICULOS_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_PLACAS_VEHICULOS_Borrar(ARRAY[%s]::icl.VT_PLACAS_VEHICULOS_rec[])'


class PkgVtTipoDescuentosItems():

    def __init__(self):
        self.consultar = 'icl.PKG_VT_tipo_descuentos_items_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_tipo_descuentos_items_Insertar(ARRAY[%s]::icl.VT_TIPO_DESCUENTOS_ITEM_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_tipo_descuentos_items_Modificar(ARRAY[%s]::icl.VT_TIPO_DESCUENTOS_ITEM_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_tipo_descuentos_items_Borrar(ARRAY[%s]::icl.VT_TIPO_DESCUENTOS_ITEM_rec[])'


class PkgVtTransportista():
    def __init__(self):
        self.consultar = 'icl.PKG_Vt_Transportista_consultar'
        self.insertar = 'SELECT icl.PKG_VT_TRANSPORTISTA_Insertar(ARRAY[%s]::icl.VT_TRANSPORTISTA_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_TRANSPORTISTA_Modificar(ARRAY[%s]::icl.VT_TRANSPORTISTA_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_TRANSPORTISTA_Borrar(ARRAY[%s]::icl.VT_TRANSPORTISTA_rec[])'


class PkgTsPropiedadCobro():
    def __init__(self):
        self.consultar = 'icl.PKG_TS_PROPIEDAD_COBRO_Consultar'
        self.insertar = 'SELECT icl.PKG_TS_PROPIEDAD_COBRO_Insertar(ARRAY[%s]::icl.TS_PROPIEDAD_COBRO_rec[])'
        self.modificar = 'SELECT icl.PKG_TS_PROPIEDAD_COBRO_modificar(ARRAY[%s]::icl.TS_PROPIEDAD_COBRO_rec[])'
        self.borrar = 'SELECT icl.PKG_TS_PROPIEDAD_COBRO_borrar(ARRAY[%s]::icl.TS_PROPIEDAD_COBRO_rec[])'


class PkgVtEspecialidadCliente():
    def __init__(self):
        self.consultar = 'icl.PKG_VT_ESPECIALIDAD_CLIENTE_Consultar'
        self.insertar = 'SELECT icl.PKG_VT_ESPECIALIDAD_CLIENTE_Insertar(ARRAY[%s]::icl.VT_ESPECIALIDAD_CLIENTE_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_ESPECIALIDAD_CLIENTE_Modificar(ARRAY[%s]::icl.VT_ESPECIALIDAD_CLIENTE_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_ESPECIALIDAD_CLIENTE_Borrar(ARRAY[%s]::icl.VT_ESPECIALIDAD_CLIENTE_rec[])'


class PkgVtTiposDescXClienteCateg():

    def __init__(self):
        self.consultar = 'icl.PKG_VT_TIPOS_DESC_X_CLIENTE_C_consultar'
        self.insertar = 'SELECT icl.PKG_VT_TIPOS_DESC_X_CLIENTE_C_Insertar(ARRAY[%s]::icl.VT_TIPOS_DESC_X_CLIENTE_rec[])'
        self.modificar = 'SELECT icl.PKG_VT_TIPOS_DESC_X_CLIENTE_C_Modificar(ARRAY[%s]::icl.VT_TIPOS_DESC_X_CLIENTE_rec[])'
        self.borrar = 'SELECT icl.PKG_VT_TIPOS_DESC_X_CLIENTE_C_Borrar(ARRAY[%s]::icl.VT_TIPOS_DESC_X_CLIENTE_rec[])'


class PkgAdEmpresa():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_EMPRESA_consultar_empresas'
        self.consultarNombreEntidad = 'SELECT icl.PKG_AD_EMPRESA_nombre_empresa_entidad(%s)'
        self.obtenerDatosEmpresa = 'icl.PKG_AD_EMPRESA_obtener_datos_empresa(%s)'
        self.insertar = 'select icl.PKG_AD_EMPRESA_Insertar(ARRAY[%s]::icl.AD_EMPRESA_re[])'
        self.modificar = 'select icl.PKG_AD_EMPRESA_modificar(ARRAY[%s]::icl.AD_EMPRESA_re[])'
        self.borrar = 'select icl.PKG_AD_EMPRESA_borrar(ARRAY[%s]::icl.AD_EMPRESA_re[])'


class PkgEnPersona():
    def __init__(self):
        self.consultar = 'icl.pkg_en_persona_buscar_nombre'
        self.max_cod_persona = ' SELECT  icl.PKG_EN_PERSONA_max_cod_persona()'
        self.contacto_electronico = 'icl.pkg_en_persona_contacto_electronico'
        self.secuencia_direccion = 'icl.pkg_en_persona_secuencia_direccion'
        self.secuencia_telefono = 'icl.pkg_en_persona_secuencia_telefono'
        self.secuencia_electronico = 'icl.pkg_en_persona_secuencia_electronico'
        self.telefono_principal = 'icl.pkg_en_persona_telefono_principal'

class PkgAdParametros():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_PARAMETROS_consultar'
        self.insertar = 'select icl.PKG_AD_PARAMETROS_insertar(ARRAY[%s]::icl.AD_PARAMETROS_rec[])'
        self.modificar = 'select icl.PKG_AD_PARAMETROS_modificar(ARRAY[%s]::icl.AD_PARAMETROS_rec[])'
        self.borrar = 'select icl.PKG_AD_PARAMETROS_Borrar(ARRAY[%s]::icl.AD_PARAMETROS_rec[])'
        self.obtener_valor = 'icl.PKG_AD_PARAMETROS_obtener_valor'



class PkgEnGeo():
    def __init__(self):
        self.buscar_nombre_lugar = 'icl.pkg_en_geo_buscar_nombre_lugar'
        self.buscar_nombre_lugar_nivel_1 = 'icl.pkg_en_geo_buscar_nombre_lugar_nivel_1'
        self.buscar_cod_org_lugar = 'icl.pkg_en_geo_buscar_cod_org_lugar'


class PkgCgMoneda():
    def __init__(self):
        self.cod_moneda_default = 'icl.pkg_cg_moneda_cod_moneda_default'


class PkgEnPais():
    def __init__(self):
        self.buscar_nombre_pais = 'icl.pkg_en_pais_buscar_nombre_pais'


class PkgAdParametrosNum():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_PARAMETROS_NUM_consultar'
        self.insertar = 'select icl.PKG_AD_PARAMETROS_NUM_insertar(ARRAY[%s]::icl.AD_PARAM_NUM_rec[])'
        self.modificar = 'select icl.PKG_AD_PARAMETROS_NUM_modificar(ARRAY[%s]::icl.AD_PARAM_NUM_rec[])'
        self.borrar = 'select icl.PKG_AD_PARAMETROS_NUM_Borrar(ARRAY[%s]::icl.AD_PARAM_NUM_rec[])'


class PkgAdUsuario():

    def __init__(self):
        self.consultarNombre = 'icl.PKG_AD_USUARIO_nombre'


class PkgAdUsuarioEmpresa():

    def __init__(self):
        self.consultarXEmpresa = 'icl.PKG_AD_USUARIO_EMPRESA_consultar'
        self.insertar = 'select icl.PKG_AD_USUARIO_EMPRESA_insertar(ARRAY[%s]::icl.AD_USUARIO_EMPRE_rec[])'
        self.modificar = 'select icl.PKG_AD_USUARIO_EMPRESA_Modificar(ARRAY[%s]::icl.AD_USUARIO_EMPRE_rec[])'
        self.borrar = 'select icl.PKG_AD_USUARIO_EMPRESA_borrar(ARRAY[%s]::icl.AD_USUARIO_EMPRE_rec[])'


class PkgAdministracion():
    def __init__(self):
        self.crear_nuevo_usuario_plan = 'SELECT icl.pkg_administracion_crear_nuevo_usuario_plan(%s, %s, %s, %s);'
        self.validar_cedula = 'SELECT icl.pkg_administracion_validar_cedula(%s);'


class PkgEnIdentificacionesXPer():
    def __init__(self):
        self.existe_identificacion_new = 'SELECT icl.pkg_en_identificaciones_x_per_existe_identificacion_new(%s);'
        self.existe_indetificacion = 'icl.pkg_en_identificaciones_x_per_existe_identificacion'
        self.consultar_cod_persona = 'SELECT icl.pkg_en_identificaciones_x_per_consultar_cod_persona(%s);'
        self.obtenerIdentificacionPrincipal = 'icl.pkg_en_identificaciones_x_per_obt_identificacion_principal'

class PkgAdAgencia():

    def __init__(self):
        self.consultar = 'icl.PKG_AD_AGENCIA_Consultar'
        self.insertar = 'select icl.PKG_AD_AGENCIA_Insertar(ARRAY[%s]::icl.T_RECORD[])'
        self.modificar = 'select icl.PKG_AD_AGENCIA_modificar(ARRAY[%s]::icl.T_RECORD[])'
        self.borrar = 'select icl.PKG_AD_AGENCIA_Borrar(ARRAY[%s]::icl.T_RECORD[])'



class PkgAdUsuarioAgencia():
    def __init__(self):
        self.consultarUsuariosXAgencia = 'icl.PKG_AD_USUARIO_AGENCIA_Consultar'
        self.insertar = 'select icl.PKG_AD_USUARIO_AGENCIA_insertar(ARRAY[%s]::icl.AD_USUARIO_AGENCIA_rec[])'
        self.modificar = 'select icl.PKG_AD_USUARIO_AGENCIA_modificar(ARRAY[%s]::icl.AD_USUARIO_AGENCIA_rec[])'
        self.borrar = 'select icl.PKG_AD_USUARIO_AGENCIA_borrar(ARRAY[%s]::icl.AD_USUARIO_AGENCIA_rec[])'
class PkgAdPantallas():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_PANTALLAS_Consultar'
        self.insertar = 'select icl.PKG_AD_PANTALLAS_Insertar(ARRAY[%s]::icl.AD_PANTALLAS_rec[])'
        self.modificar = 'select icl.PKG_AD_PANTALLAS_modificar(ARRAY[%s]::icl.AD_PANTALLAS_rec[])'
        self.borrar = 'select icl.PKG_AD_PANTALLAS_borrar(ARRAY[%s]::icl.AD_PANTALLAS_rec[])'
class PkgAdModulo():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_MODULO_Consultar'
        self.insertar = 'SELECT icl.PKG_AD_MODULO_Insertar(ARRAY[%s]::icl.AD_MODULO_rec[])'
        self.modificar = 'SELECT icl.PKG_AD_MODULO_modificar(ARRAY[%s]::icl.AD_MODULO_rec[])'
        self.borrar = 'SELECT icl.PKG_AD_MODULO_borrar(ARRAY[%s]::icl.ad_modulo_rec[])'

class PkgAdOpcion():
     def __init__(self):
         self.consultar = 'icl.PKG_AD_OPCION_GenerarMenu'
         self.insertar = 'SELECT icl.PKG_AD_OPCION_Insertar(ARRAY[%s]::icl.ad_opcion_rec[])'
         self.modificar = 'SELECT icl.PKG_AD_OPCION_modificar(ARRAY[%s]::icl.AD_OPCION_rec[])'
         self.borrar = 'SELECT icl.PKG_AD_OPCION_borrar(ARRAY[%s]::icl.AD_OPCION_rec[])'




class PkgAdRol():
    def __init__(self):
        self.consultar = 'icl.PKG_AD_ROL_Consultar'
        self.insertar = 'SELECT icl.PKG_AD_ROL_Insertar(ARRAY[%s]::icl.AD_ROL_rec[])'
        self.modificar = 'SELECT icl.PKG_AD_ROL_modificar(ARRAY[%s]::icl.AD_ROL_rec[])'
        self.borrar = 'SELECT icl.PKG_AD_ROL_borrar(ARRAY[%s]::icl.AD_ROL_rec[])'

class PkgAdOpcioneRol():
    def __init__(self):
        self.consultarOpcionesXRol = 'icl.PKG_AD_OPCION_ROL_generar_menu'
        self.insertarNuevasOpcionesRol = 'SELECT icl.PKG_AD_OPCION_ROL_insertar_opciones_nuevas'
        self.cambiarEstado = 'icl.PKG_AD_OPCION_ROL_cambiar_estado'
        self.copiarOpcionesRolARol = 'icl.PKG_AD_OPCION_ROL_copiar_configuracion_rol'


class PkgCoAgente():

    def __init__(self):
        self.consultar = 'icl.PKG_CO_AGENTE_Consultar'
        self.insertar = 'SELECT icl.PKG_CO_AGENTE_Insertar(ARRAY[%s]::icl.CO_AGENTE_rec[])'
        self.modificar = 'SELECT icl.PKG_CO_AGENTE_modificar(ARRAY[%s]::icl.CO_AGENTE_rec[])'

class PkgTsPedido():
    def __init__(self):
        self.consultar = 'icl.PKG_TS_PEDIDO_consultar_pedidos'
        self.tipo_negociacion_cliente ='icl.PKG_TS_PEDIDO_tipo_negociacion_cliente'
        self.tipo_documento_cliente = 'icl.PKG_TS_PEDIDO_tipo_documentacion_cliente'
        self.categoria_cliente = 'icl.PKG_TS_PEDIDO_categoria_cliente'
        self.palzo_dias_cliente = 'icl.PKG_TS_PEDIDO_plazo_dias_cliente'
        self.consutarRegistroCab = 'icl.PKG_TS_PEDIDO_consultar_registro'
        self.consultarPedidoDetalle = 'icl.PKG_TS_PEDIDO_consultar_pedido_det'
        self.nombre_bodega_sub_bodega = 'icl.pkg_ts_pedido_nombre_bodega_sub_bodega'
        self.descuentos_item = 'icl.pkg_ts_pedido_descuentos_item'

class PkgAdEstado():

    def __init__(self):
        self.buscar_nombre_estado = 'icl.PKG_AD_ESTADO_buscar_nombre_est'
class PkgTsClientes():

    def __init__(self):
        self.filtrar_persona = 'icl.pkg_ts_clientes_filtrar_persona'
        self.buscar_cod_categoria = 'icl.pkg_ts_clientes_buscar_cod_categoria'
        self.saldo_cliente = 'icl.pkg_ts_clientes_saldo_cliente'


class PkgEnDireccionesXPersonas():

    def __init__(self):
        self.consultar = 'icl.PKG_EN_DIRECCIONES_X_PERSONA_consultar'
class PkgEnTelefonosXPersonas():
    def __init__(self):
        self.consultar = 'icl.PKG_EN_TELEFONOS_X_PERSONA_consultar'


class PkgEnElectronicosXPersona():
    def __init__(self):
        self.consultar = 'icl.PKG_EN_ELECTRONICOS_X_PERSONA_consultar'

class PkgEnCatalogo():

    def __init__(self):
        self.buscar_nombre_catalogo = 'icl.PKG_EN_CATALOGO_buscar_nombre_catalogo'


class PkgEnConfPantallaRap():

    def __init__(self):
        self.consultar = 'icl.PKG_EN_CONF_PANTALLA_RAP_consultar_per_cliente'
        self.insertar = 'select  icl.PKG_EN_CONF_PANTALLA_RAP_insertar_per_cliente(ARRAY[%s]::icl.T_RECORD_PER_CLI[])'
        self.modificar = 'select icl.PKG_EN_CONF_PANTALLA_RAP_modificar_per_cliente(ARRAY[%s]::icl.T_RECORD_PER_CLI[])'
       # self.bloquear = 'select icl.PKG_EN_CONF_PANTALLA_RAP_bloquer_per_cliente(ARRAY[%s]::icl.T_RECORD_PER_CLI[])'




class PkgTsComprobanteCobro():
    def __init__(self):
        self.max_nro_comprobante_cobro = 'icl.pkg_ts_comprobante_cobro_max_nro_comprobante_cobro'


class PkgInSaldosItemsLotes():
    def __init__(self):
        self.saldo_disponible_lote= 'icl.pkg_in_saldos_items_lotes_saldo_disponible_lote'
class PkgInvItem():

    def __init__(self):
        self.saldo_disponible = 'icl.pkg_inv_item_saldo_disponible'
        self.buscar_porcentaje_imp = 'icl.pkg_inv_item_buscar_porcentaje_imp'
        self.buscar_impuesto_item = 'icl.pkg_inv_item_buscar_impuesto_item'
        self.buscar_unidad_med_item = 'icl.pkg_inv_item_buscar_unidad_med_item'



class PkgFacturacion():
    def __init__(self):
        self.precio_item = 'icl.pkg_facturacion_precio_item'



class PkgVtTemporadaPromocionIt():

    def __init__(self):
        self.obt_porcentaje_promocion = 'icl.pkg_vt_temporada_promocion_it_obt_porcentaje_promocion'