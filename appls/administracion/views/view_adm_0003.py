from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.db import transaction, connection

from static.vars import packages
from psycopg2 import IntegrityError
import json
import traceback

pkgAdModulo = packages.PkgAdModulo()


class DefinicionModulosView(TemplateView):
    template_name = 'ADM_0003.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.tbModulos = 'TablaModulo'
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}

        # cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'searchdata_modulos':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdModulo.consultar, [None, None, None, None])
                    rows = cursor.fetchall()
                    modulos = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                    return JsonResponse(modulos, safe=False)

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
            if table_id == self.tbModulos:
                record_to_insert = (
                    record['cod_modulo'],
                    record['nombre'],
                    record['descripcion'],
                    record['estado']
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdModulo.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)

    def process_updated_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbModulos:
                record_to_insert = (
                    record['cod_modulo'],
                    record['nombre'],
                    record['descripcion'],
                    record['estado']
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdModulo.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)

    def process_deleted_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbModulos:
                record_to_insert = (
                    record['cod_modulo'],
                    record['nombre'],
                    record['descripcion'],
                    record['estado']
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdModulo.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Mantenimiento de Modulos'
        context['lista_url'] = reverse_lazy('definicion-modulos')

        return context
