var tablas = {};

var selectedRowData = null;
var cod_persona = 0;
var indetificacioValidad = false;

var currentAction = 'ADD';

var accionFiltrarPersona = 'filtrar_persona';
var accionConsultarDirecciones = 'searchdata_direcciones';
var accionConsultarTelefonos = 'searchdata_telefonos';
var accionConsultarCorreos = 'searchdata_correos';
var accionConsultarPreCliente = 'searchdata_per_cliente';
var accionOptenerPaises = 'searchdata_paises';
var accionOptenerCiudades = 'searchdata_ciudades';
var accionOptenerZonas = 'searchdata_zonas';
var accionOptenerTiposPrecios = 'searchdata_tipo_Precios';
var accionOptenerTiposIdeNat = 'searchdata_RG_TIPO_IDE_NAT';

var accionValidacionIdentificacion = 'validacion_identificacion';
var accionGuardarDatosFormulario = 'guardar_datos_formulario';

var tbPersonas = 'TablaPersonas';
var tbDirecciones = 'TablaDireciones'
var tbTelefonos = 'TablaTelefonos'
var tbCorreos = 'TablaCorreoElectronicos'

var dataRecords = {
    [tbPersonas]: {
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
                $('#' + tbPersonas + ' tbody tr:first').trigger('click');
            }

        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}

function initTables() {
    var configs = {
        [tbPersonas]: {
            action: accionFiltrarPersona,
            ajaxUrl: "{% url 'ventas:buscar-entidades-clientes' %}",
            columns: [
                {data: 'cod_identificacion'},
                {data: 'identificacion'},
                {data: 'nombres'},
                {data: 'direccion'},
                {data: 'telefono'},
                {data: 'nombre_comercial'},
            ],
        },
    };
    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTable('#' + id, configs[id]);
            // handleEditableCells(tablas[id], id);
            //handleDeleteRows(tablas[id], id);
            handleRowSelection(tablas[id], id);
        }
    }

}


function recargarTablas() {
    for (var id in tablas) {
        if (tablas.hasOwnProperty(id)) {
            tablas[id].ajax.reload(function () {
                // handleEditableCells(tablas[id], id);
                //  handleDeleteRows(tablas[id], id);
                // habilitarElementos();
                // $('#' + tbEmpresas + ' tbody tr:first').trigger('click');
                if (selectedRowData) {
                    //  posicionar la tabla en la fila de selectedRowData
                    var rowSelector = '#' + tbPersonas + ' tbody tr[data-id="' + selectedRowData.id + '"]';
                    $(rowSelector).trigger('click');
                } else {
                    $('#' + tbPersonas + ' tbody tr:first').trigger('click');
                }
            }, false);
        }
    }
}


function handleRowSelection(table, tableId) {
    table.on('click', 'tr', function () {
        var $row = $(this).closest('tr');
        selectedRowData = table.row($row).data();
        table.$('tr.selected-row').removeClass('selected-row');
        if (selectedRowData) {
            $row.addClass('selected-row');
            //  console.log(selectedRowData);
            //iniciar los datos  delasd tablas
            initTables2(selectedRowData.cod_persona);
            $('#cod_persona').val(selectedRowData.cod_persona);
            $('#nombre_persona').val(selectedRowData.nombres);
        } else {
            $('#' + tbPersonas + ' tbody tr:first').trigger('click');
        }
    });
}

//LLENAR TABLAS DEL OTROS TAB

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
                'cod_persona': config.cod_persona
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

