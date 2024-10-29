from crispy_forms.bootstrap import StrictButton
from crispy_forms.layout import Layout, Div, HTML


# Muestra o no los botones por roles para cada formulario
class DivHeaderWithButtons(Layout):
    l_permisos = {'oro_agregar': 1, 'oro_modificar': 1, 'oro_eliminar': 1, 'oro_imprimir': 1}

    def __init__(self, instance_pk=None, remove_cancel=False, permisos=l_permisos, save_name='Guardar', *args,
                 **kwargs):
        l_instance_pk = None if instance_pk is None or instance_pk == '' else instance_pk

        super().__init__(
            Div(
                HTML("""
                    <h3 class="card-title"><b>{{ page_title }}</b></h3>
                """),
                Div(
                    HTML("""
                        <a id= "cancel_id" href="{{ url_list }}" class="btn btn-outline-dark btn-sm">
                            <i class="fas fa-angle-double-left"></i>  Cancelar
                        </a>
                    """)
                    # <-- muestra el html objeto si el remove_cancel es falso
                    if not remove_cancel else None,
                    StrictButton('<i class="fas fa-trash fa-fw"></i> Eliminar', type='submit',
                                 name="DELETE", css_class='btn btn-outline-danger btn-sm', id='delete_id',
                                 onclick='return confirm("¿Está seguro de eliminar el registro?")')
                    # StrictButton('<i class="fas fa-trash fa-fw"></i> Eliminar', type='submit',
                    #              name="DELETE", css_class='btn btn-outline-danger btn-sm', id='delete_id',
                    #              onclick='return confirmDelete()')
                    if l_instance_pk is not None and permisos['oro_eliminar'] == 1 or None else None,
                    # Boton Descargar
                    StrictButton('<i class="fas fa-file-pdf-o"></i> Descargar', type='search',
                                 name="PRINT", css_class='btn btn-outline-info btn-sm', id='print_id')
                    if l_instance_pk is not None and permisos['oro_imprimir'] == 1 else None,
                    # <-- por defecto deshabilitado
                    # Boton Guardar
                    StrictButton('<i class="fa fa-save fa-fw"></i> Guardar', type='submit',
                                 name="SAVE", css_class='btn btn-outline-primary btn-sm', id="save_id")
                    if l_instance_pk and permisos['oro_modificar'] == 1 else None,
                    # Boton Crear
                    StrictButton('<i id="save_icon_id" class="fa fa-save fa-fw"> </i> ' + save_name, type='submit',
                                 name="CREATE", css_class='btn btn-outline-primary btn-sm', id="save_id")
                    if l_instance_pk is None else None,
                    css_class='card-tools'
                ),
                css_class='card-header',
            ),
        )


class DivGridHeaderWithButtons(Layout):
    def __init__(self, instance_pk=None, grid_opts=None, remove_header=True, *args, **kwargs):
        l_instance_pk = None if instance_pk is None or instance_pk == '' else instance_pk
        super().__init__(
            Div(
                Div(
                    HTML(
                        '<h3 class="card-title" id="' + grid_opts.grid_id + '_title"><b>' + grid_opts.grid_title + '</b></h3>')
                    if remove_header is False else
                    HTML(
                        '<h3 class="card-title" id="' + grid_opts.grid_id + '_title"></h3>')
                    ,
                    Div(
                        css_class='card-tools'
                    ),
                    css_class='card-header', id="header_id",
                ),
                Div(css_class="ag-theme-alpine", css_id=grid_opts.grid_id, style=grid_opts.div_style),
                css_class='card card-outline card-primary' if remove_header is False else 'card',
            ),
        )

class DivGridHeaderWithButtonsWithoutLine(Layout):
    def __init__(self, instance_pk=None, grid_opts=None, remove_header=True, *args, **kwargs):
        l_instance_pk = None if instance_pk is None or instance_pk == '' else instance_pk
        super().__init__(
            Div(
                Div(
                    HTML(
                        '<h3 class="card-title" id="' + grid_opts.grid_id + '_title"><b>' + grid_opts.grid_title + '</b></h3>')
                    if remove_header is False else
                    HTML(
                        '<h3 class="card-title" id="' + grid_opts.grid_id + '_title"></h3>')
                    ,
                    Div(
                        css_class='card-tools'
                    ),
                    css_class='card-header', id="header_id",
                ),
                Div(css_class="ag-theme-alpine", css_id=grid_opts.grid_id, style=grid_opts.div_style),
                css_class='card card-outline' if remove_header is False else 'card',
            ),
        )

class DivGridHeaderWithButtons_old(Layout):
    def __init__(self, instance_pk=None, grid_opts=None, *args, **kwargs):
        l_instance_pk = None if instance_pk is None or instance_pk == '' else instance_pk
        super().__init__(
            Div(
                Div(
                    HTML('<h3 class="card-title" id="' + grid_opts.grid_id + '_title"></h3>'),
                    Div(
                        StrictButton('<i class="fas fa-minus"></i> Remover selección', type='button',
                                     id=grid_opts.removeSelectedRows['grid_btn_rem'],
                                     css_class='btn bg-gradient-secondary btn-xs')
                        if grid_opts.removeSelectedRows['alloRemoveSelectedRows'] else None,
                        StrictButton('<i class="fas fa-plus"></i> Agregar fila', type='button',
                                     id=grid_opts.addNewRow['grid_btn_add'],
                                     css_class='btn bg-gradient-secondary btn-xs')
                        if grid_opts.addNewRow['allowAddNewRow'] else None,
                        css_class='card-tools'
                    ),
                    css_class='card-header',
                ),
                Div(css_class="ag-theme-alpine", css_id=grid_opts.grid_id, style=grid_opts.div_style),
                css_class='card',
            ),
        )
