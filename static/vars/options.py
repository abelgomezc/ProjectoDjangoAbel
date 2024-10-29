# Autor: dre
# Fecha: 26/06/2023 10:00
# Descripción: Generalización de opciones para el proyecto

from django.forms import ModelForm, Form
from crispy_forms.helper import FormHelper
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView
from config.encryption_util import EncryptDES
# from static.utils.utils import recuperarPermisos
from static.vars.css import Form_CSS
_e = EncryptDES()

datatable_id = 'datatable1_id'
datatable_opts = {
    'responsive': True,
    'lengthChange': True,
    'autoWidth': False,
    'paging': True,
    'searching': True,
    'ordering': True,
    'info': True,
    'order': [[1, "asc"]],
    'columnDefs': [
        {
            'targets': [0],
            'visible': True,
            'orderable': False,
            'searchable': False,
            'width': '4%',
        }
    ],
    'drawCallback': None,
    'pageLength': 25,
    'pagingType': 'full_numbers',
    'buttons': ["colvis", "copy", "excel", "pdf", "print"],
    'dom':
        "<'row'<'col-sm-3'l><'col-sm-5 text-center'B><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
}

# Propiedades de las grid syncfunsion
class SyncFusionGridOptions(object):
    def __init__(self, model_id="grid", allowEdit=True, allowAdd=True, allowDelete=True):
        self.allowEdit = allowEdit
        self.allowAdd = allowAdd
        self.allowDelete = allowDelete
        self.allowPaging: True
        self.grid_id = "id_grid_" + str(model_id)
        self.grid_title = ""
        self.gridOptions = {
            'commandClick': 'commandClick',
            'columns': {},
            'aggregates': {},
            'dataSource': [],
            'locale' : 'es-EC',
            'groupSettings': None,
            'allowGrouping': False,
            'sortSettings': None,
            'allowSorting': False,
            'editSettings': {'allowEditing': allowEdit, 'allowAdding': allowAdd, 'allowDeleting': allowDelete,
                             'addNewRowPosition': 'Bottom', 'newRowPosition': 'Bottom'},
            'allowExcelExport': False,
            'toolbar': ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'],
            'actionBegin': None,
            'actionComplete': None,
            'toolbarClick': None,
            'rowDataBound': None,
            'formatSettings': None,
            # 'width': '100%',
            # 'height': 315
        }
        self.div_style = ""

    def __set_addNewRowFnData(self):
        pass

    def to_JSON(self):
        self.__set_addNewRowFnData()
        return self.__dict__

# Propiedades de las pivot syncfunsion
class SyncFusionPivotGridOptions(object):
    def __init__(self, model_id="PivotTable"):
        self.grid_id = model_id
        self.grid_title = ""
        self.gridOptions = {
            'dataSourceSettings': {
                'expandAll': False,
                'locale': 'es-EC',
                'dataSource': [],
                'columns': {},
                'values': {},
                'rows': [],
                'filters': [],
                'formatSettings': {},
                'enableSorting': True,
                'allowLabelFilter': True,
                'allowValueFilter': True,
                'drilledMembers': {},
                'selectionSettings': {'persistSelection': True},
                'showFieldList': True,
            },
            'locale': 'es-EC',
            'enginePopulated': None
            # 'height' : 350,
            # 'div_style' : "",
        }
        self.div_style = ""

    def __set_addNewRowFnData(self):
        pass

    def to_JSON(self):
        self.__set_addNewRowFnData()
        return self.__dict__

# Propiedades para los forms
class BaseForm(Form):

    def __init__(self, *args, **kwargs):
        self.kwargs = kwargs
        # Variables de sesión para el formulario
        self.AIGN_EMP_ID = kwargs.pop("AIGN_EMP_ID", None)
        self.AIGN_PER_ID = kwargs.pop("AIGN_PER_ID", None)
        self.AIGN_PER_ID = kwargs.pop("AIGN_SUC_ID", None)
        # Variables roles para el formulario
        self.PERMISOS = None#recuperarPermisos(kwargs.pop("AIGN_OPCIONES"), self.get_menu())
        super().__init__(*args, **kwargs)

        for form in self.visible_fields():
            form.field.widget.attrs['placeholder'] = Form_CSS.fields_placeholder + form.field.label.lower()
            form.field.widget.attrs['autocomplete'] = Form_CSS.fields_autocomplete
            form.field.widget.attrs['class'] = Form_CSS.fields_attr_class

        self.helper = FormHelper(self)
        self.helper.form_method = Form_CSS.form_method
        self.helper.form_id = Form_CSS.getFormID(self)
        self.helper.attrs = Form_CSS.form_attrs
        self.helper.form_tag = Form_CSS.form_tag
        self.helper.form_error_title = Form_CSS.form_err_title
        self.helper.form_class = Form_CSS.form_class
        self.helper.label_class = Form_CSS.fields_label_class_4_right
        self.helper.field_class = Form_CSS.fields_field_class_7
        self.helper.layout = self.get_layout()

    def clean(self):
        cleaned_data = super().clean()
        # Aquí puedes incluir las validaciones que son comunes para todos los formularios.
        return cleaned_data

    # Definir estos como métodos que deben ser implementados en las clases derivadas.
    def get_menu(self):
        raise NotImplementedError()

    def get_layout(self):
        raise NotImplementedError()

