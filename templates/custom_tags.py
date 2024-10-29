from django import template
from django.utils.safestring import mark_safe
import json

register = template.Library()


@register.simple_tag
def get_verbose_field_name(instance, field_name):
    return instance._meta.get_field(field_name).verbose_name


@register.filter
def get_object_attr(obj, attr):
    pseudo_context = {'object': obj}
    try:
        value = template.Variable('object.%s' % attr).resolve(pseudo_context)
        # if type(value) == type(True):
        #    return 'Si' if value else 'No'
    except template.VariableDoesNotExist:
        value = 'Attr no existe'
    return value if value is not None else ''


@register.filter(name='get_value_from_dict')
def get_value_from_dict(d, k):
    '''Returns the given key from a dictionary.'''
    return d[k]


@register.filter(is_safe=True)
def js(obj):
    return mark_safe(json.dumps(obj))


@register.simple_tag
def setvar(val=None):
    return val


@register.tag(name='eval')
def do_eval(parser, token):
    "Usage: {% eval %}1 + 1{% endeval %}"

    nodelist = parser.parse(('endeval',))

    class EvalNode(template.Node):
        def render(self, context):
            return eval(nodelist.render(context))

    parser.delete_first_token()
    return EvalNode()


# Descripción: Implementación de las bitácoras

@register.simple_tag
def get_model_name(instance):
    return instance._meta.model_name


# Descripción: Variable para la carpeta media
@register.simple_tag
def media(file_path):
    return '/media/' + file_path