function initTables2(cod_persona) {

    var configs = {
        [tbDirecciones]: {
            action: accionConsultarDirecciones,
            cod_persona: cod_persona,
            columns: [
                {data: 'nombre_tipo_direccion'},
                {data: 'calle'},
                {data: 'numero'},
                {data: 'interseccion'},

            ],
            editable: true,
            deletable: true
        },
        [tbTelefonos]: {
            action: accionConsultarTelefonos,
            cod_persona: cod_persona,
            columns: [
                {data: 'nombre_tipo_telefono'},
                {data: 'telefono'},

            ],
            editable: true,
            deletable: true
        },
        [tbCorreos]: {
            action: accionConsultarCorreos,
            cod_persona: cod_persona,
            columns: [
                {data: 'cod_catalogo'},
                {data: 'contacto'},

            ],
            editable: true,
            deletable: true
        }

    };


    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            // if (id !== tbEmpresas) {
            // Destruir la tabla si ya existe
            if ($.fn.DataTable.isDataTable('#' + id)) {
                $('#' + id).DataTable().clear().destroy();
            }

            // Inicializar la tabla con los nuevos datos
            tablas[id] = initDataTable2('#' + id, configs[id]);

            // // Remover eventos antiguos
            // $('#' + id + ' tbody').off('blur', 'td[contenteditable="true"]:not(:has(select))');
            // $('#' + id + ' tbody').off('change', 'select');
            // $('#' + id + ' tbody').off('blur', '.input-numerico[contenteditable="true"]');
            // $('#' + id + ' tbody').off('keypress', '.input-numerico[contenteditable="true"]');
            //
            // // Manejar celdas editables y filas eliminables
            // handleEditableCells(tablas[id], id);
            // handleDeleteRows(tablas[id], id);

            // }
        }
    }

}


// document.getElementById('openModalButton').addEventListener('click', function () {
//     $('#modalDatosPersona').modal('show');
// });


// Función para limpiar el formulario
function clearModalForm() {
    $('#modalDatosPersona').find('input[type="text"], input[type="email"], input[type="tel"]').val('');
    $('#modalDatosPersona').find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
    $('#modalDatosPersona').find('select').val('');
    $('#modalDatosPersona').find('textarea').val('');
}

$('#btnNuevorRegistro').on('click', function () {
    // console.log(selectedRowData.cod_persona)

    $('#modalDatosPersona').modal('show');
    clearModalForm();
    habilitarCamposFolmualrio();
    document.getElementById('NAT').checked = true;
    currentAction = 'ADD';
});


$('#btnModificarRegistro').on('click', function () {
    if (selectedRowData && selectedRowData.cod_persona) {
        habilitarCamposFolmualrioEdit();
        fetchDataAndShowModal(accionConsultarPreCliente);
        currentAction = 'EDI';
    } else {
        //console.error('No se ha seleccionado una fila.');
        toastr.info('No se ha seleccionado una fila.');
    }
    // var formData = captureFormData();
    // console.log(formData);
    // saveData(formData, 'EDI');
});

$('#btnGuardar').on('click', function () {
    var formData = captureFormData();
    console.log(formData);
    //saveData(formData, 'ADD');
    // saveData(formData, currentAction);
    if (validateFormData(formData) && indetificacioValidad === true && currentAction === 'ADD') {
        saveData(formData, currentAction);
    }
    if (validateFormData(formData) &&  currentAction === 'EDI') {
        saveData(formData, currentAction);
    }
});
$('#btnCerrar').on('click', function () {
    clearModalForm();
    clearAlerts();
});
//
$('#btnMostrarRegistro').on('click', function () {
    if (selectedRowData && selectedRowData.cod_persona) {
        bloquearCamposFolmualrio();
        fetchDataAndShowModal(accionConsultarPreCliente);

    } else {
        // console.error('No se ha seleccionado una fila.');
        toastr.info('No se ha seleccionado una fila.');
    }
});

