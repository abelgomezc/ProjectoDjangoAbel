from django.db import connection

class DatabaseExecutor:
    def _execute_function(self, function_name, *args):
        """Ejecuta una función almacenada en PostgreSQL y retorna el resultado."""
        with connection.cursor() as cursor:
            cursor.callproc(function_name, args)
            result = cursor.fetchone()
        return result

    def _execute_function_all(self, function_name, *args):
        """Ejecuta una función almacenada en PostgreSQL y retorna todos los registros."""
        with connection.cursor() as cursor:
            cursor.callproc(function_name, args)
            # Recupera todos los registros devueltos por la función
            result = cursor.fetchall()
        return result


# class DatabaseExecutor:
#     def _execute_function(self, function_name, *args):
#         """Ejecuta una función almacenada en PostgreSQL y retorna el resultado."""
#         try:
#             with connection.cursor() as cursor:
#                 cursor.callproc(function_name, args)
#                 result = cursor.fetchone()
#             return result
#         finally:
#             connection.close()
#
#     def _execute_function_all(self, function_name, *args):
#         """Ejecuta una función almacenada en PostgreSQL y retorna todos los registros."""
#         try:
#             with connection.cursor() as cursor:
#                 cursor.callproc(function_name, args)
#                 # Recupera todos los registros devueltos por la función
#                 result = cursor.fetchall()
#             return result
#         finally:
#             connection.close()
