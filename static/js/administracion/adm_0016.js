var tablas = {};

var selectedRowData = null;
//  acciones
var accionBuscarEmpresas = 'searchdata_empresas';
var accionBuscarUsuariosxEmpresa = 'searchdata_usuariosxempresa';
var accionBuscarUsuarios = 'searchdata_usuarios';
var accionBuscarPersonas = 'searchdata_personas';


//tablas de html
var tbEmpresas = 'TablaEmpresas';
var tbUsuarios = 'TablaUsuarios';

// lista a mandar al backend
var dataRecords = {

    [tbUsuarios]: {
        added: [],
        updated: [],
        deleted: []
    },


};


function initDataTable(id, config) {
    return $(id).DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true,
        ajax: {
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': config.action
            },
            dataSrc: "",

        },
        columns: config.columns,
        initComplete: function (settings, json) {
            if (json.length > 0) {
                $('#' + tbEmpresas + ' tbody tr:first').trigger('click');
            }

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTables() {
    var configs = {
        [tbEmpresas]: {
            action: accionBuscarEmpresas,
            columns: [
                {data: 'cod_empresa'},
                {data: 'nombre'},
                {data: 'cod_rol'},
                {
                    data: 'crm',
                    render: function (data) {
                        return data === 'S' ? 'Sí' : 'No';
                    }
                },
                {
                    data: 'estado',
                    render: function (data) {
                        return data === 1 ? 'Activo' : 'Inactivo';
                    }
                },


            ],

        },

    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTable('#' + id, configs[id]);
            // handleEditableCells(tablas[id], id);
            // handleDeleteRows(tablas[id], id);
            handleRowSelection(tablas[id], id);
        }
    }

}


//optener info dela fila seleccionado de la tabla empresas
function handleRowSelection(table, tableId) {
    table.on('click', 'tr', function () {
        var $row = $(this).closest('tr');
        selectedRowData = table.row($row).data();  // Guardar los datos de la fila seleccionada
        table.$('tr.selected-row').removeClass('selected-row');
        if (selectedRowData) {
            $row.addClass('selected-row');
        }
    });
}

$('#' + tbEmpresas + ' tbody').on('click', 'tr', function () {
    //clearForm();
    var $row = $(this);


    // Verificar si la fila es nueva o está editada
    // if ($(this).hasClass('new-row') || $(this).hasClass('edited-row')) {
    //     return;
    // }
    if ($row.hasClass('selected-row')) {
        return;  // No hacer nada si la fila ya está seleccionada
    }


    var tableEmpresas = tablas[tbEmpresas];
    var rowData = tableEmpresas.row(this).data();
    var cod_empresa = rowData.cod_empresa;
    var nombre_empresa = rowData.nombre;


    $('#' + tbEmpresas + ' tbody tr.selected-row').removeClass('selected-row');
    $(this).addClass('selected-row');


    //

    initTables2(cod_empresa);


});


