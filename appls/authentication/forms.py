from crispy_forms.bootstrap import PrependedText
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit
from django.contrib.auth.forms import UsernameField
from django import forms
from django.contrib.auth.forms import AuthenticationForm

from django.core.exceptions import ValidationError
from django.forms import TextInput, PasswordInput
from django.shortcuts import get_object_or_404
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import (
    authenticate,
    get_user_model
)
from django.utils.text import capfirst
from django_select2 import forms as s2forms
from django_select2.forms import Select2Widget, ModelSelect2Widget

from appls.administracion.models import AdUsuarioEmpresa, AdEmpresa

# from widgets import EmpresaSelect2Widget

UserModel = get_user_model()


# class ERPAuthenticationForm(forms.Form):
#     username = UsernameField(widget=forms.TextInput(attrs={'autofocus': True}))
#     password = forms.CharField(
#         strip=False,
#         widget=forms.PasswordInput(attrs={'autocomplete': 'current-password'}),
#     )
#     suc_id = forms.ModelChoiceField(
#         queryset=AdUsuarioEmpresa.objects.filter(estado=1),
#         widget=s2forms.ModelSelect2Widget(
#             search_fields=['cod_empresa__icontains'],
#             dependent_fields={'username': 'cod_usuario'},
#             attrs={"data-placeholder": '-- Empresa --', 'data-minimum-input-length': 0, },
#         ),
#         label=u"Empresa",
#     )
#     error_messages = {
#         'invalid_login': _(
#             "Please enter a correct %(username)s and password. Note that both "
#             "fields may be case-sensitive."
#         ),
#         'inactive': _("This account is inactive."),
#     }
#
#     def __init__(self, request=None, *args, **kwargs):
#         """
#         The 'request' parameter is set for custom auth use by subclasses.
#         The form data comes in via the standard 'data' kwarg.
#         """
#         self.request = request
#         self.user_cache = None
#         super().__init__(*args, **kwargs)
#         # Set the max length and label for the "username" field.
#         self.username_field = UserModel._meta.get_field(UserModel.USERNAME_FIELD)
#         username_max_length = self.username_field.max_length or 254
#         self.fields['username'].max_length = username_max_length
#         self.fields['username'].widget.attrs['maxlength'] = username_max_length
#         if self.fields['username'].label is None:
#             self.fields['username'].label = capfirst(self.username_field.verbose_name)
#         self.password_field = UserModel._meta.get_field('password')
#         if self.fields['password'].label is None:
#             self.fields['password'].label = capfirst(self.password_field.verbose_name)
#
#     def clean(self):
#         suc_id = self.cleaned_data.get('suc_id')
#         username = self.cleaned_data.get('username')
#         password = self.cleaned_data.get('password')
#
#         # Imprimir el valor de suc_id en la consola cuando se selecciona una empresa
#         print(f"Sucursal seleccionada (suc_id): {suc_id}")
#
#         if username is not None and password:
#             # llamado al backend appls.sesion.backends.py
#             self.user_cache = authenticate(self.request, username=username, password=password, suc_id=suc_id)
#             if self.user_cache is None:
#                 raise self.get_invalid_login_error()
#             else:
#                 self.confirm_login_allowed(self.user_cache)
#         return self.cleaned_data
#
#     def confirm_login_allowed(self, user):
#         """
#         Controls whether the given User may log in. This is a policy setting,
#         independent of end-user authentication. This default behavior is to
#         allow login by active users, and reject login by inactive users.
#
#         If the given user cannot log in, this method should raise a
#         ``ValidationError``.
#
#         If the given user may log in, this method should return None.
#         """
#         if not user.is_active:
#             raise ValidationError(
#                 self.error_messages['inactive'],
#                 code='inactive',
#             )
#
#     def get_user(self):
#         return self.user_cache
#
#     def get_invalid_login_error(self):
#         return ValidationError(
#             self.error_messages['invalid_login'],
#             code='invalid_login',
#             params={'username': self.username_field.verbose_name},
#         )
#
#
# class ERPLoginForm(ERPAuthenticationForm):
#     def __init__(self, *args, **kwargs):
#         super(ERPLoginForm, self).__init__(*args, **kwargs)
#
#         self.fields['suc_id'].widget.attrs['class'] = 'form-control-sm'
#         # self.fields['per_id'].widget.attrs['class'] = 'form-control-sm'
#         # self.fields['pem_id'].widget.attrs['class'] = 'form-control-sm'
#         for form in self.visible_fields():
#             form.field.widget.attrs['placeholder'] = form.field.label
#             form.field.widget.attrs['autocomplete'] = 'off'
#             # form.field.widget.attrs['class'] = 'form-control-border'
#             # form.field.widget.attrs['class'] = 'form-control-border form-control-sm'
#         self.helper = FormHelper(self)
#         self.helper.include_media = False
#         self.helper.form_show_labels = False
#         self.helper.layout = Layout(
#             PrependedText('username', mark_safe('<i class="fas fa-user"></i>')),
#             PrependedText('password', mark_safe('<i class="fas fa-key"></i>')),
#             'suc_id',
#             Submit('LOGIN', 'Iniciar sesión'),
#         )


