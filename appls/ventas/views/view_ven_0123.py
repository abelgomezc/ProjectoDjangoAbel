from decimal import Decimal

from django.db import transaction, connection

from django.http import JsonResponse
import json
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from appls.administracion.models import EnPais
from static.vars import packages
from static.vars.DatabaseExecutor import DatabaseExecutor
from datetime import datetime
from django.db import connection, DatabaseError

pkgTsPedido = packages.PkgTsPedido()
pkgEnIdentificacionesXPer = packages.PkgEnIdentificacionesXPer()
pkgVtTiposNegociacion = packages.PkgVtTiposNegociacion()
pkgTsClientes = packages.PkgTsClientes()
pkgEnPersona = packages.PkgEnPersona()
pkgCgMoneda = packages.PkgCgMoneda()
pkgAdParametros = packages.PkgAdParametros()
pkgEnPais = packages.PkgEnPais()
pkgEnGeo = packages.PkgEnGeo()
pkgEnCatalogo = packages.PkgEnCatalogo()
pkgTsComprobanteCobro = packages.PkgTsComprobanteCobro()
pkgInSaldosItemsLotes = packages.PkgInSaldosItemsLotes()
pkgInvItem = packages.PkgInvItem()
pkgFacturacion = packages.PkgFacturacion()
pkgVtTemporadaPromocionIt = packages.PkgVtTemporadaPromocionIt()

executor = DatabaseExecutor()