function initDataTable2(id, config) {
    return $(id).DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true,
        ajax: {
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': config.action,
                'cod_empresa': config.cod_empresa
            },
            dataSrc: "",

        },
        columns: config.columns,
        initComplete: function (settings, json) {

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTables2(cod_empresa) {

    var configs = {
        [tbUsuarios]: {
            action: accionBuscarUsuariosxEmpresa,
            cod_empresa: cod_empresa,
            columns: [
                {data: 'cod_usuario'},
                {
                    data: null,
                    defaultContent: '<button class="btnModalUsuarios btn btn-block btn-primary btn-xs"  disabled><i class="fa-solid fas fa-user fa-2xs"></i></button>',
                    className: 'btnCell',
                    orderable: false,
                    width: '10px'
                },
                {
                    data: 'nombre_usuario',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },

                {
                    data: 'autorizacion_egresos_caja',
                    className: 'small-column',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control autorizacion_egresos_caja-select">' +
                                '<option value="N"' + (data === 'N' ? ' selected' : '') + '>No</option>' +
                                '<option value="S"' + (data === 'S' ? ' selected' : '') + '>Si</option>' +
                                '</select>';
                        }
                        return data;
                    }
                },
                {
                    data: 'apertura_caja_requerido',
                    className: 'small-column',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control apertura_caja_requerido-select">' +
                                '<option value="N"' + (data === 'N' ? ' selected' : '') + '>No</option>' +
                                '<option value="S"' + (data === 'S' ? ' selected' : '') + '>Si</option>' +
                                '</select>';
                        }
                        return data;
                    }
                },
                //{data: 'cod_persona'},
                // {
                //     data: 'cod_persona',
                //     className: 'editable',
                //     createdCell: function (td, cellData, rowData, row, col) {
                //         $(td).attr('contenteditable', 'true');
                //     }
                // },
                {
                    data: 'cod_persona',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        //const valorFormateado = Number(cellData).toFixed(0);  // Formatear como número entero sin decimales
                        $(td).attr('contenteditable', 'true').addClass('input-numerico');
                    }
                },

                {
                    data: null,
                    defaultContent: '<button class="btnModalPersonas btn btn-block btn-info btn-xs" >Personas</button>',
                    className: 'btnCell',
                    orderable: false,
                    width: '10px'
                },
                {data: 'nombres_persona'},

                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select">' +
                                '<option value="1"' + (data === 1 ? ' selected' : '') + '>Activo</option>' +
                                '<option value="0"' + (data === 0 ? ' selected' : '') + '>Inactivo</option>' +
                                '</select>';
                        }
                        return data;
                    }
                },


                {
                    data: null,
                    defaultContent: '<button class="btnEliminar btn btn-block btn-danger btn-xs">X</button>',
                    className: 'btnCell',
                    orderable: false,
                    width: '10px'
                }


            ],
            editable: true,
            deletable: true
        },


    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            if (id !== tbEmpresas) {
                // Destruir la tabla si ya existe
                if ($.fn.DataTable.isDataTable('#' + id)) {
                    $('#' + id).DataTable().clear().destroy();
                }

                // Inicializar la tabla con los nuevos datos
                tablas[id] = initDataTable2('#' + id, configs[id]);

                // Remover eventos antiguos
                $('#' + id + ' tbody').off('blur', 'td[contenteditable="true"]:not(:has(select))');
                $('#' + id + ' tbody').off('change', 'select');
                $('#' + id + ' tbody').off('blur', '.input-numerico[contenteditable="true"]');
                $('#' + id + ' tbody').off('keypress', '.input-numerico[contenteditable="true"]');
                // $('#' + id + ' tbody').off('click', '.btnModalUsuarios');
                // $('#' + id + ' tbody').off('click', '.btnModalPersonas');
                // Manejar celdas editables y filas eliminables
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);

                // Agregar eventos para los botones modales
                $('#' + id + ' tbody').on('click', '.btnModalUsuarios', function () {
                    fetchDataAndShowModalUsuarios(accionBuscarUsuarios);
                });
                $('#' + id + ' tbody').on('click', '.btnModalPersonas', function () {
                    fetchDataAndShowModalPersonas(accionBuscarPersonas);
                });

            }
        }
    }

}

function addNewRow(tableId, columns) {


    var table = tablas[tableId];
    var newRowData = {};

    columns.forEach(function (column) {
        newRowData[column] = '';
    });

    newRowData.isNew = true;
    var newRow = table.row.add(newRowData).draw().node();
    var $newRow = $(newRow);
    $newRow.find('button.btnModalUsuarios').removeAttr('disabled');
    //$newRow.find('button.btnModalPersonas').removeAttr('disabled');
    $(document).off('modalRowSelected');
    if (tableId === tbUsuarios) {
        // Evento para manejar la selección de fila en el modal
        $(document).on('modalRowSelected', function (event, selectedData) {
            if (selectedData) {
                var action = selectedData.action;
                console.log('Esta es la variable de acción: ' + action);
                // Llenar las celdas correspondientes en la nueva fila
                if (action === accionBuscarUsuarios) {
                    $newRow.find('td:eq(0)').text(selectedData.cod_usuario);
                    $newRow.find('td:eq(2)').text(selectedData.nombre);
                    updateCellData($newRow.find('td:eq(0)'), table, tableId);
                    updateCellData($newRow.find('td:eq(2)'), table, tableId);
                }
            }
        });

    }

    $newRow.children().each(function (index) {
        var columnName = table.column(index).dataSrc();
        if (columns.includes(columnName)) {
            $(this).attr('contenteditable', 'true');
        } else {
            $(this).attr('contenteditable', 'false');
        }
    });
    // // Hcer que todas la celdas sena editables
    // $newRow.children().attr('contenteditable', 'true');
    // Enfocar la primera celda editable para empezar a escribir
    $newRow.find('td[contenteditable="true"]:first').focus();
    $newRow.find('td.btnCell').attr('contenteditable', 'false');

    // Si es necesario, deshabilitar edición en los selects
    if (tableId === tbUsuarios) {

        $newRow.find('td:has(select)').attr('contenteditable', 'false');// No permite que las celdas que puedan ser editable , solo el select
    }
    // Habilitar los botones en la nueva fila
    $newRow.find('button.btnModal').removeAttr('disabled');
}

