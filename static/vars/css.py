from datetime import datetime

class Form_CSS:
    form_method = 'post'
    form_attrs = {'action': '.', 'onkeydown': "return event.key != 'Enter';"}
    form_err_title = 'Errores'
    form_class = 'form-horizontal'
    form_method = 'post'
    form_tag = True
    fields_autocomplete = 'off'
    fields_placeholder = ''
    fields_attr_class = 'form-control-border form-control-sm'  # afecta a la clase del input
    fields_label_class_2_right = 'col-sm-2 text-right form-control-sm'
    fields_label_class_3_right = 'col-sm-3 text-right form-control-sm'
    fields_label_class_4_right = 'col-sm-4 text-right form-control-sm'
    fields_label_class_5_right = 'col-sm-5 text-right form-control-sm'
    fields_label_class_6_right = 'col-sm-6 text-right form-control-sm'
    fields_label_class_2_left = 'col-sm-2 text-left form-control-sm'
    fields_label_class_3_left = 'col-sm-3 text-left form-control-sm'
    fields_label_class_4_left = 'col-sm-4 text-left form-control-sm'
    fields_label_class_5_left = 'col-sm-5 text-left form-control-sm'
    fields_label_class_6_left = 'col-sm-6 text-left form-control-sm'
    # afecta al div contenedor del input
    fields_field_class_2 = 'col-sm-2 row'
    fields_field_class_3 = 'col-sm-3 row'
    fields_field_class_4 = 'col-sm-4 row'
    fields_field_class_5 = 'col-sm-5 row'
    fields_field_class_6 = 'col-sm-6 row'
    fields_field_class_7 = 'col-sm-7 row'
    fields_field_class_8 = 'col-sm-8 row'
    fields_date_format = '%Y-%m-%d'
    fields_date_format_grids = 'yyyy-MM-dd'
    fields_date_opts = {'locale': 'es-us', }
    fields_current_date = datetime.now().strftime(fields_date_format)

    def getFormID(obj):
        return 'form_' + obj.__class__.__name__ + '_id'

# CSS para la alineación de textos
class Grid_CSS:
    fields_align_text = 'Left'
    fields_align_number = 'Right'
    fields_align_id = 'Center'

# CSS para el attrs de ModelChoiceField > ModelSelect2Widget
class Select2_CSS:
     get_field_attrs = {
            "data-placeholder": '--------',
            "data-minimum-input-length": 0,
            "style": 'width: 120%;',
        }