# Propiedades para los model forms
class BaseModelFormOptions(ModelForm):

    def __init__(self, *args, **kwargs):
        self.kwargs = kwargs
        # Variables de sesión para el formulario
        self.AIGN_EMP_ID = kwargs.pop("AIGN_EMP_ID", None)
        self.AIGN_PER_ID = kwargs.pop("AIGN_PER_ID", None)
        self.AIGN_SUC_ID = kwargs.pop("AIGN_SUC_ID", None)
        # Variables roles para el formulario
        self.PERMISOS = None#recuperarPermisos(kwargs.pop("AIGN_OPCIONES"), self.get_menu())
        super(BaseModelFormOptions, self).__init__(*args, **kwargs)
        # Añadir código de atributos específicos aquí...
        for form in self.visible_fields():
            form.field.widget.attrs['placeholder'] = Form_CSS.fields_placeholder + form.field.label.lower()
            form.field.widget.attrs['autocomplete'] = Form_CSS.fields_autocomplete
            form.field.widget.attrs['class'] = Form_CSS.fields_attr_class
        self.helper = FormHelper(self)
        self.helper.form_method = Form_CSS.form_method
        self.helper.form_id = Form_CSS.getFormID(self)
        self.helper.attrs = Form_CSS.form_attrs
        self.helper.form_tag = Form_CSS.form_tag
        self.helper.form_error_title = Form_CSS.form_err_title
        self.helper.form_class = Form_CSS.form_class
        self.helper.label_class = Form_CSS.fields_label_class_4_right
        self.helper.field_class = Form_CSS.fields_field_class_7
        self.helper.layout = self.get_layout()

    def clean(self):
        super(BaseModelFormOptions, self).clean()
        return self.cleaned_data

    # Definir estos como métodos que deben ser implementados en las clases derivadas.
    def get_menu(self):
        raise NotImplementedError()

    def get_layout(self):
        raise NotImplementedError()

# Propiedades de BaseMeta para los modelforms, el atirbuto fields y widgets no se generalizan ya que
# Varian dependiendo el formulario
class BaseMetaOptions:
    fields = '__all__'
    exclude = []

# Propiedades para el listview
class BaseListView(ListView):
    model = None
    template_name = None

    # Función para asignar las variables de sesión a self, para ser usadas en toda la class
    def dispatch(self, request, *args, **kwargs):
        self.AIGN_EMP_ID = request.session['AIGN_EMP_ID']
        self.AIGN_PER_ID = request.session['AIGN_PER_ID']
        self.AIGN_SUC_ID = request.session['AIGN_SUC_ID']
        self.AIGN_OPCIONES = request.session['AIGN_OPCIONES']
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        # Inicia el context
        context = super().get_context_data(**kwargs)
        # Se obtienen los permisos de rol
        __permisos = None#recuperarPermisos(self.request.session, self.menu)
        # Se asigna el botón agregar a los permisos
        context['permisos'] = __permisos['oro_agregar']
        # Información para la pagina
        context['page_title'] = 'Reporte ' + self.model._meta.verbose_name
        # Url de formulario
        context['url_form'] = reverse_lazy(self.urlForm)
        context['url_form_add'] = reverse_lazy(self.urlForm_add)
        context['url_form_edit'] = self.urlForm_edit
        context['datatable_id'] = datatable_id
        context['datatable_opts'] = datatable_opts
        # Visualización de campos (se obtienen del modelo)
        context['show_fields'] = self.get_fields()
        # Encriptacion del id
        if self.encrypt_field:
            for r in context['object_list']:
                field_value = getattr(r, self.encrypt_field)
                setattr(r, self.encrypt_field, _e.encrypt(field_value))
        return context

    # Definir estos como métodos que deben ser implementados en las clases derivadas.
    def get_fields(self):
        raise NotImplementedError()

# Propiedades para el create view
class BaseCreateView(CreateView):
    model = None
    form_class = None
    template_name = None
    success_url_name = None
    error_url_name = None

    # Se asigna las variables de sesión a self, para ser usado en toda la class
    def dispatch(self, request, *args, **kwargs):
        self.AIGN_EMP_ID = request.session['AIGN_EMP_ID']
        self.AIGN_PER_ID = request.session['AIGN_PER_ID']
        self.AIGN_SUC_ID = request.session['AIGN_SUC_ID']
        self.AIGN_OPCIONES = request.session['AIGN_OPCIONES']
        return super().dispatch(request, *args, **kwargs)

    # Asigna al kwargs la variable de session con el formulario
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs.update({'AIGN_EMP_ID': self.AIGN_EMP_ID})
        kwargs.update({'AIGN_PER_ID': self.AIGN_PER_ID})
        kwargs.update({'AIGN_SUC_ID': self.AIGN_SUC_ID})
        kwargs.update({'AIGN_OPCIONES': self.AIGN_OPCIONES})
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = self.model._meta.verbose_name
        context['url_list'] = self.success_url
        return context

    # Convertir success_url y error_url en propiedades, que devolverán
    # los resultados de reverse_lazy con los nombres de las URL proporcionados
    # por las clases específicas.
    @property
    def success_url(self):
        return reverse_lazy(self.success_url_name)

    @property
    def error_url(self):
        return reverse_lazy(self.error_url_name)