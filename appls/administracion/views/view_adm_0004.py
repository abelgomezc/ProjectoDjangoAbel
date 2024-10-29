from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.db import transaction, connection

from appls.administracion.models import AdUsuarioEmpresa
from static.vars import packages
import base64
from psycopg2 import IntegrityError
import json
import traceback

pkgAdAgencia = packages.PkgAdAgencia()
pkgAdUsuarioAgencia = packages.PkgAdUsuarioAgencia()


class DefinicionAgenciaView(TemplateView):
    template_name = 'ADM_0004.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.tbAgencia = 'TablaAgencias'
        self.tbUsuariosAgencias = 'TablaUsuariosAgencias'

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        # cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'searchdata_agencias':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdAgencia.consultar, [self.cod_empresa, None, None, None])
                    rows = cursor.fetchall()
                    agencias = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                    return JsonResponse(agencias, safe=False)
            elif action == 'searchdata_usuarios_agencia':
                cod_agencia = request.POST.get('cod_agencia')
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdUsuarioAgencia.consultarUsuariosXAgencia,
                                    [self.cod_empresa, cod_agencia, None, None, None])
                    rows = cursor.fetchall()
                    usuariosXAgencia = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                    return JsonResponse(usuariosXAgencia, safe=False)

            elif action == 'searchdata_usuariosxempresa':
                cod_empresa = self.cod_empresa
                with connection.cursor() as cursor:
                    cursor.execute('''
                                       SELECT E.Cod_Usuario, U.Nombre
                                       FROM icl.ad_usuario_empresa E
                                       LEFT JOIN icl.ad_usuario U ON E.Cod_Usuario = U.Cod_Usuario
                                       WHERE E.Cod_Empresa = %s
                                       ORDER BY 1
                                   ''', [cod_empresa])
                    rows = cursor.fetchall()
                    usuariosXEmpresa = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                    return JsonResponse(usuariosXEmpresa, safe=False)

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





            else:  #
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' + str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def process_added_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbAgencia:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['nombre'],
                    record['estado'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdAgencia.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == self.tbUsuariosAgencias:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['cod_usuario'],
                    record['estado'],
                    record['nombreusuario'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdUsuarioAgencia.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)

    def process_updated_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbAgencia:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['nombre'],
                    record['estado'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdAgencia.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Modificar result:', result)
            elif table_id == self.tbUsuariosAgencias:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['cod_usuario'],
                    record['estado'],
                    record['nombreusuario'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdUsuarioAgencia.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Modificar result:', result)

    def process_deleted_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbAgencia:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['nombre'],
                    record['estado'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdAgencia.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Borrar result:', result)
            elif table_id == self.tbUsuariosAgencias:
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_agencia'],
                    record['cod_usuario'],
                    record['estado'],
                    record['nombreusuario'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdUsuarioAgencia.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Borrar result:', result)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Definicion Agencias'
        context['titulo_agencia'] = 'Mantenimiento Agencias'
        context['titulo_usuarios'] = 'Usuarios por Agencias'
        context['lista_url'] = reverse_lazy('definicion-agencias')
        # context['entity'] = 'Tipo'
        # context['form'] = AdEmpresaForm()

        return context
