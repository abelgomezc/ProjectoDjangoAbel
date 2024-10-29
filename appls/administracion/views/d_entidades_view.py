
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from appls.administracion.forms import tipoCatalogoForm, catalogoForm, TipoCatalogoForm
from appls.administracion.models import *
from django.views.generic import ListView, DeleteView, CreateView, UpdateView, FormView, TemplateView
from config.encryption_util import EncryptDES
import json

_e = EncryptDES()
class definicionEntidades(TemplateView):
    template_name = 'ADM_0030.html'

    @method_decorator(csrf_exempt)
    # @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    # sobre escritura del metodo post


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Listado de Personas'
        context['lista_url'] = reverse_lazy('listapersonas')
        context['entity'] = 'En Persona'
        context['form'] = definicionPersonaForm()
        return context

class referenciasEntidades(TemplateView):
    template_name = 'ADM_0027.html'

    @method_decorator(csrf_exempt)
    # @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        cod_persona = self.request.session.get('VS_COD_PERSONA')
        try:
            action = request.POST['action']
            # consultar datos
            if action == 'searchdata_refPersonales':
                data = list(EnRefPersonalesXPersona.objects.values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refBancarias':
                data = list(EnRefBancariasXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refComerciales':
                data = list(EnRefComercialesXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refLaborales':
                data = list(EnRefLaboralesXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refBienes':
                data = list(EnBienesXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refVehiculos':
                data = list(EnVehiculosXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
            elif action == 'searchdata_refGarantias':
                data = list(EnGarantiasXPersona.objects.filter(cod_persona=cod_persona).values())
                return JsonResponse(data, safe=False)
        except Exception as e:
            data['error'] = 'Error en el servidor: {}'.format(str(e))
        return JsonResponse({'error': 'No se ha especificado una acción'}, status=400)


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['lista_url'] = reverse_lazy('referenciaspersonas')
        context['entity'] = 'R'
        context['form'] = tipoCatalogoForm()
        return context