//////////////////////
//validar campos
function validateFormData(formData) {
    let missingFields = [];
    // if (!formData.cod_tipo_persona) missingFields.push('Tipo de Persona');
    if (!formData.cod_identificacion) missingFields.push('Tipo de Identificación');
    if (!formData.cod_identificacion) missingFields.push('Identificación');
    // if (!formData.identificacion1) missingFields.push('Identificación');
    //    if(indetificacioValidad === false){
    //        missingFields.push('Verificar Identificación');
    //    }

    if(currentAction === 'ADD' && indetificacioValidad === false){


        // validarIdentificacionInput();
        missingFields.push('Verificar Identificación');
    }
    if (formData.cod_tipo_persona === 'NAT') {
        if (!formData.primer_nombre) missingFields.push('Primer Nombre');
        if (!formData.apellido_paterno) missingFields.push('Apellido Paterno');
    } else if (formData.cod_tipo_persona === 'JUR') {
        if (!formData.nombres) missingFields.push('Razón Social');
    } else {

    }
    if (!formData.direccion) missingFields.push('Calle');
    if (!formData.telefono1 && !formData.telefono2) missingFields.push('Convencional o Celular');
    if (!formData.cod_pais) missingFields.push('Pais');
    if (!formData.cod_zona) missingFields.push('Ciudad');
    if (!formData.cod_zona) missingFields.push('Zona Cliente');
    if (!formData.cod_tipo_precio) missingFields.push('Tipo Precio');

    // Validar campos obligatorios

    // if (!formData.primer_nombre) missingFields.push('Primer Nombre');
    // (!formData.apellido_paterno) missingFields.push('Apellido Paterno');
    // if (!formData.email) missingFields.push('Correo Electrónico');


    // Verificar si hay campos faltantes
    if (missingFields.length > 0) {
        let message = 'Por favor, complete los siguientes campos: ' + missingFields.join(', ');
        showAlert('Error', message, 'alert-danger');
        return false;
    }

    return true;

}


// Función para enviar los datos al servidor
function saveData(formData, acc) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionGuardarDatosFormulario,
            'formData': JSON.stringify(formData),
            'acc': acc
        },
        success: function (response) {
            // console.log('Datos guardados correctamente:', response);
            toastr.success('Datos guardados correctamente:', response);
            $('#modalDatosPersona').modal('hide');
            recargarTablas();
        },
        error: function (xhr, status, error) {
            console.error('Error al guardar los datos:', error);
            // toastr.success('Error al guardar los datos:', error);
            showAlert('Error', 'Error al guardar los datos:' + error, 'alert-info');
        }
    });
}

function captureFormData() {
    let nombres = '';

    // Concatenar apellidos y nombres si el tipo de persona es 'Natural'
    if ($('#NAT').is(':checked')) {
        nombres = $('#apellidosPaternos').val() + ' ' + $('#apellidosMaternos').val() + ' ' +
        $('#primerNombre').val() + ' ' + $('#segundoNombre').val();
    }
    if ($('#JUR').is(':checked')) {
        nombres = $('#razonSocial').val();

    }
    var codPersona = null;
    if(selectedRowData){
        codPersona= selectedRowData.cod_persona || null;
        console.log('======='+selectedRowData.cod_persona);
    }else{
        codPersona= null;
    }

    return {

        cod_empresa: null,
        cod_tipo_persona: $('input[name="tipoPersona"]:checked').val(),

        cod_persona:codPersona,
        nombres: nombres,
        primer_nombre: $('#primerNombre').val(),
        segundo_nombre: $('#segundoNombre').val(),
        apellido_paterno: $('#apellidosPaternos').val(),
        apellido_materno: $('#apellidosMaternos').val(),
        nombre_comercial: $('#nombreComercial').val(),
        estado: 1,
        cod_identificacion: $('#selecttipoIdentificacion').val(),
        identificacion1: $('#identificacion').val(),
        identificacion2: null,
        direccion: $('#direccion').val(), // Dirección
        interseccion: $('#interseccion').val(),
        numero: $('#numero').val(),
        telefono1: $('#convencional').val(),
        telefono2: $('#celular').val(),
        cod_lugar: $('#cod_lugar').val(),
        cod_pais: $('#cod_pais').val(),
        email: $('#correoElectronico').val(),
        cod_zona: $('#cod_zona').val(),
        cod_tipo_precio: $('#cod_tipo_precio').val(),
        cod_categoria: null // Falta en el formulario, se establece como null
    };
}

///mostras regsitro en  modal de persona  seleccionado
function fetchDataAndShowModal(accion) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accion,
            'cod_persona': selectedRowData.cod_persona
        },
        success: function (data) {
            console.log(data);
            populateModal(data);
            $('#modalDatosPersona').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });
}

