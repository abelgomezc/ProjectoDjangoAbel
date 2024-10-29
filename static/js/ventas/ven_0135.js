var accionListarAgentes = 'accionListarAgentes';
var accionOptenerPaises = 'accion_optener_paises';

var acccionOptenerdatosAgenteSeleccionado = 'accion-optener-datos-agente'


window.onload = function () {
    var fechaEminicion = document.getElementById('fechaEminicion');
    var now = new Date();

    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + now.getDate()).slice(-2);
    var hours = ('0' + now.getHours()).slice(-2);
    var minutes = ('0' + now.getMinutes()).slice(-2);

    // Set the value of the input
    fechaEminicion.value = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    ;
};

$('#btnAgentes').on('click', function () {
    // fetchDataAndShowModalAgentes(accionListarAgentes);
    fetchDataAndShowModal(accionListarAgentes);
});

$('#btnPaises').on('click', function () {
    fetchDataAndShowModal(accionOptenerPaises);
});




function fetchDataAndShowModal(accion) {

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': accion
        },
        success: function (data) {
            if (accion === accionListarAgentes) {
                llenarDatosModalAgentes(data,accion);
            }
            if (accion === accionOptenerPaises) {
                llenarDatosModalPaises(data,accion);

            }


        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });
}

function llenarDatosModalAgentes(data,accion) {
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


}
function llenarDatosModalPaises(data,accion) {
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
                            <th>Código</th>
                            <th>Nombre</th>
                          
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);

    var columns;
    var titulo = 'Listado de Paises';
    // Configurar el título del modal
    columns = ['cod_pais', 'nombre'];


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
    $('#modalDatos .modal-title').text(titulo);
    // Mostrar el modal
    $('#modalDatos').modal('show');


}

//poder ver elemento seleccionado en el modal
$(document).on('click', '#modalTable tbody tr', function () {
    //Remover clase de selección de todas las filas
    $('#modalTable tbody tr').removeClass('selected');
    //Agregar clase de selección a la fila clickeada
    $(this).addClass('selected');
});


$('#modalAcceptButton').on('click', function () {
    var selectedData = $('#modalTable').DataTable().row('.selected').data();
    if (selectedData) {


    } else {
        // console.error('No se ha seleccionado ninguna fila.');
        toastr.info('No se ha seleccionado ninguna fila.');
    }
});

function traerdatosAgenteSelecciondo(cod_persona) {

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': acccionOptenerdatosAgenteSeleccionado,
            'cod_persona': cod_persona
        },
        success: function (data) {


        },
        error: function (xhr, status, error) {
            console.error('Error al obtener los datos:', error);
        }
    });

}


$('#btnBuscarClientes').on('click', function () {
    $('#modalIframe').attr('src', buscarEntidadesClientesUrl);
    $('#myModal').modal('show');
});

// function fetchDataAndShowModalAgentes(accion) {
//
//     $.ajax({
//         url: window.location.pathname,
//         type: 'POST',
//         data: {
//             'action': accion
//         },
//         success: function (data) {
//
//             // Agregar la variable `action` a cada fila de datos
//             data = data.map(row => {
//                 row.action = accion;
//                 return row;
//             });
//             // Limpiar modal y crear tabla
//             $('#modal-agentes .modal-body').empty().append(`
//                 <table id="modalTable" class="table table-bordered table-striped">
//                     <thead>
//                         <tr>
//                             <th>Código</th>
//                             <th>Nombre</th>
//                             <th>Zona</th>
//                         </tr>
//                     </thead>
//                     <tbody></tbody>
//                 </table>
//             `);
//
//             var columns;
//             var titulo = 'Listado de Agentes';
//             // Configurar el título del modal
//             columns = ['cod_agente', 'nombre', 'cod_zona'];
//
//
//             // Llenar la tabla con los datos
//             var table = $('#modalTable').DataTable({
//                 data: data,
//                 columns: [
//                     {data: columns[0], title: 'Código'},
//                     {data: columns[1], title: 'Nombre'},
//                     {data: columns[2], title: 'Zona'}
//                 ],
//                 responsive: true,
//                 autoWidth: false,
//                 destroy: true,
//                 deferRender: true
//             });
//             $('#modal-agentes .modal-title').text(titulo);
//             // Mostrar el modal
//             $('#modal-agentes').modal('show');
//         },
//         error: function (xhr, status, error) {
//             console.error('Error al obtener los datos:', error);
//         }
//     });
// }