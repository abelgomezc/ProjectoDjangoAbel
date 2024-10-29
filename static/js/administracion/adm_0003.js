var tablas = {};
//  acciones
var accionBuscarModulos = 'searchdata_modulos';


//tablas de html
var tbModulo = 'TablaModulo';

// lista a mandar al backend
var dataRecords = {
    [tbModulo]: {
        added: [],
        updated: [],
        deleted: []
    },


};

// Desactivar el alert de tabla vacía en DataTables
$.fn.dataTable.ext.errMode = 'none';

//Iniciar el llenado delas tablas
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
            // if (json.length > 0) {
            //     $('#' + tbAgencia + ' tbody tr:first').trigger('click');
            // }

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTables() {
    var configs = {
        [tbModulo]: {
            action: accionBuscarModulos,
            columns: [
                {data: 'cod_modulo'},
                {
                    data: 'nombre',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
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

        },

    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTable('#' + id, configs[id]);
            handleEditableCells(tablas[id], id);
            handleDeleteRows(tablas[id], id);
            // handleRowSelection(tablas[id], id);
        }
    }

}

/////
function addNewRow(tableId, columns) {
    var table = tablas[tableId];
    var newRowData = {};

    columns.forEach(function (column) {
        newRowData[column] = '';
    });

    // Agregar columna 'isNew' siempre
    newRowData.isNew = true;
    // Agregar columna 'cod_empresa' si tableId es tbParametros

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
    if (tableId === tbModulo) {
        $newRow.find('select').attr('contenteditable', 'false');
        $newRow.find('td:has(select)').attr('contenteditable', 'false'); // No permitir que las celdas que contienen selects sean editables
    }
}

function handleEditableCells(table, tableId) {

    table.on('blur', 'td[contenteditable="true"]:not(:has(select))', function () {
        var $cell = $(this);
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


}

function updateCellData($cell, table, tableId) {
    var $row = $cell.closest('tr');

    var data = table.row($row).data();
    var codColumn =
        tableId === tbModulo ? 'cod_modulo' : '';


    var codValue = $row.find('td:eq(0)').text().trim();


    data[codColumn] = codValue;
    //  data.nombre = nombreValue;
    if (tableId === tbModulo) {
        data.nombre = $row.find('td:eq(1)').text().trim();
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
            // Actualizar otros campos según sea necesario
            if (tableId === tbModulo) {
                existingRecord.nombre = data.nombre;
                existingRecord.descripcion = data.descripcion;
                existingRecord.estado = data.estado;
            }
        }
    }
}

function handleDeleteRows(table, tableId) {
    // table.off('click', 'button.btnEliminar');
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


        // Revalidar todas las filas
        table.rows().every(function () {
            validateRow($(this.node()));
        });
        // // Validar todas las tablas después de eliminar la fila
        if (validateAllTables()) {
            habilitarElementos();
        } else {
            deshabilitarElementos();
        }

    });
}

//Eventos para los botones
$('#addRowModulo').on('click', function () {
    addNewRow(tbModulo, ['cod_modulo', 'nombre', 'descripcion', 'estado']);
});
//

// $('#saveChanges').click(function () {
//     // Si todas las tablas son válidas, proceder con la lógica de guardado
//     console.log('Guardando cambios...');
//     console.log('Modulo - Añadidos:', dataRecords[tbModulo].added);
//     console.log('Modulo - Actualizados:', dataRecords[tbModulo].updated);
//     console.log('Modulo - Eliminados:', dataRecords[tbModulo].deleted);
//
// });
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

    // Si todas las tablas son válidas, proceder con la lógica de guardado.
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

///  Verificacion si hay cambios
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


// limpiar la variable dataRecords
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


//recargar  las tablas
function recargarTablas() {
    for (var id in tablas) {
        if (tablas.hasOwnProperty(id)) {
            tablas[id].ajax.reload(function () {
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);
                habilitarElementos();
            }, false);
        }
    }
}


/// Validaciones
function validateRowData(data, tableId) {
    switch (tableId) {
        case tbModulo:
            return data.cod_modulo.trim() !== '' && data.nombre.trim() !== '' && data.estado != null;
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

// Validacion de celdas
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

    $('#saveChanges').prop('disabled', true);
    $('#addRowModulo').prop('disabled', true);
    $('.btnEliminar').prop('disabled', true);

}

function habilitarElementos() {
    $('#saveChanges').prop('disabled', false);
    $('#addRowModulo').prop('disabled', false);
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


$('body').on('click', 'tr', function () {
    var $row = $(this);
    validateRow($row);
});


function isCellAllowedToBeEmpty($cell, tableId) {
    var columnIndex = $cell.index();
    var allowedEmptyColumns = [];
    switch (tableId) {
        case tbModulo:
            allowedEmptyColumns = [2];
            break;
        default:
            break;
    }

    return allowedEmptyColumns.includes(columnIndex);
}

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
