from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

from appls.administracion.models import AdUsuarioEmpresa

UserModel = get_user_model()


class AdmUsuarioBackend(BaseBackend):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    """

    def authenticate(self, request, **kwargs):
        usu_username = kwargs['username']
        usu_password = kwargs['password']

        if usu_username is None:
            usu_username = kwargs.get(UserModel.USERNAME_FIELD)
        if usu_username is None or usu_password is None:
            return
        try:
            suc = AdUsuarioEmpresa.objects.filter(estado=1)[0]
            user = UserModel._default_manager.get_by_natural_key(usu_username)
        except UserModel.DoesNotExist or AdUsuarioEmpresa.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            UserModel().set_password(usu_password)
        else:
            if user.check_password(usu_password) and self.user_can_authenticate(user):
                user.suc = suc
                return user

    def user_can_authenticate(self, adm_usuario):
        """
        Reject users with is_active=False. Custom user models that don't have
        that attribute are allowed.
        """
        usu_isactive = getattr(adm_usuario, 'usu_isactive', None)
        return usu_isactive or usu_isactive is None

    def get_user(self, user_id):
        try:
            user = UserModel._default_manager.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None