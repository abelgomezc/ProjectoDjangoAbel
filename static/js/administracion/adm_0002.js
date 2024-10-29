var tablas = {};

var selectedRowData = null; // fila seleccionado de la tabla roles
//var selectedData = null;// fila seleccioando del modal  modulos

var selectedDataModulosOpcion = null;//Almacena el modulo seleccionado en modal modulo del tab opciones
var selectedDataModulosOpcionRol = null; // almacena el modulo seleccionado del modal del tab opciones x rol

var cod_modulosSeleccionado = null;
var cod_opcioneSeleccionado = null;// pasar nulo

var accionBuscarOpciones = 'optener_menu_opciones';
var accionBuscarModulos = 'optener_modulos';
var accionBuscarRoles = 'optener_roles';
var accionBuscarOpcionesXRol = 'optener_menu_opciones_x_rol';
var accionCambiarEstadoOpcionesXRol = 'cambiar_estado_opcion_rol';
var accionCopiarOpcionesRolARol = 'copiar_opciones_rol_a_rol'


var dataEstadoOpcionXRol = null; //  almacena  la informacion si da clic en una opcion  del menu  opcionesxRol

var tbOpciones = 'TablaOpciones';
var tbRoles = 'TablaRoles';
var dataRecords = {
    [tbOpciones]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tbRoles]: {
        added: [],
        updated: [],
        deleted: []
    }
};


