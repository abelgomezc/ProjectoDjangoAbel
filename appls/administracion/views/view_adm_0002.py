from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.db import transaction, connection

from appls.administracion.models import AdEmpresa, AdModulo, AdRol
from static.vars import packages
import base64
from psycopg2 import IntegrityError
import json
import traceback

pkgAdOpcion = packages.PkgAdOpcion()
pkgAdRol = packages.PkgAdRol()
pkgAdOpcioneRol = packages.PkgAdOpcioneRol()


class DefinicionOpcionesRolesUsuarioView(TemplateView):
    template_name = 'ADM_0002.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.usuarioAutenticado = self.request.session.get('VS_USER')
        self.tbOpciones = 'TablaOpciones'
        self.tbRoles = 'TablaRoles'
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        # cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'optener_menu_opciones':
                cod_modulo = request.POST.get('cod_modulo')
                cod_opcion = request.POST.get('cod_opcion')
                if cod_opcion:
                    parametros = [cod_modulo, cod_opcion]

                else:
                    parametros = [cod_modulo, None]

                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdOpcion.consultar, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    data = [dict(zip(columns, row)) for row in rows]

                return JsonResponse(data, safe=False)
            elif action == 'optener_roles':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdRol.consultar, [None, None, None, None])
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    roles = [dict(zip(columns, row)) for row in rows]

                return JsonResponse(roles, safe=False)

            elif action == 'optener_modulos':
                modulos = AdModulo.objects.filter(estado=1)
                # Convertir los objetos a JSON
                data = [modulo.toJSON() for modulo in modulos]
                return JsonResponse(data, safe=False)
            elif action == 'optener_menu_opciones_x_rol':
                cod_modulo = request.POST.get('cod_modulo')
                cod_rol = request.POST.get('cod_rol')

                parametros_insert = [cod_modulo, cod_rol, self.cod_empresa]
                parametros = [cod_modulo, cod_rol, self.cod_empresa]
                # Ejecución de la función de inserción de nuevas opciones
                with connection.cursor() as cursor:
                    cursor.execute(f'{pkgAdOpcioneRol.insertarNuevasOpcionesRol}(%s, %s, %s);', parametros_insert)

                # Ejecución de la función de consulta de opciones por rol
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdOpcioneRol.consultarOpcionesXRol, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    data = [dict(zip(columns, row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'save_records':
                try:
                    data_records_json = request.POST.get('dataRecords')
                    if not data_records_json:
                        return JsonResponse({'error': 'Datos no válidos o faltantes'}, status=400)

                    data_records = json.loads(data_records_json)
                    results = {}

                    with transaction.atomic():
                        for table_id, operations in data_records.items():
                            success_message = f'Todos los registros se aplicaron correctamente en la tabla {table_id}'
                            warning_message = f'Algunos registros no se guardaron correctamente en la tabla {table_id}'
                            errors = []

                            for operation, records in operations.items():
                                for record in records:
                                    try:
                                        if operation == 'added':
                                            self.process_added_record(table_id, record)
                                        elif operation == 'updated':
                                            self.process_updated_record(table_id, record)
                                        elif operation == 'deleted':
                                            self.process_deleted_record(table_id, record)
                                    except IntegrityError as e:
                                        error_message = str(e.__cause__) if e.__cause__ else str(e)
                                        errors.append({
                                            'record': record,
                                            'error': f"Error procesando {operation} en {table_id}: {error_message}"
                                        })
                                    except Exception as e:
                                        errors.append({
                                            'record': record,
                                            'error': str(e)
                                        })
                                        print(f"Error procesando {operation} en {table_id}: {str(e)}")
                                        traceback.print_exc()

                            if operations:
                                if errors:
                                    results[table_id] = {
                                        'status': 'error',
                                        'message': warning_message,
                                        'errors': errors
                                    }
                                    raise IntegrityError(
                                        'Errores encontrados en la operación: ' + ', '.join(
                                            [error['error'] for error in errors])
                                    )

                                else:
                                    results[table_id] = {
                                        'status': 'success',
                                        'message': success_message
                                    }

                    return JsonResponse({'results': results})
                except json.JSONDecodeError:
                    return JsonResponse({'error': 'Datos no válidos'}, status=400)
                except IntegrityError as e:
                    return JsonResponse({'error': 'Error de integridad: ' + str(e)}, status=400)
                except Exception as e:
                    print('Exception:', e)
                    traceback.print_exc()
                    return JsonResponse({'error': str(e)}, status=400)

            elif action == 'cambiar_estado_opcion_rol':

                cod_modulo = request.POST.get('cod_modulo')
                cod_opcion = request.POST.get('cod_opcion')
                cod_rol = request.POST.get('cod_rol')
                estado = request.POST.get('estado')
                parametros = [self.cod_empresa, cod_modulo, cod_opcion, estado, cod_rol]
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdOpcioneRol.cambiarEstado, parametros)
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    data = [dict(zip(columns, row)) for row in rows]
                return JsonResponse(data, safe=False)


            elif action == 'searchdata_roles':
                roles = AdRol.objects.filter(estado=1)
                roles_list = [role.toJSON() for role in roles]
                return JsonResponse({'roles': roles_list})

            elif action == 'copiar_opciones_rol_a_rol':
                cod_modulo = request.POST.get('cod_modulo')
                cod_rol_origen = request.POST.get('cod_rol_origen')
                cod_rol_destino = request.POST.get('cod_rol_destino')
                parametros = [cod_rol_origen, cod_rol_destino, self.cod_empresa, cod_modulo]

                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdOpcioneRol.copiarOpcionesRolARol, parametros)
                    resultado = cursor.fetchone()[0]  # Capturar el primer resultado que es el mensaje

                return JsonResponse({'message': resultado})

            else:
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' + str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def process_added_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbOpciones:

                record_to_insert = (
                    record['cod_modulo'],
                    record['cod_opcion'],
                    record['nombre'],
                    record['descripcion'],
                    record['url'],
                    record['estado'],
                    record['orden'],
                    record['cod_modulo_padre'],
                    record['cod_opcion_padre'],
                    None,
                    self.usuarioAutenticado,
                    None,
                    None,
                    None,
                    None,
                    record['cod_empresa']
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdOpcion.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == self.tbRoles:
                record_to_insert = (
                    record['cod_rol'],
                    record['nombre'],
                    record['descripcion'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdRol.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)

    def process_updated_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbOpciones:
                record_to_insert = (
                    record['cod_modulo'],
                    record['cod_opcion'],
                    record['nombre'],
                    record['descripcion'],
                    record['url'],
                    record['estado'],
                    record['orden'],
                    record['cod_modulo_padre'],
                    record['cod_opcion_padre'],
                    None,
                    None,
                    None,
                    None,
                    self.usuarioAutenticado,
                    None,
                    record['cod_empresa']
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdOpcion.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Modificar result:', result)
            elif table_id == self.tbRoles:
                record_to_insert = (
                    record['cod_rol'],
                    record['nombre'],
                    record['descripcion'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdRol.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Modificar result:', result)

    def process_deleted_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbOpciones:

                record_to_insert = (
                    record['cod_modulo'],
                    record['cod_opcion'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdOpcion.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Borrar result:', result)
            elif table_id == self.tbRoles:
                record_to_insert = (
                    record['cod_rol'],
                    None,
                    None,
                    None,
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)",
                                                 record_to_insert).decode('utf-8')
                cursor.execute(pkgAdRol.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Borrar result:', result)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Definicion de Opciones y Roles por Usuarios'
        context['lista_url'] = reverse_lazy('definicion_opciones_y_roles_usuario')

        return context
