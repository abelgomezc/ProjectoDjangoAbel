from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.db import transaction, connection

from appls.administracion.models import AdEmpresa
from static.vars import packages
import base64
from psycopg2 import IntegrityError
import json
import traceback

pkgAdEmpresa = packages.PkgAdEmpresa()
pkgAdParametros = packages.PkgAdParametros()
pkgAdParametrosNum = packages.PkgAdParametrosNum()


class DefinicionEmpresasView(TemplateView):
    template_name = 'ADM_0001.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        self.tbEmpresas = 'TablaEmpresas'
        self.tbParametros = 'TablaParametros'
        self.tbParametrosNum = 'TablaParametrosNum'
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        # cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'searchdata_empresas':
                with connection.cursor() as cursor:
                    # Ejecutar la consulta para obtener las empresas
                    cursor.callproc(pkgAdEmpresa.consultar, [None, None, None, None, None])
                    rows = cursor.fetchall()
                    empresas = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                    #  Añadir  columna  de entidad
                    # Añadir columna de nombre_entidad para cada empresa
                    for empresa in empresas:
                        cod_empresa = empresa['cod_empresa']
                        cursor.execute(pkgAdEmpresa.consultarNombreEntidad, [cod_empresa])
                        nombre_entidad = cursor.fetchone()[0]
                        empresa['nombre_entidad'] = nombre_entidad

                    return JsonResponse(empresas, safe=False)

            elif action == 'searchdata_parametros':
                cod_empresa = request.POST.get('cod_empresa')
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdParametros.consultar, [cod_empresa, None, None, None, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
            elif action == 'searchdata_parametros_num':
                cod_empresa = request.POST.get('cod_empresa')
                with connection.cursor() as cursor:
                    cursor.callproc(pkgAdParametrosNum.consultar, [cod_empresa, None, None, None, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'search_logo':
                cod_empresa = request.POST.get('cod_empresa')
                try:
                    empresa = AdEmpresa.objects.get(cod_empresa=cod_empresa)
                    logo = empresa.logo

                    if logo:
                        logo_base64 = base64.b64encode(logo).decode('utf-8')
                        return JsonResponse({'logo': logo_base64})
                    else:
                        return JsonResponse({'logo': None})

                except ObjectDoesNotExist:
                    return JsonResponse({'error': 'Empresa no encontrada'}, status=404)

            elif action == 'search_info_empresa':
                cod_empresa = request.POST.get('cod_empresa')
                try:
                    empresa = AdEmpresa.objects.get(cod_empresa=cod_empresa)
                    # logo = empresa.logo
                    response_data = {
                        'nro_establecimientos_activos': empresa.nro_establecimientos_activos,
                        'nro_resolucion_contrib_esp': empresa.nro_resolucion_contrib_esp,
                        'fecha_nro_resolucion': empresa.fecha_nro_resolucion,
                        'cod_rol': empresa.cod_rol,
                        'crm': empresa.crm,
                    }
                    # if logo:
                    #     logo_base64 = base64.b64encode(logo).decode('utf-8')
                    #     response_data['logo'] = logo_base64
                    # else:
                    #     response_data['logo'] = None

                    return JsonResponse(response_data)
                except AdEmpresa.DoesNotExist:
                    return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
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

            elif action == 'save_logo':
                cod_empresa = request.POST.get('cod_empresa')
                logo = request.FILES.get('logo')
                if cod_empresa and logo:
                    try:
                        empresa = AdEmpresa.objects.get(cod_empresa=cod_empresa)
                        empresa.logo = logo.read()
                        empresa.save()
                        return JsonResponse({'status': 'success', 'message': 'Imagen guardada exitosamente.'})
                    except AdEmpresa.DoesNotExist:
                        return JsonResponse({'status': 'error', 'message': 'Empresa no encontrada.'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'Datos incompletos.'})
            elif action == 'delete_logo':
                cod_empresa = request.POST.get('cod_empresa')

                if cod_empresa:
                    try:
                        empresa = AdEmpresa.objects.get(cod_empresa=cod_empresa)
                        empresa.logo = None  # Eliminar la imagen
                        empresa.save()
                        return JsonResponse({'status': 'success', 'message': 'Imagen eliminada exitosamente.'})
                    except AdEmpresa.DoesNotExist:
                        return JsonResponse({'status': 'error', 'message': 'Empresa no encontrada.'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'Código de empresa no proporcionado.'})

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
            if table_id == self.tbEmpresas:
                cod_persona = record.get('cod_persona')
                if cod_persona is None or cod_persona.strip() == '':
                    cod_persona = None
                else:
                    try:
                        cod_persona = int(cod_persona)
                    except ValueError:
                        raise ValueError('El valor de cod_persona debe ser un entero o None')
                record_to_insert = (
                    record['cod_empresa'],
                    record['nombre'],
                    record['estado'],
                    int(record.get('cod_persona')) if record.get('cod_persona', '').strip() else None,
                    # cod_persona,
                    record['nro_establecimientos_activos'],
                    record['nro_resolucion_contrib_esp'],
                    # record['fecha_nro_resolucion'],
                    datetime.strptime(record['fecha_nro_resolucion'], '%Y-%m-%d') if record[
                        'fecha_nro_resolucion'].strip() else None,
                    record['cod_rol'],
                    record['crm']
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdEmpresa.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == self.tbParametros:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametros.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == self.tbParametrosNum:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametrosNum.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)

    def process_updated_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbEmpresas:
                cod_persona = record.get('cod_persona')
                if cod_persona is None or cod_persona.strip() == '':
                    cod_persona = None
                else:
                    try:
                        cod_persona = int(cod_persona)
                    except ValueError:
                        raise ValueError('El valor de cod_persona debe ser un entero o None')
                record_to_insert = (
                    record['cod_empresa'],
                    record['nombre'],
                    record['estado'],
                    # cod_persona,
                    int(record.get('cod_persona')) if record.get('cod_persona', '').strip() else None,
                    record['nro_establecimientos_activos'],
                    record['nro_resolucion_contrib_esp'],
                    # record['fecha_nro_resolucion'],
                    datetime.strptime(record['fecha_nro_resolucion'], '%Y-%m-%d') if record[
                        'fecha_nro_resolucion'].strip() else None,
                    record['cod_rol'],
                    record['crm']
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdEmpresa.modificar % mogrified_value)
                result = cursor.fetchall()
                print('update result:', result)
            elif table_id == self.tbParametros:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametros.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == self.tbParametrosNum:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametrosNum.modificar % mogrified_value)
                result = cursor.fetchall()
                print('update result:', result)

    def process_deleted_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == self.tbEmpresas:
                record_to_insert = (
                    record['cod_empresa'],
                    record['nombre'],
                    record['estado'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdEmpresa.borrar % mogrified_value)
                result = cursor.fetchall()
                print('delete result:', result)
            elif table_id == self.tbParametros:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametros.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == self.tbParametrosNum:
                record_to_insert = (
                    record['cod_empresa'],
                    record['cod_parametro'],
                    record['nombre'],
                    record['valor'],
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    record['observaciones'],
                )

                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgAdParametrosNum.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Definicion Empresas'
        context['lista_url'] = reverse_lazy('definicion-empresas')
        context['entity'] = 'Tipo'
        # context['form'] = AdEmpresaForm()

        return context
