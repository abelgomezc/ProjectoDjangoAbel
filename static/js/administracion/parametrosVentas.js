var tablas = {};//

var tablaDocumentacion = 'datatable_documentacion';
var tablaPrecio = 'datatable_precio';
var tablaNegociacion = 'datatable_negociacion';
var tablaCategorias = 'datatable_categorias';
var tablaPlacasVehiculos = 'datatable_placas_vehiculos';
var tablaTipoDescuentos = 'datatable_tipo_descuentos'
var tablaTrasnportistas = 'datatable_trasnportistas';
var tablaPropiedadComprobantes = 'datatable_propiedadesComprobantes';
var tablaEspecializacionCliente = 'datatable_especialidad_cliente';
var tablaDesXCategoriasCliente = 'datatable_descxCateoriasCliente';


//acciones
var accionBuscarDocumentacion = 'searchdata_tipos_documentacion';
var accionBuscarTipoPrecio = 'searchdata_tipos_precio';
var acionBuscarTipoNegociacion = 'searchdata_tipos_negociacion'
var accionBuscarCategorias = 'searchdata_categorias';
var accionBuscarPlacasVehiculos = 'searchdata_placas_vehiculos'
var accionBuscarTipoDescuentosItems = 'searchdata_tipo_descuentos_items'
var accionBuscarTransportistas = 'searchdata_transportistas'
var accionBuscarPrpiedadesComprobastes = 'searchdata_propiedades_comprobantes'
var accionBuscarEspecialidadCliente = 'searchdata_especialidad_cliente'
var accionBuscarTiposDescXClienteCateg = 'searchdata_tipos_desc_x_cliente_categ'



var dataRecords = {
    [tablaDocumentacion]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaPrecio]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaNegociacion]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaCategorias]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaPlacasVehiculos]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaTipoDescuentos]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaTrasnportistas]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaPropiedadComprobantes]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaEspecializacionCliente]: {
        added: [],
        updated: [],
        deleted: []
    },
    [tablaDesXCategoriasCliente]: {
        added: [],
        updated: [],
        deleted: []
    }
};


//inicializra las tablas

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
            beforeSend: function () {
                //  console.log('Enviando solicitud GET a:', this.url);
            }
        },
        columns: config.columns,
        initComplete: function (settings, json) {

        }
    });
}