class RegistroPedidosClientesView(TemplateView):
    template_name = 'VEN_0123.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.usuarioAutenticado = self.request.session.get('VS_USER')
        self.codPersonaAutenticado = self.request.session.get('VS_USER_COD_PERSONA')
        self.cod_agencia = '0'
        self.cod_coordinador = self.request.session.get('VS_USER')
        # self.accion = kwargs.get('accion')
        # self.nro_comprobante_cobro = kwargs.get('nro_comprobante_cobro')
        self.parametros = {
            'accion': kwargs.get('accion'),
            'nro_comprobante_cobro': kwargs.get('nro_comprobante_cobro')
        }

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'validacion_identificacion':
                identificacion = request.POST.get('identificacion')
                validarIndetificacion = ValidarIndetificacion(identificacion)
                resultados = validarIndetificacion.get_data()
                # print(resultados)
                return JsonResponse(resultados, safe=False)
            elif action == 'obtener_identificacion':
                cod_cliente = request.POST.get('cod_cliente')
                with connection.cursor() as cursor:
                    cursor.callproc(pkgEnIdentificacionesXPer.obtenerIdentificacionPrincipal, [cod_cliente])
                    result = cursor.fetchone()
                    identificacion = result[0] if result else None
                    # print('Identificación:', identificacion)
                    return JsonResponse(identificacion, safe=False)
            elif action == 'datos_cliente':
                cod_cliente = request.POST.get('cod_cliente')
                fecha_emision = request.POST.get('fecha_emision')
                cliente_datos = ClienteDatos(cod_cliente=cod_cliente, cod_empresa=self.cod_empresa,
                                             cod_agencia=self.cod_agencia, fecha_emision=fecha_emision)
                cliente_datos._fetch_data()
                datos = cliente_datos.datos
              #  print(datos)
                return JsonResponse(datos, safe=False)
            elif action == 'validar_cliente_zona':
                cod_cliente = request.POST.get('cod_cliente')
                cod_agente = request.POST.get('cod_agente')
                validador = ValidarClienteZona(cod_cliente=cod_cliente, cod_agente=cod_agente,
                                               cod_empresa=self.cod_empresa,
                                               cod_usuario=self.usuarioAutenticado)
                resultados = validador.get_data()
                # print(resultados)
                return JsonResponse(resultados, safe=False)

            elif action == 'post_query':
                cod_cliente = request.POST.get('cod_cliente')
                indetificacion = request.POST.get('identificacion')
                nro_comprobante_cobro = request.POST.get('nro_comprobante_cobro')
                fecha_emision = request.POST.get('fecha_emision')

                post_query = PostQuery(cod_empresa=self.cod_empresa, usuarioAutenticado=self.usuarioAutenticado,
                                       cod_agencia=self.cod_agencia, cod_cliente=cod_cliente,
                                       indetificacion=indetificacion, nro_comprobante_cobro=nro_comprobante_cobro
                                       , fecha_emision=fecha_emision)

                resultados = post_query.get_data()
                print(resultados)
                return JsonResponse(resultados, safe=False)
            elif action == 'verificacion_negociacion':
                lv_negociacion_db = request.POST.get('lv_negociacion_db')
                lv_documentacion = request.POST.get('lv_documentacion')
                ln_plazo = request.POST.get('ln_plazo')
                resultsVericaficacionNegociacion = verificacionNegociacion(lv_negociacion_db, self.cod_empresa,
                                                                           lv_documentacion, ln_plazo)
                return JsonResponse(resultsVericaficacionNegociacion, safe=False)


            elif action == 'calcular_descuentos':
                cantidad = request.POST.get('cantidad')
                precio = request.POST.get('precio')
                lv_cod_categoria = request.POST.get('lv_cod_categoria')
                lv_negociacion = request.POST.get('lv_negociacion')
                cod_item = request.POST.get('cod_item')
                fecha_emision = request.POST.get('fecha_emision')
                ln_porc_descuento = request.POST.get('ln_porc_descuento')

                calcularDescuento = CalcularDescuento(
                    cantidad = cantidad,
                    precio = precio,
                    lv_cod_categoria = lv_cod_categoria,
                    lv_negociacion = lv_negociacion,
                    cod_empresa =self.cod_empresa,
                    cod_item = cod_item,
                    fecha_emision =fecha_emision,
                    ln_porc_descuento=ln_porc_descuento,
                )

                resultados = calcularDescuento.get_data()
                return JsonResponse(resultados, safe=False)

            else:
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' + str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def get(self, request, *args, **kwargs):
        action = request.GET.get('action')

        # action = self.parametros.get('accion')
        if action == 'iniciar_forma':
            iniciarForma = IniciarForma(cod_empresa=self.cod_empresa, usuarioAutenticado=self.usuarioAutenticado,
                                        cod_agencia=self.cod_agencia)
            resultados = iniciarForma.get_data()
            return JsonResponse(resultados, safe=False)
        elif action == 'searchdata_agentes':
            with connection.cursor() as cursor:

                cursor.execute('''SELECT  b.cod_agente, SUBSTRING(icl.pkg_en_persona_buscar_nombre(b.cod_agente) FROM 1 FOR 100) AS nombre, a.cod_zona
                                  FROM icl.co_zonas_x_coordinador a
                                  JOIN icl.co_zonas_x_agente b ON a.cod_empresa = b.cod_empresa AND a.cod_zona = b.cod_zona
                                  JOIN icl.co_coordi_x_jefatura_linea c ON a.cod_empresa = c.cod_empresa AND a.cod_jefatura = c.cod_jefatura AND a.cod_coordinacion = c.cod_coordinacion
                                  WHERE a.cod_empresa = %s AND a.estado = 1 AND c.estado = 1 AND UPPER(c.cod_coordinador) = UPPER(%s)  AND b.estado = 1 ORDER BY 2;'''
                               , [self.cod_empresa, self.usuarioAutenticado])
                rows = cursor.fetchall()
                data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
        elif action == 'searchdata_paises':
            paises = EnPais.objects.all()
            paises_list = [pais.toJSON() for pais in paises]
            return JsonResponse({'paises': paises_list})
        elif action == 'searchdata_RG_TIPOS_NEG':
            with connection.cursor() as cursor:
                cursor.execute(''' select  nombre, cod_tipo_negociacion
                                 from icl.vt_tipos_negociacion
                                 where cod_empresa = %s and
                                  tipo != 'CER'
                                   order by 1''', [self.cod_empresa])
                rows = cursor.fetchall()
                RG_TIPOS_NEG = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(RG_TIPOS_NEG, safe=False)
        elif action == 'searchdata_direcciones':
            cod_cliente = request.GET.get('cod_cliente')
            with connection.cursor() as cursor:
                cursor.execute('''select secuencia,
                                   SUBSTRING(icl.pkg_en_catalogo_buscar_nombre_catalogo(a.cod_direccion)FROM 1 FOR 50) tipo_direccion,
                                   a.cod_pais,a.cod_lugar, a.calle, a.numero, a.interseccion
                                  from icl.en_direcciones_x_persona a
                                  where a.cod_persona = %s
                                  order by 1;'''
                               , [cod_cliente])
                rows = cursor.fetchall()
                data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
        elif action == 'searchdata_tipo_ID':
            with connection.cursor() as cursor:
                cursor.execute('''select nombre, cod_catalogo
                                  from icl.en_catalogo
                                   where cod_tipo_catalogo = '009'
                                order by 2''', )
                rows = cursor.fetchall()
                list_tipos_ide = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(list_tipos_ide, safe=False)
        elif action == 'searchdata_ciudades':
            cod_pais = request.GET.get('cod_pais')
            cod_org = request.GET.get('cod_org')
            with connection.cursor() as cursor:
                cursor.execute('''select icl.pkg_en_geo_buscar_nombre_lugar_nivel_1(b.cod_pais,b.cod_lugar) nom_lugar,
                                   b.cod_lugar
                                   from icl.en_geo b
                                   where b.cod_pais = %s
                                   and b.cod_org = 2
                                   order by 1;'''
                               , [cod_pais])
                rows = cursor.fetchall()
                list_ciudades = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(list_ciudades, safe=False)
        elif action == 'searchdata_rg_telefonos':
            cod_cliente = request.GET.get('cod_cliente')

            with connection.cursor() as cursor:
                cursor.execute('''select a.secuencia, substr(icl.pkg_en_catalogo_buscar_nombre_catalogo(a.cod_telefono),1,50) tipo_telefono,
                                           a.telefono, a.cod_telefono
                                    from icl.en_telefonos_x_persona a
                                    where a.cod_persona = %s
                                    order by 1;'''
                               , [cod_cliente])
                rows = cursor.fetchall()
                RG_TELEFONOS = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(RG_TELEFONOS, safe=False)
        elif action == 'searchdata_rg_correos':
            cod_cliente = request.GET.get('cod_cliente')

            with connection.cursor() as cursor:
                cursor.execute('''select a.secuencia, substr(icl.pkg_en_catalogo_buscar_nombre_catalogo(a.cod_catalogo),1,50) tipo_correo,
                                    a.contacto
                                    from icl.en_electronicos_x_persona a
                                    where a.cod_persona = %s and
                                          a.cod_catalogo = 'MAIL'
                                    order by 1; '''
                               , [cod_cliente])
                rows = cursor.fetchall()
                rg_correos = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(rg_correos, safe=False)
        elif action == 'searchdata_rg_coordinadores':
            cod_zona = request.GET.get('cod_zona')
            with connection.cursor() as cursor:
                cursor.execute('''select c.cod_coordinador, b.nombre, c.prioridad_zona prioridad
                                    from icl.co_zonas_x_coordinador a, icl.ad_usuario b, icl.co_coordi_x_jefatura_linea c
                                    where a.cod_empresa = %s and
                                          a.cod_zona = %s and
                                          a.estado = 1 and
                                          a.cod_empresa = c.cod_empresa and
                                          a.cod_jefatura = c.cod_jefatura and
                                          a.cod_coordinacion = c.cod_coordinacion and
                                          c.estado = 1 and
                                          UPPER(c.cod_coordinador) = UPPER(b.cod_usuario)
                                    order by c.prioridad_zona, c.cod_coordinador
                                                '''
                               , [self.cod_empresa, cod_zona])
                rows = cursor.fetchall()
                rg_coordinadores = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(rg_coordinadores, safe=False)
        elif action == 'searchdata_RG_TIPOS_TELEFONO':
            with connection.cursor() as cursor:
                cursor.execute(''' select nombre, cod_catalogo
                                    from icl.en_catalogo
                                    where cod_tipo_catalogo = '001'
                                    order by 1''', )
                rows = cursor.fetchall()
                list_tipos_telefonos = [dict(zip([column[0] for column in cursor.description], row)) for row in
                                        rows]
                return JsonResponse(list_tipos_telefonos, safe=False)
        elif action == 'searchdata_rg_item':
            fecha_emision = request.GET.get('fecha_emision')
            with connection.cursor() as cursor:
                cursor.execute(''' select x.cod_item, x.descripcion, x.descripcion_corta,round(x.saldo, 2) saldo, x.nom_marca, x.referencia,
                                           x.nro_parte, x.pais_origen, x.cod_anterior, x.controla_inventario
                                    from (select a.cod_item, a.descripcion, a.referencia, 
                                               
                                                  round(icl.pkg_inv_item_saldo_disponible(a.cod_empresa, a.cod_item, null, null, null,%s), 2) saldo,
                                                 a.controla_inventario, a.nro_parte, a.descripcion_corta, m.nombre nom_marca,
                                                 substr(icl.pkg_inv_item_buscar_pais_origen_item(a.cod_empresa, a.cod_item),1,100) pais_origen, a.cod_anterior             
                                          from icl.in_items a, icl.in_marca m, icl.co_productos_x_perfil p, icl.co_perfiles_x_zona z
                                          where a.cod_empresa = %s and
                                                a.controla_inventario = 'S' and
                                                a.cod_estado = '1' and
                                                a.cod_marca = m.cod_marca and
                                                a.cod_empresa = m.cod_empresa and  
                                    
                                                a.cod_empresa = p.cod_empresa and
                                                a.cod_item = p.cod_item and
                                                p.estado = 1 and
                                                p.cod_empresa = z.cod_empresa and
                                                p.cod_perfil = z.cod_perfil and
                                                z.estado = 1 and
                                                z.cod_zona = '03'
                                          union all
                                          select a.cod_item, a.descripcion, a.referencia, 
                                                 1 saldo, a.controla_inventario, a.nro_parte, a.descripcion_corta, m.nombre nom_marca,
                                                 substr(icl.pkg_inv_item_buscar_pais_origen_item(a.cod_empresa, a.cod_item),1,100) pais_origen, a.cod_anterior
                                          from icl.in_items a, icl.in_marca m
                                          where a.cod_empresa = %s and
                                                a.controla_inventario = 'N' and
                                                a.cod_estado = '1' and
                                                a.cod_marca = m.cod_marca and
                                                a.cod_empresa = m.cod_empresa 
                                          ) x
                                    where x.saldo > 0 
                                    group by x.cod_item, x.descripcion, x.descripcion_corta, x.saldo, x.nom_marca, x.referencia,
                                             x.nro_parte, x.pais_origen, x.cod_anterior, x.controla_inventario
                                    order by 2
''', [fecha_emision, self.cod_empresa, self.cod_empresa])
                rows = cursor.fetchall()
                list_items = [dict(zip([column[0] for column in cursor.description], row)) for row in
                              rows]
                return JsonResponse(list_items, safe=False)
        elif action == 'searchdata_rg_bodegas_lotes':
            fecha_emision = request.GET.get('fecha_emision')

            # print('--------------------------------')
            # print(fecha_emision)
            cod_item = request.GET.get('cod_item')
            with connection.cursor() as cursor:
                cursor.execute(''' SELECT 
                                    x.cod_bodega, 
                                    x.cod_sub_bodega, 
                                    x.nom_bodega || ' / ' || x.nom_sub_bodega AS nom_bodega_sub, 
                                    round(x.saldo, 2) saldo,  
                                    x.nro_lote, 
                                    x.fecha_fabricacion, 
                                    x.fecha_vencimiento, 
                                    x.saldo_total
                                FROM (
                                    SELECT 
                                        c.cod_bodega, 
                                        c.nombre AS nom_bodega, 
                                        d.cod_sub_bodega, 
                                        d.nombre AS nom_sub_bodega,
                                        icl.pkg_in_saldos_items_lotes_saldo_disponible_lote(c.cod_empresa, %s, l.nro_lote,  c.cod_agencia, c.cod_bodega, d.cod_sub_bodega,%s) AS saldo,
                                        l.nro_lote, 
                                        l.fecha_fabricacion,  
                                        l.fecha_vencimiento, 
                                        icl.pkg_inv_item_saldo_disponible(c.cod_empresa, %s, c.cod_agencia, c.cod_bodega, d.cod_sub_bodega, %s) AS saldo_total
                                    FROM 
                                        icl.in_bodega c
                                        JOIN icl.in_sub_bodega d ON c.cod_bodega = d.cod_bodega AND c.cod_agencia = d.cod_agencia AND c.cod_empresa = d.cod_empresa
                                        JOIN icl.co_sub_bodegas_x_coordinador e ON d.cod_bodega = e.cod_bodega AND d.cod_agencia = e.cod_agencia AND d.cod_empresa = e.cod_empresa AND d.cod_sub_bodega = e.cod_sub_bodega
                                        JOIN icl.co_coordi_x_jefatura_linea j ON e.cod_empresa = j.cod_empresa AND e.cod_jefatura = j.cod_jefatura AND e.cod_coordinacion = j.cod_coordinacion
                                        JOIN icl.in_saldos_items_lotes f ON f.cod_item = %s AND f.cod_bodega = e.cod_bodega AND f.cod_agencia = e.cod_agencia AND f.cod_empresa = e.cod_empresa AND f.cod_sub_bodega = e.cod_sub_bodega AND f.cod_tipo_inventario = 'FI' 
                                        JOIN icl.in_items_lotes l ON f.nro_lote = l.nro_lote AND f.cod_item = l.cod_item AND f.cod_empresa = l.cod_empresa
                                    WHERE 
                                        c.cod_empresa = %s
                                        AND c.cod_agencia = %s
                                        AND e.estado = 1
                                        AND j.estado = 1
                                        AND upper(j.cod_coordinador) = upper(%s)
                                        AND extract(year FROM %s::date) = f.anio
                                ) x
                                --WHERE x.saldo > 0
                                ORDER BY x.fecha_vencimiento; ''',
                               [cod_item, fecha_emision, cod_item, fecha_emision, cod_item, self.cod_empresa,
                                self.cod_agencia, self.cod_coordinador, fecha_emision])
                rows = cursor.fetchall()
                list_bodegas_lotes = [dict(zip([column[0] for column in cursor.description], row)) for row in
                                      rows]

               #print(list_bodegas_lotes)
                return JsonResponse(list_bodegas_lotes, safe=False)
        elif action == 'detalle_item':
            cod_item = request.GET.get('cod_item')
            datosAdicionalesItem = PostQueryDetalle()
            datos = datosAdicionalesItem.optnerDatosAdicionalesItem(cod_item=cod_item, cod_empresa=self.cod_empresa)
            # print(datos)
            return JsonResponse(datos, safe=False)
        elif action == 'optener_saldo_disponible_item':
            cod_item = request.GET.get('cod_item')
            nro_lote = request.GET.get('nro_lote')
            cod_bodega = request.GET.get('cod_bodega')
            cod_sub_bodega = request.GET.get('cod_sub_bodega')
            fecha = request.GET.get('fecha')
            lv_maneja_lotes = request.GET.get('lv_maneja_lotes')

            saldoDisponibleItem = PostQueryDetalle()
            saldoDisponible = saldoDisponibleItem.optnerSaldoDisponibleItem(
                cod_empresa=self.cod_empresa,
                cod_item=cod_item,
                nro_lote=nro_lote,
                cod_bodega=cod_bodega,
                cod_sub_bodega=cod_sub_bodega,
                cod_agencia=self.cod_agencia,
                fecha=fecha,
                lv_maneja_lotes=lv_maneja_lotes
            )
            # print(saldoDisponible)
            return JsonResponse(saldoDisponible, safe=False)
        elif action == 'optener_precio_item':
            cod_item = request.GET.get('cod_item')
            cod_cliente = request.GET.get('cod_cliente')
            cod_zona = request.GET.get('cod_zona')

            validateItem = ValidateItem()
            precio_item = validateItem.optenerPrecioItem(
                cod_empresa=self.cod_empresa,
                cod_item=cod_item,
                cod_cliente=cod_cliente,
                cod_zona=cod_zona
            )

            # descuentos = validateItem.calcularDescuentos(cod_empresa=self.cod_empresa,cod_item = cod_item)
            #
            #
            #
            # print('descuentos')
            # print(descuentos)
            return JsonResponse(precio_item, safe=False)
        elif action == 'validar_Item':
            cod_item = request.GET.get('cod_item')
            cod_cliente = request.GET.get('cod_cliente')
            cod_zona = request.GET.get('cod_zona')
            validateItem = ValidateItem()
            precio_item = validateItem.optenerPrecioItem(
                cod_empresa=self.cod_empresa,
                cod_item=cod_item,
                cod_cliente=cod_cliente,
                cod_zona=cod_zona
            )
            # print('valores '+ cod_item + ' cod_empresa '+ self.cod_empresa)

            descuentos = validateItem.calcularDescuentos(cod_empresa=self.cod_empresa, cod_item=cod_item)
            response_data = {
                'precio_item': precio_item,
                'descuentos': descuentos,

            }

            print(response_data)
            return JsonResponse(response_data, safe=False)







        else:
            return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Registro de Pedidos de Clientes'
        context['lista_url'] = reverse_lazy('registro_pedidos_clientes')
        context['ven_0020url'] = reverse_lazy('buscar-entidades-clientes')
        context['accion'] = self.parametros['accion']
        # print('acccion actual')
        # print(self.parametros['accion'])
        if self.parametros['accion'] == 'MOS' or self.parametros['accion'] == 'MOD':
            datosConsultaCab = MostrarDatosConsultaCab(
                cod_empresa=self.cod_empresa,
                cod_agencia=self.cod_agencia,
                nro_comprobante_cobro=self.parametros['nro_comprobante_cobro']
            )
            resultados = datosConsultaCab.get_data()
            print(resultados)
            context['datosConsultaCab'] = json.dumps(resultados)

            datosConsultaDet = MostrarDatosConsultaDet(
                cod_empresa=self.cod_empresa,
                cod_agencia=self.cod_agencia,
                nro_comprobante_cobro=self.parametros['nro_comprobante_cobro']
            )
            resultadosdet = datosConsultaDet.get_data()
            #print(resultadosdet)
            context['datosConsultaDet'] = json.dumps(resultadosdet)

        return context


