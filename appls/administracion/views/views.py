import traceback
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.db import transaction, connection
from django.forms import model_to_dict
from django.forms.utils import ErrorList
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from psycopg2 import IntegrityError

from appls.administracion.forms import tipoCatalogoForm, catalogoForm, TipoCatalogoForm
from appls.administracion.models import EnTipoCatalogo, EnCatalogo, VtTipoPrecio, VtTiposDocumentacion, \
    VtTiposNegociacion, AdEmpresa, VtCategorias, VtTransportista
from django.views.generic import ListView, DeleteView, CreateView, UpdateView, FormView, TemplateView

from config.encryption_util import EncryptDES
from static.vars import packages
from static.vars.options import datatable_opts
import json
import psycopg2

from static.vars.utils import JsonResponseHandler

_e = EncryptDES()
#
pkgTiposDocumentacion = packages.PkgVtTiposDocumentacion()
pkgTiposPrecio = packages.PkgVtTiposPrecio()
pkgTiposNegociacion = packages.PkgVtTiposNegociacion()
pkgVtCategorias = packages.PkgVtCategorias()
pkgVtPlacasVehiculos = packages.PkgVtPlacasVehiculos()
pkgVtTransportistas = packages.PkgVtTransportista()
pkgVtTipoDescuentosItems = packages.PkgVtTipoDescuentosItems()
pkgTsPropiedadCobro = packages.PkgTsPropiedadCobro()
pkgVtEspecialidadCliente = packages.PkgVtEspecialidadCliente()
pkgVtTiposDescXClienteCateg = packages.PkgVtTiposDescXClienteCateg()



# Create your views here.
# def ListarTipoCatalogo(request):
#     data = {
#         'titulo': 'Lista Tipo Catologo',
#         'categories': EnTipoCatalogo.objects.all()
#     }
#     return render(request, 'hometipocatalogo.html', data)


# vistas basadas en clases
class listaTipoCatelogo(ListView):
    model = EnTipoCatalogo
    template_name = 'hometipocatalogo.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [tipocatalogo.toJSON() for tipocatalogo in EnTipoCatalogo.objects.all()]
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Lista  Tipo Catalogo'
        context['crearurl'] = reverse_lazy('nuevotipocatalogo')
        return context


class crearTipoCatalogo(CreateView):
    model = EnTipoCatalogo
    form_class = tipoCatalogoForm
    template_name = 'nuevotipocatalogo.html'
    success_url = reverse_lazy('admihometipocatalogo')

    #  sobre escritura de post
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = self.request.POST.get('action')
            if action == 'add':
                form = self.get_form()  #
                data = form.save()  # METODO  DELUE ESTA EN FORM  SOBRE ESCRITO
            else:
                data['error'] = 'No a ingresado ninguna opcion'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Crear  Tipo Catalogo'
        context['action'] = 'add'
        return context


class editarTipoCatalogo(UpdateView):
    model = EnTipoCatalogo
    form_class = tipoCatalogoForm
    template_name = 'nuevotipocatalogo.html'
    success_url = reverse_lazy('hometipocatalogo')

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = self.request.POST.get('action')
            if action == 'edit':
                form = self.get_form()
                data = form.save()

            else:
                data['error'] = 'No a ingresado ninguna opcion'

        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Editar  Tipo Catalogo'
        context['action'] = 'edit'
        return context


class eliminarTipoCatalogo(DeleteView):
    model = EnTipoCatalogo
    template_name = 'eliminartipocatalogo.html'
    success_url = reverse_lazy('hometipocatalogo')

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):

        data = {}
        try:
            self.object.delete()
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Eliminar Tipo Catalogo'
        context['lista_url'] = reverse_lazy('hometipocatalogo')
        return context


