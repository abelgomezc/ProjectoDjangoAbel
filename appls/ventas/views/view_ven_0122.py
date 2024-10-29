from django.db import transaction, connection


from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from appls.administracion.models import EnPais
from static.vars import packages
from django.urls import reverse
from django.shortcuts import redirect
from django.views.generic import TemplateView

pkgTsPedido= packages.PkgTsPedido()
pkgAdEstado = packages.PkgAdEstado()

class ControlPedidosClientesView(TemplateView):
    template_name = 'VEN_0122.html'

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



            if action == 'searchdata_ts_pedidos':
                with connection.cursor() as cursor:

                    # Llamar a la función PKG_TS_PEDIDO_consultar_pedidos
                    cursor.callproc(pkgTsPedido.consultar,
                                    [self.cod_empresa, '0', None, None, None, None, None, None, None, None, None, None,
                                     None, None,
                                     None, None, None])
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]

                    # Crear una lista de resultados
                    data = [dict(zip(columns, row)) for row in rows]

                    # Obtener nombres de estado usando PKG_AD_ESTADO_buscar_nombre_est
                    with connection.cursor() as cursor_estado:
                        for item in data:
                            cod_empresa = item.get('cod_empresa')
                            cod_tipo_estado = item.get('cod_tipo_estado')
                            cod_estado = item.get('cod_estado')

                            cursor_estado.callproc(pkgAdEstado.buscar_nombre_estado,
                                                   [cod_empresa, cod_tipo_estado, cod_estado])
                            estado_row = cursor_estado.fetchone()

                            # Asumir que la función retorna un solo valor (el nombre del estado)
                            if estado_row:
                                item['nombre_estado'] = estado_row[0]  # Agregar el nombre del estado a cada fila

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
        context['titulo'] = 'Control de pedidos Clientes'
        context['lista_url'] = reverse_lazy('control-pedidos-clientes')
        context['url_registro_pedidos_cliente'] = reverse_lazy('registro-pedidos-clientes')
        return context