// detectar cambios en las celdas
function handleEditableCells(table, tableId) {
    //  var celda;
    table.on('blur', 'td[contenteditable="true"]:not(:has(select))', function () {
        var $cell = $(this);
        celda = $cell;
        var originalText = $cell.text();
        var upperCaseText = originalText.toUpperCase();
        $cell.text(upperCaseText);
        // updateCellData($cell, table, tableId);

        var data = table.row($cell.closest('tr')).data();
        if (data) {  // Verificar que data no sea undefined
            updateCellData($cell, table, tableId);
        } else {
            console.error('No data found for the selected row.');
        }
    });


    table.on('change', 'select', function () {
        var $cell = $(this).closest('td');
        var data = table.row($cell.closest('tr')).data();
        // updateCellData($cell, table, tableId);
        if (data) {  // Verificar que data no sea undefined
            updateCellData($cell, table, tableId);
        } else {
            console.error('No data found for the selected row.');
        }
    });
    // Evento 'blur' para los campos numéricos
    table.on('blur', '.input-numerico[contenteditable="true"]', function () {
        var $cell = $(this);
        var data = table.row($cell.closest('tr')).data();
        //updateCellData($cell, table, tableId);
        if (data) {  // Verificar que data no sea undefined
            updateCellData($cell, table, tableId);
        } else {
            console.error('No data found for the selected row.');
        }

    });


    // Evento 'blur' para los campos numéricos
    table.on('blur', '.input-numerico[contenteditable="true"]', function () {
        updateCellData($(this), table, tableId);
    });

    if (tableId === tbUsuarios) {
        //   Restricción para las celdas con la clase 'input-numerico'
        table.on('keypress', '.input-numerico[contenteditable="true"]', function (e) {
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });

    }


}

function updateCellData($cell, table, tableId) {
    var $row = $cell.closest('tr');

    var data = table.row($row).data();
    var codColumn =
        tableId === tbUsuarios ? 'cod_usuario' : '';
    var codValue = $row.find('td:eq(0)').text().trim();
    var nombreValue = $row.find('td:eq(2)').text().trim();
    //Verifica que data esté definido antes de intentar modificarlo


    data[codColumn] = codValue;
    data.nombre_usuario = nombreValue;
    if (tableId === tbUsuarios) {

        data.estado = parseInt($row.find('select.estado-select').val());
        data.apertura_caja_requerido = $row.find('select.apertura_caja_requerido-select').val();
        data.autorizacion_egresos_caja = $row.find('select.autorizacion_egresos_caja-select').val();
        data.cod_empresa = selectedRowData.cod_empresa;
        data.porc_sobregiro_credito = null;
        data.cod_persona = $row.find('td:eq(5)').text().trim();
        // data.cod_persona = $row.find('td:eq(5)').text().trim() ? parseInt($row.find('td:eq(5)').text().trim()) : null;
    }

    // Agregar datos del formulario si es un nuevo registro
    if (data.isNew) {
        // Agregar a la lista de registros agregados
        var addedList = dataRecords[tableId].added;
        var existingRecord = addedList.find(record => record[codColumn] === codValue);
        if (!existingRecord) {
            addedList.push(data);
        }

    } else {
        // Si no es un nuevo registro, actualizar los datos existentes
        var updatedList = dataRecords[tableId].updated;
        var existingRecord = updatedList.find(record => record[codColumn] === codValue);
        if (!existingRecord) {
            updatedList.push(data);
        } else {
            existingRecord.nombre_usuario = nombreValue;
            // Actualizar otros campos según sea necesario
            if (tableId === tbUsuarios) {
                existingRecord.estado = data.estado;
                existingRecord.apertura_caja_requerido = data.apertura_caja_requerido;
                existingRecord.autorizacion_egresos_caja = data.autorizacion_egresos_caja;
                existingRecord.cod_empresa = data.cod_empresa;
                existingRecord.porc_sobregiro_credito = data.porc_sobregiro_credito;
                existingRecord.cod_persona = data.cod_persona;
            }//

        }
    }
}