//ubicar regsotros en cada input
function populateModal(data) {

    if (Array.isArray(data) && data.length > 0) {
        var personaData = data[0];  // Acceder al primer objeto en el array
        $('#NAT').prop('checked', personaData.cod_tipo_persona === 'NAT');
        $('#JUR').prop('checked', personaData.cod_tipo_persona === 'JUR');
        $('#identificacion').val(personaData.identificacion1);
        $('#primerNombre').val(personaData.primer_nombre);
        $('#segundoNombre').val(personaData.segundo_nombre);
        $('#razonSocial').val(personaData.nombres || '');
        $('#apellidosPaternos').val(personaData.apellido_paterno || '');
        $('#apellidosMaternos').val(personaData.apellido_materno || '');
        $('#nombreComercial').val(personaData.nombre_comercial || '');
        $('#cod_pais').val(personaData.cod_pais || '');
        $('#cod_lugar').val(personaData.cod_lugar || '');
        $('#direccion').val(personaData.direccion || '');
        $('#numero').val(personaData.numero || '');
        $('#interseccion').val(personaData.interseccion || '');
        $('#convencional').val(personaData.telefono1 || '');
        $('#celular').val(personaData.telefono2 || '');
        $('#correoElectronico').val(personaData.email || '');
        $('#cod_zona').val(personaData.cod_zona || '');
        $('#cod_tipo_precio').val(personaData.cod_tipo_precio || '');

        setTimeout(function () {
            $('#selecttipoIdentificacion').val('RUC').trigger('change');
        }, 500);

    } else {
        console.error('No se encontraron datos válidos en la respuesta AJAX.');
    }
}


function toggleFields() {
    $('#cod_pais').prop('disabled', true);
    $('#cod_lugar').prop('disabled', true);
    $('#cod_zona').prop('disabled', true);
    $('#cod_tipo_precio').prop('disabled', true);

    if ($('#NAT').is(':checked')) {

        document.getElementById('NAT').checked = true;
        document.getElementById('JUR').checked = false;

        $('#razonSocial').prop('disabled', true).val('');

        $('#selecttipoIdentificacion').prop('disabled', false);
        $('#selecttipoIdentificacion').val('CED').trigger('change');
        $('#apellidosPaternos').prop('disabled', false);
        $('#apellidosMaternos').prop('disabled', false);
        $('#nombreComercial').prop('disabled', false);
        $('#primerNombre').prop('disabled', false);
        $('#segundoNombre').prop('disabled', false);
    } else if ($('#JUR').is(':checked')) {

        document.getElementById('NAT').checked = false;
        document.getElementById('JUR').checked = true;
        $('#razonSocial').prop('disabled', false);
        $('#apellidosPaternos').prop('disabled', true).val('');
        $('#apellidosMaternos').prop('disabled', true).val('');
        $('#primerNombre').prop('disabled', true).val('');
        $('#segundoNombre').prop('disabled', true).val('');
        $('#nombreComercial').prop('disabled', true).val('');
        $('#selecttipoIdentificacion').prop('disabled', true);
        $('#selecttipoIdentificacion').val('RUC').trigger('change');


    }
}

