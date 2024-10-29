var tablas = {};

var selectedRowData = null;
//  acciones
var accionBuscarAgencias = 'searchdata_agencias';
var accionBuscarUsuariosAgencia = 'searchdata_usuarios_agencia';
var accionBuscarUsuariosxEmpresa = 'searchdata_usuariosxempresa';

//tablas de html
var tbAgencia = 'TablaAgencias';
var tbUsuariosAgencias = 'TablaUsuariosAgencias';

// lista a mandar al backend
var dataRecords = {
    [tbAgencia]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tbUsuariosAgencias]: {
        added: [],
        updated: [],
        deleted: []
    },


};

// Desactivar el alert de tabla vacía en DataTables
$.fn.dataTable.ext.errMode = 'none';

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
                $('#' + tbAgencia + ' tbody tr:first').trigger('click');
            }

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTables() {
    var configs = {
        [tbAgencia]: {
            action: accionBuscarAgencias,
            columns: [
                {data: 'cod_agencia'},
                {
                    data: 'nombre', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
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

        },

    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTable('#' + id, configs[id]);
            handleEditableCells(tablas[id], id);
            handleDeleteRows(tablas[id], id);
            handleRowSelection(tablas[id], id);
        }
    }

}


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
                'cod_agencia': config.cod_agencia
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

function initTables2(cod_agencia) {

    var configs = {
        [tbUsuariosAgencias]: {
            action: accionBuscarUsuariosAgencia,
            cod_agencia: cod_agencia,
            columns: [
                {data: 'cod_usuario', className: 'select-user'},
                //  {data: 'cod_usuario'},

                {data: 'nombreusuario'},

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
            if (id !== tbAgencia) {
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

                // Manejar celdas editables y filas eliminables
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);

                // Evento de clic en la celda cod_usuario
                $('#' + id + ' tbody').off('click', 'td.select-user');

            }
        }
    }

}

//Agregar nueva fila
function addNewRow(tableId, columns) {
    var table = tablas[tableId];
    var newRowData = {};

    columns.forEach(function (column) {
        newRowData[column] = '';
    });

    // Agregar columna 'isNew' siempre
    newRowData.isNew = true;

    $(document).off('modalRowSelected');
    if (tableId === tbUsuariosAgencias) {
        newRowData.cod_agencia = selectedRowData.cod_agencia;

        $(document).on('modalRowSelected', function (event, selectedData) {
            if (selectedData) {
                var action = selectedData.action;
                // Llenar las celdas correspondientes en la nueva fila
                if (action === accionBuscarUsuariosxEmpresa) {
                    $newRow.find('td:eq(0)').text(selectedData.cod_usuario);
                    $newRow.find('td:eq(1)').text(selectedData.nombre);
                }
            }
        });


    }
    var newRow = table.row.add(newRowData).draw().node();
    var $newRow = $(newRow);

    // Añadir clase 'isNew' a la nueva fila
    $newRow.addClass('isNew');

    // Hacer que todas las celdas sean editables
    // $newRow.children().attr('contenteditable', 'true');
    // Hacer que solo las celdas de las columnas específicas sean editables
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
    if (tableId === tbAgencia || tableId === tbUsuariosAgencias) {
        $newRow.find('select').attr('contenteditable', 'false');
        $newRow.find('td:has(select)').attr('contenteditable', 'false'); // No permitir que las celdas que contienen selects sean editables
    }

    $newRow.find('td.select-user').on('click', function () {
        fetchDataAndShowModal();
    });

}

// funcion para cuando interactua con las celdas
function handleEditableCells(table, tableId) {
    var celda;
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


}

function updateCellData($cell, table, tableId) {
    var $row = $cell.closest('tr');

    var data = table.row($row).data();
    var codColumn =
        tableId === tbAgencia ? 'cod_agencia' :
            tableId === tbUsuariosAgencias ? 'cod_usuario' : '';

    var codValue = $row.find('td:eq(0)').text().trim();


    data[codColumn] = codValue;
    //  data.nombre = nombreValue;
    if (tableId === tbAgencia) {
        data.nombre = $row.find('td:eq(1)').text().trim();
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === tbUsuariosAgencias) {
        data.nombreusuario = $row.find('td:eq(1)').text().trim();
        data.estado = parseInt($row.find('select.estado-select').val());
        data.cod_agencia = selectedRowData.cod_agencia;
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
            /// existingRecord.nombre = nombreValue;
            // Actualizar otros campos según sea necesario
            if (tableId === tbAgencia) {
                existingRecord.nombre = data.nombre;
                existingRecord.estado = data.estado;
            } else if (tableId === tbUsuariosAgencias) {
                existingRecord.nombreusuario = data.nombreusuario;
                existingRecord.estado = data.estado;
                existingRecord.cod_agencia = data.cod_agencia;

            }
        }
    }
}

// funcion optener registros eliminados
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

//eventos delos botones