//

function handleDeleteRows(table, tableId) {

    // Destruir  el evento del  boton cuando inicie otra tabla
    table.off('click', 'button.btnEliminar');

    table.on('click', 'button.btnEliminar', function () {
        var $row = $(this).closest('tr');
        var data = table.row($row).data();

        if (data.isNew) {
            var addedList = dataRecords[tableId].added;
            var index = addedList.findIndex(record => record === data);
            if (index !== -1) {
                addedList.splice(index, 1);
            }
        } else {
            dataRecords[tableId].deleted.push(data);
        }
        table.row($row).remove().draw();
        // validateTable(table, tableId);
        // habiltarTabsAplicar();

        // Revalidar todas las filas
        table.rows().every(function () {
            validateRow($(this.node()));
        });

        //   Validar todas las tablas después de eliminar la fila
        if (validateAllTables()) {
            habilitarElementos();
        } else {
            deshabilitarElementos();
        }

    });
}


$('#saveChanges').click(function () {
    // Si todas las tablas son válidas, proceder con la lógica de guardado
    console.log('Guardando cambios...');
    console.log('usuarios - Añadidos:', dataRecords[tbUsuarios].added);
    console.log('usuarios - Actualizados:', dataRecords[tbUsuarios].updated);
    console.log('usuarios - Eliminados:', dataRecords[tbUsuarios].deleted);


    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            action: 'save_records',
            dataRecords: JSON.stringify(dataRecords)
        },
        success: function (response) {
            var results = response.results;
            var tableOperationPerformed = false;

            for (var tableId in results) {
                if (results.hasOwnProperty(tableId)) {
                    var result = results[tableId];
                    if (result.status === 'error') {
                        tableOperationPerformed = true;
                        $(document).Toasts('create', {
                            class: 'bg-danger',
                            title: 'Error',
                            body: result.message
                        });
                    } else if (result.status === 'success') {

                        // Verificar si hubo operaciones en la tabla
                        if (dataRecords[tableId].added.length > 0 ||
                            dataRecords[tableId].updated.length > 0 ||
                            dataRecords[tableId].deleted.length > 0) {
                            tableOperationPerformed = true;
                            $(document).Toasts('create', {
                                class: 'bg-success',
                                title: 'Éxito',
                                body: result.message
                            });

                        }


                    }
                }
            }
            // Después de mostrar todos los mensajes de éxito
            if (tableOperationPerformed) {
                // Recargar las tablas y luego resetear dataRecords
                resetDataRecords();

            } else {
                // Si no se realizaron operaciones, mostrar un mensaje de información
                $(document).Toasts('create', {
                    class: 'bg-info',
                    title: 'Información',
                    body: 'No se realizaron operaciones.'
                });
            }

            // if (!tableOperationPerformed) {
            //     $(document).Toasts('create', {
            //         class: 'bg-info',
            //         title: 'Información',
            //         body: 'No se realizaron operaciones.'
            //     });
            // }

            // resetDataRecords(); // Descomentar si quieres resetear dataRecords después de guardar
        },
        error: function (xhr) {
            var response = JSON.parse(xhr.responseText);
            if (response.errors) {
                response.errors.forEach(function (error) {
                    $(document).Toasts('create', {
                        class: 'bg-danger',
                        title: 'Error',
                        body: error.error
                    });
                });
            } else {
                $(document).Toasts('create', {
                    class: 'bg-danger',
                    title: 'Error',
                    body: response.error
                });
            }

            // resetDataRecords(); // Descomentar si quieres resetear dataRecords después de error
        }
    });

});
$('#addRowUsuarioEmpresa').on('click', function () {
    addNewRow(tbUsuarios, ['cod_usuario', 'nombre_usuario', 'autorizacion_egresos_caja', 'apertura_caja_requerido', 'cod_persona', 'estado']);

});
// $('#btnCrearUsuario').on('click', function () {
//     // Verificar si hay una empresa seleccionada
//
//     if (!selectedRowData) {
//         alert('Por favor, seleccione una empresa primero.');
//         return;
//     }
//     // Obtener el nombre de la empresa seleccionada
//     var nombreEmpresa = selectedRowData.nombre;
//
//     // Actualizar el encabezado del modal con el nombre de la empresa
//     $('#modalCrearUsuarioLabel').text('Crear Usuario para ' + nombreEmpresa);
//
//     // Abrir el modal
//     $('#modalCrearUsuario').modal('show');
//
//
// });
// $('#modalCrearUsuario').on('hidden.bs.modal', function () {
//     // Limpiar el formulario al cerrar el modal
//     $('#formCrearUsuario')[0].reset();
// });
//
//
// $(document).ready(function () {
//     $('.js-example-basic-single').select2();
// });