$('input[name="tipoPersona"]').change(function () {
    toggleFields();
});
// llenar  los select
$('#modalDatosPersona').on('shown.bs.modal', function () {

    // Llamar a la función en la carga de la página
    toggleFields();
    // document.getElementById('NAT').checked = true;
    $('#identificacion').prop('required', true);
    var select = $('#selectPais');
    select.empty();
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            'action': accionOptenerPaises
        },
        success: function (data) {
            var paises = data.paises;
            paises.forEach(function (pais) {
                var option = $('<option></option>')
                    .attr('value', pais.cod_pais)
                    .text(pais.nombre);
                select.append(option);
            });
            // Inicializa Select2 después de llenar el select
            select.select2({
                dropdownParent: $('#modalDatosPersona')
            }).on('select2:open', function () {
                setTimeout(function () {
                    document.querySelector('.select2-search__field').focus();
                }, 500);
            });
        },
        error: function (error) {
            console.error("Error al obtener los paises: ", error);
        }
    });
    $('#selectPais').on('change', function () {

        var cod_pais = $(this).val();
        $('#cod_pais').val(cod_pais);
        var selectCiudades = $('#selectCiudad');
        selectCiudades.empty();

        $.ajax({
            url: window.location.pathname,
            method: 'POST',
            data: {
                'action': accionOptenerCiudades,
                'cod_pais': cod_pais,
                'cod_org': 2
            },
            success: function (data) {
                var ciudades = data;
                ciudades.forEach(function (ciudad) {
                    var option = $('<option></option>')
                        .attr('value', ciudad.cod_lugar)
                        .text(ciudad.nom_lugar);
                    selectCiudades.append(option);
                });
                selectCiudades.select2({
                    dropdownParent: $('#modalDatosPersona')
                }).on('select2:open', function () {
                    setTimeout(function () {
                        document.querySelector('.select2-search__field').focus();
                    }, 500);
                });
            },
            error: function (error) {
                console.error("Error al obtener las ciudades: ", error);
            }
        });
    });

    // zona select
    var selectZona = $('#selectZona');
    selectZona.empty();
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            'action': accionOptenerZonas
        },
        success: function (data) {
            data.forEach(function (zona) {
                var option = $('<option></option>')
                    .attr('value', zona.cod_zona)
                    .text(zona.nombre);
                selectZona.append(option);
            });
            selectZona.select2({
                dropdownParent: $('#modalDatosPersona')
            }).on('select2:open', function () {
                setTimeout(function () {
                    document.querySelector('.select2-search__field').focus();
                }, 500);
            });
        },
        error: function (error) {
            console.error("Error al obtener los zonas: ", error);
        }
    });


    //select tipo precios
    var selectTipoPrecios = $('#selectTipoPrecio');
    selectTipoPrecios.empty();
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            'action': accionOptenerTiposPrecios
        },
        success: function (data) {
            data.forEach(function (tipoPrecio) {
                var option = $('<option></option>')
                    .attr('value', tipoPrecio.cod_tipo_precio)
                    .text(tipoPrecio.nombre);
                selectTipoPrecios.append(option);
            });
            selectTipoPrecios.select2({
                dropdownParent: $('#modalDatosPersona')
            }).on('select2:open', function () {
                setTimeout(function () {
                    document.querySelector('.select2-search__field').focus();
                }, 500);
            });
        },
        error: function (error) {
            console.error("Error al obtener los tipos de precio: ", error);
        }
    });

    var selecttipoIdentificacion = $('#selecttipoIdentificacion');
    selecttipoIdentificacion.empty();
    $.ajax({
        url: window.location.pathname,
        method: 'POST',
        data: {
            'action': accionOptenerTiposIdeNat
        },
        success: function (data) {
            data.forEach(function (tipoIdeNat) {
                var option = $('<option></option>')
                    .attr('value', tipoIdeNat.cod_catalogo)
                    .text(tipoIdeNat.nombre);
                selecttipoIdentificacion.append(option);
            });
            selecttipoIdentificacion.select2({
                dropdownParent: $('#modalDatosPersona')
            }).on('select2:open', function () {
                setTimeout(function () {
                    document.querySelector('.select2-search__field').focus();
                }, 500);
            });
        },
        error: function (error) {
            console.error("Error al obtener los tipos indetificacion: ", error);
        }
    });
    $('#selectCiudad').on('change', function () {
        var cod_lugar = $(this).val();
        $('#cod_lugar').val(cod_lugar);
    });
    $('#selectZona').on('change', function () {
        var cod_zona = $(this).val();
        $('#cod_zona').val(cod_zona);
    });
    $('#selectTipoPrecio').on('change', function () {
        var cod_tipo_precio = $(this).val();
        $('#cod_tipo_precio').val(cod_tipo_precio);
    });
    //    $('#identificacion').on('input', function() {
    //        verificarValorIdentificacion();
    //    });
});


$('#modalDatosPersona').on('hide.bs.modal', function () {
    clearAlerts(); // Limpia las alertas cuando el modal se cierra
});