# adm
class Adm_TipoCatalogoView(CreateView):
    model = EnTipoCatalogo
    form_class = TipoCatalogoForm
    template_name = 'nuevotipocatalogo.html'
    success_url = reverse_lazy('administracion:hometipocatalogo')

    # Asigna al kwargs la variable de session desde el formulario
    def get_form_kwargs(self):
        kwargs = super(Adm_TipoCatalogoView, self).get_form_kwargs()
        # Roles
        # kwargs.update({'AIGN_OPCIONES': self.request.session['AIGN_OPCIONES']})
        return kwargs

    # Iniciallizar el formulario
    # verificar ST
    # def get_initial(self):
    #     return {'emp_id': self.request.session.get('AIGN_EMP_ID')}

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        extra_errors = []
        request.POST._mutable = True
        # parametros para los SP
        # codigov = form.data['mar_codigov']
        # empid = self.request.session.get('AIGN_EMP_ID')
        if 'CREATE' in request.POST and form.is_valid():
            try:
                f = form.save(commit=False)
                f.save()
                # messages.success(request, CRUD_MSG.CREATE)
                return HttpResponseRedirect(self.success_url)
            except Exception as e:
                extra_errors.append(str(e))
        self.object = None
        context = self.get_context_data(**kwargs)
        context['form'] = form
        errors = form._errors.setdefault("__all__", ErrorList())
        errors.extend(extra_errors)
        return render(request, self.template_name, context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = self.model._meta.verbose_name
        context['url_list'] = self.success_url
        return context


class Adm_TipoCatalogoUpdateView(UpdateView):
    model = EnTipoCatalogo
    form_class = TipoCatalogoForm
    template_name = 'nuevotipocatalogo.html'
    success_url = reverse_lazy('administracion:hometipocatalogo')

    # Asigna al kwargs la variable de session desde el formulario
    def get_form_kwargs(self):
        kwargs = super(Adm_TipoCatalogoUpdateView, self).get_form_kwargs()
        # kwargs.update({'AIGN_OPCIONES': self.request.session['AIGN_OPCIONES']})
        return kwargs

    def dispatch(self, request, *args, **kwargs):
        # Desencriptando el pk
        # for k in self.kwargs.keys():
        #     self.kwargs[k] = _e.decrypt(self.kwargs[k])
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        extra_errors = []
        if 'SAVE' in request.POST and form.is_valid():
            form.save()
            # messages.success(request, CRUD_MSG.SAVE)
            return HttpResponseRedirect(self.success_url)
        if 'DELETE' in request.POST and form.is_valid():
            try:
                self.get_object().logical_delete()
                # messages.success(request, CRUD_MSG.DELETE)
                return HttpResponseRedirect(self.success_url)
            except Exception as e:
                extra_errors.append(str(e))
        self.object = None
        context = self.get_context_data(**kwargs)
        context['form'] = form
        errors = form._errors.setdefault("__all__", ErrorList())
        errors.extend(extra_errors)
        return render(request, self.template_name, context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = self.model._meta.verbose_name
        context['url_list'] = self.success_url
        # Bloquear el campo 'xxx_codigov' al momento de editar
        # context['readOnly'] = {
        #     'on': '1',
        #     'field': 'mar_codigov'}
        return context


class Adm_TipoCatalogoListView(ListView):
    model = EnTipoCatalogo
    template_name = 'hometipocatalogo.html'

    # traes la informacion con representacion de un sql
    def get_queryset(self):
        return EnTipoCatalogo.objects.all()

    def get_context_data(self, **kwargs):
        # Contol de roles
        # -----------------------------
        # __permisos = recuperarPermisos(self.request.session, menu.inv_man.Marca)
        # -----------------------------
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Reporte ' + self.model._meta.verbose_name
        context['url_form'] = reverse_lazy('administracion:nuevotipocatalogo')
        context['url_form_add'] = reverse_lazy('administracion:nuevotipocatalogo')
        context['url_form_edit'] = 'administracion:editarTipoCatalogo'
        context['datatable_id'] = 'datatable1_id'
        context['datatable_opts'] = datatable_opts
        # Agregar boton 'Agregar' lista
        context['permisos'] = 1  # __permisos['oro_agregar']
        # Atributos que se muestran en la lista
        context['show_fields'] = {'cod_tipo_catalogo': None,
                                  'nombre': None}
        # ecriptacion del id
        # for r in context['object_list']:
        return context


# fin admi


# vistas basadas en clase TemplateView modal
class tipoCatalogoView(TemplateView):
    template_name = 'listTipoCatalogo.html'

    @method_decorator(csrf_exempt)
    # @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    # sobre escritura del metodo post
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [tipocatalogo.toJSON() for tipocatalogo in EnTipoCatalogo.objects.all()]
            elif action == 'add':
                form = tipoCatalogoForm(request.POST)
                if form.is_valid():
                    form.save()
                    data['message'] = 'Tipo catálogo agregado exitosamente'
                else:
                    data['error'] = form.errors
            elif action == 'edit':
                try:
                    cod_tipo_catalogo = request.POST['cod_tipo_catalogo']
                    tipoCatalogo = get_object_or_404(EnTipoCatalogo, cod_tipo_catalogo=cod_tipo_catalogo)
                    # tipoCatalogo.cod_tipo_catalogo = request.POST['cod_tipo_catalogo']
                    tipoCatalogo.nombre = request.POST['nombre']
                    tipoCatalogo.save()
                    data['message'] = 'Tipo catálogo actualizado exitosamente'
                except EnTipoCatalogo.DoesNotExist:
                    data['error'] = 'TipoCatalogo no encontrado.'
                except EnTipoCatalogo.MultipleObjectsReturned:
                    data['error'] = 'Múltiples TipoCatalogo encontrados.'

            elif action == 'delete':
                cod_tipo_catalogo = request.POST['cod_tipo_catalogo']
                tipoCatalogo = get_object_or_404(EnTipoCatalogo, cod_tipo_catalogo=cod_tipo_catalogo)
                tipoCatalogo.delete()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = 'Error en el servidor: {}'.format(str(e))
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Tipo Catalogo'
        context['lista_url'] = reverse_lazy('listatipocatalogo')
        context['entity'] = 'Tipo Catalogo'
        context['form'] = tipoCatalogoForm()
        return context


class catalogoView(TemplateView):
    template_name = 'listCatalogo.html'

    @method_decorator(csrf_exempt)
    # @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    # sobre escritura del metodo post
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [catalogo.toJSON() for catalogo in EnCatalogo.objects.all()]
            elif action == 'add':
                form = catalogoForm(request.POST)
                if form.is_valid():
                    form.save()
                    data['message'] = 'Tipo catálogo agregado exitosamente'
                else:
                    data['error'] = form.errors
            elif action == 'edit':
                try:
                    cod_catalogo = request.POST['cod_catalogo']
                    catalogo = get_object_or_404(EnCatalogo, cod_catalogo=cod_catalogo)
                    catalogo.cod_tipo_catalogo = request.POST['cod_tipo_catalogo']
                    catalogo.nombre = request.POST['nombre']
                    catalogo.save()
                    data['message'] = 'Catálogo actualizado exitosamente'
                except EnTipoCatalogo.DoesNotExist:
                    data['error'] = 'Catalogo no encontrado.'
                except EnTipoCatalogo.MultipleObjectsReturned:
                    data['error'] = 'Múltiples Catalogo encontrados.'
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = 'Error en el servidor: {}'.format(str(e))
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Catalogo'
        context['lista_url'] = reverse_lazy('listacatalogo')
        context['entity'] = 'Catalogo'
        context['form'] = catalogoForm()

        return context


# ----- parametros  de venta desde el  body.html
class ParametrosVentasView(TemplateView):
    template_name = 'parametrosVentas.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
       self.cod_empresa = self.request.session.get('VS_COD_EMPRESA')
       #self.cod_empresa = '059'
       return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        # cod_empresa = self.request.session.get('VS_COD_EMPRESA')
        try:
            action = request.POST.get('action')

            if not action:
                return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)

            if action == 'searchdata_tipos_documentacion':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgTiposDocumentacion.consultar, [None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)

            elif action == 'searchdata_tipos_precio':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgTiposPrecio.consultar, [self.cod_empresa, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_tipos_negociacion':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgTiposNegociacion.consultar, [self.cod_empresa, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_categorias':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtCategorias.consultar, [self.cod_empresa, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_placas_vehiculos':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtPlacasVehiculos.consultar, [self.cod_empresa, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
            elif action == 'searchdata_transportistas':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtTransportistas.consultar, [None, None, None, self.cod_empresa])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_tipo_descuentos_items':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtTipoDescuentosItems.consultar,
                                    [self.cod_empresa, None, None, None, None, None, None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
            elif action == 'searchdata_propiedades_comprobantes':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgTsPropiedadCobro.consultar,
                                    [self.cod_empresa,None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                return JsonResponse(data, safe=False)
            elif action == 'searchdata_especialidad_cliente':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtEspecialidadCliente.consultar,
                                   [self.cod_empresa,None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_tipos_desc_x_cliente_categ':
                with connection.cursor() as cursor:
                    cursor.callproc(pkgVtTiposDescXClienteCateg.consultar,
                                   [self.cod_empresa,None,None,None,None,None,None,None,None])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                return JsonResponse(data, safe=False)

            # elif action == 'save_records':
            #     try:
            #         data_records_json = request.POST.get('dataRecords')
            #         if not data_records_json:
            #             return JsonResponse({'error': 'Datos no válidos o faltantes'}, status=400)
            #
            #         data_records = json.loads(data_records_json)
            #         results = {}
            #
            #         with transaction.atomic():
            #             for table_id, operations in data_records.items():
            #                 success_message = f'Todos los registros se aplicaron correctamente en la tabla {table_id}'
            #                 warning_message = f'Algunos registros no se guardaron correctamente en la tabla {table_id}'
            #                 errors = []
            #
            #                 for operation, records in operations.items():
            #                     for record in records:
            #                         try:
            #                             if operation == 'added':
            #                                 self.process_added_record(table_id, record)
            #                             elif operation == 'updated':
            #                                 self.process_updated_record(table_id, record)
            #                             elif operation == 'deleted':
            #                                 self.process_deleted_record(table_id, record)
            #                         except IntegrityError as e:
            #                             # Captura el mensaje de error específico de PostgreSQL
            #                             error_message = str(e.__cause__) if e.__cause__ else str(e)
            #                             errors.append({
            #                                 'record': record,
            #                                 'error': f"Error procesando {operation} en {table_id}: {error_message}"
            #                             })
            #                         except Exception as e:
            #                             errors.append({
            #                                 'record': record,
            #                                 'error': str(e)
            #                             })
            #                             print(f"Error procesando {operation} en {table_id}: {str(e)}")
            #                             traceback.print_exc()
            #
            #                 if operations:
            #                     if errors:
            #                         results[table_id] = {
            #                             'status': 'error',
            #                             'message': warning_message,
            #                             'errors': errors
            #                         }
            #                         raise IntegrityError(
            #                             'Errores encontrados en la operación')  # Esto hará que toda la transacción se deshaga
            #
            #                     else:
            #                         results[table_id] = {
            #                             'status': 'success',
            #                             'message': success_message
            #                         }
            #
            #         return JsonResponse({'results': results})
            #     except json.JSONDecodeError:
            #         return JsonResponse({'error': 'Datos no válidos'}, status=400)
            #     except IntegrityError as e:
            #         return JsonResponse({'error': 'Error de integridad: ' + str(e)}, status=400)
            #     except Exception as e:
            #         print('Exception:', e) #  aqui se manda la
            #         traceback.print_exc()
            #         return JsonResponse({'error': str(e)}, status=400)
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
            else:#
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' +str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def process_added_record(self, table_id, record):

        with connection.cursor() as cursor:
            if table_id == 'datatable_documentacion':
                record_to_insert = (record['cod_tipo_documentacion'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposDocumentacion.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_precio':
                record_to_insert = (self.cod_empresa, record['cod_tipo_precio'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposPrecio.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)  #
            elif table_id == 'datatable_negociacion':
                record_to_insert = (

                    record['cod_tipo_negociacion'],
                    record['nombre'],
                    record['tipo'],
                    record['estado'],
                    self.cod_empresa,
                    record['plazo'] if record['plazo'] != '' else None,
                    record['cupo'] if record['cupo'] != '' else None,

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposNegociacion.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_categorias':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_categoria'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtCategorias.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_placas_vehiculos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_placa'],
                    record['descripcion'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtPlacasVehiculos.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_trasnportistas':
                record_to_insert = (
                    record['cod_persona'],
                    record['estado'],
                    record['nombre'],
                    self.cod_empresa,
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTransportistas.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_tipo_descuentos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_descuento'],
                    record['nombre'],
                    record['tipo_valor'],
                    record['valor'],
                    'D',
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTipoDescuentosItems.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_propiedadesComprobantes':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_propiedad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTsPropiedadCobro.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_especialidad_cliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_especialidad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtEspecialidadCliente.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_descxCateoriasCliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_tipo_negociacion'],
                    record['nombre_tipo_negociacion'],
                    record['cod_categoria'],
                    record['nombre_categoria'],
                    record['cod_descuento'],
                    record['nombre_descuento'],
                    record['valor'],
                    record['estado'],
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTiposDescXClienteCateg.insertar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
                

    def process_updated_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == 'datatable_documentacion':
                record_to_insert = (record['cod_tipo_documentacion'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposDocumentacion.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_precio':
                record_to_insert = (self.cod_empresa, record['cod_tipo_precio'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposPrecio.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_negociacion':
                record_to_insert = (

                    record['cod_tipo_negociacion'],
                    record['nombre'],
                    record['tipo'],
                    record['estado'],
                    self.cod_empresa,
                    record['plazo'] if record['plazo'] != '' else None,
                    record['cupo'] if record['cupo'] != '' else None,

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposNegociacion.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_categorias':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_categoria'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtCategorias.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_placas_vehiculos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_placa'],
                    record['descripcion'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtPlacasVehiculos.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_trasnportistas':
                try:
                    cod_persona = int(record['cod_persona'])
                except ValueError:
                    raise ValueError('El valor de cod_persona debe ser un entero')
                record_to_insert = (
                    cod_persona,
                    record['estado'],
                    record['nombre'],
                    self.cod_empresa,
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTransportistas.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_tipo_descuentos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_descuento'],
                    record['nombre'],
                    record['tipo_valor'],
                    record['valor'],
                    'D',
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTipoDescuentosItems.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_propiedadesComprobantes':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_propiedad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTsPropiedadCobro.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_especialidad_cliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_especialidad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtEspecialidadCliente.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)
            elif table_id == 'datatable_descxCateoriasCliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_tipo_negociacion'],
                    record['nombre_tipo_negociacion'],
                    record['cod_categoria'],
                    record['nombre_categoria'],
                    record['cod_descuento'],
                    record['nombre_descuento'],
                    record['valor'],
                    record['estado'],
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTiposDescXClienteCateg.modificar % mogrified_value)
                result = cursor.fetchall()
                print('Update result:', result)

    def process_deleted_record(self, table_id, record):
        with connection.cursor() as cursor:
            if table_id == 'datatable_documentacion':
                record_to_insert = (record['cod_tipo_documentacion'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposDocumentacion.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_precio':
                record_to_insert = (self.cod_empresa, record['cod_tipo_precio'], record['nombre'])
                mogrified_value = cursor.mogrify("(%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposPrecio.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_negociacion':
                record_to_insert = (
                    record['cod_tipo_negociacion'],
                    record['nombre'],
                    record['tipo'],
                    record['estado'],
                    self.cod_empresa,
                    record['plazo'] if record['plazo'] != '' else None,
                    record['cupo'] if record['cupo'] != '' else None,
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTiposNegociacion.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_categorias':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_categoria'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtCategorias.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_placas_vehiculos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_placa'],
                    record['descripcion'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtPlacasVehiculos.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_trasnportistas':
                try:
                    cod_persona = int(record['cod_persona'])
                except ValueError:
                    raise ValueError('El valor de cod_persona debe ser un entero')
                record_to_insert = (
                    cod_persona,
                    record['estado'],
                    record['nombre'],
                    self.cod_empresa,
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTransportistas.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_tipo_descuentos':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_descuento'],
                    record['nombre'],
                    record['tipo_valor'],
                    record['valor'],
                    'D',
                    None,
                    None

                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTipoDescuentosItems.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_propiedadesComprobantes':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_propiedad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgTsPropiedadCobro.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)
            elif table_id == 'datatable_especialidad_cliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_especialidad'],
                    record['nombre'],
                    record['estado'],
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtEspecialidadCliente.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Insert result:', result)
            elif table_id == 'datatable_descxCateoriasCliente':
                record_to_insert = (
                    self.cod_empresa,
                    record['cod_tipo_negociacion'],
                    record['nombre_tipo_negociacion'],
                    record['cod_categoria'],
                    record['nombre_categoria'],
                    record['cod_descuento'],
                    record['nombre_descuento'],
                    record['valor'],
                    record['estado'],
                    None,
                    None
                )
                mogrified_value = cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", record_to_insert).decode('utf-8')
                cursor.execute(pkgVtTiposDescXClienteCateg.borrar % mogrified_value)
                result = cursor.fetchall()
                print('Delete result:', result)


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Parámetros de Venta'
        context['lista_url'] = reverse_lazy('parametrosventas')
        context['entity'] = 'Tipo'

        return context
