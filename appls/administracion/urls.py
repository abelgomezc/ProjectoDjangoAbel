from django.urls import path

from appls.administracion.views.view_adm_0001 import *
from appls.administracion.views.d_entidades_view import definicionEntidades, referenciasEntidades
from appls.administracion.views.view_adm_0002 import *
from appls.administracion.views.view_adm_0003 import *
from appls.administracion.views.view_adm_0004 import *
from appls.administracion.views.view_adm_0016 import *
from appls.administracion.views.view_adm_0018 import *
from appls.administracion.views.views import *

app_name = 'administracion'

urlpatterns = [
    path('tipocatalohome/', login_required(Adm_TipoCatalogoListView.as_view()), name='hometipocatalogo'),
    path('nuevotipocatalogo/', login_required(Adm_TipoCatalogoView.as_view()), name='nuevotipocatalogo'),
    path('editartipocatalogo/<str:pk>/', login_required(Adm_TipoCatalogoUpdateView.as_view()),
         name='editarTipoCatalogo'),
    path('eliminartipocatalogo/<str:pk>/', login_required(eliminarTipoCatalogo.as_view()), name='eliminarTipoCatalogo'),

    # rutas para el usu de modal
    path('tipocatalogo/', tipoCatalogoView.as_view(), name='listatipocatalogo'),
    path('catalogo/', catalogoView.as_view(), name='listacatalogo'),
    # rutas administarcio
    path('parametros-ventas/', login_required(ParametrosVentasView.as_view()), name='parametrosventas'),
    path('definicion-empresas/', login_required(DefinicionEmpresasView.as_view()), name='definicion-empresas'),
    path('definicion-usuarios/', login_required(DefinicionUsuariosView.as_view()), name='definicion-usuarios'),
    path('definicion-agencias/', login_required(DefinicionAgenciaView.as_view()), name='definicion-agencias'),
    path('definicion-pantallas-formularios/', login_required(DefinicionPantallasFormulariosView.as_view()), name='definicion-pantallas-formularios'),
    path('definicion-modulos/', login_required(DefinicionModulosView.as_view()), name='definicion-modulos'),
    path('definicion_opciones_roles_usuario/', login_required(DefinicionOpcionesRolesUsuarioView.as_view()), name='definicion_opciones_y_roles_usuario'),

    # rutas para definicion_entidades
    path('definicion-entidades/', definicionEntidades.as_view(), name='definicionEntidades'),
    path('referencias-entidades/', referenciasEntidades.as_view(), name='referenciasEntidades'),

]
