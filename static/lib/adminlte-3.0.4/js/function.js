function message_error(obj){ // que se espera que sea un objeto o una cadena de texto.
  var html = '';
  if(typeof(obj) == "object"){ // Si obj es un objeto, itera sobre sus claves y valores para construir una lista de errores.
    html = '<ul style= "text-align : left; ">';
// #trata  los errores
    $.each(obj, function(key, value){
        html += '<li>'+key+': '+value +'</li>';
     });
    html += '</ul>';
  }
  else{ //Si obj no es un objeto (probablemente una cadena de texto), crea un simple párrafo HTML para mostrar el mensaje de error.
       html ='<p>'+obj+'</p>';
  }
  Swal.fire({
      title: 'Error!',
      html: html,
      icon: 'error'
    });
}

function submit_with_ajax(url, title, content, parameters, callback) {
    $.confirm({
        theme: 'material',
        title: title,
        icon: 'fa fa-info',
        content: content,
        columnClass: 'small',
        typeAnimated: true,
        cancelButtonClass: 'btn-primary',
        draggable: true,
        dragWindowBorder: false,
        buttons: {
            info: {
                text: "Si",
                btnClass: 'btn-primary',
                action: function () {
                    $.ajax({
                        url: url,
                        data: parameters,
                        type: 'POST',
                        dataType: 'json',
                        headers: {
                         'X-CSRFToken': '{{ csrf_token }}'
                        },
                        processData: false,
                        contentType: false,
                        success: function (request) {
                            if (!request.hasOwnProperty('error')) {
                                callback(request);
                                return false;
                            }
                            message_error(request.error);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            message_error(errorThrown + ' ' + textStatus);
                        }
                    });
                }
            },
            danger: {
                text: "No",
                btnClass: 'btn-red',
                action: function () {

                }
            },
        }
    });
}