$('#btnCrearUsuario').on('click', function () {
    if (!selectedRowData) {
        $(document).Toasts('create', {
            class: 'bg-info',
            title: 'Seleccionar una Empresa',
            body: 'Por favor, seleccione una empresa primero.'
        });
        alert('');
        return;
    }
    var nombreEmpresa = selectedRowData.nombre;
    $('#modalCrearUsuarioLabel').text('Crear Usuario para ' + nombreEmpresa);
    $('#modalCrearUsuario').modal('show');
});

$('#modalCrearUsuario').on('hidden.bs.modal', function () {
    $('#formCrearUsuario')[0].reset();
});

$('#modalCrearUsuario').on('shown.bs.modal', function () {
    var select = $('#selectRol');
    select.empty();

    // Realiza la petición AJAX para obtener los roles activos
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            'action': 'searchdata_roles'
        },
        success: function (data) {
            var roles = data.roles;

            roles.forEach(function (role) {
                var option = $('<option></option>')
                    .attr('value', role.cod_rol)
                    //.text(role.nombre);
                    .text(role.cod_rol + ' - ' + role.nombre);
                select.append(option);
            });

            // Inicializa Select2 después de llenar el select
            select.select2({
                dropdownParent: $('#modalCrearUsuario')
            }).on('select2:open', function () {
                setTimeout(function () {
                    document.querySelector('.select2-search__field').focus();
                }, 500);
            });
        },
        error: function (error) {
            console.error("Error al obtener los roles: ", error);
        }
    });
});

$('#cancelButton').click(function () {
    if (tieneCambiosPendientes()) {
        resetDataRecords();
        // toastr.info('Los cambios han sido cancelados y los datos han sido restablecidos.');
        $(document).Toasts('create', {
            class: 'bg-info',
            title: 'Validación',
            body: 'Los cambios han sido cancelados y los datos han sido restablecidos.'
        });
    } else {
        $(document).Toasts('create', {
            class: 'bg-warning',
            title: 'Advertencia',
            body: 'No hay cambios pendientes para guardar.'
        });
        resetDataRecords();

    }

});
// $('#formCrearUsuario').on('submit', function (e) {
//     e.preventDefault(); // Evita el envío automático del formulario
//
//     // Muestra la confirmación
//     var confirmacion = window.confirm('¿Estás seguro de que deseas guardar este usuario?');
//
//     if (confirmacion) {
//         // Captura los datos del formulario
//         var codigoUsuario = $('#codigoUsuario').val();
//         var nombreUsuario = $('#nombreUsuario').val();
//         var rolSeleccionado = $('#selectRol').val();
//         var textoRolSeleccionado = $('#selectRol option:selected').text();
//
//         // Imprime los datos en la consola
//         console.log('Código Usuario:', codigoUsuario);
//         console.log('Nombre Usuario:', nombreUsuario);
//         console.log('Rol Seleccionado:', rolSeleccionado);
//         console.log('Texto del Rol Seleccionado:', textoRolSeleccionado);
//
//         // Aquí puedes agregar la lógica para enviar los datos al servidor si es necesario
//     }
// });

