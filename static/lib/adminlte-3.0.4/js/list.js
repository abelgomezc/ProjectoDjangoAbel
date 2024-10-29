// funcion para cargar  la tabla con ajax tipo catalogo  diferentes templetes
$(document).ready(function() {

    $('#data').DataTable({


        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true,
        ajax: {
            url: window.location.pathname,
            type: 'POST',
            data: {
                'action': 'searchdata'
            },
            dataSrc: ""
        },
        columns: [
            { data: 'cod_tipo_catalogo' },
            { data: 'nombre' },
            {
                data: null,
                className: "text-center",
                orderable: false,
                render: function(data, type, row) {
                  var editUrl = `/administracion/editartipocatalogo/${data.cod_tipo_catalogo}/`;
                  var deleteUrl = `/administracion/eliminartipocatalogo/${data.cod_tipo_catalogo}/`;
                  var buttons = `<a href="${editUrl}" class="btn btn-warning btn-sm"><i class="fa fa-edit"></i> Editar</a> `;
                   buttons += `<a href="${deleteUrl}" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i> Eliminar</a>`;
                    return buttons;
                }
            }
        ],
        initComplete: function(settings, json) {

        }
    });
});

var tbTipoCatalogo;
// funcion para cargar los registro a la variable  tbTipoCatalogo
function getData(){
   tbTipoCatalogo =  $('#datat').DataTable({
          responsive: true,
          autoWidth: false,
          destroy: true,
          deferRender: true,
          ajax: {
               url: window.location.pathname,
               type: 'POST',
               data: {
                 'action': 'searchdata'
               },
               dataSrc: ""
          },
           columns: [
                { data: 'cod_tipo_catalogo' },
                { data: 'nombre' },
                {
                   data: null,
                   className: "text-center",
                   orderable: false,
                   render: function(data, type, row) {
                       var buttons = `<a href="#" rel="edit" class="btn btn-warning btn-sm"><i class="fa fa-edit"></i> Editar</a> `;
                         buttons += `<a href="#" rel ="elim" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i> Eliminar</a>`;
                         return buttons;
                   }
                }
           ],
            initComplete: function(settings, json) {

            }
    });
}

// funciones para el crud   con modoles
$(function (){

    //carga  los datos en la tabla
    getData();
      console.log('data ');

    // EVENTO PARA AGREGAR REGISTRO
    $('.btnAdd').on('click', function() {
        $('input[name="action"]').val('add');
        $('form')[0].reset();
        $('#tituloh5').text('Nuevo Registro ');
//        $('#modalTipoCatalogo').on('shown.bs.modal', function() {
//            $('#id_cod_tipo_catalogo').prop('readonly',false);
//            $('#tituloh5').text('Nuevo Registro');
//             $('form')[0].reset();
//
//        });
        //$('#modalTipoCatalogo').modal('show');
         $('#modalTipoCatalogo').modal('show');
    });


    // evento cuando se cierre el modal
    $('#modalTipoCatalogo').on('show.bs.modal', function() {
        $('form')[0].reset();
    });
    // evento para la confirmacion
    $('form').on('submit', function(e) {
        e.preventDefault();
        var parameters = new FormData(this);
        submit_with_ajax(window.location.pathname, 'Notificacion', '¿Está seguro de realizar esta acción?', parameters, function() {
            $('#modalTipoCatalogo').modal('hide');
            tbTipoCatalogo.ajax.reload();
        });
    });
     // EVENTO PARA EDITAR REGISTRO
    $('#datat tbody').on('click', 'a[rel="edit"]', function(){
        var tr = tbTipoCatalogo.cell($(this).closest('td,li')).index();
        var data = tbTipoCatalogo.row(tr.row).data();
        $('#modalTipoCatalogo').off('show.bs.modal').on('shown.bs.modal', function() {
            $('#id_cod_tipo_catalogo').val(data.cod_tipo_catalogo).prop('readonly', true); // Hacer el campo solo lectura
            $('#id_nombre').val(data.nombre);
            $('#id').val(data.cod_tipo_catalogo);
            $('input[name="action"]').val('edit');
            $('#tituloh5').text('Editar Registro');
        });
        $('#modalTipoCatalogo').modal('show');
    });
    //evento para eliminar
    $('#datat tbody').on('click', 'a[rel="elim"]', function(){
        var tr = tbTipoCatalogo.cell($(this).closest('td,li')).index();
        var data = tbTipoCatalogo.row(tr.row).data();
        var parameters  = new FormData();
        parameters.append('action', 'delete');
        parameters.append('cod_tipo_catalogo', data.cod_tipo_catalogo);
        submit_with_ajax(window.location.pathname, 'Notificacion', '¿Está seguro de eliminar este Registro?', parameters, function() {
            tbTipoCatalogo.ajax.reload();
        });

    });



    //evento cuando se cierre el modal
    $('#modalTipoCatalogo').on('hidden.bs.modal', function() {
        $('#id_cod_tipo_catalogo').prop('readonly', false);
        $('input[name="action"]').val('');
        $('form')[0].reset();
     });

     // Forzar mayúsculas en el campo de nombre
    $('#id_nombre').on('input', function() {
        this.value = this.value.toUpperCase();
    });

      // Maneja el botón de cancelar
    $('#cancelButton').on('click', function() {
        $('form')[0].reset();
        $('#modalTipoCatalogo').modal('hide');


    });
    // Limpia el formulario cuando el modal se cierra
    $('#modalTipoCatalogo').on('hidden.bs.modal', function () {

      $('#id_cod_tipo_catalogo').prop('readonly',false);
      $('input[name="action"]').val('');
      $(this).find('form')[0].reset();
    });

    //

});



