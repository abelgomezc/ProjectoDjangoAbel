var tablas = {};

var selectedRowData = null;
//  acciones
var accionBuscarEmpresas = 'searchdata_empresas';
var accionBuscarParametros = 'searchdata_parametros';
var accionBuscarParametrosNum = 'searchdata_parametros_num';
//tablas de html
var tbEmpresas = 'TablaEmpresas';
var tbParametros = 'TablaParametros';
var tbParametrosNum = 'TablaParametrosNum';
// lista a mandar al backend
var dataRecords = {
    [tbEmpresas]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tbParametros]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tbParametrosNum]: {
        added: [],
        updated: [],
        deleted: []
    }

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
                    data: 'cod_persona',
                    className: 'editable',
                    createdCell: function (td, cellData, rowData, row, col) {
                        //const valorFormateado = Number(cellData).toFixed(0);  // Formatear como número entero sin decimales
                        $(td).attr('contenteditable', 'true').addClass('input-numerico');
                    }
                },

                {data: 'nombre_entidad'},
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


function addNewRow(tableId, columns) {
    var table = tablas[tableId];
    var newRowData = {};

    columns.forEach(function (column) {
        newRowData[column] = '';
    });

    // Agregar columna 'isNew' siempre
    newRowData.isNew = true;
    // Agregar columna 'cod_empresa' si tableId es tbParametros
    if (tableId === tbParametros || tableId === tbParametrosNum) {
        newRowData.cod_empresa = selectedRowData.cod_empresa;
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
    if (tableId === tbEmpresas) {
        $newRow.find('select').attr('contenteditable', 'false');
        $newRow.find('td:has(select)').attr('contenteditable', 'false'); // No permitir que las celdas que contienen selects sean editables
    }
}


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


    if (tableId === tbEmpresas) {
        // Evento 'input' para capturar cambios en el formulario #formEmpresa
        $('#formEmpresa input, #formEmpresa select').on('input', function () {

            $('#formEmpresa input, #formEmpresa select').each(function () {
                // console.log($(this).attr('id'), ':', $(this).val());
            });

            // Llamar a updateCellData para capturar los datos del formulario
            updateCellData(celda, table, tableId);
        });
        //   Restricción para las celdas con la clase 'input-numerico'
        table.on('keypress', '.input-numerico[contenteditable="true"]', function (e) {
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });

    }
    if (tableId === tbParametrosNum) {

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
        tableId === tbEmpresas ? 'cod_empresa' :
            tableId === tbParametros ? 'cod_parametro' :
                tableId === tbParametrosNum ? 'cod_parametro' : '';

    var codValue = $row.find('td:eq(0)').text().trim();
    var nombreValue = $row.find('td:eq(1)').text().trim();


    // Actualizar los datos de la fila con los valores de la celda


    //Verifica que data esté definido antes de intentar modificarlo

    data[codColumn] = codValue;
    data.nombre = nombreValue;
    if (tableId === tbEmpresas) {

        data.estado = parseInt($row.find('select.estado-select').val());
        data.cod_persona = $row.find('td:eq(3)').text().trim();
        data.nro_establecimientos_activos = parseInt($('#nro_establecimientos_activos').val()) || null;
        data.nro_resolucion_contrib_esp = parseInt($('#nro_resolucion_contrib_esp').val()) || null;
        data.fecha_nro_resolucion = $('#fecha_nro_resolucion').val();
        data.cod_rol = $('#cod_rol').val();
        data.crm = $('#crm').val().charAt(0);
    } else if (tableId === tbParametros) {
        data.valor = $row.find('td:eq(2)').text().trim();
        data.observaciones = $row.find('td:eq(3)').text().trim();
        data.cod_empresa = selectedRowData.cod_empresa;
    } else if (tableId === tbParametrosNum) {
        data.valor = parseFloat($row.find('td:eq(2)').text().trim());
        data.observaciones = $row.find('td:eq(3)').text().trim();
        data.cod_empresa = selectedRowData.cod_empresa;
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
            if (tableId === tbEmpresas) {
                existingRecord.estado = data.estado;
                existingRecord.cod_persona = data.cod_persona;
                existingRecord.nro_establecimientos_activos = data.nro_establecimientos_activos;
                existingRecord.nro_resolucion_contrib_esp = data.nro_resolucion_contrib_esp;
                existingRecord.fecha_nro_resolucion = data.fecha_nro_resolucion;
                existingRecord.cod_rol = data.cod_rol;
                existingRecord.crm = data.crm;
            } else if (tableId === tbParametros) {
                existingRecord.valor = data.valor;
                existingRecord.observaciones = data.observaciones;
                existingRecord.cod_empresa = data.cod_empresa;
            } else if (tableId === tbParametrosNum) {
                existingRecord.valor = data.valor;
                existingRecord.observaciones = data.observaciones;
                existingRecord.cod_empresa = data.cod_empresa;
            }
        }
    }
}


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

