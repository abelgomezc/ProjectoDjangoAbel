from django.contrib.auth.decorators import login_required
from django.urls import path

from appls.ventas.views.view_cre_0020 import *
from appls.ventas.views.view_ven_0122 import *
from appls.ventas.views.view_ven_0123 import *
from appls.ventas.views.view_ven_0135 import *

app_name = 'ventas'

urlpatterns = [

    # rutas Ventas
    path('facturacion-almacen/', login_required(FacturacionAlmacenView.as_view()), name='facturacion-almacen'),
    path('control-pedidos-clientes/', login_required(ControlPedidosClientesView.as_view()),
         name='control-pedidos-clientes'),

    path('registro-pedidos-clientes/<str:accion>/', login_required(RegistroPedidosClientesView.as_view()),
         name='registro-pedidos-clientes'),
    path('registro-pedidos-clientes/<int:nro_comprobante_cobro>/<str:accion>/', login_required(RegistroPedidosClientesView.as_view()),
         name='registro-pedidos-clientes'),

    path('buscar-entidades-clientes/', login_required(BuscarEntidadesClientesView.as_view()),
         name='buscar-entidades-clientes'),

    # path('registro-pedidos-clientes/', login_required(RegistroPedidosClientesView.as_view()),
    #      name='registro-pedidos-clientes'),

]