$('#addRowAgencia').on('click', function () {
    addNewRow(tbAgencia, ['cod_agencia', 'nombre', 'estado']);

});

$('#addRowUsuarioAgencia').on('click', function () {
    addNewRow(tbUsuariosAgencias, ['cod_usuario', 'estado']);

});
$('#saveChanges').click(function () {
    var isValid = true;
    // Validar cada tabla antes de guardar cambios
    for (var tableId in dataRecords) {
        if (dataRecords.hasOwnProperty(tableId)) {
            var $table = $('#' + tableId).DataTable();
            if (!validateTable($table, tableId)) {
                isValid = false;
                // console.log('Hay campos obligatorios vacíos en la tabla ' + tableId);
                $(document).Toasts('create', {
                    class: 'bg-info',
                    title: 'Validación',
                    body: 'Por favor complete todos los campos obligatorios antes de guardar los cambios.'
                });
                break; // Salir del bucle si encontramos un error
            }
        }
    }

    // Si todas las tablas son válidas, proceder con la lógica de guardado
    if (isValid && tieneCambiosPendientes()) {

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
    } else {
        $(document).Toasts('create', {
            class: 'bg-warning',
            title: 'Advertencia',
            body: 'No hay cambios pendientes para guardar.'
        });
    }
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


$('#' + tbAgencia + ' tbody').on('click', 'tr', function () {

    var $row = $(this);

    // Verificar si el clic fue en el botón de eliminar
    if ($(event.target).closest('button').hasClass('btnEliminar')) {
        return;
    }
    // Verificar si la fila es nueva o está editada
    if ($(this).hasClass('new-row') || $(this).hasClass('edited-row')) {
        return;
    }
    if ($row.hasClass('selected-row')) {
        return;  // No hacer nada si la fila ya está seleccionada
    }


    //var tableEmpresas = tablas[tbAgencia];
    var rowData = tablas[tbAgencia].row(this).data();
    var cod_agencia = rowData.cod_agencia;
    // var nombre_empresa = rowData.nombre;
    //

    $('#' + tbAgencia + ' tbody tr.selected-row').removeClass('selected-row');
    $(this).addClass('selected-row');

    //
    initTables2(cod_agencia);


});

/// Verificar si hay cambios
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
                    //  posicionar la tabla en la fila de selectedRowData
                    var rowSelector = '#' + tbAgencia + ' tbody tr[data-id="' + selectedRowData.id + '"]';
                    $(rowSelector).trigger('click');
                } else {
                    $('#' + tbAgencia + ' tbody tr:first').trigger('click');
                }
            }, false);
        }
    }
}


//Validaciones

function validateRowData(data, tableId) {
    switch (tableId) {
        case tbAgencia:
            return data.cod_agencia.trim() !== '' && data.nombre.trim() !== '' && data.estado != null;
        case tbUsuariosAgencias:
            return data.cod_usuario.trim() !== '' && data.estado != null;
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
    if (!validateAllTables()) {
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
    $('#addRowAgencia').prop('disabled', true);
    $('#addRowUsuarioAgencia').prop('disabled', true);
    $('.btnEliminar').prop('disabled', true);

}

function habilitarElementos() {
    $('a[data-toggle="pill"]').removeClass('disabled');
    $('#saveChanges').prop('disabled', false);
    $('#addRowAgencia').prop('disabled', false);
    $('#addRowUsuarioAgencia').prop('disabled', false);
    $('.btnEliminar').prop('disabled', false);


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
        case tbAgencia:
            break;
        case tbUsuariosAgencias:
            allowedEmptyColumns = [1];
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


// FUNCION CONSULTAR USUARIOS
function fetchDataAndShowModal() {
    // var action = 'searchdata_usuariosxempresa'
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionBuscarUsuariosxEmpresa
        },
        success: function (data) {

            // Agregar la variable `action` a cada fila de datos
            data = data.map(row => {
                row.action = accionBuscarUsuariosxEmpresa;
                return row;
            });
            // Limpiar modal y crear tabla
            $('#modal-usuarios .modal-body').empty().append(`
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


            var titulo = 'Listado de Usuarios';
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
            $('#modal-usuarios .modal-title').text(titulo);
            // Mostrar el modal
            $('#modal-usuarios').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });
}


// agregar la clase  selected las  filas seleccionadas
$(document).on('click', '#modalTable tbody tr', function () {
    //Remover clase de selección de todas las filas
    $('#modalTable tbody tr').removeClass('selected');
    //Agregar clase de selección a la fila clickeada
    $(this).addClass('selected');
});
// optener la fila seleccionada del modal
$('#modalAcceptButton').on('click', function () {
    var selectedData = $('#modalTable').DataTable().row('.selected').data();
    if (selectedData) {
       // console.log(selectedData)
        $(document).trigger('modalRowSelected', [selectedData]);
        $('#modal-usuarios').modal('hide');
    } else {
        // console.error('No se ha seleccionado ninguna fila.');
        toastr.info('No se ha seleccionado ninguna fila.');

    }
});