class ClienteDatos:
    def __init__(self, cod_cliente, cod_empresa, cod_agencia, fecha_emision):
        self.cod_cliente = cod_cliente
        self.cod_empresa = cod_empresa
        self.cod_agencia = cod_agencia
        self.fecha_emision = fecha_emision
        self.datos = {}

    def _execute_function(self, function_name, *args):
        """ Ejecuta una función almacenada en PostgreSQL y retorna el resultado. """
        with connection.cursor() as cursor:
            cursor.callproc(function_name, args)
            result = cursor.fetchone()
        return result

    def _fetch_data(self):
        """ Recupera los datos del cliente y los almacena en el diccionario. """
        # if self.cod_cliente is None:
        #     # Establecer valores predeterminados cuando cod_cliente es None
        #     self.datos.update({
        #         'nombre_cliente': None,
        #         'email': None,
        #         'secuencia_direccion': None,
        #         'secuencia_telefono': None,
        #         'secuencia_electronico': None,
        #         'lv_negociacion_db': None,
        #         'lv_nom_negociacion_cliente': None,
        #         # 'lv_documentacion': None,
        #
        #     })
        #     return
        # Recuperar datos usando funciones almacenadas
        self.datos['nombre_cliente'] = self._execute_function(pkgEnPersona.consultar, self.cod_cliente)[0]
        self.datos['email'] = self._execute_function(pkgEnPersona.contacto_electronico, self.cod_cliente, 'MAIL')[0]
        self.datos['indetificacion'] = \
            self._execute_function(pkgEnIdentificacionesXPer.obtenerIdentificacionPrincipal, self.cod_cliente)[0]
        identificacion_data = self._execute_function(pkgEnIdentificacionesXPer.existe_indetificacion,
                                                     self.datos['indetificacion'])
        if identificacion_data:
            resultados = self.siExisteIdentificacion(self.datos['indetificacion'])
            self.datos['lv_cod_identificacion'] = resultados['cod_identificacion']
            self.datos['cod_tipo_persona'] = resultados['tipo_persona']
            self.datos['cod_cliente'] = resultados['cod_cliente']
        # self.datos['identificacion_data'] = identificacion_data
        self.datos['secuencia_direccion'] = self._execute_function(pkgEnPersona.secuencia_direccion, self.cod_cliente)[
            0]
        self.datos['secuencia_telefono'] = self._execute_function(pkgEnPersona.secuencia_telefono, self.cod_cliente)[0]
        self.datos['secuencia_correo'] = \
            self._execute_function(pkgEnPersona.secuencia_electronico, self.cod_cliente, 'MAIL')[0]
        self.datos['lv_negociacion_db'] = \
            self._execute_function(pkgTsPedido.tipo_negociacion_cliente, self.cod_empresa, self.cod_cliente)[0]
        if self.datos['lv_negociacion_db']:
            self.datos['lv_nom_negociacion_cliente'] = \
                self._execute_function(pkgVtTiposNegociacion.buscar_nom_tipo_negociacion, self.cod_empresa,
                                       self.datos['lv_negociacion_db'])[0]

        else:
            self.datos['lv_nom_negociacion_cliente'] = None
        self.datos['lv_documentacion'] = \
            self._execute_function(pkgTsPedido.tipo_documento_cliente, self.cod_empresa, self.cod_cliente)[0]

        self.datos['lv_cod_categoria'] = \
            self._execute_function(pkgTsClientes.buscar_cod_categoria, self.cod_empresa, self.cod_cliente)[0]
        self.datos['lv_categoria'] = \
            self._execute_function(pkgTsPedido.categoria_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['ln_plazo'] = \
            self._execute_function(pkgTsPedido.palzo_dias_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['ln_cupo'] = self.obtenerCupo(self.cod_cliente)
        self.datos['ln_saldo_vencido'] = self.saldoVencido(self.cod_cliente, self.fecha_emision)
        # resultsVericaficacionNegociacion = verificacionNegociacion(self.datos['lv_negociacion_db'], self.cod_empresa, self.datos['lv_documentacion'], self.datos['ln_plazo'],)
        # self.datos['plazo_dias'] = resultsVericaficacionNegociacion['plazo_dias']
        # self.datos['nro_cuotas'] = resultsVericaficacionNegociacion['nro_cuotas']

    def siExisteIdentificacion(self, identificacion):
        with connection.cursor() as cursor:
            # Obtener el código de identificación y cod_persona
            cursor.execute("""
                SELECT cod_persona, cod_identificacion
                FROM icl.en_identificaciones_x_persona
                WHERE identificacion = %s;
            """, [identificacion])
            result = cursor.fetchone()

            # Si se obtiene un resultado, extraer cod_persona y cod_identificacion
            if result:
                cod_cliente, cod_identificacion = result
            else:
                cod_cliente, cod_identificacion = None, None

            # Obtener el tipo de persona si cod_cliente existe
            tipo_persona = None
            if cod_cliente:
                cursor.execute("""
                    SELECT tipo_persona
                    FROM icl.en_persona
                    WHERE cod_persona = %s;
                """, [cod_cliente])
                tipo_persona_result = cursor.fetchone()
                tipo_persona = tipo_persona_result[0] if tipo_persona_result else None

            # Retornar los resultados obtenidos
            return {
                'cod_identificacion': cod_identificacion,
                'cod_cliente': cod_cliente,
                'tipo_persona': tipo_persona
            }

    def obtenerCupo(self, cod_cliente):
        try:
            with connection.cursor() as cursor:
                # Inicializar ln_cupo como None
                ln_cupo = None
                # Ejecutar la consulta para obtener cupo_credito
                cursor.execute("""
                    SELECT cupo_credito
                    FROM icl.ts_clientes
                    WHERE cod_cliente = %s AND cod_empresa = %s;
                """, [cod_cliente, self.cod_empresa])
                # Obtener el resultado de la consulta
                result = cursor.fetchone()
                if result:
                    ln_cupo = result[0]
                # Si ln_cupo no es nulo, calcular el cupo disponible
                if ln_cupo is not None:
                    # Llamar al procedimiento almacenado para obtener el saldo del cliente
                    cursor.callproc(pkgTsClientes.saldo_cliente, [self.cod_empresa, cod_cliente])
                    saldo_cliente = cursor.fetchone()[0]

                    # Calcular el cupo disponible
                    ln_cupo = ln_cupo - (saldo_cliente or 0)
                    ln_cupo = "{:.2f}".format(ln_cupo)
                    # ln_cupo = round(ln_cupo, 2)
                # Retornar el valor de ln_cupo
                return ln_cupo
        except Exception as e:
            # Manejar excepciones, por ejemplo, si no se encuentra ningún dato
            print(f"Error: {e}")
            return None

    def saldoVencido(self, cod_cliente, fecha_emision):
        try:
            with connection.cursor() as cursor:
                # Inicializar ln_saldo_vencido como None
                ln_saldo_vencido = None
                # Ejecutar la consulta para obtener saldo vencido
                cursor.execute("""
                    SELECT COALESCE(
                        SUM(
                            icl.pkg_ts_vencimiento_cobro_saldo_cuota_comprobante(
                                cc.cod_empresa, 
                                cc.cod_agencia, 
                                cc.nro_comprobante_cobro, 
                                vc.cuota, 
                                %s
                            )
                        ), 0
                    ) 
                    FROM icl.ts_comprobante_cobro cc
                    JOIN icl.ts_vencimiento_cobro vc
                        ON cc.nro_comprobante_cobro = vc.nro_comprobante_cobro
                        AND cc.cod_agencia = vc.cod_agencia
                        AND cc.cod_empresa = vc.cod_empresa
                    JOIN icl.ts_tipo_comprob_cobro tc
                        ON cc.cod_comprobante = tc.cod_comprobante
                        AND cc.cod_empresa = tc.cod_empresa
                    WHERE cc.cod_empresa = %s
                      AND cc.cod_agencia = %s
                      AND cc.cod_estado != 'ANU'
                      AND cc.cod_cliente = %s
                      AND vc.fecha_vencimiento < %s
                      AND tc.cod_tipo_transaccion IN ('VENTAS', 'VTASFA');
                """, [fecha_emision, self.cod_empresa, self.cod_agencia, cod_cliente, fecha_emision])

                # Obtener el resultado de la consulta
                result = cursor.fetchone()
                if result:
                    ln_saldo_vencido = result[0]
                    # print(ln_saldo_vencido)
                    ln_saldo_vencido = "{:.2f}".format(ln_saldo_vencido)
                    # print(ln_saldo_vencido)
                else:
                    ln_saldo_vencido = None

                # Retornar
                return ln_saldo_vencido
        except Exception as e:
            # Manejar excepciones
            print(f"Error: {e}")
            return None

    # ----verificacion de la negociacion
    # def verificacionNegociacion(self, lv_negociacion_db, cod_empresa, lv_documentacion, ln_plazo):
    #     datos = {}
    #     # Verificación de la negociación
    #     if not lv_negociacion_db:
    #         datos = {
    #             'error': 'El cliente no tiene definido un Tipo de Negociación...',
    #         }
    #     elif executor._execute_function(pkgVtTiposNegociacion.tipo_negociacion, cod_empresa, lv_negociacion_db)[
    #         0] == 'CER':
    #         datos = {
    #             'error': 'El cliente tiene la Cuenta Cerrada. No puede continuar...',
    #         }
    #     elif executor._execute_function(pkgVtTiposNegociacion.tipo_negociacion, cod_empresa, lv_negociacion_db)[
    #         0] == 'CRE':
    #         if not lv_documentacion or ln_plazo is None:
    #             datos = {
    #                 'error': 'El cliente no tiene definido Tipo de Documentación/Plazo Días...',
    #             }
    #         else:
    #             # Definir el plazo de días
    #             datos['plazo_dias'] = ln_plazo if ln_plazo is not None else 0
    #     else:
    #         datos['nro_cuotas'] = 1
    #         datos['plazo_dias'] = ln_plazo if ln_plazo is not None else 0
    #
    #     return datos


class ValidarClienteZona:

    def __init__(self, cod_cliente, cod_agente, cod_empresa, cod_usuario):
        self.cod_cliente = cod_cliente
        self.cod_agente = cod_agente
        self.cod_empresa = cod_empresa
        self.cod_usuario = cod_usuario
        self.datos = {}

    def _fetch_data(self):
        try:
            with connection.cursor() as cursor:
                if self.cod_cliente:
                    if not self.cod_agente:
                        try:
                            # Ejecutar la primera consulta
                            cursor.execute('''
                                SELECT b.cod_agente, substr(icl.pkg_en_persona_buscar_nombre(b.cod_agente), 1, 100) AS nombre, a.cod_zona
                                FROM icl.co_zonas_x_coordinador a
                                JOIN icl.co_zonas_x_agente b ON a.cod_empresa = b.cod_empresa AND a.cod_zona = b.cod_zona AND b.estado = 1
                                JOIN icl.co_cliente_zona c ON b.cod_empresa = c.cod_empresa AND b.cod_zona = c.cod_zona AND c.cod_cliente = %s AND c.estado = 1
                                JOIN icl.co_coordi_x_jefatura_linea d ON a.cod_empresa = d.cod_empresa AND a.cod_jefatura = d.cod_jefatura AND a.cod_coordinacion = d.cod_coordinacion AND d.estado = 1
                                WHERE a.cod_empresa = %s AND a.estado = 1 AND UPPER(d.cod_coordinador) = UPPER(%s)
                            ''', [self.cod_cliente, self.cod_empresa, self.cod_usuario])

                            result = cursor.fetchone()
                            if result:
                                self.datos['cod_agente'] = result[0]
                                self.datos['nom_agente'] = result[1]
                                self.datos['cod_zona'] = result[2],
                                self.datos['cod_coordinador'] = self.cod_usuario
                                self.datos['msNoPertenece'] = None
                            else:
                                self.datos['msNoPertenece'] = 'El Cliente actual no pertenece a la Zona especificada.'

                        except DatabaseError as e:
                            self.datos['error'] = f"Error en la consulta: {e}"

                    else:
                        try:
                            # Ejecutar la segunda consulta si cod_agente no es nulo
                            cursor.execute('''
                                SELECT b.cod_agente
                                FROM icl.co_zonas_x_coordinador a
                                JOIN icl.co_zonas_x_agente b ON a.cod_empresa = b.cod_empresa AND a.cod_zona = b.cod_zona AND b.estado = 1
                                JOIN icl.co_cliente_zona c ON b.cod_empresa = c.cod_empresa AND b.cod_zona = c.cod_zona AND c.cod_cliente = %s AND c.estado = 1
                                JOIN icl.co_coordi_x_jefatura_linea d ON a.cod_empresa = d.cod_empresa AND a.cod_jefatura = d.cod_jefatura AND a.cod_coordinacion = d.cod_coordinacion AND d.estado = 1
                                WHERE a.cod_empresa = %s AND a.estado = 1 AND UPPER(d.cod_coordinador) = UPPER(%s) AND a.cod_zona = %s
                            ''', [self.cod_cliente, self.cod_empresa, self.cod_usuario, self.cod_agente])

                            result = cursor.fetchone()
                            if result:
                                self.datos['cod_agente'] = result[0]
                                self.datos['msNoPertenece'] = None
                            else:
                                self.datos['msNoPertenece'] = 'El Cliente actual no pertenece a la Zona especificada.'
                        except DatabaseError as e:
                            self.datos['error'] = f"Error en la consulta: {e}"

        except Exception as e:
            self.datos['error'] = f"Error: {e}"

    def get_data(self):
        self._fetch_data()
        return self.datos


class IniciarForma:
    def __init__(self, cod_empresa, usuarioAutenticado, cod_agencia):
        self.cod_empresa = cod_empresa
        self.usuarioAutenticado = usuarioAutenticado
        self.cod_agencia = cod_agencia
        self.datos = {}

    def _fetch_data(self):
        self.datos['cod_comprobante'] = \
            executor._execute_function(pkgAdParametros.obtener_valor, self.cod_empresa, 'PEDIDO')[0]
        if not self.datos['cod_comprobante']:
            self.datos['error'] = 'No existe definido Tipo Comprobante de Pedidos de clientes...'
        self.datos['cod_moneda'] = executor._execute_function(pkgCgMoneda.cod_moneda_default, self.cod_empresa)[0]
        self.datos['cod_pais'] = executor._execute_function(pkgAdParametros.obtener_valor, self.cod_empresa, 'PAISDEF')[
            0]
        self.datos['fecha_emision'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if self.datos['cod_pais']:
            self.datos['nombre_pais'] = \
                executor._execute_function(pkgEnPais.buscar_nombre_pais, self.datos['cod_pais'])[0]
        self.datos['ln_cuantas_bodegas'] = self.cuantas_bodegas(self.cod_empresa, self.cod_agencia,
                                                                self.usuarioAutenticado)

    from django.db import connection

    def cuantas_bodegas(self, cod_empresa, cod_agencia, usuario_autenticado):
        try:
            with connection.cursor() as cursor:
                # Ejecutar la consulta para contar las bodegas
                cursor.execute("""
                    SELECT COUNT(a.cod_bodega)
                    FROM icl.co_sub_bodegas_x_coordinador a
                    JOIN icl.co_coordi_x_jefatura_linea b
                    ON a.cod_empresa = b.cod_empresa
                    AND a.cod_jefatura = b.cod_jefatura 
                    AND a.cod_coordinacion = b.cod_coordinacion
                    WHERE a.cod_empresa = %s
                    AND a.cod_agencia = %s
                    AND a.estado = 1
                    AND b.estado = 1 
                    AND UPPER(b.cod_coordinador) = UPPER(%s);
                """, [cod_empresa, cod_agencia, usuario_autenticado])

                # Obtener el resultado de la consulta
                result = cursor.fetchone()
                ln_cuantas_bodegas = result[0] if result else 0

                return ln_cuantas_bodegas

        except Exception as e:
            # Manejar excepciones
            print(f"Error: {e}")
            return None

    def get_data(self):
        self._fetch_data()
        return self.datos


class PostQuery:

    def __init__(self, cod_empresa, usuarioAutenticado, cod_agencia, cod_cliente, indetificacion,
                 nro_comprobante_cobro, fecha_emision):
        self.cod_empresa = cod_empresa
        self.usuarioAutenticado = usuarioAutenticado
        self.cod_agencia = cod_agencia
        self.cod_cliente = cod_cliente
        self.indetificacion = indetificacion
        self.nro_comprobante_cobro = nro_comprobante_cobro
        self.fecha_emision = fecha_emision
        self.datos = {}

    def _fetch_data(self):
        identificacion_existe = executor._execute_function(pkgEnIdentificacionesXPer.existe_indetificacion,
                                                           self.indetificacion)
        self.datos['identicacion'] = self.indetificacion
        if identificacion_existe:
            resultados = self.siExisteIdentificacion(self.indetificacion, self.cod_cliente)
            self.datos['lv_cod_identificacion'] = resultados['cod_identificacion']
            self.datos['cod_tipo_persona'] = resultados['tipo_persona']
        secuencia_direccion, secuencia_telefono, secuencia_correo = self.cambios(self.nro_comprobante_cobro,
                                                                                 self.cod_empresa, self.cod_agencia)

        direccion_datos = self.direccion(secuencia_direccion, self.cod_cliente)
        if direccion_datos:
            self.datos['secuencia_direccion'] = direccion_datos['secuencia_direccion']
            self.datos['calle'] = direccion_datos['calle']
            self.datos['numero'] = direccion_datos['numero']
            self.datos['interseccion'] = direccion_datos['interseccion']
            self.datos['cod_pais'] = direccion_datos['cod_pais']
            self.datos['cod_lugar'] = direccion_datos['cod_lugar']
            self.datos['cod_direccion'] = direccion_datos['cod_direccion']
            self.datos['nombre_pais'] = direccion_datos['nombre_pais']
            self.datos['lugar'] = direccion_datos['lugar']
            self.datos['cod_org'] = direccion_datos['cod_org']
            self.datos['lv_direccion'] = direccion_datos['lv_direccion']
        self.datos['secuencia_telefono'] = secuencia_telefono
        self.datos['telefono'] = executor._execute_function(pkgEnPersona.telefono_principal, self.cod_cliente)[0]
        self.datos['secuencia_correo'] = secuencia_correo
        correo_datos = self.correo(secuencia_correo, self.cod_cliente)
        if correo_datos:
            self.datos['lv_nom_secuencia_correo'] = correo_datos['lv_nombre_secuencia_correo']
            self.datos['email'] = correo_datos['email']

        if not self.datos['cod_org']:
            self.datos['cod_org'] = 2
        self.datos['lv_negociacion_db'] = \
            executor._execute_function(pkgTsPedido.tipo_negociacion_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['lv_nom_negociacion_cliente'] = \
            executor._execute_function(pkgVtTiposNegociacion.buscar_nom_tipo_negociacion, self.cod_empresa,
                                       self.datos['lv_negociacion_db'])[0]
        self.datos['lv_documentacion'] = \
            executor._execute_function(pkgTsPedido.tipo_documento_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['lv_cod_categoria'] = \
            executor._execute_function(pkgTsClientes.buscar_cod_categoria, self.cod_empresa, self.cod_cliente)[0]
        self.datos['lv_categoria'] = \
            executor._execute_function(pkgTsPedido.categoria_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['ln_plazo'] = \
            executor._execute_function(pkgTsPedido.palzo_dias_cliente, self.cod_empresa, self.cod_cliente)[0]
        self.datos['ln_cupo'] = self.obtenerCupo(self.cod_cliente)
        self.datos['ln_saldo_vencido'] = self.saldoVencido(self.cod_cliente, self.fecha_emision)
        saldos_cliente = self.saldosCliente(self.cod_cliente, self.cod_empresa)
        self.datos['ln_saldos_cliente'] = saldos_cliente['ln_saldos_cliente']
        self.datos['ln_anticipos_cliente'] = saldos_cliente['ln_anticipos_cliente']

    def siExisteIdentificacion(self, identificacion, cod_cliente):
        with connection.cursor() as cursor:
            # obtener el código de identificación
            cursor.execute("""
                   SELECT cod_identificacion
                   FROM icl.en_identificaciones_x_persona
                   WHERE identificacion = %s;
               """, [identificacion])
            cod_identificacion = cursor.fetchone()
            # obtener el tipo de persona
            cursor.execute("""
                   SELECT tipo_persona
                   FROM icl.en_persona
                   WHERE cod_persona = %s;
               """, [cod_cliente])
            tipo_persona = cursor.fetchone()
            # Retornar los resultados obtenidos
            return {
                'cod_identificacion': cod_identificacion[0] if cod_identificacion else None,
                'tipo_persona': tipo_persona[0] if tipo_persona else None
            }

    def cambios(self, nro_comprobante_cobro, cod_empresa, cod_agencia):
        with connection.cursor() as cursor:
            # obtener el código de identificación
            cursor.execute("""
                             select secuencia_direccion, secuencia_telefono, secuencia_correo
                            from icl.ts_comprobante_cobro
                            where nro_comprobante_cobro = %s and
                            cod_agencia = %s and
                             cod_empresa = %s;

                     """, [nro_comprobante_cobro, cod_agencia, cod_empresa])
            result = cursor.fetchone()
            if result:
                # Retornar los tres elementos obtenidos
                return result[0], result[1], result[2]
            else:
                return None, None, None

    def direccion(self, secuencia_direccion, cod_cliente):
        datos = {}
        with connection.cursor() as cursor:
            if secuencia_direccion:
                cursor.execute("""
                     SELECT calle, numero, interseccion, cod_pais, cod_lugar, cod_direccion
                     FROM icl.en_direcciones_x_persona
                     WHERE secuencia = %s AND cod_persona = %s;
                 """, [secuencia_direccion, cod_cliente])
                result = cursor.fetchone()
                if result:

                    # nombre_lugar = executor._execute_function(pkgEnGeo.buscar_nombre_lugar, result[3], result[4])[0]
                    nombre_lugar_nivel_1 = \
                        executor._execute_function(pkgEnGeo.buscar_nombre_lugar_nivel_1, result[3], result[4])[0]

                    # lugar = nombre_lugar + ' / ' + nombre_lugar_nivel_1[:100]
                    lugar = nombre_lugar_nivel_1[:100]

                    datos = {
                        'secuencia_direccion': secuencia_direccion,
                        'calle': result[0],
                        'numero': result[1],
                        'interseccion': result[2],
                        'cod_pais': result[3],
                        'cod_lugar': result[4],
                        'cod_direccion': result[5],
                        'nombre_pais': executor._execute_function(pkgEnPais.buscar_nombre_pais(result[3])[0]),
                        'lugar': lugar,
                        'cod_org': executor._execute_function(pkgEnGeo.buscar_cod_org_lugar, result[3], result[4])[0],
                        'lv_direccion': executor._execute_function(pkgEnCatalogo.buscar_nombre_catalogo, result[5])[0]
                    }
                else:
                    datos = {}
            else:
                secuencia_direccion = executor._execute_function(pkgEnPersona.secuencia_direccion, self.cod_cliente)[0]
                cursor.execute("""
                     SELECT calle, numero, interseccion, cod_pais, cod_lugar, cod_direccion
                     FROM icl.en_direcciones_x_persona
                     WHERE secuencia = %s AND cod_persona = %s;
                 """, [secuencia_direccion, cod_cliente])
                result = cursor.fetchone()
                if result:
                    # Extrae los valores correctos de las tuplas devueltas por las funciones
                    # nombre_lugar = executor._execute_function(pkgEnGeo.buscar_nombre_lugar, result[3], result[4])[0]
                    nombre_lugar_nivel_1 = \
                        executor._execute_function(pkgEnGeo.buscar_nombre_lugar_nivel_1, result[3], result[4])[0]
                    lugar = nombre_lugar_nivel_1[:100]
                    datos = {
                        'secuencia_direccion': secuencia_direccion,
                        'calle': result[0],
                        'numero': result[1],
                        'interseccion': result[2],
                        'cod_pais': result[3],
                        'cod_lugar': result[4],
                        'cod_direccion': result[5],
                        'nombre_pais': executor._execute_function(pkgEnPais.buscar_nombre_pais, result[3])[0],
                        'lugar': lugar,
                        'cod_org': executor._execute_function(pkgEnGeo.buscar_cod_org_lugar, result[3], result[4])[0],
                        'lv_direccion': executor._execute_function(pkgEnCatalogo.buscar_nombre_catalogo, result[5])[0]

                    }
                else:
                    datos = {}

        return datos

    def correo(self, secuencia_correo, cod_cliente):
        datos = {}
        with connection.cursor() as cursor:

            if secuencia_correo:
                cursor.execute("""
                       select contacto, substr(icl.pkg_en_catalogo_buscar_nombre_catalogo(e.cod_catalogo),1,50)
                       from icl.en_electronicos_x_persona e
                       where e.cod_persona = %s
                         and e.secuencia = %s
              
                 """, [cod_cliente, secuencia_correo])
                result = cursor.fetchone()
                if result:
                    datos = {
                        'email': result[0],
                        'lv_nombre_secuencia_correo': result[1]
                    }

                else:
                    datos = {}
            else:
                datos = {
                    'email': executor._execute_function(pkgEnPersona.contacto_electronico, cod_cliente, 'MAIL')[0],
                    'lv_nombre_secuencia_correo': None
                }
        return datos

    def obtenerCupo(self, cod_cliente):
        try:
            with connection.cursor() as cursor:
                ln_cupo = None
                cursor.execute("""
                    SELECT cupo_credito
                    FROM icl.ts_clientes
                    WHERE cod_cliente = %s AND cod_empresa = %s;
                """, [cod_cliente, self.cod_empresa])

                result = cursor.fetchone()
                if result:
                    ln_cupo = result[0]
                if ln_cupo is not None:
                    cursor.callproc(pkgTsClientes.saldo_cliente, [self.cod_empresa, cod_cliente])
                    saldo_cliente = cursor.fetchone()[0]
                    ln_cupo = ln_cupo - (saldo_cliente or 0)
                    ln_cupo = "{:.2f}".format(ln_cupo)
                    # ln_cupo = round(ln_cupo, 2)

                return ln_cupo
        except Exception as e:
            print(f"Error: {e}")
            return None

    def saldoVencido(self, cod_cliente, fecha_emision):
        try:
            with connection.cursor() as cursor:

                ln_saldo_vencido = None

                cursor.execute("""
                    SELECT COALESCE(
                        SUM(
                            icl.pkg_ts_vencimiento_cobro_saldo_cuota_comprobante(
                                cc.cod_empresa, 
                                cc.cod_agencia, 
                                cc.nro_comprobante_cobro, 
                                vc.cuota, 
                                %s
                            )
                        ), 0
                    ) 
                    FROM icl.ts_comprobante_cobro cc
                    JOIN icl.ts_vencimiento_cobro vc
                        ON cc.nro_comprobante_cobro = vc.nro_comprobante_cobro
                        AND cc.cod_agencia = vc.cod_agencia
                        AND cc.cod_empresa = vc.cod_empresa
                    JOIN icl.ts_tipo_comprob_cobro tc
                        ON cc.cod_comprobante = tc.cod_comprobante
                        AND cc.cod_empresa = tc.cod_empresa
                    WHERE cc.cod_empresa = %s
                      AND cc.cod_agencia = %s
                      AND cc.cod_estado != 'ANU'
                      AND cc.cod_cliente = %s
                      AND vc.fecha_vencimiento < %s
                      AND tc.cod_tipo_transaccion IN ('VENTAS', 'VTASFA');
                """, [fecha_emision, self.cod_empresa, self.cod_agencia, cod_cliente, fecha_emision])

                result = cursor.fetchone()
                if result:
                    ln_saldo_vencido = result[0]
                    # print(ln_saldo_vencido)
                    ln_saldo_vencido = "{:.2f}".format(ln_saldo_vencido)
                    # print(ln_saldo_vencido)
                else:
                    ln_saldo_vencido = None

                # Retornar
                return ln_saldo_vencido
        except Exception as e:
            # Manejar excepciones
            print(f"Error: {e}")
            return None

    # def saldosCliente(self, cod_cliente, cod_empresa):
    #     with connection.cursor() as cursor:
    #         # Obtener saldo de ventas
    #         cursor.execute("""
    #             select coalesce(sum(v.saldo), 0)
    #             from icl.ts_comprobante_cobro c
    #             join icl.ts_vencimiento_cobro v
    #             on v.cod_empresa = c.cod_empresa
    #             and v.cod_agencia = c.cod_agencia
    #             and v.nro_comprobante_cobro = c.nro_comprobante_cobro
    #             join icl.ts_tipo_comprob_cobro t
    #             on c.cod_empresa = t.cod_empresa
    #             and c.cod_comprobante = t.cod_comprobante
    #             where c.cod_empresa = %s
    #             and c.cod_cliente = %s
    #             and c.cod_estado not in('ANU')
    #             and v.saldo > 0
    #             and t.cod_tipo_transaccion = 'VENTAS';
    #         """, [cod_empresa, cod_cliente])
    #         ln_saldos_cliente = cursor.fetchone()
    #
    #
    #         # Obtener saldo de anticipos
    #         cursor.execute("""
    #             select coalesce(sum(i.valor - icl.pkg_ts_movimiento_cobro_total_x_ingreso_afecta(i.cod_empresa, i.cod_agencia, i.nro_ingreso)), 0)
    #             from icl.ts_ingresos i
    #             join icl.ts_tipo_ingreso t
    #             on i.cod_empresa = t.cod_empresa
    #             and i.cod_ingreso = t.cod_ingreso
    #             where i.cod_empresa = %s
    #             and i.cod_cliente = %s
    #             and i.cod_estado not in ('ANU')
    #             and (i.valor - icl.pkg_ts_movimiento_cobro_total_x_ingreso_afecta(i.cod_empresa, i.cod_agencia, i.nro_ingreso)) > 0
    #             and t.cod_tipo_transaccion = 'ANTCLI';
    #         """, [cod_empresa, cod_cliente])
    #         ln_saldo_anticipos = cursor.fetchone()
    #
    #         # Obtener saldo de notas de crédito
    #         cursor.execute("""
    #             select coalesce(sum(i.valor_neto - icl.pkg_ts_movimiento_cobro_total_x_comprobante_afecta(i.cod_empresa, i.cod_agencia, i.nro_comprobante_cobro)), 0)
    #             from icl.ts_comprobante_cobro i
    #             join icl.ts_tipo_comprob_cobro t
    #             on i.cod_empresa = t.cod_empresa
    #             and i.cod_comprobante = t.cod_comprobante
    #             where i.cod_empresa = %s
    #             and i.cod_cliente = %s
    #             and i.cod_estado not in ('ANU')
    #             and (i.valor_neto - icl.pkg_ts_movimiento_cobro_total_x_comprobante_afecta(i.cod_empresa, i.cod_agencia, i.nro_comprobante_cobro)) > 0
    #             and t.cod_tipo_transaccion in ('NOCRECLI', 'NCREVTA');
    #         """, [cod_empresa, cod_cliente])
    #         ln_saldo_nc = cursor.fetchone()
    #
    #         # Asegurarse de que las variables no sean None
    #         ln_saldo_anticipos = ln_saldo_anticipos[0] if ln_saldo_anticipos and ln_saldo_anticipos[
    #             0] is not None else 0
    #         ln_saldo_nc = ln_saldo_nc[0] if ln_saldo_nc and ln_saldo_nc[0] is not None else 0
    #
    #         # Calcular el total de anticipos del cliente
    #         ln_anticipos_cliente = ln_saldo_anticipos + ln_saldo_nc
    #
    #
    #         # Retornar los resultados obtenidos
    #         return {
    #             'ln_saldos_cliente': ln_saldos_cliente[0] if ln_saldos_cliente else 0,
    #             'ln_anticipos_cliente': ln_anticipos_cliente
    #         }

    # devuleve los datos de la clase

    def saldosCliente(self, cod_cliente, cod_empresa):
        with connection.cursor() as cursor:
            # Obtener saldo de ventas
            cursor.execute("""
                select coalesce(sum(v.saldo), 0)
                from icl.ts_comprobante_cobro c
                join icl.ts_vencimiento_cobro v 
                on v.cod_empresa = c.cod_empresa
                and v.cod_agencia = c.cod_agencia
                and v.nro_comprobante_cobro = c.nro_comprobante_cobro
                join icl.ts_tipo_comprob_cobro t 
                on c.cod_empresa = t.cod_empresa
                and c.cod_comprobante = t.cod_comprobante
                where c.cod_empresa = %s
                and c.cod_cliente = %s
                and c.cod_estado not in('ANU')
                and v.saldo > 0
                and t.cod_tipo_transaccion = 'VENTAS';
            """, [cod_empresa, cod_cliente])
            ln_saldos_cliente = cursor.fetchone()
            ln_saldos_cliente = ln_saldos_cliente[0] if ln_saldos_cliente else 0
            ln_saldos_cliente = "{:.2f}".format(ln_saldos_cliente)

            # Obtener saldo de anticipos
            cursor.execute("""
                select coalesce(sum(i.valor - icl.pkg_ts_movimiento_cobro_total_x_ingreso_afecta(i.cod_empresa, i.cod_agencia, i.nro_ingreso)), 0)
                from icl.ts_ingresos i
                join icl.ts_tipo_ingreso t 
                on i.cod_empresa = t.cod_empresa
                and i.cod_ingreso = t.cod_ingreso
                where i.cod_empresa = %s
                and i.cod_cliente = %s
                and i.cod_estado not in ('ANU')
                and (i.valor - icl.pkg_ts_movimiento_cobro_total_x_ingreso_afecta(i.cod_empresa, i.cod_agencia, i.nro_ingreso)) > 0
                and t.cod_tipo_transaccion = 'ANTCLI';
            """, [cod_empresa, cod_cliente])
            ln_saldo_anticipos = cursor.fetchone()
            ln_saldo_anticipos = ln_saldo_anticipos[0] if ln_saldo_anticipos and ln_saldo_anticipos[
                0] is not None else 0

            # Obtener saldo de notas de crédito
            cursor.execute("""
                select coalesce(sum(i.valor_neto - icl.pkg_ts_movimiento_cobro_total_x_comprobante_afecta(i.cod_empresa, i.cod_agencia, i.nro_comprobante_cobro)), 0)
                from icl.ts_comprobante_cobro i
                join icl.ts_tipo_comprob_cobro t 
                on i.cod_empresa = t.cod_empresa
                and i.cod_comprobante = t.cod_comprobante
                where i.cod_empresa = %s
                and i.cod_cliente = %s
                and i.cod_estado not in ('ANU')
                and (i.valor_neto - icl.pkg_ts_movimiento_cobro_total_x_comprobante_afecta(i.cod_empresa, i.cod_agencia, i.nro_comprobante_cobro)) > 0
                and t.cod_tipo_transaccion in ('NOCRECLI', 'NCREVTA');
            """, [cod_empresa, cod_cliente])
            ln_saldo_nc = cursor.fetchone()
            ln_saldo_nc = ln_saldo_nc[0] if ln_saldo_nc and ln_saldo_nc[0] is not None else 0

            # Calcular el total de anticipos del cliente
            ln_anticipos_cliente = ln_saldo_anticipos + ln_saldo_nc
            ln_anticipos_cliente = "{:.2f}".format(ln_anticipos_cliente)

            # Retornar los resultados obtenidos
            return {
                'ln_saldos_cliente': ln_saldos_cliente,
                'ln_anticipos_cliente': ln_anticipos_cliente
            }

    def get_data(self):
        self._fetch_data()
        return self.datos


class ValidarIndetificacion:
    def __init__(self, indetificacion):
        self.indetificacion = indetificacion
        self.datos = {}

    def _fetch_data(self):
        identificacion_data = executor._execute_function(pkgEnIdentificacionesXPer.existe_indetificacion,
                                                         self.indetificacion)[0]
        if identificacion_data:
            resultados = self.siExisteIdentificacion(self.indetificacion)
            self.datos['lv_cod_identificacion'] = resultados['cod_identificacion']
            self.datos['cod_tipo_persona'] = resultados['tipo_persona']
            self.datos['cod_cliente'] = resultados['cod_cliente']
            self.datos['mensaje'] = None

        else:
            self.datos['mensaje'] = 'Identificación No Existe.'

    def siExisteIdentificacion(self, identificacion):
        with connection.cursor() as cursor:
            # Obtener el código de identificación y cod_persona
            cursor.execute("""
                SELECT cod_persona, cod_identificacion
                FROM icl.en_identificaciones_x_persona
                WHERE identificacion = %s;
            """, [identificacion])
            result = cursor.fetchone()

            # Si se obtiene un resultado, extraer cod_persona y cod_identificacion
            if result:
                cod_cliente, cod_identificacion = result
            else:
                cod_cliente, cod_identificacion = None, None

            # Obtener el tipo de persona si cod_cliente existe
            tipo_persona = None
            if cod_cliente:
                cursor.execute("""
                    SELECT tipo_persona
                    FROM icl.en_persona
                    WHERE cod_persona = %s;
                """, [cod_cliente])
                tipo_persona_result = cursor.fetchone()
                tipo_persona = tipo_persona_result[0] if tipo_persona_result else None

            # Retornar los resultados obtenidos
            return {
                'cod_identificacion': cod_identificacion,
                'cod_cliente': cod_cliente,
                'tipo_persona': tipo_persona
            }

    def get_data(self):
        self._fetch_data()
        return self.datos


def verificacionNegociacion(lv_negociacion_db, cod_empresa, lv_documentacion, ln_plazo, ):
    datos = {}

    # Verificación de la negociación
    if not lv_negociacion_db:
        datos = {
            'alerta_error': 'El cliente no tiene definido un Tipo de Negociación...',
        }
    elif executor._execute_function(pkgVtTiposNegociacion.tipo_negociacion, cod_empresa, lv_negociacion_db)[0] == 'CER':
        datos = {
            'alerta_error': 'El cliente tiene la Cuenta Cerrada. No puede continuar...',
        }
    elif executor._execute_function(pkgVtTiposNegociacion.tipo_negociacion, cod_empresa, lv_negociacion_db)[0] == 'CRE':
        if not lv_documentacion or not ln_plazo:
            datos = {
                'alerta_error': 'El cliente no tiene definido Tipo de Documentación/Plazo Días...',
            }
        else:
            datos['plazo_dias'] = ln_plazo if ln_plazo is not None else 0

    else:

        datos['nro_cuotas'] = 1
        datos['plazo_dias'] = ln_plazo if ln_plazo is not None else 0
    return datos


class MostrarDatosConsultaCab:

    def __init__(self, cod_empresa, cod_agencia, nro_comprobante_cobro):
        self.cod_empresa = cod_empresa
        self.cod_agencia = cod_agencia
        self.nro_comprobante_cobro = nro_comprobante_cobro
        self.datos = {}

    def _fetch_data(self):
        resultado = executor._execute_function(
            pkgTsPedido.consutarRegistroCab,
            self.cod_empresa,
            self.cod_agencia,
            self.nro_comprobante_cobro
        )
        #

        if resultado:
            self.datos['cod_empresa'] = resultado[0]
            self.datos['cod_agencia'] = resultado[1]
            self.datos['nro_comprobante_cobro'] = str(resultado[2])
            self.datos['cod_comprobante'] = resultado[3]
            self.datos['nro_cod_comprobante'] = str(resultado[4])
            self.datos['cod_cliente'] = resultado[5]
            self.datos['nombre_cliente'] = resultado[6]
            self.datos['nombre_comercial'] = resultado[7]
            self.datos['fecha_emision'] = str(resultado[8])
            self.datos['valor_bruto'] = str(resultado[9])
            self.datos['valor_neto'] = str(resultado[10])
            self.datos['cod_moneda'] = resultado[11]
            self.datos['descripcion'] = resultado[12]
            self.datos['nro_cuotas'] = str(resultado[13])
            self.datos['cod_coordinador'] = resultado[14]
            self.datos['cod_facturador'] = resultado[15]
            self.datos['cod_agente'] = resultado[16]
            self.datos['nom_agente'] = resultado[17]
            self.datos['cod_tipo_estado'] = resultado[18]
            self.datos['cod_estado'] = resultado[19]
            self.datos['cod_cliente_referencia'] = resultado[20]
            self.datos['cod_identificacion'] = resultado[21]
            self.datos['identificacion'] = resultado[22]
            self.datos['secuencia_cierre'] = str(resultado[23])
            self.datos['cod_zona'] = resultado[24]
            self.datos['observaciones'] = resultado[25]
            self.datos['cod_tipo_negociacion'] = resultado[26]
            self.datos['cod_tipo_documentacion'] = resultado[27]
            self.datos['cupo_credito'] = str(resultado[28])
            self.datos['observacion_cambio_estado'] = resultado[29]
            self.datos['nro_comprobante_web'] = str(resultado[30])
            self.datos['plazo_dias'] = str(resultado[31])
            self.datos['tipo_cta_x_cobrar'] = resultado[32]
            self.datos['cod_establecimiento'] = resultado[33]
            self.datos['cod_punto_venta'] = resultado[34]
            self.datos['secuencia_documento'] = str(resultado[35])

    def get_data(self):
        self._fetch_data()
        return self.datos


class MostrarDatosConsultaDet:

    def __init__(self, cod_empresa, cod_agencia, nro_comprobante_cobro):
        self.cod_empresa = cod_empresa
        self.cod_agencia = cod_agencia
        self.nro_comprobante_cobro = nro_comprobante_cobro
        self.datos = []

    def _fetch_data(self):
        try:
            resultados = executor._execute_function_all(
                pkgTsPedido.consultarPedidoDetalle,
                self.cod_empresa,
                self.cod_agencia,
                self.nro_comprobante_cobro
            )
            for resultado in resultados:
                datos_item = {
                    'cod_empresa': str(resultado[0]),
                    'cod_agencia': str(resultado[1]),
                    'nro_comprobante_cobro': str(resultado[2]),
                    'secuencia': str(resultado[3]),
                    'cod_item': str(resultado[4]),
                    'cod_bodega': str(resultado[5]),
                    'cod_sub_bodega': str(resultado[6]),
                    'cantidad': str(resultado[7]),
                    'precio': str(resultado[8]),
                    'cod_impuesto': str(resultado[9]),
                    'porcentaje_impuesto': str(resultado[10]),
                    'valor_bruto': str(resultado[11]),
                    'valor_neto': str(resultado[12]),
                    'cantidad_pedida_transf': str(resultado[13]),
                    'cantidad_despachada_transf': str(resultado[14]),
                    'cantidad_pedido_vta': str(resultado[15]),
                    'cod_tipo_estado': str(resultado[16]),
                    'cod_estado': str(resultado[17]),
                    'ing_egr_item': str(resultado[18]),
                    'fecha': str(resultado[19]) if resultado[19] else None,
                    'cod_tipo_inventario': str(resultado[20]),
                    'costo_promedio': str(resultado[21]),
                    'cod_agencia_egr': str(resultado[22]),
                    'valor_item_total': str(resultado[23]),
                    'valor_descuento_venta': str(resultado[24]),
                    'observaciones': str(resultado[25]),
                    'promocion': str(resultado[26]),
                    'cod_impuesto_especial': str(resultado[27]),
                    'cod_impuesto_ret_especial': str(resultado[28]),
                    'porc_impuesto_especial': str(resultado[29]),
                    'valor_impuesto_especial': str(resultado[30]),
                    'secuencia_propiedad': str(resultado[31]),
                    'ln_porc_descuento': str(resultado[32]),
                    'descripcion_venta_item': str(resultado[33]),
                    'nro_lote': str(resultado[34]),
                    'fecha_fabricacion': str(resultado[35]) if resultado[35] else None,
                    'fecha_vencimiento': str(resultado[36]) if resultado[36] else None
                }
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            icl.pkg_inv_item_buscar_unidad_med_item(cod_empresa,cod_item) as unidad, 
                            descripcion, 
                            icl.pkg_inv_marca_buscar_nombre_marca(cod_marca, cod_empresa) as nombre_marca, 
                            referencia,
                            maneja_lotes, 
                            controla_inventario
                        FROM icl.in_items
                        WHERE cod_item = %s 
                        AND cod_empresa = %s
                    """, [resultado[4], self.cod_empresa])

                    resultado_adicional = cursor.fetchone()
                if resultado_adicional:
                    datos_item.update({
                        'unidad': resultado_adicional[0],
                        'descripcion': resultado_adicional[1],
                        'lv_nom_marca': resultado_adicional[2],
                        ' lv_referencia_item': resultado_adicional[3],
                        'lv_maneja_lotes': 'N' if resultado_adicional[4] is None else resultado_adicional[4],
                        # 'lv_maneja_lotes': resultado_adicional[4],
                        'lv_controla_inventario': resultado_adicional[5]
                    })

                nombre_bodega_sub_bodega = executor._execute_function(
                    pkgTsPedido.nombre_bodega_sub_bodega,
                    self.cod_empresa,
                    resultado[5],
                    resultado[6]

                )
                if nombre_bodega_sub_bodega:
                    datos_item.update({
                        'lv_nom_bodega': nombre_bodega_sub_bodega[0],
                    })

                # cambiamos los farmotos de  fecha
                fecha_str = str(resultado[19])
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
                fecha_formateada = fecha_obj.strftime("%m/%d/%Y")
                if resultado_adicional[4] == 'S':

                    # print("fecha formato ")
                    # print(fecha_formateada)
                    saldo_disponible = executor._execute_function(
                        pkgInSaldosItemsLotes.saldo_disponible_lote,
                        self.cod_empresa,
                        resultado[4],
                        resultado[34],
                        self.cod_agencia,
                        resultado[5],
                        resultado[6],
                        fecha_formateada
                        # str(resultado[19])  # fecha del item
                    )
                    datos_item.update({
                        'saldo_disponible': str(saldo_disponible)
                    })
                else:
                    saldo_disponible = executor._execute_function(
                        pkgInvItem.saldo_disponible,
                        self.cod_empresa,
                        resultado[4],  # cod_item
                        self.cod_agencia,
                        resultado[5],
                        resultado[6],
                        fecha_formateada
                        # str(resultado[19])  # fecha del item
                    )
                    datos_item.update({
                        'saldo_disponible': str(saldo_disponible)
                    })
                # print("item")
                # print(resultado[4])
                # print("maneja lotes")
                # print(datos_item['lv_maneja_lotes'])
                # print("saldo disponible")
                # print(datos_item['saldo_disponible'])
                # print("fecha formato ")
                # print(fecha_formateada)
                # print("nro lote")
                # print(datos_item['nro_lote'])

                print(self.datos)
                self.datos.append(datos_item)
        except Exception as e:
            print(f"Error al mostara datos de detalle : {e}")

    def get_data(self):
        self._fetch_data()
        return self.datos


class PostQueryDetalle:
    # def __init__(self, cod_empresa, cod_item, cod_bodega, cod_sub_bodega, nro_lote, cod_agencia, fecha):
    #     self.cod_empresa = cod_empresa
    #     self.cod_item = cod_item
    #     self.cod_bodega = cod_bodega
    #     self.cod_sub_bodega = cod_sub_bodega
    #     self.nro_lote = nro_lote
    #     self.cod_agencia = cod_agencia
    #     self.fecha = fecha
    #     self.datos_item = {}
    #
    # def _fetch_data(self):
    #     with connection.cursor() as cursor:
    #         cursor.execute("""
    #             SELECT
    #             icl.pkg_inv_item_buscar_unidad_med_item(cod_empresa,cod_item) as unidad,
    #             descripcion,
    #             icl.pkg_inv_marca_buscar_nombre_marca(cod_marca, cod_empresa) as nombre_marca,
    #             referencia,
    #             maneja_lotes,
    #             controla_inventario
    #             FROM icl.in_items
    #             WHERE cod_item = %s
    #             AND cod_empresa = %s
    #                        """, [self.cod_item, self.cod_empresa])
    #
    #         resultado_adicional = cursor.fetchone()
    #     if resultado_adicional:
    #         self.datos_item.update({
    #             'unidad': resultado_adicional[0],
    #             'descripcion': resultado_adicional[1],
    #             'lv_nom_marca': resultado_adicional[2],
    #             'LV_REFERENCIA_ITEM': resultado_adicional[3],
    #             'lv_maneja_lotes': 'N' if resultado_adicional[4] is None else resultado_adicional[4],
    #             'lv_controla_inventario': resultado_adicional[5]
    #         })
    #     nombre_bodega_sub_bodega = executor._execute_function(
    #         pkgTsPedido.nombre_bodega_sub_bodega,
    #         self.cod_empresa,
    #         self.cod_bodega,
    #         self.cod_sub_bodega
    #
    #     )
    #     if nombre_bodega_sub_bodega:
    #         self.datos_item.update({
    #             'lv_nom_bodega': nombre_bodega_sub_bodega[0],
    #         })
    #
    #     #cambiamos los farmotos de  fecha
    #     fecha_str = str(self.fecha)
    #     fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
    #     fecha_formateada = fecha_obj.strftime("%m/%d/%Y")
    #     if resultado_adicional[4] == 'S':
    #         saldo_disponible = executor._execute_function(
    #             pkgInSaldosItemsLotes.saldo_disponible_lote,
    #             self.cod_empresa,
    #             self.cod_item,
    #             self.nro_lote,
    #             self.cod_agencia,
    #             self.cod_bodega,
    #             self.cod_sub_bodega,
    #             fecha_formateada
    #         )
    #         self.datos_item.update({
    #             'saldo_disponible': str(saldo_disponible)
    #         })
    #     else:
    #         saldo_disponible = executor._execute_function(
    #             pkgInvItem.saldo_disponible,
    #             self.cod_empresa,
    #             self.cod_item,
    #             self.cod_agencia,
    #             self.cod_bodega,
    #             self.cod_sub_bodega,
    #             fecha_formateada
    #         )
    #         self.datos_item.update({
    #             'saldo_disponible': str(saldo_disponible)
    #         })
    #
    # def get_data(self):
    #     self._fetch_data()
    #     return self.datos_item

    # def
    def optnerDatosAdicionalesItem(self, cod_item, cod_empresa):
        datos_item = {}

        with connection.cursor() as cursor:
            cursor.execute("""
                       SELECT 
                       icl.pkg_inv_item_buscar_unidad_med_item(cod_empresa,cod_item) as unidad, 
                       descripcion, 
                       icl.pkg_inv_marca_buscar_nombre_marca(cod_marca, cod_empresa) as nombre_marca, 
                       referencia,
                       maneja_lotes, 
                       controla_inventario
                       FROM icl.in_items
                       WHERE cod_item = %s 
                       AND cod_empresa = %s
                                  """, [cod_item, cod_empresa])
            resultado_adicional = cursor.fetchone()

        # Si se encontraron resultados, actualiza el diccionario
        if resultado_adicional:
            datos_item.update({
                'unidad': resultado_adicional[0],
                'descripcion': resultado_adicional[1],
                'lv_nom_marca': resultado_adicional[2],
                'lv_referencia_item': resultado_adicional[3],
                'lv_maneja_lotes': 'N' if resultado_adicional[4] is None else resultado_adicional[4],
                'lv_controla_inventario': resultado_adicional[5]
            })
        return datos_item

    def optenerNombreBodega(self, cod_bodega, cod_sub_bodega, cod_empresa):
        nombre_bodega_sub_bodega = executor._execute_function(
            pkgTsPedido.nombre_bodega_sub_bodega,
            cod_empresa,
            cod_bodega,
            cod_sub_bodega
        )
        if nombre_bodega_sub_bodega:
            return nombre_bodega_sub_bodega[0]
        else:
            return None

    from datetime import datetime

    def optnerSaldoDisponibleItem(self, cod_empresa, cod_item, nro_lote, cod_bodega, cod_sub_bodega, cod_agencia, fecha,
                                  lv_maneja_lotes):

        if 'T' in fecha:
            fecha_str = fecha.replace('T', ' ')
        else:
            fecha_str = fecha

        # print('Fecha original:', fecha)

        # Verificar si la fecha tiene segundos
        if len(fecha_str) == 19:  # "YYYY-MM-DD HH:MM:SS"
            fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
        else:
            # Añadir '00' segundos si la fecha no tiene segundos
            fecha_str += ":00"
            fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")
        fecha_formateada = fecha_obj.strftime("%Y-%m-%d")

        # print('--------------------------------')
        # print(fecha)
        # print(fecha_formateada)

        # Si el ítem maneja lotes
        if lv_maneja_lotes == 'S':
            saldo_disponible = executor._execute_function(
                pkgInSaldosItemsLotes.saldo_disponible_lote,
                cod_empresa,
                cod_item,
                nro_lote,
                cod_agencia,
                cod_bodega,
                cod_sub_bodega,
                fecha_formateada
            )
            return saldo_disponible
        else:
            # Si no maneja lotes
            saldo_disponible = executor._execute_function(
                pkgInvItem.saldo_disponible,
                cod_empresa,
                cod_item,
                cod_agencia,
                cod_bodega,
                cod_sub_bodega,
                fecha_formateada
            )
            return saldo_disponible

    def optenerLvDescuentos(self,cod_empresa,cod_agencia,nro_comprobante_cobro,secuencia):
        lv_descuentos = executor._execute_function(
            pkgTsPedido.descuentos_item,
            cod_empresa,
            cod_agencia,
            nro_comprobante_cobro,
            secuencia

        )
        if lv_descuentos:
            return lv_descuentos


    def optnerLnPorcentajePromocion (self,cod_empresa , cod_item,fehca_emision,cantidad):
        ln_porcentaje_promocion = executor._execute_function(
            pkgVtTemporadaPromocionIt.obt_porcentaje_promocion,
            cod_empresa,
            cod_item,
            fehca_emision,
            cantidad,
            None
        )
        if ln_porcentaje_promocion:
            return ln_porcentaje_promocion[0]
        else:
            return None




class ValidateItem:
    def optenerPrecioItem(self, cod_empresa, cod_item, cod_cliente, cod_zona):
        try:
            cod_cliente = int(cod_cliente)
        except ValueError:
            print("Error: cod_cliente no es un número válido")
            return None
        precioItem = executor._execute_function(
            pkgFacturacion.precio_item,
            cod_empresa,
            cod_item,
            cod_zona,
            cod_cliente
        )
        if precioItem:
            return precioItem[0]
        else:
            return None

    def calcularDescuentos(self, cod_empresa, cod_item):
        datos = {}
        print("=====")
        porcentaje_impuesto = executor._execute_function(
            'icl.pkg_inv_item_buscar_porcentaje_imp',
            cod_empresa,
            cod_item,
        )
        print(porcentaje_impuesto)
         #
        if porcentaje_impuesto:
            datos['porcentaje_impuesto'] = porcentaje_impuesto[0]
        cod_impuesto = executor._execute_function(
            pkgInvItem.buscar_impuesto_item,
            cod_empresa,
            cod_item,
        )
        if cod_impuesto:
            datos['cod_impuesto'] = cod_impuesto[0]
        unidad = executor._execute_function(
            pkgInvItem.buscar_unidad_med_item,
            cod_empresa,
            cod_item,

        )
        if unidad:
            datos['unidad'] = unidad[0]
        with connection.cursor() as cursor:
            cursor.execute("""
                    select cod_impuesto_especial, cod_impuesto_ret_especial, referencia, maneja_lotes
                    from icl.in_items
                    where cod_item = %s and
                    cod_empresa = %s;
                        """, [cod_item,cod_empresa])
            resultado = cursor.fetchone()
            if resultado:
                datos['cod_impuesto_especial'] = resultado[0]
                datos['cod_impuesto_ret_especial'] = resultado[1]
                datos['lv_referencia_item'] = resultado[2]
                datos['lv_maneja_lotes'] = resultado[3]


        if datos['cod_impuesto_especial'] != None:
            with connection.cursor() as cursor:
                cursor.execute("""
                      select porcentaje 
                      from icl.ts_impuesto_retencion
                      where cod_impuesto = %s and
                            cod_retencion = %s;
                            """, [datos['cod_impuesto_especial'], datos['cod_impuesto_ret_especial']])
                porc_impuesto_especial = cursor.fetchone()
                if porc_impuesto_especial:
                     datos['porc_impuesto_especial'] = porc_impuesto_especial[0]
        else :
           datos['valor_impuesto_especial'] = None
           datos['porc_impuesto_especial'] = None

   
        return datos



class CalcularDescuento:
    ln_contador = 0
    ln_total_descuento = 0
    ln_descuento = 0
    ln_precio = 0
    ln_porcentaje_promocion = 0
    ln_promocion = 0


    def __init__(self, cantidad, precio, lv_cod_categoria, lv_negociacion, cod_empresa, cod_item,fecha_emision, ln_porc_descuento):
        self.cantidad = cantidad or 1
        self.precio = precio
        self.lv_cod_categoria = lv_cod_categoria
        self.lv_negociacion = lv_negociacion
        self.cod_empresa = cod_empresa
        self.cod_item = cod_item
        self.fecha_emision = fecha_emision
        self.ln_porc_descuento = ln_porc_descuento
        self.datos = {}
        self.lv_descuentos = ""

    def _fetch_data(self):
        ln_precio = self.precio * self.cantidad
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT cod_descuento, valor
                FROM icl.vt_tipos_desc_x_cliente_categ
                WHERE cod_empresa = %s
                  AND cod_categoria = %s
                  AND cod_tipo_negociacion = %s;
            """, [self.cod_empresa, self.lv_cod_categoria, self.lv_negociacion])

            resultado = cursor.fetchall()
            for reg in resultado:
                self.ln_contador += 1
                ln_descuento = ln_precio * reg[1] / 100
                ln_precio -= ln_descuento
                self.ln_total_descuento += ln_descuento
                if self.ln_contador == 1:
                    self.lv_descuentos = str(reg[1])
                else:
                    self.lv_descuentos += ' - ' + str(reg[1])

        self.datos['valor_descuento_venta'] = round(self.ln_total_descuento, 4)
        self.datos['ln_precio'] = self.ln_precio
        self.datos['ln_total_descuento'] = self.ln_total_descuento
        self.datos['lv_descuentos'] = self.lv_descuentos
        self.datos['ln_descuento'] = self.ln_descuento
        self.datos['ln_total_descuento'] = self.ln_total_descuento

        ln_porcentaje_promocion = executor._execute_function(
            pkgVtTemporadaPromocionIt.obt_porcentaje_promocion,
            self.cod_empresa,
            self.cod_item,
            self.fecha_emision,
            self.cantidad,
            None
        )
        if ln_porcentaje_promocion:
            self.datos['ln_porcentaje_promocion'] = ln_porcentaje_promocion[0]

        self.datos['promocion'] = 'N'
        if ln_porcentaje_promocion[0] > 0:
            self.datos['promocion'] = 'S'
            self.ln_promocion = self.datos['ln_precio'] * self.datos['ln_porcentaje_promocion'] / 100
            self.datos['ln_promocion'] = self.ln_promocion
            self.datos['lv_descuentos'] = self.datos['lv_descuentos'] +"-" + self.datos['ln_porcentaje_promocion']
            self.datos['valor_descuento_venta'] = self.datos['valor_descuento_venta'] +  self.datos['ln_promocion']
            self.datos['ln_precio'] =self.datos['ln_precio'] -  self.datos['ln_promocion']

        if self.ln_porc_descuento > 0:
            self.datos['ln_descuento'] = self.datos['ln_precio'] * self.ln_porc_descuento / 100
            self.datos['lv_descuentos'] = self.datos['lv_descuentos'] +"-"+ self.ln_porc_descuento
           #
            self.datos['valor_descuento_venta'] = self.datos['valor_descuento_venta'] +  self.datos['ln_descuento']
            self.datos['ln_precio'] = self.datos['ln_precio']-self.datos['ln_descuento']
        return self.datos

    def get_data(self):
        self._fetch_data()
        return self.datos




























