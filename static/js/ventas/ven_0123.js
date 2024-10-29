var tablas = {};


var codPersonaSeleccionadoCre_0020 = null;
var selectedRowData = null;
var accionBuscarAgentes = 'searchdata_agentes';
var accionOptenerPaises = 'searchdata_paises';
var accionOptenerCiudades = 'searchdata_ciudades';
var accionOptenerTiposTelefonos = 'searchdata_RG_TIPOS_TELEFONO';
var accionOptenerDirecciones = 'searchdata_direcciones';

var btnItems;
var btnBodega;

var accionOptenerRgCorreos = 'searchdata_rg_correos'
var accionValidacionIdentificacion = 'validacion_identificacion';
var accionOptenerRgTelfonos = 'searchdata_rg_telefonos';
var accionOptenerRgCoordinadores = 'searchdata_rg_coordinadores';
var accionValidarClienteZona = 'validar_cliente_zona';
var accionIniciarForma = 'iniciar_forma';
var accionPostQuery = 'post_query';
var accionVerificacionNegociacion = 'verificacion_negociacion';
var accionOptenerRgItem = 'searchdata_rg_item';
var accionOptenerRgBodegasLotes = 'searchdata_rg_bodegas_lotes';

var identificacion = null;
var buscarClientesUrl = "{% url 'ventas:buscar-entidades-clientes' %}";
var accionOptenertiposID = 'searchdata_tipo_ID';
var accionOptenerTIPOS_NEG = 'searchdata_RG_TIPOS_NEG'
var tbDetalle = 'TablaDetalle'
var accionOptenerPedidoDetalle = 'consultar_pedido_detalle'

var nro_comprobante_cobro = 0;
//var fechaEmision = null;


var dataRecords = {
    [tbDetalle]: {
        added: [],
        updated: [],
        deleted: []
    },

};

function ingresarFechaActual() {
    //  window.onload = function () {
    var fechaEmision = document.getElementById('fechaEmision');
    var now = new Date();

    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + now.getDate()).slice(-2);
    var hours = ('0' + now.getHours()).slice(-2);
    var minutes = ('0' + now.getMinutes()).slice(-2);
    var seconds = ('0' + now.getSeconds()).slice(-2);
    // Set the value of the input
    fechaEmision.value = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
    //};

}

// optiene la fecha actual
$('#btnAgentes').on('click', function () {
    // fetchDataAndShowModalAgentes(accionListarAgentes);
    fetchDataAndShowModal(accionBuscarAgentes);
});

$('#btnPaises').on('click', function () {
    fetchDataAndShowModal(accionOptenerPaises);
});

$('#btnDireccion').on('click', function () {
    fetchDataAndShowModal(accionOptenerDirecciones);
});

$('#rg_telefonos').on('click', function () {
    fetchDataAndShowModal(accionOptenerRgTelfonos); //
});
$('#rg_correos').on('click', function () {
    fetchDataAndShowModal(accionOptenerRgCorreos); //
});
$('#rg_coordinadores').on('click', function () {
    fetchDataAndShowModal(accionOptenerRgCoordinadores); //
});
//
$('#btnGuardar').on('click', function () {

//    var formData = {};
//    $('#form_cabezera').find('input, select, textarea').each(function () {
//        var inputId = $(this).attr('id');  // Obtiene el id del input
//        var inputValue = $(this).val();    // Obtiene el valor del input
//        if (inputId) {
//            formData[inputId] = inputValue;
//        }
//    });
//    var datosTabla = [];
//    tabla.rows().every(function (rowIdx, tableLoop, rowLoop) {
//        var data = this.data();
//        var registro = {
//            cod_item: data.cod_item,
//            descripcion: data.descripcion,
//            unidad: data.unidad,
//            cod_bodega: data.cod_bodega,
//            cod_sub_bodega: data.cod_sub_bodega,
//            lv_nom_bodega: data.lv_nom_bodega,
//            saldo_disponible: data.saldo_disponible,
//            cantidad_pedido_vta: data.cantidad_pedido_vta,
//            cantidad: data.cantidad,
//            ln_porc_descuento: data.ln_porc_descuento,
//            precio: data.precio,
//            iva_item: data.iva_item,
//            ln_valor_neto: data.ln_valor_neto,
//            promocion: data.promocion,
//            isNew: data.isNew,
//        };
//
//        // añadimos
//        datosTabla.push(registro);
//    });


   // console.log(datosTabla);
    console.log(pedidoCabecera);
   // console.log(formData);
  //console.log(listaDetalles);
    listaDetalles.forEach((detalle, index) => {
        console.log(detalle);
    });
});


//////////////
function fetchDataAndShowModal(accion) {

    $.ajax({
        url: window.location.pathname,
        type: 'GET',
        data: {
            'action': accion,
            'cod_cliente': $("#cod_cliente").val(),
            'cod_zona': $("#cod_zona").val(),
            'fecha_emision': $("#fechaEmision").val()
        },
        success: function (data) {
            if (accion === accionBuscarAgentes) {
                llenarDatosModalAgentes(data, accion);
            }
            // if (accion === accionOptenerPaises) {
            //     llenarDatosModalPaises(data, accion);
            //
            // }
            if (accion === accionOptenerDirecciones) {
                llenarDatosModalDirecciones(data, accion);

            }
            if (accion === accionOptenerRgTelfonos) {
                llenarDatosModalTelefonos(data, accion);

            }
            if (accion === accionOptenerRgCorreos) {
                llenarDatosModalCorreos(data, accion);

            }
            if (accion === accionOptenerRgCoordinadores) {
                llenarDatosModalCoordinadores(data, accion);

            }
            // if (accion === accionOptenerRgItem) {
            //     llenarDatosModalDetalle(data, accion);
            //
            // }

        },
        error: function (xhr, status, error) {
            //console.error('Error al obtener los datos:', error);
            toastr.warning('No hay registros .');
        }
    });
}

