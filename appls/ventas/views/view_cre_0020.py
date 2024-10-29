import traceback

from django.db import transaction, connection

from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
import psycopg2
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from appls.administracion.models import EnPais
from static.vars import packages
import json

pkgTsClientes = packages.PkgTsClientes()
pkgEnDireccionesXPersonas = packages.PkgEnDireccionesXPersonas()
pkgEnTelefonosXPersonas = packages.PkgEnTelefonosXPersonas()
pkgEnElectronicosXPersona = packages.PkgEnElectronicosXPersona()
pkgEnConfPantallaRap = packages.PkgEnConfPantallaRap()
pkgAdministracion = packages.PkgAdministracion()
pkgEnIdentificacionesXPer = packages.PkgEnIdentificacionesXPer()
pkgEnPersona = packages.PkgEnPersona()


class BuscarEntidadesClientesView(TemplateView):
    template_name = 'CRE_0020.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.usuarioAutenticado = self.request.session.get('VS_USER')

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'filtrar_persona':
                with connection.cursor() as cursor:
                    # Llamar a la función PKG_TS_PEDIDO_consultar_pedidos
                    cursor.callproc(pkgTsClientes.filtrar_persona,
                                    [self.cod_empresa, None, None, None, None, None])
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]
                    return JsonResponse(data, safe=False)
            elif action == 'searchdata_direcciones':
                cod_persona = request.POST.get('cod_persona')
                secuencia = request.POST.get('secuencia') or None
                cod_direccion = request.POST.get('cod_direccion') or None
                calle = request.POST.get('calle') or None

                parametros = [cod_persona, secuencia, cod_direccion, calle]

                with connection.cursor() as cursor:
                    cursor.callproc(pkgEnDireccionesXPersonas.consultar, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]

                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]
                    return JsonResponse(data, safe=False)
            elif action == 'searchdata_telefonos':
                cod_persona = request.POST.get('cod_persona')
                secuencia = request.POST.get('secuencia') or None
                cod_telefono = request.POST.get('cod_telefono') or None
                telefono = request.POST.get('telefono') or None

                parametros = [cod_persona, secuencia, cod_telefono, telefono]

                with connection.cursor() as cursor:
                    cursor.callproc(pkgEnTelefonosXPersonas.consultar, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]

                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]
                    return JsonResponse(data, safe=False)
            elif action == 'searchdata_correos':
                cod_persona = request.POST.get('cod_persona')
                parametros = [cod_persona]
                with connection.cursor() as cursor:
                    cursor.callproc(pkgEnElectronicosXPersona.consultar, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]
                    return JsonResponse(data, safe=False)
            elif action == 'searchdata_per_cliente':
                cod_persona = request.POST.get('cod_persona')
                parametros = [self.cod_empresa, cod_persona]
                with connection.cursor() as cursor:
                    cursor.callproc(pkgEnConfPantallaRap.consultar, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]
                    return JsonResponse(data, safe=False)
            elif action == 'searchdata_paises':
                paises = EnPais.objects.all()
                paises_list = [pais.toJSON() for pais in paises]
                return JsonResponse({'paises': paises_list})

            elif action == 'searchdata_ciudades':
                cod_pais = request.POST.get('cod_pais')
                cod_org = request.POST.get('cod_org')
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
            elif action == 'searchdata_zonas':
                with connection.cursor() as cursor:
                    cursor.execute('''select cod_zona, nombre 
                                      from icl.co_zona
                                      where cod_empresa = %s
                                      order by 1;'''
                                   , [self.cod_empresa])
                    rows = cursor.fetchall()
                    list_zonas = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                    return JsonResponse(list_zonas, safe=False)
            elif action == 'searchdata_tipo_Precios':
                with connection.cursor() as cursor:
                    cursor.execute('''select cod_tipo_precio, nombre
                                      from icl.vt_tipo_precio
                                      where cod_empresa = %s
                                      order by cod_tipo_precio'''
                                   , [self.cod_empresa])
                    rows = cursor.fetchall()
                    list_tipos_precios = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                    return JsonResponse(list_tipos_precios, safe=False)
            elif action == 'searchdata_RG_TIPO_IDE_NAT':
                with connection.cursor() as cursor:
                    cursor.execute('''select nombre, cod_catalogo
                                      from icl.en_catalogo
                                      where cod_tipo_catalogo = '009' 
                                      and cod_catalogo != 'CON'
                                      order by 1;'''
                                   , )
                    rows = cursor.fetchall()
                    list_tipos_ide_nat = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                    return JsonResponse(list_tipos_ide_nat, safe=False)
            elif action == 'validacion_identificacion':
                identificacion = request.POST.get('identificacion')
                with connection.cursor() as cursor:
                    cursor.execute(pkgAdministracion.validar_cedula, [identificacion])
                    resultado = cursor.fetchone()[0]  # Obtenemos el primer (y único) valor retornado
                    if resultado == 'N':
                        # Identificación no válida
                        response = {
                            'mensaje': 'La Identificación ingresada, NO ES VALIDA...',
                             'valid': False
                        }
                        return JsonResponse(response, safe=False)
                    elif resultado == 'S':
                        cursor.execute(pkgEnIdentificacionesXPer.existe_identificacion_new,
                                       [identificacion])
                        existe_identificacion = cursor.fetchone()[0]
                        if existe_identificacion:
                            response = {
                                'mensaje': 'La identificación ingresada YA existe...',
                                           'valid': False
                            }
                        else:
                            response = {
                                'valid': True
                            }
                        return JsonResponse(response, safe=False)

            elif action == 'guardar_datos_formulario':
                # Verificar que 'formData' no sea None
                form_data_raw = request.POST.get('formData')
                if not form_data_raw:
                    return JsonResponse({'error': 'No se ha recibido formData'}, status=400)
                # Convertir la cadena JSON a un diccionario Python
                form_data = json.loads(form_data_raw)
                acc = request.POST.get('acc')
                # Llamar a la función guardarDatosFormulario
                result = self.guardarDatosFormulario(form_data, acc)
                if result:
                    return JsonResponse({'message': 'Datos guardados correctamente'}, status=200)
                else:
                    return JsonResponse({'error': 'Error al guardar los datos'}, status=400)

            # Otras acciones aquí...
            else:
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' + str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def guardarDatosFormulario(self, form_data, accion):
        try:
            cod_empresa = self.cod_empresa
            with connection.cursor() as cursor:
                # Obtener el valor máximo de cod_persona
                # cursor.execute(pkgEnPersona.max_cod_persona)
                # cursor.execute("SELECT icl.PKG_EN_PERSONA_max_cod_persona()")
                # max_cod_persona = cursor.fetchone()[0]
                # cod_persona = max_cod_persona + 1
                if accion == 'ADD':
                    # Obtener el valor máximo de cod_persona solo si la acción es agregar
                    cursor.execute(pkgEnPersona.max_cod_persona)
                    max_cod_persona = cursor.fetchone()[0]
                    cod_persona = max_cod_persona + 1
                else:
                    # Usar el valor de cod_persona existente en form_data si la acción es editar
                    cod_persona = form_data['cod_persona']
                values = (
                    cod_empresa,
                    form_data['cod_tipo_persona'],
                    int(cod_persona),
                    form_data['nombres'],
                    form_data['primer_nombre'],
                    form_data['segundo_nombre'],
                    form_data['apellido_paterno'],
                    form_data['apellido_materno'],
                    form_data['nombre_comercial'],
                    int(form_data['estado']),
                    form_data['cod_identificacion'],
                    form_data['identificacion1'],
                    form_data['identificacion2'],
                    form_data['direccion'],
                    form_data['interseccion'],
                    form_data['numero'],
                    form_data['telefono1'],
                    form_data['telefono2'],
                    form_data['cod_lugar'],
                    form_data['cod_pais'],
                    form_data['email'],
                    form_data['cod_zona'],
                    form_data['cod_tipo_precio'],
                    form_data['cod_categoria']
                )
                if accion == 'ADD':
                    mogrified_value = cursor.mogrify(
                        "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)",
                        values).decode('utf-8')
                    cursor.execute(pkgEnConfPantallaRap.insertar % mogrified_value)
                    result = cursor.fetchall()
                    print('Insert result:', result)
                elif accion == 'EDI':
                    mogrified_value = cursor.mogrify(
                        "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)",
                        values).decode('utf-8')
                    cursor.execute(pkgEnConfPantallaRap.modificar % mogrified_value)
                    result = cursor.fetchall()
                    print('Update result:', result)

            return True

        except Exception as e:
            print('Error al guardar los datos del formulario:', e)
            traceback.print_exc()
            return False

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Buscar Entidades Clientes'
        context['lista_url'] = reverse_lazy('buscar-entidades-clientes')

        return context