$('#formCrearUsuario').on('submit', function (e) {
    e.preventDefault(); // Evita el envío automático del formulario
    $('#confirmModal').modal('show'); // Muestra el modal de confirmación
});

// $('#confirmSave').on('click', function () {
//     // Captura los datos del formulario
//     var codigoUsuario = $('#codigoUsuario').val();
//     var nombreUsuario = $('#nombreUsuario').val();
//     var rolSeleccionado = $('#selectRol').val();
//
//
//     // Imprime los datos en la consola
//     console.log('Código Usuario:', codigoUsuario);
//     console.log('Nombre Usuario:', nombreUsuario);
//     console.log('Rol Seleccionado:', rolSeleccionado);
//     console.log('Código  de empresa :', selectedRowData.cod_empresa)
//
//     // Aquí puedes agregar la lógica para enviar los datos al servidor si es necesario
//     $.ajax({
//         url: window.location.pathname,
//         type: 'POST',
//         data: {
//             'action': 'save_userdb',
//             'cod_empresa': selectedRowData.cod_empresa,
//             'cod_usuario': codigoUsuario,
//             'nombre_usuario': nombreUsuario,
//             'plan_rol': rolSeleccionado
//         },
//         success: function (response) {
//             toastr.success('Usuario guardado con exito.');
//         },
//         error: function (error) {
//             toastr.info('Error al Guardar el usuario .' + error.message);
//         }
//     });
//
//     // Cierra los modales
//     $('#confirmModal').modal('hide');
//     $('#modalCrearUsuario').modal('hide');
// });

$('#confirmSave').on('click', function () {
    // Captura los datos del formulario
    var codigoUsuario = $('#codigoUsuario').val();
    var nombreUsuario = $('#nombreUsuario').val();
    var rolSeleccionado = $('#selectRol').val();

    // Imprime los datos en la consola
    // console.log('Código Usuario:', codigoUsuario);
    // console.log('Nombre Usuario:', nombreUsuario);
    // console.log('Rol Seleccionado:', rolSeleccionado);
    // console.log('Código de empresa:', selectedRowData.cod_empresa);

    // Lógica para enviar los datos al servidor
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': 'save_userdb',
            'cod_empresa': selectedRowData.cod_empresa,
            'cod_usuario': codigoUsuario,
            'nombre_usuario': nombreUsuario,
            'plan_rol': rolSeleccionado
        },
        success: function (response) {
            if (response.error) {
                toastr.error('Error al guardar el usuario: ' + response.error);
            } else {
                toastr.success('Usuario guardado con éxito.');
            }
        },
        error: function (error) {
            toastr.error('Error al guardar el usuario: ' + error.responseText);
        }
    });

    // Cierra los modales
    $('#confirmModal').modal('hide');
    $('#modalCrearUsuario').modal('hide');
});


// Desactivar el alert de tabla vacía en DataTables
$.fn.dataTable.ext.errMode = 'none';


function fetchDataAndShowModalUsuarios(action) {

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': action
        },
        success: function (data) {
            // Agregar la variable `action` a cada fila de datos
            data = data.usuarios.map(row => {
                row.action = action;
                return row;
            });

            // Limpiar modal y crear tabla
            $('#modal-lg .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

            // Determinar los datos y las columnas según la acción
            var columns;
            var titulo;
            titulo = 'Listado de Usuarios';
            // Configurar el título del modal
            columns = ['cod_usuario', 'nombre'];
            // Llenar la tabla con los datos
            var table = $('#modalTable').DataTable({
                data: data,
                columns: [
                    {data: columns[0], title: 'Código'},
                    {data: columns[1], title: 'Nombre'}
                ],
                responsive: true,
                autoWidth: false,
                destroy: true,
                deferRender: true
            });
            $('#modal-lg .modal-title').text(titulo);
            // Mostrar el modal
            $('#modal-lg').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });
}


