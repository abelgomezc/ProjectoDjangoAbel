from django.db import connection


# organizar  menu abel
# def obtener_modulos_por_usuario(cod_usuario: str):
#     with connection.cursor() as cursor:
#         cursor.execute("SELECT * FROM icl.obtener_modulos_por_usuario(%s)", [cod_usuario])
#         rows = cursor.fetchall()
#
#     modulos = [
#         {
#             "cod_modulo": row[0],
#             "nombre_modulo": row[1],
#             #"icono":row[2],
#         }
#         for row in rows
#     ]
#     # retornar los modulos
#     return modulos
#
# def fn_get_menu(cod_empresa: str, cod_usuario: str):
#     # Obtener módulos por usuario
#     modulos = obtener_modulos_por_usuario(cod_usuario)
#
#     with connection.cursor() as cursor:
#         cursor.execute("SELECT * FROM icl.fn_get_menu_full(%s, %s)", [cod_empresa, cod_usuario])
#         rows = cursor.fetchall()
#
#
#     # Convierte los resultados a una lista de diccionarios
#     menu_items = [
#         {
#             "nivel": row[1],
#             "nombre": row[2],
#             "icono": row[3],
#             "url": row[6],
#             "cod_opcion_padre": row[5],
#             "cod_opcion": row[4],
#             "cod_modulo": row[7]  # codigo de modulo
#         }
#         for row in rows
#     ]
#     # maximo nivel
#     nivel_maximo = 5
#     for opcion in menu_items:
#         for nivel in range(1, nivel_maximo + 1):
#             if opcion['nivel'] == nivel:
#                 if es_ultimo_nivel(opcion, menu_items):
#                     opcion['es_ultimo_nivel'] = 1
#                 else:
#                     opcion['es_ultimo_nivel'] = 0
#
#     # Organizar las opciones dentro de sus módulos
#     menu_organizado = {}
#     for modulo in modulos:
#         cod_modulo = modulo['cod_modulo']
#         menu_organizado[cod_modulo] = {
#             "nombre_modulo": modulo['nombre_modulo'],
#             "opciones": [opcion for opcion in menu_items if opcion['cod_modulo'] == cod_modulo]
#         }
#     return menu_organizado
#
# #
#
#
# def es_ultimo_nivel(cod_opcion, cod_opciones):
#     cod_actual = cod_opcion['cod_opcion']
#     nivel_actual = cod_opcion['nivel']
#
#     for opcion in cod_opciones:
#         if opcion['nivel'] == nivel_actual + 1 and opcion['cod_opcion'].startswith(cod_actual):
#             return False
#     return True

# si
# def obtener_modulos_por_usuario(cod_usuario: str):
#     with connection.cursor() as cursor:
#         cursor.execute("SELECT * FROM icl.obtener_modulos_por_usuario(%s)", [cod_usuario])
#         rows = cursor.fetchall()
#
#     modulos = [
#         {
#             "cod_modulo": row[0],
#             "nombre_modulo": row[1],
#             # "icono": row[2],
#         }
#         for row in rows
#     ]
#     return modulos
#
#
# def fn_get_menu(cod_empresa: str, cod_usuario: str):
#     modulos = obtener_modulos_por_usuario(cod_usuario)
#
#     with connection.cursor() as cursor:
#         cursor.execute("SELECT * FROM icl.fn_get_menu_full(%s, %s)", [cod_empresa, cod_usuario])
#         rows = cursor.fetchall()
#
#     menu_items = [
#         {
#             "nivel": row[1],
#             "nombre": row[2],
#             "icono": row[3],
#             "url": row[6],
#             "cod_opcion_padre": row[5],
#             "cod_opcion": row[4],
#             "cod_modulo": row[7]
#         }
#         for row in rows
#     ]
#
#     def organizar_opciones(opciones, cod_padre=None):
#         return [
#             {
#                 **opcion,
#                 "subopciones": organizar_opciones(opciones, opcion["cod_opcion"])
#             }
#             for opcion in opciones if opcion["cod_opcion_padre"] == cod_padre
#         ]
#
#     menu_organizado = {}
#     for modulo in modulos:
#         cod_modulo = modulo["cod_modulo"]
#         opciones_modulo = [opcion for opcion in menu_items if opcion["cod_modulo"] == cod_modulo]
#         menu_organizado[cod_modulo] = {
#             "nombre_modulo": modulo["nombre_modulo"],
#             "opciones": organizar_opciones(opciones_modulo)
#         }
#
#     # # Imprimir la jerarquía para depuración
#     # for cod_modulo, modulo in menu_organizado.items():
#     #     print(f"\nMódulo: {modulo['nombre_modulo']} (Código: {cod_modulo})")
#     #     # imprimir_opciones(modulo["opciones"])
#
#     return menu_organizado

# def imprimir_opciones(opciones, nivel=0):
#     for opcion in opciones:
#         indent = "  " * nivel
#         print(f"{indent}Opción: {opcion['nombre']} (Código: {opcion['cod_opcion']})")
#         print(f"{indent}  Nivel: {opcion['nivel']}")
#         print(f"{indent}  URL: {opcion['url']}")
#         print(f"{indent}  Código Padre: {opcion['cod_opcion_padre']}")
#         print(f"{indent}  Es Último Nivel: {len(opcion['subopciones']) == 0}")
#         imprimir_opciones(opcion['subopciones'], nivel + 1)


def obtener_modulos_por_usuario(cod_usuario: str):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM icl.obtener_modulos_por_usuario(%s)", [cod_usuario])
        rows = cursor.fetchall()

    modulos = [
        {
            "cod_modulo": row[0],
            "nombre_modulo": row[1],
            # "icono": row[2],
        }
        for row in rows
    ]
    return modulos


def fn_get_menu(cod_empresa: str, cod_usuario: str):
    modulos = obtener_modulos_por_usuario(cod_usuario)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM icl.fn_get_menu_full(%s, %s)", [cod_empresa, cod_usuario])
        rows = cursor.fetchall()

    menu_items = [
        {
            "nivel": row[1],
            "nombre": row[2],
            "icono": row[3],
            "url": row[6],
            "cod_opcion_padre": row[5],
            "cod_opcion": row[4],
            "cod_modulo": row[7]
        }
        for row in rows
    ]

    def organizar_opciones(opciones, cod_padre=None):
        return [
            {
                **opcion,
                "subopciones": organizar_opciones(opciones, opcion["cod_opcion"])
            }
            for opcion in opciones if opcion["cod_opcion_padre"] == cod_padre
        ]

    menu_organizado = {}
    for modulo in modulos:
        cod_modulo = modulo["cod_modulo"]
        # Filtrar las opciones del módulo actual
        opciones_modulo = [opcion for opcion in menu_items if opcion["cod_modulo"] == cod_modulo]

        # Solo agregar el módulo si tiene opciones
        if opciones_modulo:
            menu_organizado[cod_modulo] = {
                "nombre_modulo": modulo["nombre_modulo"],
                "opciones": organizar_opciones(opciones_modulo)
            }

    return menu_organizado
