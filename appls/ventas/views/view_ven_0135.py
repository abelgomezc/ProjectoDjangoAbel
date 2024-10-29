from django.db import transaction, connection


from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from appls.administracion.models import EnPais
from static.vars import packages

pkgCoAgente = packages.PkgCoAgente()

class FacturacionAlmacenView(TemplateView):
    template_name = 'VEN_0135.html'

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

            if action == 'accionListarAgentes':

                with connection.cursor() as cursor:
                    cod_empresa = self.cod_empresa
                    cursor.execute('''select a.cod_agente , icl.pkg_en_persona_buscar_nombre(a.cod_agente) nombre,
                                    b.cod_zona
                                    from icl.co_agente a, icl.co_zonas_x_agente b
                                     where a.cod_empresa =  %s and
                                     a.cod_empresa = b.cod_empresa and
                                     a.cod_agente = b.cod_agente and
                                     b.estado = 1
                                      order by 2
                                             ''', [cod_empresa])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
                    return JsonResponse(data, safe=False)


            elif action == 'accion_optener_paises':
                paises = EnPais.objects.values('cod_pais', 'nombre')
                # Convertir el QuerySet a una lista para que pueda ser serializada a JSON
                data = list(paises)
                return JsonResponse(data, safe=False)

            elif action == 'accion-optener-datos-agente':
                with connection.cursor() as cursor:
                    cod_persona  = request.POST.get('cod_persona')
                    cursor.execute('''select secuencia, 
                          icl.PKG_EN_CATALOGO_buscar_nombre_catalogo(a.cod_direccion) tipo_direccion,
                          a.cod_pais,a.cod_lugar, a.calle, a.numero, a.interseccion
                           from icl.en_direcciones_x_persona a
                           where a.cod_persona = %s
                           order by 1;''', [cod_persona])
                    rows = cursor.fetchall()
                    data = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

                    return JsonResponse(data, safe=False)


            else:
                data['error'] = 'Ha ocurrido un error'
                return JsonResponse(data, status=400)

        except Exception as e:
            print('Exception:', e)
            raise Exception('Ups! parece que algo salio mal.:' + str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Facturacion Almacen'
        context['tituloCabezera'] = 'Comprobante Venta'
        context['tituloDetalle'] = 'Detalle'
        context['lista_url'] = reverse_lazy('facturacion-almacen')

        return context