# MO


# abel
class ERPAuthenticationForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'autofocus': True}))
    password = forms.CharField(
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'current-password'}),
    )
    # suc_id = forms.ModelChoiceField(
    #     queryset=AdEmpresa.objects.filter(estado=1),  # Asegúrate de incluir todas las empresas aquí
    #     widget=forms.Select(attrs={'class': 'form-control form-control-sm select2'}),
    #     label="Empresa",
    # )
    suc_id = forms.ModelChoiceField(
        queryset=AdEmpresa.objects.none(),  # Inicialmente vacío, se llenará dinámicamente
        widget=ModelSelect2Widget(
            queryset=AdEmpresa.objects.filter(estado=1),
            search_fields=['cod_empresa__icontains'],
          #  dependent_fields={'username': 'cod_usuario'},  # Campo dependiente: 'username'
            attrs={"data-placeholder": '-- Empresa --', 'data-minimum-input-length': 0},
        ),
        label="Empresa",
    )
    error_messages = {
        'invalid_login': _(
            "Por favor, ingrese un %(username)s y contraseña correctos. Tenga en cuenta que ambos "
            "campos pueden ser sensibles a mayúsculas y minúsculas."
        ),
        'inactive': _("Esta cuenta está inactiva."),
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['suc_id'].queryset = AdEmpresa.objects.filter(estado=1)

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')

        if username and password:
            suc_ids = AdUsuarioEmpresa.objects.filter(cod_usuario=username).values_list('cod_empresa', flat=True)
            cleaned_data['suc_id'] = AdEmpresa.objects.filter(cod_empresa__in=suc_ids, estado=1).first()

            user = authenticate(username=username, password=password)
            if not user:
                raise self.get_invalid_login_error()
            else:
                self.user_cache = user
                self.confirm_login_allowed(user)

        return cleaned_data

    def confirm_login_allowed(self, user):
        if not user.is_active:
            raise ValidationError(
                self.error_messages['inactive'],
                code='inactive',
            )

    def get_user(self):
        return self.user_cache

    def get_invalid_login_error(self):
        return ValidationError(
            self.error_messages['invalid_login'],
            code='invalid_login',
            params={'username': self.fields['username'].label},
        )



class ERPLoginForm(ERPAuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['suc_id'].widget.attrs['class'] = 'form-control-sm'
        # for field in self.visible_fields():
        #     field.field.widget.attrs['placeholder'] = field.field.label
        #     field.field.widget.attrs['autocomplete'] = 'off'

        self.helper = FormHelper(self)
        self.helper.include_media = False
        self.helper.form_show_labels = False
        self.helper.layout = Layout(
            PrependedText('username', mark_safe('<i class="fas fa-user"></i>')),
            PrependedText('password', mark_safe('<i class="fas fa-key"></i>')),
            'suc_id',
            Submit('LOGIN', 'Iniciar sesión'),
        )

def obtener_empresas_por_usuario(cod_usuario):
    empresas_usuario = AdUsuarioEmpresa.objects.filter(cod_usuario=cod_usuario).values_list('cod_empresa', flat=True)
    empresas = AdEmpresa.objects.filter(cod_empresa__in=empresas_usuario)
    return empresas





#########