// enviar cod_persona seleccionado
$('#btnSeleccionarPersona').on('click', function () {
    var codPersona = selectedRowData.cod_persona;
    //console.log(selectedRowData);
    window.parent.postMessage({codPersona: codPersona}, '*'); // Envía el mensaje al padre
});


//validar indetificacion

// Evento para el campo de texto de identificación
function showAlert(title, message, alertClass) {
    var alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <strong>${title}</strong> ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;
    $('#alertContainer').html(alertHtml);
}
function clearAlerts() {
    $('#alertContainer').html('');
}




$('#identificacion').on('blur', function () {
    indetificacioValidad = false;
    var identificacionValue = $(this).val();
    var selectValue = $('#selecttipoIdentificacion').val();
    if (!identificacionValue) {
        showAlert('Campo Vacio', 'El campo de identificación no puede estar vacío.', 'alert-info');
        return;
    }
    switch (selectValue) {
        case 'CED':
            if (identificacionValue.length !== 10) {
                showAlert('Cedula Invalida', 'Para CED, la longitud debe ser 10.', 'alert-info');
            } else {
                validarIdentificacion(identificacionValue);
            }
            break;
        case 'RUC':
            if (identificacionValue.length !== 13) {
                showAlert('Ruc Invalido', 'Para RUC, la longitud debe ser 13.', 'alert-info');
            } else {
                validarIdentificacion(identificacionValue);
            }
            break;
        default:
            console.log('Tipo de identificación no válido o no seleccionado.');
            break;
    }
});

function validarIdentificacion(identificacion) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionValidacionIdentificacion,
            'identificacion': identificacion
        },
        success: function (data) {

            if (data.mensaje) {
                showAlert('Alerta', data.mensaje, 'alert-info');
            }
            indetificacioValidad = data.valid;
        },
        error: function (xhr, status, error) {
            console.error('Error al validar identificación:', error);
            showAlert('Error', 'Error al validar identificación. Por favor, inténtalo nuevamente.', 'alert-danger');
        }
    });
}




function bloquearCamposFolmualrio() {

    $('#modalDatosPersona').on('shown.bs.modal', function () {
        // Bloquear todos los campos de entrada y selección dentro del modal
        $('#modalDatosPersona').find('input, select').prop('disabled', true);
        $('#btnGuardar').prop('disabled', true);


    });

}

function habilitarCamposFolmualrio() {
    $('#modalDatosPersona').on('shown.bs.modal', function () {
        // Bloquear todos los campos de entrada y selección dentro del modal
        $('#modalDatosPersona').find('input, select').prop('disabled', false);

        toggleFields();
        $('#btnGuardar').prop('disabled', false);
    });

}

function habilitarCamposFolmualrioEdit() {
    $('#modalDatosPersona').on('shown.bs.modal', function () {
        // Bloquear todos los campos de entrada y selección dentro del modal
        $('#modalDatosPersona').find('input, select').prop('disabled', false);
        $('#NAT').prop('disabled', true);
        $('#JUR').prop('disabled', true);
        $('#selecttipoIdentificacion').prop('disabled', true);
        $('#identificacion').prop('disabled', true);
        $('#razonSocial').prop('disabled', true);
        $('#cod_pais').prop('disabled', true);
        $('#cod_lugar').prop('disabled', true);
        $('#cod_zona').prop('disabled', true);
        $('#cod_tipo_precio').prop('disabled', true);
        $('#btnGuardar').prop('disabled', false);
        //toggleFields();
    });

}


$(function () {
    // carga  los datos en las tablas
    initTables();
});




$('#modalDatosPersona').on('shown.bs.modal', function () {
    $(this).find('input[type="text"], input[type="tel"], input[type="email"]').each(function () {
        // Añade el evento input a cada campo
        $(this).on('input', function () {
            // Convierte el valor a mayúsculas
            this.value = this.value.toUpperCase();
        });
    });
});
// Opcional: remover el evento cuando se cierra el modal para evitar duplicados
$('#modalDatosPersona').on('hidden.bs.modal', function () {
    $(this).find('input[type="text"], input[type="tel"], input[type="email"]').each(function () {
        $(this).off('input');
    });
});