function initTables() {
    var configs = {
        [tablaDocumentacion]: {
            action: accionBuscarDocumentacion,
            columns: [
                {data: 'cod_tipo_documentacion'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
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
            ]
        },
        [tablaPrecio]: {
            action: accionBuscarTipoPrecio,
            columns: [
                {data: 'cod_tipo_precio'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
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
            ]
        },
        [tablaNegociacion]: {
            action: acionBuscarTipoNegociacion,
            columns: [
                {data: 'cod_tipo_negociacion'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'cupo', createdCell: function (td, cellData, rowData, row, col) {
                        const valorFormateado = Number(cellData).toFixed(2);
                        $(td).attr('contenteditable', 'true').addClass('input-numerico').text(valorFormateado);

                    }
                },
                {
                    data: 'plazo', createdCell: function (td, cellData, rowData, row, col) {
                        const valorFormateado = Number(cellData).toFixed(2);
                        $(td).attr('contenteditable', 'true').addClass('input-numerico').text(valorFormateado);

                    }
                },
                {
                    data: 'tipo',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            let valorMostrar = '';
                            switch (data) {
                                case 'CER':
                                    valorMostrar = 'Cerrado';
                                    break;
                                case 'CON':
                                    valorMostrar = 'Contado';
                                    break;
                                case 'CRE':
                                    valorMostrar = 'Credito';
                                    break;
                                case 'TAR':
                                    valorMostrar = 'Tarjeta';
                                    break;
                                default:
                                    valorMostrar = data;
                            }
                            return '<select class="form-control tipo-select">' +
                                '<option value="CER"' + (data === 'CER' ? ' selected' : '') + '>Cerrado</option>' +
                                '<option value="CON"' + (data === 'CON' ? ' selected' : '') + '>Contado</option>' +
                                '<option value="CRE"' + (data === 'CRE' ? ' selected' : '') + '>Credito</option>' +
                                '<option value="TAR"' + (data === 'TAR' ? ' selected' : '') + '>Tarjeta</option>' +
                                '</select>';
                        }
                        return data;
                    }
                },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaCategorias]: {
            action: accionBuscarCategorias,
            columns: [
                {data: 'cod_categoria'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaPlacasVehiculos]: {
            action: accionBuscarPlacasVehiculos,
            columns: [
                {data: 'cod_placa'},
                {
                    data: 'descripcion', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaTipoDescuentos]: {
            action: accionBuscarTipoDescuentosItems,
            columns: [
                {data: 'cod_descuento'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },

                {
                    data: 'tipo_valor',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            let valorMostrar = '';
                            switch (data) {
                                case 'VAL':
                                    valorMostrar = 'Valor';
                                    break;
                                case 'POR':
                                    valorMostrar = 'Porcentaje';
                                    break;

                                default:
                                    valorMostrar = data;
                            }
                            return '<select class="form-control tipo-select">' +
                                '<option value="VAL"' + (data === 'VAL' ? ' selected' : '') + '>Valor</option>' +
                                '<option value="POR"' + (data === 'POR' ? ' selected' : '') + '>Porcentaje</option>' +

                                '</select>';
                        }
                        return data;
                    }
                },
                {
                    data: 'valor',
                    createdCell: function (td, cellData, rowData, row, col) {
                        const valorFormateado = Number(cellData).toFixed(2); // Formatea a 2 decimales
                        $(td).attr('contenteditable', 'true').addClass('input-numerico').text(valorFormateado);
                    }
                },

                {
                    data: null,
                    defaultContent: '<button class="btnEliminar btn btn-block btn-danger btn-xs">X</button>',
                    className: 'btnCell',
                    orderable: false,
                    width: '10px'
                }
            ]
        },
        [tablaTrasnportistas]: {
            action: accionBuscarTransportistas,
            columns: [
                {
                    data: 'cod_persona', createdCell: function (td, cellData, rowData, row, col) {
                        //const valorFormateado = Number(cellData).toFixed(0);  // Formatear como número entero sin decimales
                        $(td).attr('contenteditable', 'true').addClass('input-numerico');
                    }
                },
                // {
                //     data: null,
                //     defaultContent: '<button type="button" class="btnModal btn btn-block btn-outline-primary btn-xs"><i class="fas fa-users"></i></button>',
                //     className: 'btnCell',
                //     orderable: false,
                //     searchable: false,
                //     createdCell: function (td, cellData, rowData, row, col) {
                //         $(td).attr('contenteditable', 'false');
                //     }
                // },

                {data: 'nombre'},
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaPropiedadComprobantes]: {
            action: accionBuscarPrpiedadesComprobastes,
            columns: [
                {data: 'cod_propiedad'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaEspecializacionCliente]: {
            action: accionBuscarEspecialidadCliente,
            columns: [
                {data: 'cod_especialidad'},
                {
                    data: 'nombre', createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('contenteditable', 'true');
                    }
                },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return '<select class="form-control estado-select" >' +
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
            ]
        },
        [tablaDesXCategoriasCliente]: {
            action: accionBuscarTiposDescXClienteCateg,
            columns: [
                {data: 'cod_tipo_negociacion'},
                {
                    data: null,
                    defaultContent: '<button type="button" class="btnModal btn btn-block btn-outline-primary btn-xs" data-toggle="modal" data-target="#modal-lg" data-action="searchdata_tipos_negociacion" disabled><i class="fas fa-table"></i></button>',
                    className: 'btnCell',
                    orderable: false
                },
                {data: 'nombre_tipo_negociacion'},
                {data: 'cod_categoria'},
                {
                    data: null,
                    defaultContent: '<button type="button" class="btnModal btn btn-block btn-outline-primary btn-xs" data-toggle="modal" data-target="#modal-lg" data-action="searchdata_categorias" disabled><i class="fas fa-table"></i></button>',
                    className: 'btnCell',
                    orderable: false
                },
                {data: 'nombre_categoria'},
                {data: 'cod_descuento'},
                {
                    data: null,
                    defaultContent: '<button type="button" class="btnModal btn btn-block btn-outline-primary btn-xs" data-toggle="modal" data-target="#modal-lg" data-action="searchdata_tipo_descuentos_items" disabled><i class="fas fa-table"></i></button>',
                    className: 'btnCell',
                    orderable: false
                },
                {data: 'nombre_descuento'},
                {
                    data: 'valor', title: 'Valor', createdCell: function (td, cellData, rowData, row, col) {
                        const valorFormateado = Number(cellData).toFixed(2);
                        $(td).attr('contenteditable', 'true').addClass('input-numerico').text(valorFormateado);
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
            ]

        }

    };
    for (var id in configs) {
        if (configs.hasOwnProperty(id)) {
            tablas[id] = initDataTable('#' + id, configs[id]);
            handleEditableCells(tablas[id], id);
            handleDeleteRows(tablas[id], id);
        }
    }

}

//si
function handleEditableCells(table, tableId) {
    // Evento 'blur' para convertir texto a mayúsculas al salir de la celda
    table.on('blur', 'td[contenteditable="true"]:not(:has(select))', function () {
        var $cell = $(this);
        var originalText = $cell.text();
        var upperCaseText = originalText.toUpperCase();
        if (originalText !== upperCaseText) {
            $cell.text(upperCaseText);
            updateCellData($cell, table, tableId);

        }
    });
    table.on('change', 'select', function () {
        updateCellData($(this).closest('td'), table, tableId);
    });


    if (tableId === tablaTrasnportistas) {
        //   Restricción para las celdas con la clase 'input-numerico'
        table.on('keypress', '.input-numerico[contenteditable="true"]', function (e) {
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });

    } else {

        // Evento keypress para la clase 'input-numerico'
        table.on('keypress', '.input-numerico[contenteditable="true"]', function (e) {
            var charCode = (e.which) ? e.which : e.keyCode;
            var inputText = $(this).text();

            // Permitir solo números del 0 al 9 y el punto decimal
            if (!(charCode >= 48 && charCode <= 57) && charCode !== 46) {
                e.preventDefault();
                return false;
            }

            // Evitar que el punto esté al principio del texto
            if (charCode === 46 && inputText.length === 0) {
                e.preventDefault();
                return false;
            }

            // Convertir la coma (,) a punto (.) solo si no hay otro punto presente
            if (charCode === 44 && !inputText.includes('.')) {
                $(this).text(inputText + '.');
                e.preventDefault();
                return false;
            }

            // Permitir solo un punto decimal
            if (charCode === 46 && inputText.includes('.')) {
                e.preventDefault();
                return false;
            }
        });


    }


    // Evento 'blur' para los campos numéricos
    table.on('blur', '.input-numerico[contenteditable="true"]', function () {
        updateCellData($(this), table, tableId);
    });

}

//si
function updateCellData($cell, table, tableId) {
    var $row = $cell.closest('tr');
    var data = table.row($row).data();

    // var codColumn = tableId === 'datatable_documentacion' ? 'cod_tipo_documentacion' :
    //     tableId === 'datatable_precio' ? 'cod_tipo_precio' :
    //         tableId === 'datatable_negociacion' ? 'cod_tipo_negociacion' :
    //             tableId === 'datatable_placas_vehiculos' ? 'cod_placa' :
    //                 tableId === 'datatable_trasnportistas' ? 'cod_persona' :
    //                     tableId === 'datatable_tipo_descuentos' ? 'cod_descuento' :
    //                         tableId === 'datatable_propiedadesComprobantes' ? 'cod_propiedad' :
    //                             tableId === 'datatable_especialidad_cliente' ? 'cod_especialidad' :
    //                                 tableId === 'datatable_descxCateoriasCliente' ? null : // Para manejar esto abajo
    //                                     'cod_categoria';
    var codColumn = tableId === tablaDocumentacion ? 'cod_tipo_documentacion' :
        tableId === tablaPrecio ? 'cod_tipo_precio' :
            tableId === tablaNegociacion ? 'cod_tipo_negociacion' :
                tableId === tablaPlacasVehiculos ? 'cod_placa' :
                    tableId === tablaTrasnportistas ? 'cod_persona' :
                        tableId === tablaTipoDescuentos ? 'cod_descuento' :
                            tableId === tablaPropiedadComprobantes ? 'cod_propiedad' :
                                tableId === tablaEspecializacionCliente ? 'cod_especialidad' :
                                    tableId === tablaDesXCategoriasCliente ? null : 'cod_categoria';


    // Para la mayoría de las tablas, obtenemos los valores de las columnas de la fila
    var codValue = tableId !== tablaDesXCategoriasCliente ? $row.find('td:eq(0)').text().trim() : null;
    // var codValue = $row.find('td:eq(0)').text().trim();
    var nombreValue = $row.find('td:eq(1)').text().trim();


    data[codColumn] = codValue;
    data.nombre = nombreValue;

    if (tableId === 'datatable_negociacion') {
        var cupoValue = $row.find('td:eq(2)').text().trim();
        var plazoValue = $row.find('td:eq(3)').text().trim();

        data.cupo = cupoValue !== '' ? parseFloat(cupoValue) : null;
        data.plazo = plazoValue !== '' ? parseFloat(plazoValue) : null;
        data.tipo = $row.find('select.tipo-select').val();
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_categorias') {
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_placas_vehiculos') {
        data.descripcion = nombreValue;
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_tipo_descuentos') {
        data.tipo_valor = $row.find('select.tipo-select').val();
        var valor = $row.find('td:eq(3)').text().trim();
        data.valor = valor !== '' ? parseFloat(valor) : null;
    } else if (tableId === 'datatable_trasnportistas') {
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_propiedadesComprobantes') {
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_especialidad_cliente') {
        data.estado = parseInt($row.find('select.estado-select').val());
    } else if (tableId === 'datatable_descxCateoriasCliente') {
        // Obtener valores específicos para la tabla datatable_descxCateoriasCliente
        var codValue1 = $row.find('td:eq(0)').text().trim(); // cod_tipo_negociacion
        var codValue2 = $row.find('td:eq(3)').text().trim(); // cod_categoria
        var codValue3 = $row.find('td:eq(6)').text().trim(); // cod_descuento

        data.cod_tipo_negociacion = codValue1;
        data.cod_categoria = codValue2;
        data.cod_descuento = codValue3;
        var valor = $row.find('td:eq(9)').text().trim();
        data.valor = valor !== '' ? parseFloat(valor) : null;
        data.estado = parseInt($row.find('select.estado-select').val());

        // Crear una clave compuesta para manejar entradas
        var compositeKey = codValue1 + '-' + codValue2 + '-' + codValue3;

    }
    if (data.isNew) {
        var addedList = dataRecords[tableId].added;
        var existingRecord = tableId === 'datatable_descxCateoriasCliente' ?
            addedList.find(record => record.cod_tipo_negociacion + '-' + record.cod_categoria + '-' + record.cod_descuento === compositeKey) :
            addedList.find(record => record[codColumn] === codValue);
        // var existingRecord = addedList.find(record => record[codColumn] === codValue);

        if (!existingRecord) {
            addedList.push(data);
        }
    } else {
        var updatedList = dataRecords[tableId].updated;
        var existingRecord = tableId === 'datatable_descxCateoriasCliente' ?
            updatedList.find(record => record.cod_tipo_negociacion + '-' + record.cod_categoria + '-' + record.cod_descuento === compositeKey) :
            updatedList.find(record => record[codColumn] === codValue);
        // var existingRecord = updatedList.find(record => record[codColumn] === codValue);

        if (!existingRecord) {
            updatedList.push(data);
        } else {
            existingRecord.nombre = nombreValue;
            if (tableId === 'datatable_negociacion') {
                existingRecord.cupo = data.cupo;
                existingRecord.plazo = data.plazo;
                existingRecord.tipo = data.tipo;
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_categorias') {
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_placas_vehiculos') {
                existingRecord.descripcion = data.descripcion;
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_tipo_descuentos') {
                existingRecord.tipo_valor = data.tipo_valor;
                existingRecord.valor = data.valor;
            } else if (tableId === 'datatable_trasnportistas') {
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_propiedadesComprobantes') {
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_especialidad_cliente') {
                existingRecord.estado = data.estado;
            } else if (tableId === 'datatable_descxCateoriasCliente') {
                existingRecord.valor = data.valor;
                existingRecord.estado = data.estado;
            }

        }
    }
}


function handleDeleteRows(table, tableId) {
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
        validateTable(table, tableId);
        habiltarTabsAplicar();
    });
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

    // Aquí removemos el evento global anterior para evitar que afecte a todas las filas nuevas
    $(document).off('modalRowSelected');

    if (tableId === tablaDesXCategoriasCliente) {
        // Evento para manejar la selección de fila en el modal
        $(document).on('modalRowSelected', function (event, selectedData) {
            if (selectedData) {
                var action = selectedData.action;
                console.log('Esta es la variable de acción: ' + action);
                // Llenar las celdas correspondientes en la nueva fila
                if (action === acionBuscarTipoNegociacion) {
                    $newRow.find('td:eq(0)').text(selectedData.cod_tipo_negociacion);
                    $newRow.find('td:eq(2)').text(selectedData.nombre);
                } else if (action === accionBuscarCategorias) {
                    $newRow.find('td:eq(3)').text(selectedData.cod_categoria);
                    $newRow.find('td:eq(5)').text(selectedData.nombre);
                } else if (action === accionBuscarTipoDescuentosItems) {
                    $newRow.find('td:eq(6)').text(selectedData.cod_descuento);
                    $newRow.find('td:eq(8)').text(selectedData.nombre);
                }

            }
        });

    }


    // Hacer todas las celdas editables solo si no es la tabla 'datatable_descxCateoriasCliente'
    if (tableId !== tablaDesXCategoriasCliente) {
        $newRow.children().attr('contenteditable', 'true');
    }

    // // Hcer que todas la celdas sena editables
    // $newRow.children().attr('contenteditable', 'true');

    // Enfocar la primera celda editable para empezar a escribir
    $newRow.find('td[contenteditable="true"]:first').focus();
    $newRow.find('td.btnCell').attr('contenteditable', 'false');

    // Si es necesario, deshabilitar edición en los selects
    if (tableId === 'datatable_negociacion' || tableId === 'datatable_categorias' || tableId === 'datatable_placas_vehiculos'
        || tableId === 'datatable_tipo_descuentos' || tableId === 'datatable_trasnportistas' || tableId === 'datatable_propiedadesComprobantes'
        || tableId === 'datatable_especialidad_cliente' || tableId === 'datatable_descxCateoriasCliente') {
        $newRow.find('select').attr('contenteditable', 'false');
        $newRow.find('td:has(select)').attr('contenteditable', 'false');// No permite que las celdas que puedan ser editable , solo el select
    }
    // Habilitar los botones en la nueva fila
    $newRow.find('button.btnModal').removeAttr('disabled');
}

//Campos a verificar que no pueden ir vacios
function validateRowData(data, tableId) {
    switch (tableId) {
        case 'datatable_documentacion':
            return data.cod_tipo_documentacion.trim() !== '' && data.nombre.trim() !== '';
        case 'datatable_precio':
            return data.cod_tipo_precio.trim() !== '' && data.nombre.trim() !== '';
        case 'datatable_negociacion':
            return data.cod_tipo_negociacion.trim() !== '' && data.nombre.trim() !== '' && data.tipo.trim() !== '' && data.estado != null;
        case 'datatable_categorias':
            return data.cod_categoria.trim() !== '' && data.nombre.trim() !== '' && data.estado != null;
        case 'datatable_placas_vehiculos':
            return data.cod_placa.trim() !== '' && data.descripcion.trim() !== '' && data.estado != null;
        case 'datatable_tipo_descuentos':
            return data.cod_descuento.trim() !== '' && data.nombre.trim() !== '' && data.tipo_valor.trim() !== '' && data.valor != null;
        case 'datatable_trasnportistas':
            return data.cod_persona !== '' && data.estado != null;
        //         return typeof data.cod_persona === 'number' && data.cod_persona != null && data.nombre.trim() !== '' && data.estado != null;
        case 'datatable_propiedadesComprobantes':
            return data.cod_propiedad.trim() !== '' && data.nombre.trim() !== '' && data.estado != null;
        case 'datatable_especialidad_cliente':
            return data.cod_especialidad.trim() !== '' && data.nombre.trim() !== '' && data.estado != null;
        case 'datatable_descxCateoriasCliente':
            return data.cod_tipo_negociacion.trim() !== '' && data.cod_categoria.trim() !== '' && data.cod_descuento.trim() !== '' && data.valor !== null && data.estado != null;
        default:
            return false;
    }
}

//Validar si hay campos obligatorios vacíos en la tabla
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

// Manejar evento cuando el usuario cambia de pestaña
$('a[data-toggle="pill"]').on('click', function (e) {
    var targetTab = $(this).attr('href');
    var $table = $(targetTab).find('table').DataTable();
    var tableId = $table.attr('id');

    // Validar la tabla antes de cambiar de pestaña
    if (!validateTable($table, tableId)) {
        e.preventDefault(); // Cancelar cambio de pestaña
        console.log('Hay campos obligatorios vacíos en la tabla ' + tableId);
        alert('Por favor complete todos los campos obligatorios antes de cambiar de pestaña.');
        return false;
    }
});


// Validar los datos cuando el usuario sale de la fila completa
$('body').on('blur', 'td[contenteditable="true"]', function () {
    var $cell = $(this);
    var $row = $cell.closest('tr');
    validateRow($row);
});



function validateRow($row) {
    var tableId = $row.closest('table').attr('id');
    var table = tablas[tableId];
    var rowIndex = table.row($row).index();
    var rowData = table.row(rowIndex).data();

    // Validar los datos de la fila según la tabla actual
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
    // Validar los datos de la fila según la tabla actual
    if (!validateRowData(rowData, tableId) || isEmpty) {
        // Si los datos de la fila no son válidos o alguna celda está vacía y no debería estarlo
        console.log('La fila no es válida para la tabla', tableId);
        // Deshabilitar pestañas y botón de guardar
        $('a[data-toggle="pill"]').addClass('disabled');
        $('#saveChanges').prop('disabled', true);

        // Mostrar mensaje de campos vacíos si aplica
        if (isEmpty) {
            // $(document).Toasts('create', {
            //     class: 'bg-info',
            //     title: 'Validación',
            //     body: 'Hay campo/s vacíos.'
            // });
            toastr.info('Hay campo/s vacíos.');
        }
    } else {
        // Habilitar pestañas y botón de guardar si la fila es válida
        $('a[data-toggle="pill"]').removeClass('disabled');
        $('#saveChanges').prop('disabled', false);
    }
}


function isCellAllowedToBeEmpty($cell, tableId) {
    var columnIndex = $cell.index();
    var allowedEmptyColumns = [];

    switch (tableId) {
        case tablaDocumentacion:
            break;
        case tablaPrecio:
            break;
        case tablaCategorias:
            break;
        case tablaPlacasVehiculos:
            // No hay columnas permitidas para estar vacías especificadas aquí
            break;
        case tablaNegociacion:
            allowedEmptyColumns = [2, 3]; // Índices de las columnas cupo y plazo que pueden estar vacías
            break;
        case tablaTipoDescuentos:
            break;
        case tablaTrasnportistas:
            allowedEmptyColumns = [1]; // Índice de la columna nombre que puede estar vacía
            break;
        case tablaPropiedadComprobantes:
            break;
        case tablaEspecializacionCliente:
            break;
        case tablaDesXCategoriasCliente:
            // No hay columnas permitidas para estar vacías especificadas aquí
            break;
        default:
            break;
    }

    return allowedEmptyColumns.includes(columnIndex);
}


//si
// Validar los datos cuando el usuario cambia un


$('body').on('change', 'select', function () {
    var $select = $(this);
    var $row = $select.closest('tr');
    validateRow($row);

});


$('#saveChanges').click(function () {
    var isValid = true;
    // Validar cada tabla antes de guardar cambios
    for (var tableId in dataRecords) {
        if (dataRecords.hasOwnProperty(tableId)) {
            var $table = $('#' + tableId).DataTable();
            if (!validateTable($table, tableId)) {
                isValid = false;
                console.log('Hay campos obligatorios vacíos en la tabla ' + tableId);
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
                                recargarTablas();
                                resetDataRecords();
                            }


                        }
                    }
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


// Función para verificar si hay cambios pendientes en dataRecords
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




// Eventos de agregar nuevas filas
$('#addRowDocumentacion').on('click', function () {
    addNewRow(tablaDocumentacion, ['cod_tipo_documentacion', 'nombre']);
});

$('#addRowPrecio').on('click', function () {
    addNewRow(tablaPrecio, ['cod_tipo_precio', 'nombre']);
});

$('#addRowNegociacion').on('click', function () {
    addNewRow(tablaNegociacion, ['cod_tipo_negociacion', 'nombre', 'cupo', 'plazo', 'tipo', 'estado']);
});

$('#addRowCategorias').on('click', function () {
    addNewRow(tablaCategorias, ['cod_categoria', 'nombre', 'estado']);
});

$('#addRowPlacasVehiculos').on('click', function () {
    addNewRow(tablaPlacasVehiculos, ['cod_placa', 'descripcion', 'estado']);
});

$('#addRowTrasnportistas').on('click', function () {
    addNewRow(tablaTrasnportistas, ['cod_persona', 'nombre', 'estado']);
});

$('#addRowTipoDescuentoItems').on('click', function () {
    addNewRow(tablaTipoDescuentos, ['cod_descuento', 'nombre', 'tipo_valor', 'valor']);
});

$('#addRowPropiedadesComprobantes').on('click', function () {
    addNewRow(tablaPropiedadComprobantes, ['cod_propiedad', 'nombre', 'estado']);
});

$('#addRowEspecialidadCliente').on('click', function () {
    addNewRow(tablaEspecializacionCliente, ['cod_especialidad', 'nombre', 'estado']);
});

$('#addRowDescXCategoriasCliente').on('click', function () {
    addNewRow(tablaDesXCategoriasCliente, ['cod_tipo_negociacion', 'nombre_tipo_negociacion', 'cod_categoria', 'nombre_categoria', 'cod_descuento', 'nombre_descuento', 'valor', 'estado']);
});

// Evento de clic para todos los botones con la clase 'btnModal'
$(document).on('click', '.btnModal', function () {
    var action = $(this).data('action');
    $('#modalAcceptButton').data('action', action);
    fetchDataAndShowModal(action);
});
// Evento para seleccionar una fila en la tabla dentro del modal
$(document).on('click', '#modalTable tbody tr', function () {
    // Remover clase de selección de todas las filas
    $('#modalTable tbody tr').removeClass('selected');
    // Agregar clase de selección a la fila clickeada
    $(this).addClass('selected');
    var action = $('#modalAcceptButton').data('action'); // Obtener la acción guardada
    $(this).data('action', action);

});

// Evento para aceptar la selección y mostrar en consola
$('#modalAcceptButton').on('click', function () {
    var selectedData = $('#modalTable').DataTable().row('.selected').data();
    if (selectedData) {
        var action = $('#modalAcceptButton').data('action'); // Obtener la acción guardada
        selectedData.action = action;
        $(document).trigger('modalRowSelected', [selectedData]);
        $('#modal-lg').modal('hide');
    } else {
        // console.error('No se ha seleccionado ninguna fila.');
        toastr.info('No se ha seleccionado ninguna fila.');

    }
});

//  evento  del btn cancelar
$('#cancelButton').click(function () {
    resetDataRecords();
    // toastr.info('Los cambios han sido cancelados y los datos han sido restablecidos.');
    $(document).Toasts('create', {
        class: 'bg-info',
        title: 'Validación',
        body: 'Los cambios han sido cancelados y los datos han sido restablecidos.'
    });
});


function resetDataRecords() {
    // dataRecords = {
    //     'datatable_documentacion': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_precio': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_negociacion': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_categorias': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_placas_vehiculos': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //
    //     'datatable_tipo_descuentos': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_trasnportistas': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_propiedadesComprobantes': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_especialidad_cliente': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    //     'datatable_descxCateoriasCliente': {
    //         added: [],
    //         updated: [],
    //         deleted: []
    //     },
    // };
// Iterar sobre cada clave del objeto dataRecords
    for (let key in dataRecords) {
        // Verificar que la propiedad existe directamente en el objeto y no en su cadena de prototipo
        if (dataRecords.hasOwnProperty(key)) {
            // Reiniciar las listas vaciándolas
            dataRecords[key].added = [];
            dataRecords[key].updated = [];
            dataRecords[key].deleted = [];
        }
    }

    // Recargar todas las tablas y re-asociar eventos
    // for (var id in tablas) {
    //     if (tablas.hasOwnProperty(id)) {
    //         tablas[id].ajax.reload(function () {
    //             handleEditableCells(tablas[id], id);
    //             handleDeleteRows(tablas[id], id);
    //             habiltarTabsAplicar();
    //
    //         }, false);
    //     }
    // }
    recargarTablas();


}

function recargarTablas() {
    for (var id in tablas) {
        if (tablas.hasOwnProperty(id)) {
            tablas[id].ajax.reload(function () {
                handleEditableCells(tablas[id], id);
                handleDeleteRows(tablas[id], id);
                habiltarTabsAplicar();

            }, false);
        }
    }

}

function habiltarTabsAplicar() {
    // Habilitar pestañas y botón de guardar después de resetear los datos
    $('a[data-toggle="pill"]').removeClass('disabled');
    $('#saveChanges').prop('disabled', false);

}

//Rellenar las tablas del model segun su accion
function fetchDataAndShowModal(action) {
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            'action': action
        },
        success: function (data) {

            // Agregar la variable `action` a cada fila de datos
            data = data.map(row => {
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
            if (action === acionBuscarTipoNegociacion) {
                titulo = 'Listado de Tipos de Negociacion';
                // Configurar el título del modal
                columns = ['cod_tipo_negociacion', 'nombre'];
            } else if (action === accionBuscarCategorias) {
                titulo = 'Listado de Categorias';
                // Configurar el título del modal
                columns = ['cod_categoria', 'nombre'];
            } else if (action === accionBuscarTipoDescuentosItems) {
                titulo = 'Listado de Descuentos ';
                // Configurar el título del modal
                columns = ['cod_descuento', 'nombre'];
            }

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


$.fn.dataTable.ext.errMode = 'none';

///
//si
// Función para validar una fila completa
// function validateRow($row) {
//     var tableId = $row.closest('table').attr('id');
//     var table = tablas[tableId];
//     var rowIndex = table.row($row).index();
//     var rowData = table.row(rowIndex).data();
//
//     // Validar los datos de la fila según la tabla actual
//     if (!validateRowData(rowData, tableId)) {
//         console.log('Los datos de la fila no son válidos para la tabla', tableId);
//         // Mostrar mensaje de error específico para cada campo obligatorio no completado
//         switch (tableId) {
//             case 'datatable_documentacion':
//                 if (rowData.cod_tipo_documentacion.trim() === '') {
//                     console.log('Código de tipo de documentación es obligatorio.');
//                 }
//                 if (rowData.nombre.trim() === '') {
//                     console.log('Nombre es obligatorio.');
//                 }
//                 break;
//             case 'datatable_precio':
//                 if (rowData.cod_tipo_precio.trim() === '') {
//                     console.log('Código de tipo de precio es obligatorio.');
//                 }
//                 if (rowData.nombre.trim() === '') {
//                     console.log('Nombre es obligatorio.');
//                 }
//                 break;
//             case 'datatable_negociacion':
//                 if (rowData.cod_tipo_negociacion.trim() === '') {
//                     console.log('Código de tipo de negociación es obligatorio.');
//                 }
//                 if (rowData.nombre.trim() === '') {
//                     console.log('Nombre es obligatorio.');
//                 }
//                 if (rowData.tipo.trim() === '') {
//                     console.log('Tipo es obligatorio.');
//                 }
//                 if (rowData.estado == null) {
//                     console.log('Estado es obligatorio.');
//                 }
//                 break;
//             case 'datatable_categorias':
//                 if (rowData.cod_categoria.trim() === '') {
//                     console.log('Código de categoría es obligatorio.');
//                 }
//                 if (rowData.nombre.trim() === '') {
//                     console.log('Nombre es obligatorio.');
//                 }
//                 if (rowData.estado == null) {
//                     console.log('Estado es obligatorio.');
//                 }
//                 break;
//             case 'datatable_placas_vehiculos':
//                 if (rowData.cod_placa.trim() === '') {
//                     console.log('Código de placa es obligatorio.');
//                 }
//                 if (rowData.descripcion.trim() === '') {
//                     console.log('Descripcion es obligatorio.');
//                 }
//                 if (rowData.estado == null) {
//                     console.log('Estado es obligatorio.');
//                 }
//                 break;
//             default:
//                 break;
//         }
//
//         // Deshabilitar la capacidad de cambiar de pestaña si hay errores en la fila
//         $('a[data-toggle="pill"]').addClass('disabled');
//         // Deshabilitar la capacidad de guardar cambios si hay errores en la fila
//         $('#saveChanges').prop('disabled', true);
//     } else {
//         // Habilitar la capacidad de cambiar de pestaña si la fila es válida
//         $('a[data-toggle="pill"]').removeClass('disabled');
//         // Habilitar la capacidad de guardar cambios si la fila es válida
//         $('#saveChanges').prop('disabled', false);
//     }
// }