// Desactivar el alert de tabla vacía en DataTables
$.fn.dataTable.ext.errMode = 'none';

//eventos de añadir filas
$('#addRowEmpresa').on('click', function () {
    addNewRow(tbEmpresas, ['cod_empresa', 'nombre', 'estado', 'cod_persona']);
    clearForm();
});

$('#addRowParametro').on('click', function () {
    addNewRow(tbParametros, ['cod_parametro', 'nombre', 'valor', 'observaciones']);

});
$('#addRowParametroNum').on('click', function () {
    addNewRow(tbParametrosNum, ['cod_parametro', 'nombre', 'valor', 'observaciones']);

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

//boton cancelar
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


// Evento cuando se cambia la imagen seleccionada desde el input
document.getElementById('inputLogoEmpresa').addEventListener('change', function (event) {
    var file = event.target.files[0];
    mostrarImagenSeleccionada(file);
});

// Evento cuando se hace clic en "Seleccionar Imagen"
document.getElementById('seleccionarImagen').addEventListener('click', function () {
    document.getElementById('inputLogoEmpresa').click();
});


document.getElementById('guardarImagen').addEventListener('click', function () {
    // Verificar que `selectedRowData` contiene los datos de la fila seleccionada
    if (!selectedRowData || !selectedRowData.cod_empresa) {
        $(document).Toasts('create', {
            class: 'bg-warning',
            title: 'Advertencia',
            body: 'Por favor selecciona una empresa.'
        });
        return;
    }

    var codEmpresa = selectedRowData.cod_empresa;
    var fileInput = document.getElementById('inputLogoEmpresa');

    if (fileInput.files.length === 0) {
        $(document).Toasts('create', {
            class: 'bg-warning',
            title: 'Advertencia',
            body: 'Por favor selecciona una imagen nueva.'
        });
        return;
    }

    var formData = new FormData();
    formData.append('action', 'save_logo');
    formData.append('cod_empresa', codEmpresa);
    formData.append('logo', fileInput.files[0]);

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log("Imagen guardada exitosamente.");
            $(document).Toasts('create', {
                class: 'bg-success',
                title: 'Éxito',
                body: 'Imagen guardada exitosamente.'
            });
        },
        error: function (xhr, error, code) {
            console.error("Error al guardar la imagen:", error);
            $(document).Toasts('create', {
                class: 'bg-danger',
                title: 'Error',
                body: 'Hubo un error al guardar la imagen. Por favor, inténtalo nuevamente.'
            });
        }
    });
});


document.getElementById('limpiarImagen').addEventListener('click', function () {
    if (!selectedRowData || !selectedRowData.cod_empresa) {
        $(document).Toasts('create', {
            class: 'bg-warning',
            title: 'Advertencia',
            body: 'Por favor selecciona una empresa.'
        });
        return;
    }

    var codEmpresa = selectedRowData.cod_empresa;

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': 'delete_logo',
            'cod_empresa': codEmpresa
        },
        success: function (response) {
            if (response.status === 'success') {
                document.getElementById('logoEmpresa').src = "{% static 'img/sys/nodisponible.png' %}";
                $(document).Toasts('create', {
                    class: 'bg-success',
                    title: 'Éxito',
                    body: 'Imagen eliminada exitosamente.'
                });
            } else {
                $(document).Toasts('create', {
                    class: 'bg-danger',
                    title: 'Error',
                    body: response.message
                });
            }
        },
        error: function (xhr, error, code) {
            console.error("Error al eliminar la imagen:", error);
            $(document).Toasts('create', {
                class: 'bg-danger',
                title: 'Error',
                body: 'Hubo un error al eliminar la imagen. Por favor, inténtalo nuevamente.'
            });
        }
    });
});