function fetchDataAndShowModalPersonas(action) {
    $('#modal-personas').modal('show');
}

// Evento para seleccionar una fila en la tabla dentro del modal
$(document).on('click', '#modalTable tbody tr', function () {
    // Remover clase de selección de todas las filas
    $('#modalTable tbody tr').removeClass('selected');
    // Agregar clase de selección a la fila clickeada
    $(this).addClass('selected');
    var action = $('#modalAcceptButton').data('action'); // Obtener la acción guardada
    // $(this).data('action', action);

});

// Evento para aceptar la selección y mostrar
$('#modalAcceptButton').on('click', function () {
    var selectedData = $('#modalTable').DataTable().row('.selected').data();
    if (selectedData) {
        // var action = $('#modalAcceptButton').data('action'); // Obtener la acción guardada
        // selectedData.action = action;
        $(document).trigger('modalRowSelected', [selectedData]);
        $('#modal-lg').modal('hide');
        console.log(selectedData)
    } else {
        // console.error('No se ha seleccionado ninguna fila.');
        toastr.info('No se ha seleccionado ninguna fila.');

    }

});//


// validaciones de las tablas
function tieneCambiosPendientes() {
    for (var tableId in dataRecords) {
        if (dataRecords.hasOwnProperty(tableId)) {
            var changes = dataRecords[tableId];
            if (changes.added.length > 0 || changes.updated.length > 0 || changes.deleted.length > 0) {
                return true;
            }
        }
    }
    return false;
}


function resetDataRecords() {
    for (let key in dataRecords) {
        if (dataRecords.hasOwnProperty(key)) {
            dataRecords[key].added = [];
            dataRecords[key].updated = [];
            dataRecords[key].deleted = [];
        }
    }
    recargarTablas();
}

function recargarTablas() {
    for (var id in tablas) {
        if (tablas.hasOwnProperty(id)) {
            tablas[id].ajax.reload(function () {
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);
                habilitarElementos();
                // $('#' + tbEmpresas + ' tbody tr:first').trigger('click');
                if (selectedRowData) {
                   //posicionar la tabla en la fila de selectedRowData
                    var rowSelector = '#' + tbEmpresas + ' tbody tr[data-id="' + selectedRowData.id + '"]';
                    $(rowSelector).trigger('click');
                } else {
                    $('#' + tbEmpresas + ' tbody tr:first').trigger('click');
                }
            }, false);
        }
    }
}

//celdas que tiene que cumplir
function validateRowData(data, tableId) {
    switch (tableId) {
        case tbUsuarios:
            return data.cod_usuario.trim() !== '' && data.nombre_usuario.trim() !== '' && data.estado != null;
        default:
            return false;
    }
}

function validateTable(table, tableId) {
    var isValid = true;
    table.rows().every(function () {
        var rowData = this.data();
        if (!validateRowData(rowData, tableId)) {
            isValid = false;
            return false;
        }
    });
    return isValid;
}

function validateAllTables() {
    var allValid = true;
    for (var tableId in tablas) {
        if (tablas.hasOwnProperty(tableId)) {
            if (tableId === tbEmpresas) {
                continue; // Salta a la siguiente iteración del bucle
            }
            var table = tablas[tableId];
            if (!validateTable(table, tableId)) {
                allValid = false;
                break;
            }
        }
    }
    return allValid;
}

