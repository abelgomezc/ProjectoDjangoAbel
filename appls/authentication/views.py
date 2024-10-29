from django.contrib.auth import logout, login
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, RedirectView, FormView

from appls.administracion.models import AdUsuarioEmpresa, AdEmpresa
from appls.authentication.forms import ERPLoginForm
from appls.menu import utils


class HomeView(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Bienvenido'
        return context


class LogoutView(RedirectView):
    pattern_name = 'login'

    def dispatch(self, request, *args, **kwargs):
        logout(request)
        return super().dispatch(request, *args, **kwargs)


def myfirstview(request):
    data = {
        'name': 'Abel Gomez',
        # 'categories': Category.objects.all()
    }
    return render(request, 'index.html', data)


# class LoginView(FormView):
#     template_name = 'login.html'
#     form_class = ERPLoginForm
#     success_url = reverse_lazy('insoft_home')
#
#     def dispatch(self, request, *args, **kwargs):
#         if request.user.is_authenticated:
#             return HttpResponseRedirect(self.success_url)
#         return super().dispatch(request, *args, **kwargs)
#     @csrf_exempt
#     def form_valid(self, form):
#         login(self.request, form.get_user())
#
#         suc_id = self.request.POST.get('suc_id')
#         username = form.cleaned_data.get('username')
#         password = form.cleaned_data.get('password')
#
#         print(f"Variables del formulario de inicio de sesión:")
#         print(f"Usuario: {username}")
#         print(f"Sucursal ID: {suc_id}")
#
#
#         empresa = AdUsuarioEmpresa.objects.get(cod_empresa=self.request.POST['suc_id']).cod_empresa
#
#         self.request.session['VS_COD_EMPRESA'] = empresa
#
#         self.request.session['AIGN_MODULO'] = None
#
#         self.request.session['AIGN_MENU'] = None
#
#         self.request.session['AIGN_OPCIONES'] = utils.fn_get_menu(empresa, self.request.user.cod_usuario)
#
#         # self.request.session['AIGN_OPCIONES'] = utils.fn_get_menu(empresa, 'ICL')
#
#         #self.request.session['AIGN_OPCIONES'] = utils.fn_get_menu('039', 'ICL')
#
#         self.request.session.modified = True
#         return HttpResponseRedirect(self.success_url)
#
#     def get_context_data(self, **kwargs):
#         context = super(LoginView, self).get_context_data(**kwargs)
#         context['page_title'] = 'Iniciando Sesion'
#         return context



class LoginView(FormView):
    template_name = 'login.html'
    form_class = ERPLoginForm
    success_url = reverse_lazy('insoft_home')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(self.success_url)
        return super().dispatch(request, *args, **kwargs)




    @csrf_exempt
    def form_valid(self, form):
        login(self.request, form.get_user())

        suc_id = self.request.POST.get('suc_id')
        username = form.cleaned_data.get('username')
        # password = form.cleaned_data.get('password')

        # Obtener el código de empresa seleccionado
        empresa = AdUsuarioEmpresa.objects.filter(cod_empresa=suc_id, cod_usuario=username).first()
        print('selecciono')
        print(f"Objeto de Empresa: {empresa}")
        print(f"codigo{suc_id}")
        print('----------------------------------------------------------------')
        # Acceso al objeto de usuario autenticado
        user = self.request.user

        if empresa:

            # Obtener el código de persona desde la relación
            cod_persona = user.cod_persona.cod_persona if user.cod_persona else None

            self.request.session['VS_COD_EMPRESA'] = empresa.cod_empresa
            self.request.session['AIGN_MODULO'] = None
            self.request.session['AIGN_MENU'] = None
            self.request.session['VS_USER'] = self.request.user.cod_usuario
            self.request.session['VS_USER_COD_PERSONA'] = cod_persona
            self.request.session['AIGN_OPCIONES'] = utils.fn_get_menu(empresa.cod_empresa, self.request.user.cod_usuario)
            self.request.session.modified = True

        else:
            # Manejar el caso donde no se encontró la empresa asociada al usuario
            form.add_error('suc_id', 'No tienes acceso a esta empresa.')
            return self.form_invalid(form)

        return HttpResponseRedirect(self.success_url)



    def get_context_data(self, **kwargs):
        context = super(LoginView, self).get_context_data(**kwargs)
        context['page_title'] = 'Iniciando Sesión'
        return context