document.getElementById('inputLogoEmpresa').value = ''; // Limpiar el input file

// Función para mostrar la imagen seleccionada
function mostrarImagenSeleccionada(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('logoEmpresa').src = e.target.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}


function clearForm() {
    document.getElementById('formEmpresa').reset();

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

// Función para verificar si hay cambios pendientes en dataRecords

$('#' + tbEmpresas + ' tbody').on('click', 'tr', function () {
    //clearForm();
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


    var tableEmpresas = tablas[tbEmpresas];
    var rowData = tableEmpresas.row(this).data();
    var cod_empresa = rowData.cod_empresa;
    var nombre_empresa = rowData.nombre;


    $('#cod_empresa_param').val(cod_empresa);
    $('#nombre_empresa_param').val(nombre_empresa);
    $('#cod_empresa_param_num').val(cod_empresa);
    $('#nombre_empresa_param_num').val(nombre_empresa);

    $('#' + tbEmpresas + ' tbody tr.selected-row').removeClass('selected-row');
    $(this).addClass('selected-row');


    //

    initTables2(cod_empresa);

    //buscar logo
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': 'search_logo',
            'cod_empresa': cod_empresa
        },
        success: function (response) {
            const logoElement = document.getElementById("logoEmpresa");

            if (response.logo) {
                const logoBase64 = response.logo;
                logoElement.src = `data:image/png;base64,${logoBase64}`;
            } else {
                // console.warn('No se encontró el logo para la empresa con el código', cod_empresa);
                logoElement.src = "{% media 'img/sys/nodisponible.png' %}";
            }
        },
        error: function (error) {
            console.error('Error al obtener el logo de la empresa:', error);
        }
    });


    // Buscar primero en dataRecords
    var empresaData = null;
    var empresaFound = false;

    // Buscar en added
    empresaData = dataRecords[tbEmpresas].added.find(function (empresa) {
        return empresa.cod_empresa === cod_empresa;
    });
    if (empresaData) {
        empresaFound = true;
    } else {
        // Buscar en updated
        empresaData = dataRecords[tbEmpresas].updated.find(function (empresa) {
            return empresa.cod_empresa === cod_empresa;
        });
        if (empresaData) {
            empresaFound = true;
        }
    }

    if (empresaFound) {
        // Si la empresa se encontró en dataRecords, rellenar el formulario con los datos encontrados
        $('#cod_empresa_param').val(empresaData.cod_empresa);
        $('#nombre_empresa_param').val(empresaData.nombre);
        $('#cod_empresa_param_num').val(empresaData.cod_empresa);
        $('#nombre_empresa_param_num').val(empresaData.nombre);
        // Llenar los otros campos del formulario según sea necesario

        if (empresaData.nro_establecimientos_activos !== undefined) {
            document.getElementById("nro_establecimientos_activos").value = empresaData.nro_establecimientos_activos;
        }
        if (empresaData.nro_resolucion_contrib_esp !== undefined) {
            document.getElementById("nro_resolucion_contrib_esp").value = empresaData.nro_resolucion_contrib_esp;
        }
        if (empresaData.fecha_nro_resolucion !== undefined) {
            document.getElementById("fecha_nro_resolucion").value = empresaData.fecha_nro_resolucion;
        }
        if (empresaData.cod_rol !== undefined) {
            document.getElementById("cod_rol").value = empresaData.cod_rol;
        }
        if (empresaData.crm !== undefined) {
            document.getElementById("crm").value = empresaData.crm;
        }
    } else {
        // Si no se encontró en dataRecords, hacer la solicitud AJAX para obtener los datos
        $.ajax({
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': 'search_info_empresa',
                'cod_empresa': cod_empresa
            },
            success: function (response) {

                if (response.nro_establecimientos_activos !== undefined) {
                    document.getElementById("nro_establecimientos_activos").value = response.nro_establecimientos_activos;
                }

                if (response.nro_resolucion_contrib_esp !== undefined) {
                    document.getElementById("nro_resolucion_contrib_esp").value = response.nro_resolucion_contrib_esp;
                }

                if (response.fecha_nro_resolucion !== undefined) {
                    document.getElementById("fecha_nro_resolucion").value = response.fecha_nro_resolucion;
                }

                if (response.cod_rol !== undefined) {
                    document.getElementById("cod_rol").value = response.cod_rol;
                }

                if (response.crm !== undefined) {
                    document.getElementById("crm").value = response.crm;
                }
            },
            error: function (error) {
                console.error('Error al obtener la información de la empresa:', error);
            }
        });
    }


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
        [tbParametros]: {
            action: accionBuscarParametros,
            cod_empresa: cod_empresa,
            columns: [
                {data: 'cod_parametro'},
                {
                    data: 'nombre', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'valor', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },

                {
                    data: 'observaciones',
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
        },
        [tbParametrosNum]: {
            action: accionBuscarParametrosNum,
            cod_empresa: cod_empresa,
            columns: [
                {data: 'cod_parametro'},
                {
                    data: 'nombre', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'valor', className: 'editable', createdCell: function (td, cellData, rowData, row, col) {
                        const valorFormateado = Number(cellData).toFixed(2);
                        $(td).attr('contenteditable', 'true').addClass('input-numerico').text(valorFormateado);
                    },
                    className: 'text-right'
                },
                {
                    data: 'observaciones',
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

                // Manejar celdas editables y filas eliminables
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);

            }
        }
    }

}

