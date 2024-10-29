from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import Textarea

from appls.authentication.models import AdUsuario


# Register your models here.
class UserAdminConfig(UserAdmin):
    model = AdUsuario
    search_fields = ('cod_usuario', 'nombre',)
    list_filter = ('cod_usuario', 'nombre', 'is_active', 'is_staff',)
    ordering = ('-cod_usuario',)
    list_display = ('cod_usuario', 'nombre', 'is_active', 'is_staff',)

    fieldsets = (
        (None, {'fields': ('cod_usuario', 'nombre', 'pw_app', 'pw_bd',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions',)}),
    )

    formfield_overrides = {
        AdUsuario.nombre: {'widget': Textarea(attrs={'rows': 10, 'cols': 40})},
    }

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'cod_usuario', 'nombre', 'pw_app', 'pw_bd', 'password1', 'password2', 'is_active', 'is_staff', 'groups',
                'user_permissions','cod_persona')
        }),
    )


admin.site.register(AdUsuario, UserAdminConfig)