function initDataTableOpciones(id, config) {
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
                'cod_modulo': config.cod_modulo,
                'cod_opcion': config.cod_opcion
            },

            dataSrc: function (json) {
                //hacer que la opcione que sera padre no se agreg al atabla
                if (config.cod_modulo !== null && config.cod_opcion !== null) {
                    // Filtrar los datos si ambos parámetros tienen valor
                    return json.filter(item =>
                        !(item.cod_modulo === config.cod_modulo && item.cod_opcion === config.cod_opcion)
                    );
                }
                //Filtar solo opciones hijos del Modulo y nos subniveles
                if (config.cod_modulo !== null && config.cod_opcion == null) {
                    // Filtrar los datos
                    return json.filter(item =>
                        !item.cod_opcion.includes('.')
                    );
                }
                // Si alguno de los parámetros es null, no filtrar los datos
                return json;
            }
        },
        columns: config.columns,
        initComplete: function (settings, json) {
        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTableOpcines(cod_modulo, cod_opcion) {

    var configs = {
        [tbOpciones]: {
            action: accionBuscarOpciones,
            cod_modulo: cod_modulo,
            cod_opcion: cod_opcion,
            columns: [
                {data: 'cod_opcion'},
                {
                    data: 'nombre', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'url', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },

                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select">' +
                                '<option value="1"' + (data === '1' ? ' selected' : '') + '>Activo</option>' +
                                '<option value="0"' + (data === '0' ? ' selected' : '') + '>Inactivo</option>' +
                                '</select>';
                        }
                        return data;
                    }
                },

                {
                    data: 'orden',
                    className: 'editable text-right',
                    createdCell: function (td, cellData, rowData, row, col) {
                        //const valorFormateado = Number(cellData).toFixed(0);  // Formatear como número entero sin decimales
                        $(td).attr('contenteditable', 'true').addClass('input-numerico');
                    },
                    //  className: 'text-right'
                },
                {
                    data: 'descripcion',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'cod_empresa',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
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
        }


    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            if (id !== tbRoles) {
                // Destruir la tabla si ya existe
                if ($.fn.DataTable.isDataTable('#' + id)) {
                    $('#' + id).DataTable().clear().destroy();
                }

                // Inicializar la tabla con los nuevos datos
                tablas[id] = initDataTableOpciones('#' + id, configs[id]);

                // Remover eventos antiguos
                $('#' + id + ' tbody').off('blur', 'td[contenteditable="true"]:not(:has(select))');
                $('#' + id + ' tbody').off('change', 'select');
                $('#' + id + ' tbody').off('blur', '.input-numerico[contenteditable="true"]');
                $('#' + id + ' tbody').off('keypress', '.input-numerico[contenteditable="true"]');

                // Manejar celdas editables y filas eliminables
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);
                $('#addRowOpcion').prop('disabled', false);

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

    if (tableId === tbOpciones) {
        var nuevaSecuencia = generarSecuenciaTbOpcion(cod_modulosSeleccionado, cod_opcioneSeleccionado);
        newRowData['cod_opcion'] = nuevaSecuencia;
    }

    // Agregar la nueva fila
    var newRowIndex = table.row.add(newRowData).draw(false).index();
    var $newRow = $(table.row(newRowIndex).node());
    $newRow.addClass('isNew');

    if (tableId === tbOpciones) {
        // Manejo específico para tbOpciones: Ajustar la paginación para mostrar la fila en la página correcta
        var pageInfo = table.page.info();
        var currentPage = pageInfo.page;

        // Calcular la página en la que debería estar la nueva fila
        var newRowIndexInPage = table.row(newRowIndex).index() % pageInfo.length;
        var newPage = Math.floor(newRowIndex / pageInfo.length);

        // Si la fila está en una página diferente, cambiar la página
        if (newPage !== currentPage) {
            table.page(newPage).draw('page');
        }
    }

    // Hacer que todas las celdas sean editables
    $newRow.children().each(function (index) {
        var columnName = table.column(index).dataSrc();
        if (columns.includes(columnName)) {
            $(this).attr('contenteditable', 'true');
        } else {
            $(this).attr('contenteditable', 'false');
        }
    });

    // Enfocar la primera celda editable para empezar a escribir
    $newRow.find('td[contenteditable="true"]:first').focus();
    $newRow.find('td.btnCell').attr('contenteditable', 'false');

    // Si es necesario, deshabilitar edición en los selects
    if (tableId === tbOpciones || tableId === tbRoles) {
        $newRow.find('select').attr('contenteditable', 'false');
        $newRow.find('td:has(select)').attr('contenteditable', 'false');
    }

}


//opner modulos y llenar en la tabla del modal
function fetchDataAndShowModal(tab) {

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionBuscarModulos
        },
        success: function (data) {

            // Agregar la variable `action` a cada fila de datos
            data = data.map(row => {
                row.action = tab;
                return row;
            });
            // Limpiar modal y crear tabla
            $('#modal-modulos .modal-body').empty().append(`
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

            var columns;
            var titulo = 'Listado de Modulos';
            // Configurar el título del modal
            columns = ['cod_modulo', 'nombre'];


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
            $('#modal-modulos .modal-title').text(titulo);
            // Mostrar el modal
            $('#modal-modulos').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });
}

$('#inputCodModulo').on('click', function () {
    fetchDataAndShowModal('opciones');
});

$('#inputCodModuloxRol').on('click', function () {
    fetchDataAndShowModal('opcionesRol');
});

$(document).on('click', '#modalTable tbody tr', function () {
    //Remover clase de selección de todas las filas
    $('#modalTable tbody tr').removeClass('selected');
    //Agregar clase de selección a la fila clickeada
    $(this).addClass('selected');
});

$('#addRowOpcion').on('click', function () {
    addNewRow(tbOpciones, ['nombre', 'url', 'estado', 'orden', 'descripcion', 'cod_empresa']);
});

$('#addRowRol').on('click', function () {
    addNewRow(tbRoles, ['cod_rol', 'nombre', 'descripcion', 'estado']);
});

//despues de aceptar  me optine el valor del modulo seleccionado
$('#modalAcceptButton').on('click', function () {
    var selectedData = $('#modalTable').DataTable().row('.selected').data();
    if (selectedData) {
        if (selectedData.action === 'opciones') {
            selectedDataModulosOpcion = selectedData;
            optenerOpciones();
            encontrarDatosIngresadosaDataRecords(null,selectedDataModulosOpcion.cod_modulo);
        } else if (selectedData.action === 'opcionesRol') {
            selectedDataModulosOpcionRol = selectedData;
            optenerOpcionesXRol();

        }
    } else {
        // console.error('No se ha seleccionado ninguna fila.');
        toastr.info('No se ha seleccionado ninguna fila.');
    }
});

//Se Manda al peticion para optner las opciones para el menu  del tab  de opciones
function optenerOpciones() {
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            action: accionBuscarOpciones,
            cod_modulo: selectedDataModulosOpcion.cod_modulo,
            cod_opcion: null,
        },
        success: function (response) {
            // console.log('Datos recibidos:', response);
            buildMenuOpciones(response, selectedDataModulosOpcion);
            //Refrescar tabla Opciones
            initTableOpcines(selectedDataModulosOpcion.cod_modulo, null)
        },
        error: function (xhr) {
            // console.error('Error en la solicitud:', xhr.responseText);
            toastr.info('Error en la solicitud obtener módulos');
        }
    });
    $('#inputCodModulo').val(selectedDataModulosOpcion.cod_modulo);
    $('#nombre').val(selectedDataModulosOpcion.nombre);
    $(document).trigger('modalRowSelected', [selectedDataModulosOpcion]);
    $('#modal-modulos').modal('hide');
}


//Se Manda al peticion para optner las opciones para el menu  del tab  de opciones x rol
function optenerOpcionesXRol() {

    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            action: accionBuscarOpcionesXRol,
            cod_modulo: selectedDataModulosOpcionRol.cod_modulo,
            cod_rol: selectedRowData.cod_rol,
        },
        success: function (response) {
            // console.log('Datos recibidos:', response);
            buildMenuOpcionesRol(response);

        },
        error: function (xhr) {
            // console.error('Error en la solicitud:', xhr.responseText);
            toastr.info('Error en la solicitud obtener módulos');
        }
    });
    $('#inputCodModuloxRol').val(selectedDataModulosOpcionRol.cod_modulo);
    $('#nombreModulo').val(selectedDataModulosOpcionRol.nombre);
    $('#inputCodRol').val(selectedRowData.cod_rol);
    $('#nombreRol').val(selectedRowData.nombre);
    $(document).trigger('modalRowSelected', [selectedDataModulosOpcionRol]);
    $('#modal-modulos').modal('hide');

}


//// inicializar tabla roles
function initDataTableRoles(id, config) {
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
                $('#' + tbRoles + ' tbody tr:first').trigger('click');
            }

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTableRoles() {

    var configs = {
        [tbRoles]: {
            action: accionBuscarRoles,
            columns: [
                {data: 'cod_rol'},
                {
                    data: 'nombre', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'descripcion',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
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
        }


    };
    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTableRoles('#' + id, configs[id]);
            handleEditableCells(tablas[id], id);
            handleDeleteRows(tablas[id], id);
            handleRowSelection(tablas[id], id);
        }
    }


}

//
//optner datos de la fila seleccionado del latabla roles
function handleRowSelection(table, tableId) {
    table.on('click', 'tr', function () {
        var $row = $(this).closest('tr');
        selectedRowData = table.row($row).data();  // Guardar los datos de la fila seleccionada
        table.$('tr.selected-row').removeClass('selected-row');
        if (selectedRowData) {
            $row.addClass('selected-row');
            $('#inputCodRol').val(selectedRowData.cod_rol);
            $('#nombreRol').val(selectedRowData.nombre);// Asinganar  valores alos  inputs
            if (selectedDataModulosOpcionRol != null) {
                optenerOpcionesXRol();
            }
        } else {
            $('#' + tbRoles + ' tbody tr:first').trigger('click');
        }
    });
}

// FUNCIONES PARA OPTENR REGISTROS

//Funcion para el eliminado de registros
function handleDeleteRows(table, tableId) {

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

        // Validar todas las tablas después de eliminar la fila
        if (validateAllTables()) {
            habilitarElementos();
        } else {
            deshabilitarElementos();
        }

    });
}


// Funcion para ubicar los resgitros segun su accion  nuevos y editados
function updateCellData($cell, table, tableId) {
    var $row = $cell.closest('tr');

    var data = table.row($row).data();
    var codColumn =
        tableId === tbOpciones ? 'cod_opcion' :
            tableId === tbRoles ? 'cod_rol' : '';
    var codValue = $row.find('td:eq(0)').text().trim();
    var nombreValue = $row.find('td:eq(1)').text().trim();

    data[codColumn] = codValue;
    data.nombre = nombreValue;
    if (tableId === tbOpciones) {
        data.url = $row.find('td:eq(2)').text().trim();
        data.orden = parseInt($row.find('td:eq(4)').text().trim());
        data.estado = parseInt($row.find('select.estado-select').val());
        data.descripcion = $row.find('td:eq(5)').text().trim();
        data.cod_empresa = $row.find('td:eq(6)').text().trim();
        data.cod_modulo = selectedDataModulosOpcion.cod_modulo;
        if (cod_opcioneSeleccionado === null) {
            data.cod_modulo_padre = null;
        } else {
            data.cod_modulo_padre = cod_modulosSeleccionado;
        }
        data.cod_opcion_padre = cod_opcioneSeleccionado;

        // data.cod_modulo_padre = cod_modulosSeleccionado;
        //data.cod_opcion_padre = cod_opcioneSeleccionado;
    } else if (tableId === tbRoles) {
        data.descripcion = $row.find('td:eq(2)').text().trim();
        data.estado = parseInt($row.find('select.estado-select').val());
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
            existingRecord.nombre = nombreValue;
            // Actualizar otros campos según sea necesario
            if (tableId === tbOpciones) {
                existingRecord.url = data.url;
                existingRecord.orden = data.orden;
                existingRecord.estado = data.estado;
                existingRecord.descripcion = data.descripcion;
                existingRecord.cod_empresa = data.cod_empresa;
                existingRecord.cod_modulo_padre = data.cod_modulo_padre;
                existingRecord.cod_opcion_padre = data.cod_opcion_padre;
                existingRecord.cod_modulo = data.cod_modulo;
            } else if (tableId === tbRoles) {
                existingRecord.descripcion = data.descripcion;
                existingRecord.estado = data.estado;

            }
        }
    }
}


//funcion para detectar cambios  enlas filas y celdas
function handleEditableCells(table, tableId) {

    table.on('blur', 'td[contenteditable="true"]:not(:has(select))', function () {
        var $cell = $(this);
        celda = $cell;
        var originalText = $cell.text();
        var upperCaseText = originalText.toUpperCase();
        $cell.text(upperCaseText);

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
        if (data) {  // Verificar que data no sea undefined
            updateCellData($cell, table, tableId);
        } else {
            console.error('No data found for the selected row.');
        }
    });
    if (tableId === tbOpciones || tableId === tbRoles) {
        table.on('keypress', '.input-numerico[contenteditable="true"]', function (e) {
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });
    }

    // Restringir la entrada a un máximo de 8 caracteres en la celda cod_rol
    table.on('keydown', 'td[contenteditable="true"]:nth-child(1)', function (e) { // Suponiendo que cod_rol está en la primera columna
        var $cell = $(this);
        var text = $cell.text();

        // Evitar la entrada de más caracteres si ya hay 8 dígitos
        if (text.length >= 8 && e.key !== 'Backspace' && e.key !== 'Delete' && !isArrowKey(e)) {
            e.preventDefault();
        }
    });

}

// permite detectar la flecha del teclado
function isArrowKey(e) {
    return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
}


//Validar los datos antes de guardar cambios
$('#saveChanges').click(function () {
    console.log('Guardando cambios...');
    console.log('Opciones - Añadidos:', dataRecords[tbOpciones].added);
    console.log('Opciones - Actualizados:', dataRecords[tbOpciones].updated);
    console.log('Opciones - Eliminados:', dataRecords[tbOpciones].deleted);
    console.log('Roles - Añadidos:', dataRecords[tbRoles].added);
    console.log('Roles - Actualizados:', dataRecords[tbRoles].updated);
    console.log('Roles - Eliminados:', dataRecords[tbRoles].deleted);
});


// $('#saveChanges').click(function () {
//     console.log('Guardando cambios...');
//     console.log('Opciones - Añadidos:', dataRecords[tbOpciones].added);
//     console.log('Opciones - Actualizados:', dataRecords[tbOpciones].updated);
//     console.log('Opciones - Eliminados:', dataRecords[tbOpciones].deleted);
//     console.log('Roles - Añadidos:', dataRecords[tbRoles].added);
//     console.log('Roles - Actualizados:', dataRecords[tbRoles].updated);
//     console.log('Roles - Eliminados:', dataRecords[tbRoles].deleted);
//
//     $.ajax({
//         url: window.location.pathname,
//         method: 'POST',
//         data: {
//             action: 'save_records',
//             dataRecords: JSON.stringify(dataRecords)
//         },
//         success: function (response) {
//             var results = response.results;
//             var tableOperationPerformed = false;
//
//             for (var tableId in results) {
//                 if (results.hasOwnProperty(tableId)) {
//                     var result = results[tableId];
//                     if (result.status === 'error') {
//                         tableOperationPerformed = true;
//                         $(document).Toasts('create', {
//                             class: 'bg-danger',
//                             title: 'Error',
//                             body: result.message
//                         });
//                     } else if (result.status === 'success') {
//
//                         // Verificar si hubo operaciones en la tabla
//                         if (dataRecords[tableId].added.length > 0 ||
//                             dataRecords[tableId].updated.length > 0 ||
//                             dataRecords[tableId].deleted.length > 0) {
//                             tableOperationPerformed = true;
//                             $(document).Toasts('create', {
//                                 class: 'bg-success',
//                                 title: 'Éxito',
//                                 body: result.message
//                             });
//
//                         }
//
//
//                     }
//                 }
//             }
//             // Después de mostrar todos los mensajes de éxito
//             // if (tableOperationPerformed) {
//             //     // Recargar las tablas y luego resetear dataRecords
//             //     resetDataRecords();
//             //
//             // } else {
//             //     // Si no se realizaron operaciones, mostrar un mensaje de información
//             //     $(document).Toasts('create', {
//             //         class: 'bg-info',
//             //         title: 'Información',
//             //         body: 'No se realizaron operaciones.'
//             //     });
//             // }
//
//             // if (!tableOperationPerformed) {
//             //     $(document).Toasts('create', {
//             //         class: 'bg-info',
//             //         title: 'Información',
//             //         body: 'No se realizaron operaciones.'
//             //     });
//             // }
//
//             // resetDataRecords(); // Descomentar si quieres resetear dataRecords después de guardar
//         },
//         error: function (xhr) {
//             var response = JSON.parse(xhr.responseText);
//             if (response.errors) {
//                 response.errors.forEach(function (error) {
//                     $(document).Toasts('create', {
//                         class: 'bg-danger',
//                         title: 'Error',
//                         body: error.error
//                     });
//                 });
//             } else {
//                 $(document).Toasts('create', {
//                     class: 'bg-danger',
//                     title: 'Error',
//                     body: response.error
//                 });
//             }
//
//             // resetDataRecords(); // Descomentar si quieres resetear dataRecords después de error
//         }
//     });
//
// });

// iniciar la pantalla
$(document).ready(function () {
    // Inicializar las tablas al cargar la página
    initTableRoles();
    $('#addRowOpcion').prop('disabled', true);
});

//

//Optener secuencia para  cod_opcion
function generarSecuenciaTbOpcion(cod_modulo, cod_opcion) {
    // Obtiene los datos actuales de la tabla
    var table = tablas[tbOpciones];
    var data = table.rows().data().toArray();

    // Filtra los valores actuales de la columna cod_opcion
    var opciones = data.map(row => row.cod_opcion);

    // Función para generar la siguiente secuencia en formato 01, 02, 03, etc.
    function generarSecuenciaSimple(opciones) {
        opciones.sort();
        var max = opciones[opciones.length - 1];
        var nextNumber = parseInt(max, 10) + 1;
        return nextNumber.toString().padStart(2, '0');
    }

    // Función para generar la siguiente secuencia en formato 01.01, 01.02, etc.
    function generarSecuenciaConPunto(opciones) {
        var prefix = cod_opcion;
        var secuencias = opciones.filter(opcion => opcion.startsWith(prefix + '.'));
        secuencias.sort();
        var max = secuencias[secuencias.length - 1];
        var nextNumber = parseInt(max.split('.').pop(), 10) + 1;
        return prefix + '.' + nextNumber.toString().padStart(2, '0');
    }

    // Determina si la tabla está vacía
    var tablaVacia = opciones.length === 0;

    // Generar la siguiente secuencia basada en si la tabla está vacía o no
    var nuevaSecuencia;
    if (tablaVacia) {
        if (cod_opcion.includes('.')) {
            // Si cod_opcion tiene un punto, iniciar la secuencia con .01 después del último nivel
            nuevaSecuencia = cod_opcion + '.01';
        } else {
            // Si cod_opcion no tiene un punto, iniciar la secuencia con .01
            nuevaSecuencia = cod_opcion + '.01';
        }
    } else {
        // Determina el formato de secuencia actual
        var tienePunto = opciones.some(opcion => opcion.includes('.'));

        if (tienePunto) {
            nuevaSecuencia = generarSecuenciaConPunto(opciones);
        } else {
            nuevaSecuencia = generarSecuenciaSimple(opciones);
        }
    }

    console.log('nueva secuencia :' + nuevaSecuencia);

    return nuevaSecuencia;
}


//Ordenar el menu de opciones tab opciones
function buildMenuOpciones(data, moduloSeleccionado) {
    var menuContainer = $('#menu');
    menuContainer.empty(); // Limpiar el contenedor

    // Obtener el cod_modulo del primer elemento de data
    var cod_modulo_padre = data.length > 0 ? data[0].cod_modulo : null;

    // Crear un objeto para el módulo padre
    var moduloPadre = {
        cod_modulo: cod_modulo_padre,
        cod_opcion: null,
        nombre: moduloSeleccionado.nombre,
        estado: moduloSeleccionado.estado,
        sub_opciones: []
    };

    // Crear un mapa para fácil acceso a los elementos por su código
    var itemMap = {};
    var processedItems = new Set(); // Conjunto para rastrear elementos procesados

    data.forEach(function (item) {
        if (!itemMap[item.cod_opcion]) {
            itemMap[item.cod_opcion] = {
                ...item,
                sub_opciones: []
            };
        }
    });

    // Asignar sub-opciones
    data.forEach(function (item) {
        if (item.cod_opcion_padre && itemMap[item.cod_opcion_padre]) {
            if (!processedItems.has(item.cod_opcion)) {
                itemMap[item.cod_opcion_padre].sub_opciones.push(itemMap[item.cod_opcion]);
                processedItems.add(item.cod_opcion);
            }
        } else {
            // Si no tiene padre, agregarlo al módulo principal
            moduloPadre.sub_opciones.push(itemMap[item.cod_opcion]);
        }
    });

    // Función recursiva para construir elementos del menú
    function createMenuItem(item, isSubOption) {
        var listItem = $('<li class="menu-item"></li>');
        var link = $('<a href="#"></a>').text(item.nombre);

        // Agregar ícono según el estado
        var statusIcon = $('<i class="status-icon"></i>');
        if (item.estado == 1) {
            statusIcon.addClass('fas fa-check-circle').css('color', 'green'); // Activo
        } else {
            statusIcon.addClass('fas fa-times-circle').css('color', 'red'); // Inactivo
        }
        listItem.append(statusIcon).append(link);

        // Agregar evento click para imprimir valores en consola
        link.click(function () {
            $('.menu-item').removeClass('selected-item');

            // Añadir la clase 'selected-item' al ítem clicado
            listItem.addClass('selected-item');
            initTableOpcines(item.cod_modulo, item.cod_opcion);// mandar para la consulta de opciones
            cod_opcioneSeleccionado = item.cod_opcion;
            cod_modulosSeleccionado = item.cod_modulo;
            encontrarDatosIngresadosaDataRecords(item.cod_opcion, item.cod_modulo)

            $('#nombre_input').val(item.nombre);
            $('#inputCodOpcion').val(item.cod_opcion);
        });

        if (item.sub_opciones && item.sub_opciones.length > 0) {
            var toggleButton = $('<span class="menu-toggle">[-]</span>'); // Iniciar con desplegado
            listItem.prepend(toggleButton);

            var sublist = $('<ul class="menu-sublist"></ul>');
            item.sub_opciones.forEach(function (subItem) {
                sublist.append(createMenuItem(subItem, true));
            });
            listItem.append(sublist);

            toggleButton.click(function () {
                if (sublist.is(':visible')) {
                    sublist.slideUp();
                    toggleButton.text('[+]');
                } else {
                    sublist.slideDown();
                    toggleButton.text('[-]');
                }
            });

            // Inicializar el submenú como visible
            sublist.show();
            toggleButton.text('[-]');
        }
        return listItem;
    }

    // Agregar el módulo principal al contenedor
    var rootMenuItem = createMenuItem(moduloPadre);
    menuContainer.append(rootMenuItem);

    // Inicializar el menú como desplegado
    $('#menu .menu-sublist').show();
    $('#menu .menu-toggle').text('[-]');
}


function encontrarDatosIngresadosaDataRecords(cod_opcion_padre, cod_modulo_padre) {

    if (cod_opcion_padre == null) {
        // agregra los elemnetos la tabla opcion nulla
        var opcionesModuloAdd = dataRecords[tbOpciones].added.filter(function (opcion) {
            return opcion.cod_modulo === cod_modulo_padre && opcion.cod_modulo_padre === null && opcion.cod_opcion_padre === null;
        });
        // Buscar todos los registros actualizados que coincidan
        var opcionesModuloUpdate = dataRecords[tbOpciones].updated.filter(function (opcion) {
            return opcion.cod_modulo === cod_modulo_padre && opcion.cod_modulo_padre === null && opcion.cod_opcion_padre === null;
        });

        // Buscar todos los registros eliminados que coincidan
        var opcionesModuloDelete = dataRecords[tbOpciones].deleted.filter(function (opcion) {
            return opcion.cod_modulo === cod_modulo_padre && opcion.cod_modulo_padre === null && opcion.cod_opcion_padre === null;
        });

        // Imprimir resultados en la consola
        if (opcionesModuloAdd.length > 0) {
            console.log('Nuevos solo modulos nuevos padre raiz  : ', opcionesModuloAdd);
        } else {
            console.log('No hay nuevos datos con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }
        if (opcionesModuloUpdate.length > 0) {
            console.log('Editados modulos : ', opcionesModuloUpdate);
        } else {
            console.log('No hay datos editados con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }

        if (opcionesModuloDelete.length > 0) {
            console.log('Eliminados mmodulo: ', opcionesModuloDelete);
        } else {
            console.log('No hay datos eliminados con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }

    }
    if (cod_modulo_padre !== null && cod_modulo_padre !== null) {
        // Buscar todos los registros añadidos que coincidan
        var opcionesAdd = dataRecords[tbOpciones].added.filter(function (opcion) {
            return opcion.cod_opcion_padre === cod_opcion_padre && opcion.cod_modulo_padre === cod_modulo_padre;
        });

        // Buscar todos los registros actualizados que coincidan
        var opcionesUpdate = dataRecords[tbOpciones].updated.filter(function (opcion) {
            return opcion.cod_opcion_padre === cod_opcion_padre && opcion.cod_modulo_padre === cod_modulo_padre;
        });

        // Buscar todos los registros eliminados que coincidan
        var opcionesDelete = dataRecords[tbOpciones].deleted.filter(function (opcion) {
            return opcion.cod_opcion_padre === cod_opcion_padre && opcion.cod_modulo_padre === cod_modulo_padre;
        });

        // Imprimir resultados en la consola
        if (opcionesAdd.length > 0) {
            console.log('Nuevos: ', opcionesAdd);
        } else {
            console.log('No hay nuevos datos con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }

        if (opcionesUpdate.length > 0) {
            console.log('Editados: ', opcionesUpdate);
        } else {
            console.log('No hay datos editados con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }

        if (opcionesDelete.length > 0) {
            console.log('Eliminados: ', opcionesDelete);
        } else {
            console.log('No hay datos eliminados con cod_opcion_padre: ' + cod_opcion_padre + ' y cod_modulo_padre: ' + cod_modulo_padre);
        }

    }


}


///ordenar menu de opciones tab opciones X rol
function buildMenuOpcionesRol(data) {
    var menuContainer = $('#menuOpcionesRol');
    menuContainer.empty(); // Limpiar el contenedor

    // Obtener el cod_modulo del primer elemento de data
    var cod_modulo_padre = data.length > 0 ? data[0].node_modulo : null;

    // Crear un objeto para el módulo padre
    var moduloPadre = {
        node_modulo: cod_modulo_padre,
        cod_opcion: null,
        node_label: cod_modulo_padre,
        node_state: 1,
        sub_opciones: []
    };

    // Crear un mapa para fácil acceso a los elementos por su código
    var itemMap = {};
    var processedItems = new Set(); // Conjunto para rastrear elementos procesados

    data.forEach(function (item) {
        if (!itemMap[item.node_opcion]) {
            itemMap[item.node_opcion] = {
                ...item,
                sub_opciones: []
            };
        }
    });

    // Asignar sub-opciones
    data.forEach(function (item) {
        if (item.node_opcion_padre && itemMap[item.node_opcion_padre]) {
            if (!processedItems.has(item.node_opcion)) {
                itemMap[item.node_opcion_padre].sub_opciones.push(itemMap[item.node_opcion]);
                processedItems.add(item.node_opcion);
            }
        } else {
            // Si no tiene padre, agregarlo al módulo principal
            moduloPadre.sub_opciones.push(itemMap[item.node_opcion]);
        }
    });

    // Función recursiva para construir elementos del menú
    function createMenuItem(item) {
        var listItem = $('<li class="menuOpcionesRol-item"></li>');
        var link = $('<a href="#"></a>').text(item.node_label);

        // Agregar ícono según el estado
        var statusIcon = $('<i class="status-icon"></i>');
        statusIcon.addClass(item.node_icon); // Usar el ícono proporcionado

        listItem.append(statusIcon).append(link);

        // Agregar evento click para imprimir valores en consola
        link.click(function () {
            dataEstadoOpcionXRol = null;

            // Remover la clase 'selected-item' de todos los ítems
            $('.menuOpcionesRol-item').removeClass('selected-item');

            // Añadir la clase 'selected-item' al ítem clicado
            listItem.addClass('selected-item');

            console.log(item);
            dataEstadoOpcionXRol = item;
        });

        if (item.sub_opciones && item.sub_opciones.length > 0) {
            var toggleButton = $('<span class="menuOpcionesRol-toggle">[-]</span>'); // Iniciar con desplegado
            listItem.prepend(toggleButton);

            var sublist = $('<ul class="menuOpcionesRol-sublist"></ul>');
            item.sub_opciones.forEach(function (subItem) {
                sublist.append(createMenuItem(subItem));
            });
            listItem.append(sublist);

            toggleButton.click(function () {
                if (sublist.is(':visible')) {
                    sublist.slideUp();
                    toggleButton.text('[+]');
                } else {
                    sublist.slideDown();
                    toggleButton.text('[-]');
                }
            });

            // Inicializar el submenú como visible
            sublist.show();
            toggleButton.text('[-]');
        }
        return listItem;
    }

    // Agregar el módulo principal al contenedor
    var rootMenuItem = createMenuItem(moduloPadre);
    menuContainer.append(rootMenuItem);

    // Inicializar el menú como desplegado
    $('#menuOpcionesRol .menuOpcionesRol-sublist').show();
    $('#menuOpcionesRol .menuOpcionesRol-toggle').text('[-]');
}


// cambiar estado deuna opcion  del tab opcionxrol
function cambiarEstado(estado) {
    if (dataEstadoOpcionXRol != null) {

        $.ajax({
            url: window.location.pathname,
            method: 'POST',
            data: {
                action: accionCambiarEstadoOpcionesXRol,
                cod_modulo: dataEstadoOpcionXRol.node_modulo,
                cod_opcion: dataEstadoOpcionXRol.node_opcion,
                estado: estado,
                cod_rol: selectedRowData.cod_rol,
            },
            success: function (response) {
                // console.log('respuesta del  backketd' + response)
                toastr.success('Se a cambio el estado con exito.');
                 optenerOpcionesXRol();
            },
            error: function (xhr) {
                // console.error('Error en la solicitud:', xhr.responseText);
                toastr.info('Error en la solicitud  de Cambiar estado.');
            }
        });

    } else {
        toastr.info('Seleccione una Opcion.');
        console.log(' la variable dataEstadoOpcionXRol esta vacia o nulla ');
    }

}

$('#btnActivar').click(function () {
    cambiarEstado(1);
});
$('#btnInactivo').click(function () {
    cambiarEstado(0);
});
$('#btnOcultar').click(function () {
    cambiarEstado(2);
});

$('#btnCopiar').click(function () {

    if (selectedDataModulosOpcionRol != null) {

        $('#modalCopiarRolLabel').text('Crear Copia ');
        $('#modalCopiarRol').modal('show');
    } else {
        toastr.info('Seleccione un Modulo.');
    }
});
$('#modalCopiarRol').on('hidden.bs.modal', function () {
    $('#formCopiarRol')[0].reset();
});

$('#modalCopiarRol').on('shown.bs.modal', function () {

    $('#codigoRolDestino').val(selectedRowData.cod_rol);

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
                dropdownParent: $('#modalCopiarRol')
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
$('#formCopiarRol').on('submit', function (e) {
    e.preventDefault(); // Evita el envío automático del formulario
    $('#confirmModal').modal('show'); // Muestra el modal de confirmación
});


$('#confirmSave').on('click', function () {
    // Captura los datos del formulario
    var codigoRolOrigen = $('#codigoRolDestino').val();
    var rolSeleccionadoDestino = $('#selectRol').val();
    var cod_modulo = selectedDataModulosOpcionRol.cod_modulo;


    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionCopiarOpcionesRolARol,
            'cod_modulo': cod_modulo,
            'cod_rol_origen': codigoRolOrigen,
            'cod_rol_destino': rolSeleccionadoDestino
        },
        success: function (response) {
            if (response.message.startsWith('Error:')) {
                toastr.error(response.message);
            } else {
                toastr.success(response.message);
            }
        },
        error: function (error) {
            toastr.error('Error ' + error.responseText);
        }
    });

    // Cierra los modales
    $('#confirmModal').modal('hide');
    $('#modalCopiarRol').modal('hide');
});


//validaciones
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
                if (selectedRowData) {
                    //  posicionar la tabla en la fila de selectedRowData
                    var rowSelector = '#' + tbRoles + ' tbody tr[data-id="' + selectedRowData.id + '"]';
                    $(rowSelector).trigger('click');
                } else {
                    $('#' + tbRoles + ' tbody tr:first').trigger('click');
                }
            }, false);
        }
    }
}


function validateRowData(data, tableId) {

    switch (tableId) {
        case tbOpciones:
            console.log('dato de orden : ' + data.orden);
            console.log(typeof data.orden);
            // Convertir a cadena si no lo es
            let ordenStr = data.orden !== null && data.orden !== undefined ? String(data.orden) : '';

            // Verificar si data.orden es una cadena y no está vacía
            let ordenValido = ordenStr.trim() !== '';

            // También puedes verificar si data.orden es un número
            let ordenNumero = !isNaN(data.orden);

            return data.cod_opcion.trim() !== '' && data.nombre.trim() !== '' && (ordenValido || ordenNumero);
        //  return data.cod_opcion.trim() !== '' && data.nombre.trim() !== '' && (data.orden.trim() !== '' || data.orden != null);
        case tbRoles:
            return data.cod_rol.trim() !== '' && data.nombre.trim() !== '';

        default:
            return false;
    }
}

//
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

//
function validateAllTables() {
    var allValid = true;
    for (var tableId in tablas) {
        if (tablas.hasOwnProperty(tableId)) {
            var table = tablas[tableId];
            if (!validateTable(table, tableId)) {
                allValid = false;
                break;
            }
        }
    }
    return allValid;
}

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
    if (!validateRowData(rowData, tableId) || isEmpty) {
        deshabilitarElementos();
        if (isEmpty) {
            toastr.info('Hay campo/s vacíos.');
        }
    } else {
    }
    if (!validateAllTables()) {//
        deshabilitarElementos();
        if (isEmpty) {
            $row.find('.btnEliminar').prop('disabled', false);
            editableCells($row, isEmpty);

        } else {
            $row.find('.btnEliminar').prop('disabled', true);
        }
    } else {
        habilitarElementos();
        editableCells($row, false);

    }
}

function deshabilitarElementos() {
    $('a[data-toggle="pill"]').addClass('disabled');
    $('#saveChanges').prop('disabled', true);
    $('#btnActivar').prop('disabled', true);
    $('#btnInactivo').prop('disabled', true);
    $('#btnOcultar').prop('disabled', true);
    $('#btnCopiar').prop('disabled', true);
    $('#addRowRol').prop('disabled', true);
    $('#addRowOpcion').prop('disabled', true);
    $('.btnEliminar').prop('disabled', true);
    $('#inputCodModulo').prop('disabled', true);

    // Deshabilitar la interacción con el menú de opciones
    $('#menu .menu-item > a').addClass('disabled-link'); // Añadir una clase para deshabilitar
    $('#menu .menu-item').off('click'); // Eliminar eventos 'click' de los elementos del menú


}

function habilitarElementos() {
    $('a[data-toggle="pill"]').removeClass('disabled');
    $('#saveChanges').prop('disabled', false);
    $('#btnActivar').prop('disabled', false);
    $('#btnInactivo').prop('disabled', false);
    $('#btnOcultar').prop('disabled', false);
    $('#btnCopiar').prop('disabled', false);
    $('#addRowRol').prop('disabled', false);
    $('#addRowOpcion').prop('disabled', false);
    $('.btnEliminar').prop('disabled', false);
    $('#inputCodModulo').prop('disabled', false);

    $('#menu .menu-item > a').removeClass('disabled-link');
    $('#menu .menu-item').on('click');

}

$('body').on('blur', 'td[contenteditable="true"]', function () {
    var $cell = $(this);
    var $row = $cell.closest('tr');
    validateRow($row);
});

$('body').on('change', 'select', function () {
    var $select = $(this);
    var $row = $select.closest('tr');
    validateRow($row);
});

// $('body').on('blur', '.input-numerico[contenteditable="true"]', function () {
//     var $cell = $(this);
//     var $row = $cell.closest('tr');
//     validateRow($row);
// });


$('a[data-toggle="pill"]').on('click', function (e) {
    var targetTab = $(this).attr('href');
    var $table = $(targetTab).find('table').DataTable();
    var tableId = $table.attr('id');

    if (!validateTable($table, tableId)) {
        e.preventDefault();
        $(document).Toasts('create', {
            class: 'bg-info',
            title: 'Campos Vacios',
            body: 'Por favor complete todos los campos obligatorios antes de cambiar de pestaña.'
        });
        return false;
    }
});


function isCellAllowedToBeEmpty($cell, tableId) {
    var columnIndex = $cell.index();
    var allowedEmptyColumns = [];

    switch (tableId) {
        case tbOpciones:
            allowedEmptyColumns = [2, 5, 6];
            break;
        case tbRoles:
            allowedEmptyColumns = [2];
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
