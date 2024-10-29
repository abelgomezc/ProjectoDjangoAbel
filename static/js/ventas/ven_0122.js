var tablas = {};

var selectedRowData = null;
var accionConsultarTsPedidos = 'searchdata_ts_pedidos'

var tbTsPedodos = 'TablaTsPedido'


var dataRecords = {
    [tbTsPedodos]: {
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
                $('#' + tbTsPedodos + ' tbody tr:first').trigger('click');
            }
        },
        createdRow: function (row, data, dataIndex) {
            // Aplicar la clase para reducir el tamaño de fuente a cada fila creada
            $(row).addClass('table-small-font');
        },
        error: function (xhr, error, code) {
            console.log('Error al inicializar DataTable para:', id, 'Error:', error, 'Código:', code);
        }
    });
}


function initTables() {
    var configs = {
        [tbTsPedodos]: {
            action: accionConsultarTsPedidos,
            columns: [
    {
        data: null,
        className: 'text-nowrap',
        width: '5%',
        render: function (data, type, row) {
            return data.cod_comprobante + '-' + data.nro_cod_comprobante;
        }
    },
    {
        data: 'nro_comprobante_web',
        className: 'text-nowrap',
        width: '5%'
    },
    {
        data: 'identificacion',
        className: 'text-nowrap',
        width: '7%'
    },
    {
        data: 'nombre_cliente',
        className: 'text-nowrap',
        width: '25%'
    },
    {
        data: 'fecha_emision',
        className: 'text-nowrap',
        width: '8%'
    },
    {
        data: 'valor_bruto',
        className: 'text-right text-nowrap',
        width: '5%',  // Define el ancho
        render: function (data, type, row) {
            if (type === 'display') {
                return parseFloat(data).toFixed(2);
            }
            return data;
        }
    },
    {
        data: 'valor_neto',
        className: 'text-right text-nowrap',
        width: '3%',  // Define el ancho
        render: function (data, type, row) {
            if (type === 'display') {
                var valorBruto = row.valor_bruto || 0;
                var valorNeto = data || 0;
                var iva = parseFloat(valorNeto) - parseFloat(valorBruto);
                return iva.toFixed(2);
            }
            return data;
        }
    },
    {
        data: 'valor_neto',
        className: 'text-right text-nowrap',
        width: '4%',  // Define el ancho
        render: function (data, type, row) {
            if (type === 'display') {
                return parseFloat(data).toFixed(2);
            }
            return data;
        }
    },
    {
        data: 'nom_agente',
        className: 'text-nowrap',
        width: '17%'
    },
    {
        data: 'cod_zona',
        className: 'text-nowrap',
        width: '3%'
    },
    {
        data: 'cod_coordinador',
        className: 'text-nowrap',
        width: '5%'
    },
    {
        data: 'nombre_estado',
        className: 'text-nowrap',
        width: '5%'
    },
//    {
//        data: 'nro_comprobante_cobro',
//        className: 'text-nowrap',
//        width: '5%'
//    },
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


function handleRowSelection(table, tableId) {
    table.on('click', 'tr', function () {
        var $row = $(this).closest('tr');
        selectedRowData = table.row($row).data();  // Guardar los datos de la fila seleccionada
        table.$('tr.selected-row').removeClass('selected-row');
        if (selectedRowData) {
            $row.addClass('selected-row');
            // console.log(selectedRowData)
            // nro_comprobante_cobro = selectedRowData.nro_comprobante_cobro
        } else {
            $('#' + tbTsPedodos + ' tbody tr:first').trigger('click');
        }
    });
}

$('#btn_nuevo_registro').on('click', function (e) {
    e.preventDefault();
    var accion = $(this).data('accion');
    window.location.href = '/ventas/registro-pedidos-clientes/' + accion + '/';
});

$('#btn_editar_registro').on('click', function (e) {
    if (selectedRowData) {
        e.preventDefault();
        var accion = $(this).data('accion');
        var nro_comprobante_cobro = selectedRowData.nro_comprobante_cobro;
        window.location.href = '/ventas/registro-pedidos-clientes/' + nro_comprobante_cobro + '/' + accion + '/';

    } else {

        toastr.info('No se ha seleccionado ningún Registro.');
    }


});

$('#btn_mostrar_registro').on('click', function (e) {

    if (selectedRowData) {
        e.preventDefault();
        var accion = $(this).data('accion');
        var nro_comprobante_cobro = selectedRowData.nro_comprobante_cobro;
        window.location.href = '/ventas/registro-pedidos-clientes/' + nro_comprobante_cobro + '/' + accion + '/';

    } else {

        toastr.info('No se ha seleccionado ningún Registro.');
    }

});


$(function () {
    //
    initTables();

});