////
//validar solo enteros en los inputs numericos
$(document).ready(function () {
    // Evitar que se ingresen caracteres no numéricos y negativos
    $('#nro_establecimientos_activos, #nro_resolucion_contrib_esp').on('input', function () {
        var value = $(this).val();
        var newValue = '';

        // Remover caracteres no numéricos y negativos
        for (var i = 0; i < value.length; i++) {
            if (!isNaN(value[i]) && value[i] !== '-' && value[i] !== '.') {
                newValue += value[i];
            }
        }

        // Actualizar el valor del campo
        $(this).val(newValue);
    });
});

///validacionnes
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
                    var rowSelector = '#' + tbEmpresas + ' tbody tr[data-id="' + selectedRowData.id + '"]';
                    $(rowSelector).trigger('click');
                } else {
                    $('#' + tbEmpresas + ' tbody tr:first').trigger('click');
                }
            }, false);
        }
    }
}


function validateRowData(data, tableId) {
    switch (tableId) {
        case tbEmpresas:
            return data.cod_empresa.trim() !== '' && data.nombre.trim() !== '' && data.estado != null && data.crm != null ;
        case tbParametros:
            return data.cod_parametro.trim() !== '' && data.nombre.trim() !== '';
        case tbParametrosNum:
            return data.cod_parametro.trim() !== '' && data.nombre.trim() !== '';
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
    $('#addRowEmpresa').prop('disabled', true);
    $('#addRowParametro').prop('disabled', true);
    $('#addRowParametroNum').prop('disabled', true);
    $('.btnEliminar').prop('disabled', true);
    $('#formEmpresa :input').prop('disabled', true);
    $('#seleccionarImagen').prop('disabled', true);
    $('#guardarImagen').prop('disabled', true);
    $('#limpiarImagen').prop('disabled', true);
}

function habilitarElementos() {
    $('a[data-toggle="pill"]').removeClass('disabled');
    $('#saveChanges').prop('disabled', false);
    $('#addRowEmpresa').prop('disabled', false);
    $('#addRowParametro').prop('disabled', false);
    $('#addRowParametroNum').prop('disabled', false);
    $('.btnEliminar').prop('disabled', false);
    $('#formEmpresa :input').prop('disabled', false);
    $('#seleccionarImagen').prop('disabled', false);
    $('#guardarImagen').prop('disabled', false);
    $('#limpiarImagen').prop('disabled', false);

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
        case tbEmpresas:
            allowedEmptyColumns = [3, 4];
            break;
        case tbParametros:
            allowedEmptyColumns = [2, 3];
            break;
        case tbParametrosNum:
            allowedEmptyColumns = [2, 3];
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
    var isNewRow = $row.hasClass('isNew');

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