function llenarDatosModalAgentes(data, accion) {

    data = data.map(row => {
        row.action = accion;
        return row;
    });
    // Limpiar modal y crear tabla
    $('#modalDatos .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Zona</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Agentes';
    // Configurar el título del modal
    columns = ['cod_agente', 'nombre', 'cod_zona'];


    // Llenar la tabla con los datos
    var table = $('#modalTable').DataTable({
        data: data,
        columns: [
            {data: columns[0], title: 'Código'},
            {data: columns[1], title: 'Nombre'},
            {data: columns[2], title: 'Zona'}
        ],
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true
    });
    $('#modalDatos .modal-title').text(titulo);
    // Mostrar el modal
    $('#modalDatos').modal('show');
    ajustarTamanoModal();


}


function llenarDatosModalDirecciones(data, accion) {

    data = data.map(row => {
        row.action = accion;
        return row;
    });

    $('#modalDatos .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Secuencia</th>
                            <th>Tipo</th>
                            <th>Pais</th>
                            <th>Lugar</th>
                            <th>Calle</th>
                            <th>Nro</th>
                            <th>Interseccion</th>

                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Direcciones';
    columns = ['secuencia', 'tipo_direccion', 'cod_pais', 'cod_lugar', 'calle', 'numero', 'interseccion'];
    var table = $('#modalTable').DataTable({
        data: data,
        columns: [
            {data: columns[0]},
            {data: columns[1]},
            {data: columns[2]},
            {data: columns[3]},
            {data: columns[4]},
            {data: columns[5]},
            {data: columns[6]}

        ],
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true
    });
    $('#modalDatos .modal-title').text(titulo);
    // Mostrar el modal
    $('#modalDatos').modal('show');
    ajustarTamanoModal();


}


function llenarDatosModalTelefonos(data, accion) {

    data = data.map(row => {
        row.action = accion;
        return row;
    });

    $('#modalDatos .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Secuencia</th>
                            <th>Tipo</th>
                            <th>Telefono</th>
                            <th>Cod Telefono</th>


                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Telefonos';
    columns = ['secuencia', 'tipo_telefono', 'telefono', 'cod_telefono',];
    // Llenar la tabla con los datos
    var table = $('#modalTable').DataTable({
        data: data,
        columns: [
            {data: columns[0]},
            {data: columns[1]},
            {data: columns[2]},
            {data: columns[3]},

        ],
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true
    });
    $('#modalDatos .modal-title').text(titulo);
    $('#modalDatos').modal('show');
    ajustarTamanoModal();


}


function llenarDatosModalCorreos(data, accion) {
    // Agregar la variable `action` a cada fila de datos
    data = data.map(row => {
        row.action = accion;
        return row;
    });
    // Limpiar modal y crear tabla
    $('#modalDatos .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Secuencia</th>
                            <th>Tipo</th>
                            <th>Contacto</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Correos';
    // Configurar el título del modal
    columns = ['secuencia', 'tipo_correo', 'contacto',];


    // Llenar la tabla con los datos
    var table = $('#modalTable').DataTable({
        data: data,
        columns: [
            {data: columns[0]},
            {data: columns[1]},
            {data: columns[2]},


        ],
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true
    });
    $('#modalDatos .modal-title').text(titulo);
    // Mostrar el modal
    $('#modalDatos').modal('show');
    ajustarTamanoModal();


}


function llenarDatosModalCoordinadores(data, accion) {
    // Agregar la variable `action` a cada fila de datos
    data = data.map(row => {
        row.action = accion;
        return row;
    });
    // Limpiar modal y crear tabla
    $('#modalDatos .modal-body').empty().append(`
                <table id="modalTable" class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            <th>Prioridad</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Coordinadores';
    // Configurar el título del modal
    columns = ['cod_coordinador', 'nombre', 'prioridad',];


    // Llenar la tabla con los datos
    var table = $('#modalTable').DataTable({
        data: data,
        columns: [
            {data: columns[0]},
            {data: columns[1]},
            {data: columns[2]},


        ],
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true
    });
    $('#modalDatos .modal-title').text(titulo);
    // Mostrar el modal
    $('#modalDatos').modal('show');
    ajustarTamanoModal();


}


// En ven_0123.js
$('#btnBuscarClientes').on('click', function () {
    $('#modalIframe').attr('src', buscarEntidadesClientesUrl);
    $('#myModal').modal('show');
});


//////////

// function handleRowSelection(table, tableId) {
//     table.on('click', 'tr', function () {
//         var $row = $(this).closest('tr');
//         selectedRowData = table.row($row).data();  // Guardar los datos de la fila seleccionada
//         table.$('tr.selected-row').removeClass('selected-row');
//         if (selectedRowData) {
//             $row.addClass('selected-row');
//             console.log(selectedRowData)
//         } else {
//             $('#' + tbPersonas + ' tbody tr:first').trigger('click');
//         }
//     });
// }

// modales presentes en la ven_0123 cabecera
$(document).on('click', '#modalTable tbody tr', function () {
    $('#modalTable tbody tr').removeClass('selected');
    $(this).addClass('selected');
});


//function ajustarTamanoModal() {
//
//    var tableHeight = $('#modalTable').outerHeight(true);
//    var modalBody = $('#modalDatos .modal-body');
//    var modalDialog = $('#modalDatos .modal-dialog');
//
//
//    modalBody.css('max-height', 'none');
//    modalDialog.css('max-height', 'none');
//
//
//    if (tableHeight < 300) {
//        modalBody.css('max-height', 'auto');
//    } else {
//        modalBody.css('max-height', '60vh');
//    }
//}

function loadIdentificationTypes() {

    $.ajax({
        url: window.location.pathname,
        type: 'GET',
        data: {
            action: accionOptenertiposID
        },
        success: function (data) {
            var select = $('#LV_COD_IDENTIFICACION');
            select.empty();
            //  select.append('<option value="">Seleccione una opción</option>');
            data.forEach(function (item) {
                select.append('<option value="' + item.cod_catalogo + '">' + item.nombre + '</option>');
            });
        },
        error: function (error) {
            console.error('Error al cargar los tipos de identificación:', error);
        }
    });
}

function loadtelefonosTypes() {

    $.ajax({
        url: window.location.pathname,
        type: 'GET',
        data: {
            action: accionOptenerTiposTelefonos
        },
        success: function (data) {
            var select = $('#LV_COD_TELEFONO');
            select.empty();
            //  select.append('<option value="">Seleccione una opción</option>');
            data.forEach(function (item) {
                select.append('<option value="' + item.cod_catalogo + '">' + item.nombre + '</option>');
            });
        },
        error: function (error) {
            console.error('Error al cargar los tipos de telefonos:', error);
        }
    });
}

function loadRG_TIPOS_NEG() {

    $.ajax({
        url: window.location.pathname,
        type: 'GET',
        data: {
            action: accionOptenerTIPOS_NEG
        },
        success: function (data) {
            var select = $('#LV_NEGOCIACION');
            select.empty();
            select.append('<option value="">Seleccione una opción</option>');
            data.forEach(function (item) {
                select.append('<option value="' + item.cod_tipo_negociacion + '">' + item.nombre + '</option>');
            });
        },
        error: function (error) {
            console.error('Error al cargar los tipos de identificación:', error);
        }
    });
}


//evento para cuano cargar la pagina
$(function () {
    // carga  los datos en las tablas
    loadIdentificationTypes();
    loadRG_TIPOS_NEG();
    //iniciarForma();
    loadtelefonosTypes();
    llenarSelector();


    if (accion === 'MOS' || accion === 'MOD') {
        pedidoCabecera = new PedidoCabecera();
        mostrarDatosCab();
        mostarDatosCabezeraForm();
        mostarpedidodeto();

    }
    if (accion === 'ING') {
        pedidoCabecera = new PedidoCabecera();
        iniciarForma();
        listaDetalles = [];
    }


});


function llamardatosporidentificacion() {

    var identificacionValue = $('#identificacion').val();
    if (!identificacionValue) {
        // toastr.info('Campo Identificación vacío.');
        $('#LV_COD_IDENTIFICACION').val('');
        $('#cod_tipo_persona').val('');
    } else {
        validarIdentificacion(identificacionValue);
    }

}


let pedidoCabecera;
$('#identificacion').on('blur', function () {
    var identificacionValue = $(this).val();

    if (!identificacionValue) {
        toastr.info('Campo Identificación vacío.');
        $('#LV_COD_IDENTIFICACION').val('');
        $('#cod_tipo_persona').val('');
    } else {
        validarIdentificacion(identificacionValue);


        // if (identificacionValue.length === 10 || identificacionValue.length === 13) {
        //     var tercerDijito = parseInt(identificacionValue.charAt(2)); // Tercer dígito (0-indexado)
        //     if (identificacionValue.length === 10) {
        //         $('#LV_COD_IDENTIFICACION').val('CED');
        //     } else if (identificacionValue.length === 13) {
        //         $('#LV_COD_IDENTIFICACION').val('RUC');
        //     }
        //     if (tercerDijito >= 6) {
        //         $('#cod_tipo_persona').val('JUR');
        //     } else if (tercerDijito < 6) {
        //         $('#cod_tipo_persona').val('NAT');
        //     }
        // } else {
        //     console.log('Identificación con longitud no válida');
        //     // $('#cod_tipo_persona').val(''); // Desmarcar la selección
        //     // toastr.error('Longitud de identificación no válida.');
        // }
    }
});

//validar campo de identificacion
function validarIdentificacion(identificacion) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionValidacionIdentificacion,
            'identificacion': identificacion
        },
        success: function (data) {
            if (data.mensaje === null) {
                //console.log(data);
                //  const pedidoCabecera = new PedidoCabecera();


                pedidoCabecera.identificacion = $('#identificacion').val();
                pedidoCabecera.lv_cod_identificacion = data.lv_cod_identificacion
                pedidoCabecera.cod_tipo_persona = data.cod_tipo_persona;
                pedidoCabecera.cod_cliente = data.cod_cliente;


//                $('#cod_cliente').val(data.cod_cliente);
//                $('#LV_COD_IDENTIFICACION').val(data.lv_cod_identificacion);
//                $('#cod_tipo_persona').val(data.cod_tipo_persona);
                // validarClienteZona();
                datosCliente(data.cod_cliente);
                //postQuery();
            } else {
                toastr.error(data.mensaje);
            }
        },
        error: function (xhr, status, error) {
            // console.error('Error al validar identificación:', error);
            toastr.error('Error al validar identificación. Por favor, inténtalo nuevamente.');
        }
    });
}


function optenerIdentificacion(codPersona) {
    // document.getElementById('cod_cliente').value = codPersona;

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': 'obtener_identificacion',
            'cod_cliente': codPersona
        },
        success: function (data) {
            identificacion = data;
            $('#identificacion').val(identificacion);

        },
        error: function (xhr, status, error) {
            console.error('Error :', error);
            // toastr.error('Error ');
        }
    });
}


function validarClienteZona() {

    if ($("#cod_cliente").val()) {
        if (!$("#cod_agente").val()) {
            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: {
                    'action': accionValidarClienteZona,
                    'cod_cliente': $("#cod_cliente").val(),
                    'cod_agente': $("#cod_agente").val()
                },
                success: function (data) {
                    if (data.msNoPertenece === null) {

                        pedidoCabecera.cod_agente = data.cod_agente;
                        pedidoCabecera.nom_agente = data.nom_agente;
                        pedidoCabecera.cod_zona = data.cod_zona;
                        pedidoCabecera.cod_coordinador = data.cod_coordinador;

                        if (pedidoCabecera.cod_coordinador === null || pedidoCabecera.cod_coordinador === '') {
                            if (pedidoCabecera.cod_zona !== null) {
                                pedidoCabecera.cod_coordinador = data.cod_coordinador;
                            }
                        }
                        console.log("tengo valor  codagente validarClienteZona   " + pedidoCabecera.cod_agente);


                        // console.log(data);
                    } else {
                        toastr.error(data.msNoPertenece);
                        pedidoCabecera.cod_agente = null;
                        pedidoCabecera.nom_agente = null;
                        pedidoCabecera.cod_zona = null;
                        $('#cod_agente').val('');
                        $('#nombre_agente').val('');
                        $('#cod_zona').val('');

                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error al validar cliente zona : ', error);
                    // toastr.error('Error al validar cliente zona .', error);
                }
            });
        }
    }

}


function iniciarForma() {

    $.ajax({
        url: window.location.pathname,
        type: 'GET',
        data: {
            'action': accionIniciarForma,
        },
        success: function (data) {
            console.log(data);
            $('#cod_comprobante').val(data.cod_comprobante);
            $('#fechaEmision').val(data.fecha_emision);
            $('#cod_moneda').val(data.cod_moneda);
            $('#cod_pais').val(data.cod_pais);
            $('#nombre_pais').val(data.nombre_pais);
        },
        error: function (xhr, status, error) {
            console.error('Error aL INICIAR FORMA: ', error);
            // toastr.error('Error al validar cliente zona .', error);
        }
    });
}


function postQuery() {

    //console.log('postQuery');
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionPostQuery,
            'cod_cliente': $("#cod_cliente").val(),
            'nro_comprobante_cobro': nro_comprobante_cobro,
            'identificacion': $("#identificacion").val(),
            'fecha_emision': new Date().toISOString()
        },
        success: function (data) {


            pedidoCabecera.secuencia_direccion = data.secuencia_direccion;
            pedidoCabecera.calle = data.calle;
            pedidoCabecera.nro = data.numero;
            pedidoCabecera.interseccion = data.interseccion;
            pedidoCabecera.cod_pais = data.cod_pais;
            pedidoCabecera.cod_lugar = data.cod_lugar;
            pedidoCabecera.lv_direccion = data.lv_direccion;
            pedidoCabecera.telefono = data.telefono;
            pedidoCabecera.lv_nom_secuencia_telefono = data.lv_nom_secuencia_telefono;
            pedidoCabecera.email.data = email;
            pedidoCabecera.ln_anticipos_cliente = data.ln_anticipos_cliente;
            pedidoCabecera.ln_saldos_cliente = data.ln_saldos_cliente;
            pedidoCabecera.cod_tipo_persona = data.cod_tipo_persona;
            pedidoCabecera.lv_cod_identificacion = data.lv_cod_identificacion;


            mostarDatosCabezeraForm();
        },
        error: function (xhr, status, error) {
            console.error('Error en post query : ', error);
            // toastr.error('Error al validar cliente zona .', error);
        }
    });

}

function datosCliente(codPersona) {

    console.log('datosCliente');
    ingresarFechaActual();
    document.getElementById('cod_cliente').value = codPersona;
    document.getElementById('cod_pais').value = '593';
    if (accion !== 'MOS' || accion !== 'MOD') {
        validarClienteZona();
    }

    optenerIdentificacion(codPersona);
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': 'datos_cliente',
            'cod_cliente': codPersona,
            'fecha_emision': new Date().toISOString()
        },
        success: function (data) {
            console.log(data);
            if (accion !== 'MOS') {
                verificacionNegociacion(data.lv_negociacion_db, data.lv_documentacion, data.ln_plazo);

            }
            // verificacionNegociacion(data.lv_negociacion_db, data.lv_documentacion, data.ln_plazo);
            pedidoCabecera.cod_cliente = data.cod_cliente;
            pedidoCabecera.nombre_cliente = data.nombre_cliente;
            pedidoCabecera.email = data.email;
            pedidoCabecera.secuencia_direccion = data.secuencia_direccion;
            pedidoCabecera.secuencia_telefono = data.secuencia_telefono;
            pedidoCabecera.secuencia_correo = data.secuencia_correo;
            pedidoCabecera.lv_nom_negociacion_cliente = data.lv_nom_negociacion_cliente;
            pedidoCabecera.lv_categoria = data.lv_categoria;
            pedidoCabecera.ln_plazo = data.ln_plazo;
            pedidoCabecera.ln_cupo = data.ln_cupo;
            pedidoCabecera.ln_saldo_vencido = data.ln_saldo_vencido;
            pedidoCabecera.lv_negociacion_db = data.lv_negociacion_db
            pedidoCabecera.lv_cod_categoria = data.lv_cod_categoria;
            pedidoCabecera.lv_negociacion = data.lv_negociacion_db;
            postQuery();
        },
        error: function (xhr, status, error) {
            console.error('Error :', error);
            // toastr.error('Error ');
        }
    });

}


function mostarDatosCabezeraForm() {

    $('#cod_cliente').val(pedidoCabecera.cod_cliente);
    $('#LV_COD_IDENTIFICACION').val(pedidoCabecera.lv_cod_identificacion);
    $('#cod_tipo_persona').val(pedidoCabecera.cod_tipo_persona);
    $('#nombre_cliente').val(pedidoCabecera.nombre_cliente);
    $('#email').val(pedidoCabecera.email);
    $('#secuencia_direccion').val(pedidoCabecera.secuencia_direccion);
    $('#secuencia_telefono').val(pedidoCabecera.secuencia_telefono);
    $('#secuencia_correo').val(pedidoCabecera.secuencia_correo);
    $('#lv_nom_negociacion_cliente').val(pedidoCabecera.lv_nom_negociacion_cliente);
    $('#lv_categoria').val(pedidoCabecera.lv_categoria);
    $('#ln_plazo').val(pedidoCabecera.ln_plazo);
    $('#ln_cupo').val(pedidoCabecera.ln_cupo);
    $('#ln_saldo_vencido').val(pedidoCabecera.ln_saldo_vencido);
    $('#LV_NEGOCIACION').val(pedidoCabecera.lv_negociacion_db);

    // console.log(data);
    $('#secuencia_direccion').val(pedidoCabecera.secuencia_direccion);
    $('#calle').val(pedidoCabecera.calle);
    $('#NRO').val(pedidoCabecera.numero);
    $('#interseccion').val(pedidoCabecera.interseccion);
    $('#cod_pais').val(pedidoCabecera.cod_pais);
    // $('#selectPais').val(data.cod_pais);
    $('#selectPais').val(pedidoCabecera.cod_pais).trigger('change');
    $('#cod_lugar').val(pedidoCabecera.cod_lugar);
    // $('#selectLugar').val(data.cod_lugar);
    $('#selectLugar').val(pedidoCabecera.cod_lugar).trigger('change');
    $('#lv_direccion').val(pedidoCabecera.lv_direccion);
    $('#telefono').val(pedidoCabecera.telefono);
    $('#lv_nom_secuencia_telefono').val(pedidoCabecera.lv_nom_secuencia_correo);
    $('#email').val(pedidoCabecera.email);
    $('#ln_anticipos_cliente').val(pedidoCabecera.ln_anticipos_cliente);
    $('#ln_saldos_cliente').val(pedidoCabecera.ln_saldos_cliente);

    $('#cod_agente').val(pedidoCabecera.cod_agente);
    $('#nombre_agente').val(pedidoCabecera.nom_agente);
    $('#cod_zona').val(pedidoCabecera.cod_zona);
    $('#cod_coordinador').val(pedidoCabecera.cod_coordinador)

    // if (pedidoCabecera.cod_coordinador === null) {
    //     if (pedidoCabecera.cod_zona !== null) {
    //         $('#cod_coordinador').val(pedidoCabecera.cod_coordinador)
    //     }
    // }

    $('#descripcion').val(datosConsultaCab.descripcion);
    $('#cod_moneda').val(datosConsultaCab.cod_moneda);
    $('#identificacion').val(pedidoCabecera.identificacion);

    $('#cod_comprobante').val(pedidoCabecera.cod_comprobante);
    $('#nro_cod_comprobante').val(pedidoCabecera.nro_cod_comprobante);
    $('#cod_cliente').val(pedidoCabecera.cod_cliente);
    $('#nombre_cliente').val(pedidoCabecera.nombre_cliente);
    $('#valor_bruto').val(pedidoCabecera.cod_comprobante);
    $('#nro_cod_comprobante').val(pedidoCabecera.nro_cod_comprobante);


//        console.log('fecha  form '+pedidoCabecera.fecha_emision )
    $('#fechaEmision').val(pedidoCabecera.fecha_emision);


    $('#cod_zona').val(pedidoCabecera.cod_zona);
    $('#observaciones').val(pedidoCabecera.observaciones);


}


function limpiarCampos() {

    $('#cod_cliente').val('');
    $('#nombre_cliente').val('');
    $('#email').val('');
    $('#telefono').val('');
    $('#calle').val('');
    $('#NRO').val('');
    $('#interseccion').val('');
    $('#lugar').val('');
    $('#LV_COD_IDENTIFICACION').val('');
    $('#cod_tipo_persona').val('');
    $('#ln_anticipos_cliente').val('');
    $('#ln_saldos_cliente').val('');
}

function llenarSelector() {

    var select = $('#selectPais');
    select.empty();
    $.ajax({
        url: window.location.pathname,
        method: 'GET',
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

            select.select2({
                // dropdownParent: $('#modalDatosPersona')
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
        var selectLugar = $('#selectLugar');
        selectLugar.empty();

        $.ajax({
            url: window.location.pathname,
            method: 'GET',
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
                    selectLugar.append(option);
                });
                selectLugar.select2({
                    // dropdownParent: $('#modalDatosPersona')
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


}


function verificacionNegociacion(lv_negociacion_db, lv_documentacion, ln_plazo) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accionVerificacionNegociacion,
            'lv_negociacion_db': lv_negociacion_db,
            'lv_documentacion': lv_documentacion,
            'ln_plazo': ln_plazo
        },
        success: function (data) {
            console.log('datos de verificacion de negociacion');
            if (data.alerta_error) {
                toastr.error(data.alerta_error);

                $('input, button,select').not('#btnBuscarClientes #modalDatos input, #modalDatos button, #btnCerrarModalPersonas').prop('disabled', true);
                $('#identificacion').prop('disabled', false);
                $('#btnBuscarClientes').prop('disabled', false);
                $('#btnCerrarModalPersonas').prop('disabled', false);

            } else {
                $('input, button,select').prop('disabled', false);
                $('#LV_COD_IDENTIFICACION').prop('disabled', true);
                $('#cod_tipo_persona').prop('disabled', true);
                $('#cod_cliente').prop('disabled', true);
                $('#plazo_dias').val(data.plazo_dias);
                if ($('#nro_cuotas').val() === null || $('#nro_cuotas').val() === '') {
                    $('#nro_cuotas').val(1);
                }

            }
            console.log(data);
        },
        error: function (xhr, status, error) {
            toastr.error('Error al validar la negociación.', error);
            // Rehabilitar todos los elementos si hay un error en la petición AJAX
            $('input, button').prop('disabled', false);
        }
    });
}


///////////////tabla de itemas/////////////
var itemSeleccionado = null;
var bodegaLoteSeleccionado = null;

//
function convertirADosDecimales(valorStr) {

    valorStr = valorStr.replace(/[^\d.-]/g, '');
    let valor = Number(valorStr);
    if (!isNaN(valor)) {
        return Number(valor.toFixed(2));
    } else {
        console.error("El valor proporcionado no es un número válido");
        return 0;
    }
}

var tabla;
// tabla detalle
$(document).ready(function () {

    tabla = $('#TablaDetalle').DataTable({
        responsive: true,
        autoWidth: false,
        dom: 't',

        scrollCollapse: true,
        paging: false,
        data: [],
        columns: [
            {
                data: null,
                defaultContent: '<button class="btnModalItemas btn btn-block btn-primary btn-xs"><i class="fa-solid fas fa-list fa-2xs"></i></button>',
                className: 'btnCell',
                orderable: false,
                width: '10px'
            },
            {
                data: 'cod_item',
                render: function (data, type, row) {
                    return data ? data + '/' + row.descripcion : '';
                },

                className: 'largo-column editable',
                width: '40%'
            },
            {
                data: 'unidad',
                width: '5%'
            },
            {
                data: null,
                defaultContent: '<button class="btnModalBodegasLotes btn btn-block btn-primary btn-xs"><i class="fa-solid fas fa-warehouse fa-2xs"></i></button>',
                className: 'btnCell ',
                orderable: false,
                width: '10px'
            },
            {
                data: 'cod_bodega',
                render: function (data, type, row) {
                    return data ? data + '/' + row.cod_sub_bodega + '/' + row.lv_nom_bodega : ''; // Verificación por si está vacío
                },

                width: '30%'
            },
            {
                data: 'saldo_disponible',
                className: 'text-right',
                width: '5%'
            },
            {
                data: 'cantidad_pedido_vta',
                className: 'text-right',
                width: '5%'
            },
            {
                data: 'cantidad',
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).attr('contenteditable', 'true');
                    $(td).addClass('editable');
                    $(td).on('keydown', function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Prevenir el salto de línea
                            $(this).blur(); // Desenfocar la celda para salir de la edición
                        }
                    });
                },
                className: 'text-right',
                width: '3%'
            },
            {
                data: 'ln_porc_descuento',
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).attr('contenteditable', 'true');
                    $(td).addClass('editable');
                    $(td).on('keydown', function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Prevenir el salto de línea
                            $(this).blur(); // Desenfocar la celda para salir de la edición
                        }
                    });
                },
                width: '3%'
            },
            {
                data: 'precio',
                className: 'corto-column text-right',
                width: '7%'
            },
            {
                data: 'iva_item',
                width: '5%'
            },
            {
                data: 'ln_valor_neto',
                className: 'corto-column',
                width: '7%'
            },
            {
                data: 'promocion',
                render: function (data, type, row) {
                    return `<input type="checkbox" ${data === 'S' ? 'checked' : ''}>`;
                },
                className: 'checkbox-column',
                orderable: false,
                width: '10px'
            },


            {
                data: null,
                defaultContent: '<button class="btnEliminar btn btn-block btn-danger btn-xs">X</button>',
                className: 'btnCell',
                orderable: false,
                width: '9px'
            }
        ]
    });




    function llenarDatosIniciales(datos) {
        datos.forEach(function (item) {
            var valorBruto = parseFloat(item.valor_bruto);
            var porcentajeImpuesto = parseFloat(item.porcentaje_impuesto);

            // Calcular el IVA usando la fórmula
            var iva_item = round(valorBruto * (porcentajeImpuesto / 100), 4);

            tabla.row.add({
                cod_item: item.cod_item,
                descripcion: item.descripcion,
                unidad: item.unidad,
                cod_bodega: item.cod_bodega,
                cod_sub_bodega: item.cod_sub_bodega,
                lv_nom_bodega: item.lv_nom_bodega,
                saldo_disponible: convertirADosDecimales(item.saldo_disponible.toString()),
                cantidad_pedido_vta: item.cantidad_pedido_vta,
                cantidad: item.cantidad.toString(),
                ln_porc_descuento: item.ln_porc_descuento,
                precio: convertirADosDecimales(item.precio.toString()),
                iva_item: iva_item,
                ln_valor_neto: round(valorBruto + iva_item, 4),
                promocion: item.promocion


            }).draw(false);

            tabla.on('draw', calcularTotales);
        });
    }


    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    if (accion === 'MOS' || accion === 'MOD') {
        //llenarDatosIniciales(datosConsultaDet);
        llenarDatosIniciales(listaDetalles);
    }
    $('#addRowItem').on('click', function () {
        agregarFila();

    });

// Función para agregar una nueva fila
    function agregarFila() {
        // var newRowIdx = tabla.rows().count();
        var nuevoPedidoDetalle = new PedidoDetalle();
        nuevoPedidoDetalle.isNew = true;
        listaDetalles.push(nuevoPedidoDetalle);
        tabla.row.add({
            cod_item: '',
            descripcion: '',
            unidad: '',
            cod_bodega: '',
            cod_sub_bodega: '',
            lv_nom_bodega: '',
            saldo_disponible: '',
            cantidad_pedido_vta: '',
            cantidad: '',
            ln_porc_descuento: '',
            precio: '',
            iva_item: '',
            ln_valor_neto: '',
            promocion: '',
            isNew: true
        }).draw(false);
        // newPedidoDetalle = new PedidoDetalle();
    }

    $(document).ready(function () {
        detectarCambiosEnCeldas();
        tabla.on('draw', calcularTotales);
    });


    function detectarCambiosEnCeldas() {
        $('#TablaDetalle tbody').on('input', 'td.editable', function () {
            var fila = $(this).closest('tr');
            var datosFila = tabla.row(fila).data();
            var filaIndex = tabla.row(fila).index();
            var valorIngresado = $(this).text().trim();
            var cell = tabla.cell(this);
            var cellIndex = cell.index();
            var pedidoDetalle = listaDetalles[filaIndex];

            if (!isNaN(valorIngresado) && valorIngresado !== '') {
                if (cellIndex.column === 7) {
                    pedidoDetalle.cantidad = parseFloat(valorIngresado);
                    pedidoDetalle.lv_cantidad=pedidoDetalle.cantidad ;
                }
                if (cellIndex.column === 8) {
                    pedidoDetalle.ln_porc_descuento = parseFloat(valorIngresado);
                }
                pedidoDetalle.valor_impuesto_especial = roundToFour(
                    ((pedidoDetalle.cantidad || 0) * (pedidoDetalle.precio || 0) - (pedidoDetalle.valor_descuento_venta || 0))
                    * (pedidoDetalle.porc_impuesto_especial || 0) / 100
                );
                pedidoDetalle.ln_valor_bruto = roundToFour(
                    ((pedidoDetalle.cantidad || 0) * (pedidoDetalle.precio || 0)) +
                    (pedidoDetalle.valor_impuesto_especial || 0) -
                    (pedidoDetalle.valor_descuento_venta || 0)
                );

                pedidoDetalle.iva_item = roundToFour(
                    (pedidoDetalle.ln_valor_bruto || 0) * ((pedidoDetalle.porcentaje_impuesto || 0) / 100)
                );

                pedidoDetalle.ln_valor_neto = roundToFour(
                    (pedidoDetalle.ln_valor_bruto || 0) + (pedidoDetalle.iva_item || 0)
                );

                tabla.cell({
                    row: filaIndex,
                    column: 10
                }).data(pedidoDetalle.iva_item).draw();
                tabla.cell({
                    row: filaIndex,
                    column: 11
                }).data(pedidoDetalle.ln_valor_neto).draw();

                tabla.on('draw', calcularTotales);

            } else {
                //  console.log('El valor ingresado no es válido:', valorIngresado);
                toastr.info('El valor ingresado no es válido ');
            }
        });
    }

    function roundToFour(num) {
        return Math.round(num * 10000) / 10000;
    }





    //
    function calcularTotales() {
        var totalPedido = 0;
        var totalFacturar = 0;
        if (tabla.rows().count() === 1) {
            var data = tabla.row(0).data();
            totalPedido = parseFloat(data.cantidad_pedido_vta) || 0;
            totalFacturar = parseFloat(data.cantidad) || 0;
        } else {
            tabla.rows({search: 'applied'}).every(function () {
                var data = this.data();
                totalPedido += parseFloat(data.cantidad_pedido_vta) || 0;
                totalFacturar += parseFloat(data.cantidad) || 0;
            });
        }
        $('#totalCantidadPedido').text(totalPedido.toFixed(2));
        $('#totalCantidadFacturar').text(totalFacturar.toFixed(2));
    }


// Event Listener para las filas nuevas y existentes
    $('#TablaDetalle tbody').on('click', '.btnEliminar', function () {
        tabla.row($(this).parents('tr')).remove().draw();
    });




// Función para buscar un registro en la listaDetalles por cod_item
    function buscarRegistroPorCodItem(cod_item) {
        return listaDetalles.find(function (detalle) {
            return detalle.cod_item === cod_item;
        });
    }

    $('#TablaDetalle').on('click', '.btnModalItemas', function () {
        var fila = $(this).closest('tr');
        var datosFila = tabla.row(fila).data();
        var filaIndex = tabla.row(fila).index();
        fetchDataAndShowModalDetalle(accionOptenerRgItem, filaIndex);
    });


//    $('#TablaDetalle').on('click', '.btnModalBodegasLotes', function () {
//        var fila = $(this).closest('tr');
//        var filaIndex = tabla.row(fila).index();
//        fetchDataAndShowModalDetalle(accionOptenerRgBodegasLotes, filaIndex);
//    });

    $('#TablaDetalle').on('click', '.btnModalBodegasLotes', function () {
        var fila = $(this).closest('tr');
        var filaIndex = tabla.row(fila).index();
        var datosFila = tabla.row(fila).data();

        if (itemSeleccionado && itemSeleccionado.filaIndex === filaIndex) {
            fetchDataAndShowModalDetalle(accionOptenerRgBodegasLotes, filaIndex);
        } else {
            var registroExistente = buscarRegistroPorCodItem(datosFila.cod_item);
           // console.log('valor item : ' + itemSeleccionado.cod_item);
            if (registroExistente) {

                itemSeleccionado = registroExistente;
                fetchDataAndShowModalDetalle(accionOptenerRgBodegasLotes, filaIndex);

            } else {

                itemSeleccionado = datosFila.cod_item;
                fetchDataAndShowModalDetalle(accionOptenerRgBodegasLotes, filaIndex);
            }
        }
    });


    function fetchDataAndShowModalDetalle(accion, filaIndex) {
        var fechaEmision = new Date($("#fechaEmision").val());
        var formattedDate = fechaEmision.toISOString().split('T')[0];

        var data = {
            'action': accion,
            'fecha_emision': formattedDate // Formato 'YYYY-MM-DD'
        };

        if (accion === accionOptenerRgBodegasLotes) {
            data['cod_item'] = itemSeleccionado.cod_item;
        }

        $.ajax({
            url: window.location.pathname,
            type: 'GET',
            data: data,
            success: function (data) {
                if (accion === accionOptenerRgItem) {
                    llenarDatosModalDetalleItems(data, filaIndex);
                } else if (accion === accionOptenerRgBodegasLotes) {
                    llenarDatosModalDetalleBodegasLotes(data, filaIndex);
                }
            },
            error: function (xhr, status, error) {
                toastr.warning('No se pudo obtener la información.');
            }
        });
    }

    // Función para llenar el modal con los datos de ítems y manejar la selección
    function llenarDatosModalDetalleItems(data, filaIndex) {
        $('#modalDetalle .modal-bodyDetalle').empty().append(`
            <table id="modalTableDetalle" class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Codigo</th>
                        <th>Descripcion</th>
                        <th>Referencia</th>
                        <th>Marca</th>
                        <th>Saldo</th>
                        <th>Nro. Parte</th>
                        <th>Origen</th>
                        <th>Cod Anterior</th>
                        <th>Control</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);

        var table = $('#modalTableDetalle').DataTable({
            data: data,
            columns: [
                {data: 'cod_item'},
                {data: 'descripcion'},
                {data: 'referencia'},
                {data: 'nom_marca'},
                {data: 'saldo'},
                {data: 'nro_parte'},
                {data: 'pais_origen'},
                {data: 'cod_anterior'},
                {data: 'controla_inventario'}
            ],
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true
        });

        $('#modalDetalle .modal-title').text('Listado de Items');
        $('#modalDetalle').modal('show');

        $('#modalTableDetalle tbody').on('click', 'tr', function () {
            $('#modalTableDetalle tbody tr').removeClass('selected');
            $(this).addClass('selected');
        });
        //
        $('#btnModalAccept').off('click').on('click', function () {
            var accionOptenerDetalleitem = 'detalle_item';
            var selectedData = $('#modalTableDetalle').DataTable().row('.selected').data();
            if (selectedData) {
                console.log(selectedData)
                itemSeleccionado = selectedData;
                itemSeleccionado.filaIndex = filaIndex;

                var pedidoDetalle = listaDetalles[filaIndex];
                pedidoDetalle.cod_item = selectedData.cod_item;
                pedidoDetalle.descripcion = selectedData.descripcion;
                //   itemSeleccionado.filaIndex = filaIndex;
                tabla.cell({
                    row: filaIndex,
                    column: 1
                }).data(itemSeleccionado.cod_item + '/' + itemSeleccionado.descripcion).draw();
                tabla.cell({
                    row: filaIndex,
                    column: 5
                }).data(itemSeleccionado.saldo).draw();
                var dataitem = {
                    'action': accionOptenerDetalleitem,
                    'cod_item': itemSeleccionado.cod_item
                };

                $.ajax({
                    url: window.location.pathname,
                    type: 'GET',
                    data: dataitem,
                    success: function (data) {

                        tabla.cell({
                            row: filaIndex,
                            column: 2
                        }).data(data.unidad).draw();

                        itemSeleccionado['unidad'] = data.unidad;
                        itemSeleccionado['descripcion'] = data.descripcion;
                        itemSeleccionado['lv_nom_marca'] = data.lv_nom_marca;
                        itemSeleccionado['LV_REFERENCIA_ITEM'] = data.LV_REFERENCIA_ITEM;
                        itemSeleccionado['lv_maneja_lotes'] = data.lv_maneja_lotes;
                        itemSeleccionado['lv_controla_inventario'] = data.lv_controla_inventario;


                        pedidoDetalle.unidad = data.unidad;
                        pedidoDetalle.lv_nom_marca = data.lv_nom_marca;
                        pedidoDetalle.lv_referencia_item = data.lv_referencia_item;
                        pedidoDetalle.lv_maneja_lotes = data.lv_maneja_lotes;
                        pedidoDetalle.lv_maneja_lotes = data.lv_controla_inventario;

                    },
                    error: function (xhr, status, error) {
                        toastr.warning('No se pudo obtener la información del item .');
                    }

                });


                validarItem(itemSeleccionado.cod_item, pedidoCabecera.cod_cliente ,null).then(result => {
                    let precio_item = result.precio_item;
                    let descuentos = result.descuentos;
                    pedidoDetalle.precio = precio_item;
                    pedidoDetalle.cod_impuesto_especial = descuentos.cod_impuesto_especial;
                    pedidoDetalle.cod_impuesto_ret_especial = descuentos.cod_impuesto_ret_especial;
                    pedidoDetalle.lv_referencia_item = descuentos.lv_referencia_item;
                    pedidoDetalle.lv_maneja_lotes = descuentos.lv_maneja_lotes;
                    pedidoDetalle.porc_impuesto_especial = descuentos.porc_impuesto_especial;

                    pedidoDetalle.porcentaje_impuesto = parseFloat(descuentos.porcentaje_impuesto) || 0;
                    console.log('---------------', descuentos.porcentaje_impuesto)
                    pedidoDetalle.cod_impuesto = descuentos.cod_impuesto;


                    tabla.cell({
                        row: filaIndex,
                        column: 9
                    }).data(precio_item).draw();

                    if (pedidoDetalle.cod_impuesto_especial) {
                        pedidoDetalle.valor_impuesto_especial = null;
                    } else {


                    }

                }).catch(error => {
                    console.error('Error al validar el ítem:', error);
                });


                console.log('datos de item seleccionado');
                console.log(itemSeleccionado);
                $('#modalDetalle').modal('hide');
            } else {
                toastr.info('No se ha seleccionado ningún ítem.');
            }
        });
    }

    // Función para llenar el modal con los datos de bodegas y manejar la selección
    function llenarDatosModalDetalleBodegasLotes(data, filaIndex) {
        $('#modalDetalle .modal-bodyDetalle').empty().append(`
            <table id="modalTableDetalle" class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Bodega</th>
                        <th>Sub Bodega</th>
                        <th>Nombre</th>
                        <th>Saldo</th>
                        <th>Nro. Lote</th>
                        <th>Fabricacion</th>
                        <th>Vencimiento</th>
                        <th>Sub Total</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);

        var table = $('#modalTableDetalle').DataTable({
            data: data,
            columns: [
                {data: 'cod_bodega'},
                {data: 'cod_sub_bodega'},
                {data: 'nom_bodega_sub'},
                {data: 'saldo'},
                {data: 'nro_lote'},
                {data: 'fecha_fabricacion'},
                {data: 'fecha_vencimiento'},
                {data: 'saldo_total'}
            ],
            responsive: true,
            autoWidth: false,
            destroy: true,
            deferRender: true
        });

        $('#modalDetalle .modal-title').text('Listado de Saldos por Bodega y Nro. Lote');
        $('#modalDetalle').modal('show');

        $('#modalTableDetalle tbody').on('click', 'tr', function () {
            $('#modalTableDetalle tbody tr').removeClass('selected');
            $(this).addClass('selected');
        });
        ////// modal aceptar bodega
        $('#btnModalAccept').off('click').on('click', function () {
            var selectedBodega = $('#modalTableDetalle').DataTable().row('.selected').data();
            if (selectedBodega) {
                console.log('info bodega seleccioando ')
                console.log(selectedBodega);

                var pedidoDetalle = listaDetalles[filaIndex];

                pedidoDetalle.cod_bodega = selectedBodega.cod_bodega;
                pedidoDetalle.cod_sub_bodega = selectedBodega.cod_sub_bodega;
                pedidoDetalle.nro_lote = selectedBodega.nro_lote;


                tabla.cell({
                    row: filaIndex,
                    column: 4
                }).data('').draw(false);  // Limpiar la celda
                tabla.cell({
                    row: filaIndex,
                    column: 4
                }).data(selectedBodega.cod_bodega + '/' + selectedBodega.cod_sub_bodega + '/' + selectedBodega.nom_bodega_sub).draw();


                var optenerSaldoDisponibleItem = 'optener_saldo_disponible_item';
                var databidega = {
                    'action': optenerSaldoDisponibleItem,
                    'cod_item': itemSeleccionado.cod_item,
                    'nro_lote': selectedBodega.nro_lote,
                    'cod_bodega': selectedBodega.cod_bodega,
                    'cod_sub_bodega': selectedBodega.cod_sub_bodega,
                    'fecha': $("#fechaEmision").val(),
                    'lv_maneja_lotes': itemSeleccionado.lv_maneja_lotes
                };

                $.ajax({
                    url: window.location.pathname,
                    type: 'GET',
                    data: databidega,
                    success: function (data) {
                        console.log('datos del saldo disponible' + data);

                        tabla.cell({
                            row: filaIndex,
                            column: 5
                        }).data(convertirADosDecimales(data.toString())).draw();
                        pedidoDetalle.saldo_disponible = data.toString();

                    },
                    error: function (xhr, status, error) {
                        toastr.warning('No se pudo obtener la información del saldo disponible .');
                    }

                });



                $('#modalDetalle').modal('hide');
            } else {
                toastr.info('No se ha seleccionado ninguna bodega.');
            }
        });
    }


});


// var datosConsultaCab = null;
function mostrarDatosCab() {

    if (datosConsultaCab) {



        for (let key in datosConsultaCab) {
            if (datosConsultaCab.hasOwnProperty(key)) {

                pedidoCabecera[key] = datosConsultaCab[key];
            }
        }

        $('#identificacion').val(pedidoCabecera.identificacion);
        llamardatosporidentificacion();
        mostarDatosCabezeraForm();

    }

}


var listaDetalles;

function mostarpedidodeto() {
    if (datosConsultaDet) {

        listaDetalles = [];


        datosConsultaDet.forEach(datosRegistro => {

            const detalle = new PedidoDetalle();


            detalle.cod_empresa = datosRegistro.cod_empresa;
            detalle.cod_agencia = datosRegistro.cod_agencia;

            detalle.nro_comprobante_cobro = datosRegistro.nro_comprobante_cobro;
            detalle.secuencia = datosRegistro.secuencia;
            detalle.cod_item = datosRegistro.cod_item;
            detalle.cod_bodega = datosRegistro.cod_bodega;
            detalle.cod_sub_bodega = datosRegistro.cod_sub_bodega;
            detalle.cantidad = datosRegistro.cantidad;
            detalle.precio = datosRegistro.precio;
            detalle.unidad = datosRegistro.unidad;
            detalle.descripcion = datosRegistro.descripcion;
            detalle.lv_nom_marca = datosRegistro.lv_nom_marca;
            detalle.lv_referencia_item = datosRegistro.lv_referencia_item;
            detalle.lv_referencia_item = datosRegistro.lv_referencia_item;
            detalle.lv_maneja_lotes = datosRegistro.lv_maneja_lotes;
            detalle.lv_controla_inventario = datosRegistro.lv_controla_inventario;
            detalle.lv_nom_bodega = datosRegistro.lv_nom_bodega;
            detalle.saldo_disponible = datosRegistro.saldo_disponible;

            detalle.cod_impuesto = datosRegistro.cod_impuesto;
            detalle.porcentaje_impuesto = parseFloat(datosRegistro.porcentaje_impuesto) || 0;
            detalle.valor_bruto = datosRegistro.valor_bruto;
            detalle.valor_neto = datosRegistro.valor_neto;
            detalle.cantidad_pedida_transf = datosRegistro.cantidad_pedida_transf;
            detalle.cantidad_despachada_transf = datosRegistro.cantidad_despachada_transf;
            detalle.cantidad_pedido_vta = datosRegistro.cantidad_pedido_vta;
            detalle.cod_tipo_estado = datosRegistro.cod_tipo_estado;
            detalle.cod_estado = datosRegistro.cod_estado;
            detalle.ing_egr_item = datosRegistro.ing_egr_item;
            detalle.fecha = datosRegistro.fecha ? new Date(datosRegistro.fecha) : null;
            detalle.cod_tipo_inventario = datosRegistro.cod_tipo_inventario;
            detalle.costo_promedio = datosRegistro.costo_promedio;
            detalle.cod_agencia_egr = datosRegistro.cod_agencia_egr;
            detalle.valor_item_total = datosRegistro.valor_item_total;
            detalle.valor_descuento_venta = datosRegistro.valor_descuento_venta;
            detalle.observaciones = datosRegistro.observaciones;
            detalle.promocion = datosRegistro.promocion;
            detalle.cod_impuesto_especial = datosRegistro.cod_impuesto_especial;
            detalle.cod_impuesto_ret_especial = datosRegistro.cod_impuesto_ret_especial;
            detalle.porc_impuesto_especial = datosRegistro.porc_impuesto_especial;
            detalle.valor_impuesto_especial = datosRegistro.valor_impuesto_especial;
            detalle.secuencia_propiedad = datosRegistro.secuencia_propiedad;
            detalle.ln_porc_descuento = datosRegistro.ln_porc_descuento;
            detalle.descripcion_venta_item = datosRegistro.descripcion_venta_item;
            detalle.nro_lote = datosRegistro.nro_lote;
            detalle.fecha_fabricacion = datosRegistro.fecha_fabricacion ? new Date(datosRegistro.fecha_fabricacion) : null;
            detalle.fecha_vencimiento = datosRegistro.fecha_vencimiento ? new Date(datosRegistro.fecha_vencimiento) : null;


            listaDetalles.push(detalle);
        });
        return listaDetalles;
    } else {
        console.log('No hay datos en datosConsultaDet');
    }
}


var optner_precio_item = 'optener_precio_item'

function optnerPrecioItem(cod_item, cod_cliente, cod_zona) {
    return new Promise((resolve, reject) => {
        var dataitem = {
            'action': optner_precio_item,
            'cod_item': cod_item,
            'cod_cliente': cod_cliente,
            'cod_zona': cod_zona
        };

        $.ajax({
            url: window.location.pathname,
            type: 'GET',
            data: dataitem,
            success: function (data) {
                let precio = parseFloat(data);
                resolve(precio);
            },
            error: function (xhr, status, error) {
                toastr.warning('No se pudo obtener el precio del item.');
                reject(error);
            }
        });
    });
}


var accionValidarItem = 'validar_Item';

function validarItem(cod_item, cod_cliente, cod_zona) {
    return new Promise((resolve, reject) => {
        var dataitem = {
            'action': accionValidarItem,
            'cod_item': cod_item,
            'cod_cliente': cod_cliente,
            'cod_zona': cod_zona
        };
        $.ajax({
            url: window.location.pathname,
            type: 'GET',
            data: dataitem,
            success: function (data) {
                let precio_item = parseFloat(data.precio_item);
                let descuentos = data.descuentos;
                resolve({precio_item, descuentos});
            },
            error: function (xhr, status, error) {
                toastr.warning('No se pudo obtener el precio del item.');
                reject(error);
            }
        });
    });
}


//Clase
class PedidoCabecera {
    constructor(
        cod_empresa,
        cod_agencia,
        nro_comprobante_cobro,
        cod_comprobante,
        nro_cod_comprobante,
        fecha_emision,
        calendario,
        cod_moneda,
        cod_agente,
        nom_agente,
        cod_zona,
        identificacion,
        cod_cliente,
        lv_cod_identificacion,
        cod_tipo_persona,
        observaciones,
        lv_categoria,
        lv_nom_negociacion_cliente,
        secuencia_direccion,

        lv_direccion,
        cod_pais,

        nom_pais,
        cod_lugar,

        lugar,
        calle,
        nro,
        interseccion,
        secuencia_telefono,

        lv_nom_secuencia_telefono,
        lv_cod_telefono,
        telefono,
        secuencia_correo,

        lv_nom_secuencia_correo,
        email,
        cod_coordinador,

        descripcion,
        nombre_cliente,
        lv_negociacion,
        ln_plazo,
        lv_documentacion,
        plazo_dias,
        nro_cuotas,
        ln_anticipos_cliente,
        ln_saldos_cliente,
        nombre_comercial,
        valor_bruto,
        valor_neto,
        cod_facturador,
        cod_tipo_estado,
        cod_estado,
        cod_cliente_referencia,
        cod_identificacion,
        secuencia_cierre,
        cod_tipo_negociacion,
        cod_org,
        lv_cod_categoria,
        lv_negociacion_db,
        cod_tipo_documentacion,
        cupo_credito,
        observacion_cambio_estado,
        nro_comprobante_web,
        tipo_cta_x_cobrar,
        cod_establecimiento,
        cod_punto_venta,
        secuencia_documento,
        ln_cupo,
        ln_saldo_vencido
    ) {
        this.cod_empresa = cod_empresa;
        this.cod_agencia = cod_agencia;
        this.nro_comprobante_cobro = nro_comprobante_cobro;
        this.cod_comprobante = cod_comprobante;
        this.nro_cod_comprobante = nro_cod_comprobante;
        this.fecha_emision = fecha_emision;
        this.calendario = calendario;
        this.cod_moneda = cod_moneda;
        this.cod_agente = cod_agente;

        this.nom_agente = nom_agente;
        this.cod_zona = cod_zona;

        this.identificacion = identificacion;

        this.cod_cliente = cod_cliente;
        this.lv_cod_identificacion = lv_cod_identificacion;
        this.cod_tipo_persona = cod_tipo_persona;
        this.observaciones = observaciones;
        this.lv_categoria = lv_categoria;
        this.lv_nom_negociacion_cliente = lv_nom_negociacion_cliente;
        this.secuencia_direccion = secuencia_direccion;

        this.lv_direccion = lv_direccion;
        this.cod_pais = cod_pais;

        this.nom_pais = nom_pais;
        this.cod_lugar = cod_lugar;

        this.lugar = lugar;
        this.calle = calle;
        this.nro = nro;
        this.interseccion = interseccion;
        this.secuencia_telefono = secuencia_telefono;

        this.lv_nom_secuencia_telefono = lv_nom_secuencia_telefono;
        this.lv_cod_telefono = lv_cod_telefono;
        this.telefono = telefono;
        this.secuencia_correo = secuencia_correo;

        this.lv_nom_secuencia_correo = lv_nom_secuencia_correo;
        this.email = email;
        this.cod_coordinador = cod_coordinador;

        this.descripcion = descripcion;
        this.nombre_cliente = nombre_cliente;
        this.lv_negociacion = lv_negociacion;
        this.ln_plazo = ln_plazo;
        this.lv_documentacion = lv_documentacion;
        this.plazo_dias = plazo_dias;
        this.nro_cuotas = nro_cuotas;
        this.ln_anticipos_cliente = ln_anticipos_cliente;
        this.ln_saldos_cliente = ln_saldos_cliente;
        this.nombre_comercial = nombre_comercial;
        this.valor_bruto = valor_bruto;
        this.valor_neto = valor_neto;
        this.cod_facturador = cod_facturador;
        this.cod_tipo_estado = cod_tipo_estado;
        this.cod_estado = cod_estado;
        this.cod_cliente_referencia = cod_cliente_referencia;
        this.cod_identificacion = cod_identificacion;
        this.secuencia_cierre = secuencia_cierre;
        this.cod_tipo_negociacion = cod_tipo_negociacion;
        this.cod_org = cod_org;
        this.lv_cod_categoria = lv_cod_categoria;
        this.lv_negociacion_db = lv_negociacion_db;
        this.cod_tipo_documentacion = cod_tipo_documentacion;
        this.cupo_credito = cupo_credito;
        this.observacion_cambio_estado = observacion_cambio_estado;
        this.nro_comprobante_web = nro_comprobante_web;
        this.tipo_cta_x_cobrar = tipo_cta_x_cobrar;
        this.cod_establecimiento = cod_establecimiento;
        this.cod_punto_venta = cod_punto_venta;
        this.secuencia_documento = secuencia_documento;
        this.ln_cupo = ln_cupo;
        this.ln_saldo_vencido = ln_saldo_vencido;
    }


    mostrarInformacion() {
        console.log(`Comprobante: ${this.nro_comprobante_cobro}, Cliente: ${this.nombre_cliente}`);

    }
}





//////////
class PedidoDetalle {
    constructor(
        cod_empresa,
        cod_agencia,
        nro_comprobante_cobro,
        secuencia,
        cod_item,

        descripcion,
        lv_nom_marca,
        unidad,
        cod_bodega,

        cod_sub_bodega,
        lv_nom_bodega,
        saldo_disponible,
        cantidad_pedido_vta,
        ln_total_cantidad_pedido_vta,
        cantidad,
        ln_total_cantidad,
        ln_porc_descuento,
        precio,
        iva_item,
        ln_valor_neto,
        lv_promocion,
        del,
        propiedad,
        descripcion_venta_item,
        nro_lote,
        fecha_fabricacion,
        fecha_vencimiento,
        lv_referencia_item,
        ln_valor_bruto,
        ln_total_valor_bruto,
        cod_impuesto,
        porcentaje_impuesto,
        valor_bruto,
        valor_neto,
        cantidad_pedida_transf,
        cantidad_despachada_transf,
        cod_tipo_estado,
        cod_estado,
        ing_egr_item,
        fecha,
        cod_tipo_inventario,
        costo_promedio,
        cod_agencia_egr,
        valor_item_total,
        observaciones,
        promocion,
        cod_impuesto_ret_especial,
        lv_descuentos,
        valor_descuento_venta,
        lv_cantidad,
        porc_impuesto_especial,
        cod_impuesto_especial,
        valor_impuesto_especial,
        ice_valor,
        subt_con_iva,
        subt_sin_iva,
        iva_valor,
        total,
        iva_0,
        iva_12,
        lv_controla_inventario,
        sum_descuento,
        secuencia_propiedad,

        lv_maneja_lotes,
        filaIndex,
        isNew
    ) {
        this.cod_empresa = cod_empresa;
        this.cod_agencia = cod_agencia;
        this.nro_comprobante_cobro = nro_comprobante_cobro;
        this.secuencia = secuencia;
        this.cod_item = cod_item;

        this.descripcion = descripcion;
        this.lv_nom_marca = lv_nom_marca;
        this.unidad = unidad;
        this.cod_bodega = cod_bodega;

        this.cod_sub_bodega = cod_sub_bodega;
        this.lv_nom_bodega = lv_nom_bodega;
        this.saldo_disponible = saldo_disponible;
        this.cantidad_pedido_vta = cantidad_pedido_vta;
        this.ln_total_cantidad_pedido_vta = ln_total_cantidad_pedido_vta;
        this.cantidad = cantidad;
        this.ln_total_cantidad = ln_total_cantidad;
        this.ln_porc_descuento = ln_porc_descuento;
        this.precio = precio;
        this.iva_item = iva_item;
        this.ln_valor_neto = ln_valor_neto;
        this.lv_promocion = lv_promocion;
        this.del = del;
        this.propiedad = propiedad;
        this.descripcion_venta_item = descripcion_venta_item;
        this.nro_lote = nro_lote;
        this.fecha_fabricacion = fecha_fabricacion;
        this.fecha_vencimiento = fecha_vencimiento;
        this.lv_referencia_item = lv_referencia_item;
        this.ln_valor_bruto = ln_valor_bruto;
        this.ln_total_valor_bruto = ln_total_valor_bruto;
        this.cod_impuesto = cod_impuesto;
        this.porcentaje_impuesto = porcentaje_impuesto;
        this.valor_bruto = valor_bruto;
        this.valor_neto = valor_neto;
        this.cantidad_pedida_transf = cantidad_pedida_transf;
        this.cantidad_despachada_transf = cantidad_despachada_transf;
        this.cod_tipo_estado = cod_tipo_estado;
        this.cod_estado = cod_estado;
        this.ing_egr_item = ing_egr_item;
        this.fecha = fecha;
        this.cod_tipo_inventario = cod_tipo_inventario;
        this.costo_promedio = costo_promedio;
        this.cod_agencia_egr = cod_agencia_egr;
        this.valor_item_total = valor_item_total;
        this.observaciones = observaciones;
        this.promocion = promocion;
        this.cod_impuesto_ret_especial = cod_impuesto_ret_especial;
        this.lv_descuentos = lv_descuentos;
        this.valor_descuento_venta = valor_descuento_venta;
        this.lv_cantidad = lv_cantidad;
        this.porc_impuesto_especial = porc_impuesto_especial;
        this.cod_impuesto_especial = cod_impuesto_especial;
        this.valor_impuesto_especial = valor_impuesto_especial;
        this.ice_valor = ice_valor;
        this.subt_con_iva = subt_con_iva;
        this.subt_sin_iva = subt_sin_iva;
        this.iva_valor = iva_valor;
        this.total = total;
        this.iva_0 = iva_0;
        this.iva_12 = iva_12;
        this.lv_controla_inventario = lv_controla_inventario;
        this.sum_descuento = sum_descuento;
        this.secuencia_propiedad = secuencia_propiedad;

        this.lv_maneja_lotes = lv_maneja_lotes;
        this.filaIndex = filaIndex;
        this.isNew = isNew;
    }


    mostrarInformacion() {
        console.log(`Item: ${this.cod_item}, Descripción: ${this.descripcion}, Cantidad: ${this.cantidad}`);

    }
}