//////////////////////////////// tabla  encatalogo
var tbCatalogo;
// funcion para cargar los registro a la variable  tbCatalogo
function getDataCatalgo(){

   tbCatalogo =  $('#dataCatalogo').DataTable({
          responsive: true,
          autoWidth: false,
          destroy: true,
          deferRender: true,
          ajax: {
               url: window.location.pathname,
               type: 'POST',
               data: {
                 'action': 'searchdata'
               },
               dataSrc: ""
          },
           columns: [
                { data: 'cod_catalogo' },
                { data: 'nombre' },
                { data: 'cod_tipo_catalogo' },
                {
                   data: null,
                   className: "text-center",
                   orderable: false,
                   render: function(data, type, row) {
                       var buttons = `<a href="#" rel="edit" class="btn btn-warning btn-sm"><i class="fa fa-edit"></i> Editar</a> `;
                         buttons += `<a href="#" rel ="elim" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i> Eliminar</a>`;
                         return buttons;
                   }
                }
           ],
            initComplete: function(settings, json) {

            }
    });
}

$(function (){
    //carga  los datos en la tabla
    getDataCatalgo();
    // EVENTO PARA AGREGAR REGISTRO
    $('.btnAdd').on('click', function() {
        $('input[name="action"]').val('add');
        $('form')[0].reset();
        $('#tituloh5').text('Nuevo Registro ');

        $('#modalCatalogo').modal('show');
    });
     // evento cuando se abrir el modal
    $('#modalCatalogo').on('show.bs.modal', function() {
         $('.select2').select2({
            dropdownParent:$('#modalCatalogo')
         });
        $('.select2-search__field').focus();
        $('form')[0].reset();
    });

      // evento para la confirmacion
      $('#modalCatalogo').on('shown.bs.modal', function() {
        $('form').off('submit').on('submit', function(e) {
            e.preventDefault();
            var parameters = new FormData(this);
            submit_with_ajax(window.location.pathname, 'Notificación', '¿Está seguro de realizar esta acción?', parameters, function() {
                $('#modalCatalogo').modal('hide');
                tbCatalogo.ajax.reload();
            });
        });
    });
    // Maneja el botón de cancelar
    $('#cancelButton').on('click', function() {
        $('form')[0].reset();
        $('#modalCatalogo').modal('hide');

    });

   // EVENTO PARA EDITAR REGISTRO
    $('#dataCatalogo tbody').on('click', 'a[rel="edit"]', function(){
        var tr = tbCatalogo.cell($(this).closest('td,li')).index();
        var data = tbCatalogo.row(tr.row).data();
        console.log(data);
        $('#modalCatalogo').off('show.bs.modal').on('shown.bs.modal', function() {
            $('#id_cod_catalogo').val(data.cod_catalogo).prop('readonly', true); // Hacer el campo solo lectura
            $('#id_nombre').val(data.nombre);
            $('#id_cod_tipo_catalogo').val(data.cod_tipo_catalogo);
            $('#id').val(data.cod_catalogo);
            $('input[name="action"]').val('edit');
            $('#tituloh5').text('Editar Registro');
        });
        $('#modalCatalogo').modal('show');
    });





});










