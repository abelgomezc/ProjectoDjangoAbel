from django_select2.forms import ModelSelect2Widget

from appls.administracion.models import AdUsuarioEmpresa


class EmpresaSelect2Widget(ModelSelect2Widget):
    search_fields = [
        'nombre__icontains',
    ]
    # dependent_fields = {'username': 'cod_usuario'},

    def get_queryset(self):
        username = self.data.get('username')
        if username:
            return AdUsuarioEmpresa.objects.filter(cod_usuario=username)
        return AdUsuarioEmpresa.objects.none()

    # def build_attrs(self, *args, **kwargs):
    #     attrs = super().build_attrs(*args, **kwargs)
    #     attrs['data-usuario-field-id'] = 'cod_usuario'  # Asegúrate de que el ID del campo de usuario sea correcto
    #     return attrs