//
function validateRow($row) {
    var tableId = $row.closest('table').attr('id');
    var table = tablas[tableId];
    var rowIndex = table.row($row).index();
    var rowData = table.row(rowIndex).data();

    var isEmpty = false;
    $row.find('td[contenteditable="true"]').each(function () {
        var $cell = $(this);
        if ($cell.text().trim() === '' && !isCellAllowedToBeEmpty($cell, tableId)) {
            $cell.addClass('highlight');
            isEmpty = true;
        } else {
            $cell.removeClass('highlight');
        }
    });

    if (!validateAllTables()) {
        console.log(!validateAllTables())
        console.log('desabilitar tablas validacion todas ')
        if (isEmpty) {
            deshabilitarElementos();
            $row.find('.btnEliminar').prop('disabled', false);
            editableCells($row, isEmpty);
            toastr.info('Hay campo/s vacíos.');
        } else {
            $row.find('.btnEliminar').prop('disabled', true);
        }
    } else {
        console.log('en else -----')
        console.log(validateAllTables())
    }
    if (!isEmpty && validateAllTables()) {
        console.log('habilitar tablas validacion todas ')
        habilitarElementos();
        editableCells($row, false);
    }


}


function deshabilitarElementos() {

    $('#saveChanges').prop('disabled', true);
    $('.btnEliminar').prop('disabled', true);
    $('#addRowUsuarioEmpresa').prop('disabled', true);
    $('#btnCrearUsuario').prop('disabled', true);
}

function habilitarElementos() {

    $('#saveChanges').prop('disabled', false);
    $('.btnEliminar').prop('disabled', false);
    $('#addRowUsuarioEmpresa').prop('disabled', false);
    $('#btnCrearUsuario').prop('disabled', false);
    $('#btnEliminar').prop('disabled', false)


}

/// Evento donde  se llamara  las validaciones
$('body').on('blur', 'td[contenteditable="true"]', function () {
    var $cell = $(this);
    var $row = $cell.closest('tr');
    validateRow($row);
});


$('body').on('change', 'table select', function () {
    var $select = $(this);
    var $row = $select.closest('tr');
    validateRow($row);
});


////
function isCellAllowedToBeEmpty($cell, tableId) {
    var columnIndex = $cell.index();
    var allowedEmptyColumns = [];

    switch (tableId) {
        case tbUsuarios:
            //allowedEmptyColumns = [1, 3, 4, 5, 6, 7, 8];
            allowedEmptyColumns = [5, 7];
            break;
        default:
            break;
    }

    return allowedEmptyColumns.includes(columnIndex);
}

$('body').on('click', 'tr', function () {
    var $row = $(this);
    validateRow($row);
});

function editableCells($row, isEmpty) {
    var tableId = $row.closest('table').attr('id');
    var table = tablas[tableId];
    // var isNewRow = $row.hasClass('isNew');

    if (isEmpty) {
        // Deshabilitar la edición en todas las celdas editables de la tabla
        table.cells('td.editable').nodes().to$().attr('contenteditable', 'false');
        table.cells('td:has(select)').nodes().to$().find('select').prop('disabled', true);
        // Habilitar la edición en las celdas editables de la fila específica
        //$row.find('td.editable').attr('contenteditable', 'true');
        $row.find('td.editable').attr('contenteditable', 'true').on('dblclick', function () {
            $(this).focus();
        });

        $row.find('td:has(select)').find('select').prop('disabled', false);

    } else {
        // Habilitar la edición en todas las celdas editables de la tabla
        table.cells('td.editable').nodes().to$().attr('contenteditable', 'true');
        table.cells('td:has(select)').nodes().to$().find('select').prop('disabled', false);
    }
}

// if (!validateRowData(rowData, tableId) || isEmpty) {
//
//     if (isEmpty) {
//         deshabilitarElementos();
//         toastr.info('Hay campo/s vacíos.');
//     }
//
// } else {
//    // habilitarElementos();
//     editableCells($row, false);
//
// }
//
// if (!validateAllTables()) {
//     if (isEmpty) {
//         deshabilitarElementos();
//         $row.find('.btnEliminar').prop('disabled', false);
//         editableCells($row, isEmpty);
//
//     } else {
//         $row.find('.btnEliminar').prop('disabled', true);
//     }
// } else {
//     habilitarElementos();
//    //editableCells($row, false);
// }

// $('body').on('change', 'select', function () {
//     var $select = $(this);
//     var $row = $select.closest('tr');
//     validateRow($row);
// });
