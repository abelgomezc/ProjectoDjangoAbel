# utils.py
from django.http import JsonResponse

class JsonResponseHandler:
    def __init__(self, status='error', data=None, message=None):
        self.response = {
            'status': status,
            'data': data,
            'message': message
        }

    def get_response(self):
        return JsonResponse(self.response)

