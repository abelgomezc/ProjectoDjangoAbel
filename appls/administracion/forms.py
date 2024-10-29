from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div
from django.forms import ModelForm, forms, Form, ModelChoiceField

from appls.administracion.models import EnTipoCatalogo, EnCatalogo, AdEmpresa
from config.crispy_layouts import DivHeaderWithButtons
from static.vars.css import Form_CSS


from django import forms
from .models import AdEmpresa
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field


class tipoCatalogoForm(ModelForm):
    class Meta:
        model = EnTipoCatalogo
        fields = ['cod_tipo_catalogo', 'nombre']

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     if self.instance and self.instance.pk:
    #         self.fields['cod_tipo_catalogo'].widget.attrs['readonly'] = True

    # aqui tambien se puede sobre escribir el save
    # def save(self, commit=True):
    #
    #     data = {}
    #     form = super()
    #     try:
    #         if form.is_valid():
    #             form.save()
    #         else:
    #             data['error'] = form.errors
    #     except Exception as e:
    #         data['error'] = str(e)
    #     return data

    # podemos hacer validaciones
    # def clean(self):
    #     cleaned = super().clean()
    #     cod_tipo_catalogo = cleaned.get('cod_tipo_catalogo')
    #     if cod_tipo_catalogo and len(cod_tipo_catalogo) <= 10:
    #         raise forms.ValidationError('validacion de prueba x')
    #
    #         # self.add_error('cod_tipo_catalogo', 'ESTE DEBE SER MENEOR O IGUAL A 10 N')
    #     return cleaned

    def save(self, commit=True):
        data = {}
        form = super(tipoCatalogoForm, self).save(commit=False)
        try:
            if self.is_valid():
                if commit:
                    form.save()
                data['message'] = 'Guardado exitosamente'
            else:
                data['error'] = self.errors
        except Exception as e:
            data['error'] = str(e)
        return data


class TipoCatalogoForm(ModelForm):
    # def __init_subclass__(cls, **kwargs):
    def __init__(self, *args, **kwargs):

        # Control de roles
        # --------------------------------------------------------------------------------------
        # self.PERMISOS = recuperarPermisos(kwargs.pop("AIGN_OPCIONES"), menu.inv_man.Marca)
        # --------------------------------------------------------------------------------------
        super(TipoCatalogoForm, self).__init__(*args, **kwargs)
        # Cambiar atributos especificos
        # self.fields['cod_tipo_catalogo'].required = False
        instance = kwargs.get('instance')
        if instance is not None:
            self.fields['cod_tipo_catalogo'].widget.attrs['readonly'] = True
        # Cambiar atributos genericos
        for form in self.visible_fields():
            form.field.widget.attrs['placeholder'] = Form_CSS.fields_placeholder + form.field.label.lower()
            form.field.widget.attrs['autocomplete'] = Form_CSS.fields_autocomplete
            form.field.widget.attrs['class'] = Form_CSS.fields_attr_class
        self.helper = FormHelper(self)
        self.helper.form_method = 'post'
        self.helper.form_id = Form_CSS.getFormID(self)
        self.helper.attrs = Form_CSS.form_attrs
        self.helper.form_tag = True
        self.helper.form_error_title = Form_CSS.form_err_title
        self.helper.form_class = Form_CSS.form_class
        self.helper.label_class = Form_CSS.fields_label_class_2_right
        self.helper.field_class = Form_CSS.fields_field_class_3
        self.helper.layout = Layout(
            Div(
                DivHeaderWithButtons(instance_pk=self.instance.pk,
                                     permisos={'oro_agregar': 1, 'oro_modificar': 1, 'oro_eliminar': 1,
                                               'oro_imprimir': 1}),
                Div('cod_tipo_catalogo',
                    'nombre',
                    css_class='card-body'
                    ),
                css_class='card'
            ),
        )

    class Meta:
        model = EnTipoCatalogo
        fields = '__all__'
        # exclude = ['mar_estado']
        # widgets = {
        #     'emp_id': HiddenInput(),
        # }

    def clean(self):
        form_data = self.cleaned_data
        cleaned_data = super().clean()
        # Valida que el codigo no se repita en caso de estar ya creado
        # Verifica si el registro es creación o edición
        # if (self.instance.pk is None):
        #     codRep = Inv_Marca.countRegister(Inv_Marca, 'mar_codigov', form_data['mar_codigov'],
        #                                      'mar_estado')[0]
        # else:
        #     codRep = Inv_Marca.countRegister(Inv_Marca, 'mar_codigov', form_data['mar_codigov'],
        #                                      'mar_estado', 'mar_id', self.instance.pk)[0]
        # if (codRep > 0):
        #     self._errors['mar_codigov'] = [CRUD_MSG.CODIGOV_DUPLICADO]
        #     del form_data['mar_codigov']
        #     # raise forms.ValidationError('Mensaje de error') #Mensaje de error mostrado de diferente manera
        return form_data


class catalogoForm(ModelForm):
    class Meta:
        model = EnCatalogo
        fields = ['cod_catalogo', 'nombre', 'cod_tipo_catalogo']

    def save(self, commit=True):
        data = {}
        form = super(catalogoForm, self).save(commit=False)
        try:
            if self.is_valid():
                if commit:
                    form.save()
                data['message'] = 'Guardado exitosamente'
            else:
                data['error'] = self.errors
        except Exception as e:
            data['error'] = str(e)
        return data




# class AdEmpresaForm(ModelForm):
#     class Meta:
#         model = AdEmpresa
#         fields = ['nro_establecimientos_activos', 'nro_resolucion_contrib_esp', 'fecha_nro_resolucion', 'cod_rol', 'crm']
#
#



# class AdEmpresaForm(forms.ModelForm):
#     fecha_nro_resolucion = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
#     cod_rol = forms.ModelChoiceField(queryset=AdEmpresa.objects.values_list('cod_rol', flat=True).distinct())
#     crm = forms.ModelChoiceField(queryset=AdEmpresa.objects.values_list('crm', flat=True).distinct())
#
#     class Meta:
#         model = AdEmpresa
#         fields = ['nro_establecimientos_activos', 'nro_resolucion_contrib_esp', 'fecha_nro_resolucion', 'cod_rol', 'crm']
#
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.helper = FormHelper()
#         self.helper.layout = Layout(
#             Field('nro_establecimientos_activos'),
#             Field('nro_resolucion_contrib_esp'),
#             Field('fecha_nro_resolucion'),
#             Field('cod_rol'),
#             Field('crm')
#         )