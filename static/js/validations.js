//

function message_error(obj) {
    $.each(obj, function (key, value) {
        console.log(key);
        console.log(value);
        etiqueta = 'id_' + key; //id_cab_numero
        document.getElementById(etiqueta).insertAdjacentHTML("afterend",
            "<label id=\"\" class=\"error\" for=\"id_cab_numero\">" + value + "</label>");
    });
}

function message_error2(obj) {
    etiqueta = 'id_cue_codigov';
    var element = document.getElementById("error");
    if (typeof (element) != 'undefined' && element != null) {
        element.parentNode.removeChild(element);
        $.each(obj, function (key, value) {
            console.log(key);
            console.log(value);
            document.getElementById(etiqueta).insertAdjacentHTML("afterend",
                "<label id=\"error\" class=\"error\" for=\"id_cab_numero\">" + value + "</label>");
        });
    } else {
        $.each(obj, function (key, value) {
            console.log(key);
            console.log(value);
            document.getElementById(etiqueta).insertAdjacentHTML("afterend",
                "<label id=\"error\" class=\"error\" for=\"id_cab_numero\">" + value + "</label>");
        });
    }
}

function ajaxCuenta(ruta, parameters, urllist) {
    $.ajax({
        url: ruta,
        type: 'POST',
        data: parameters,//{csrfmiddlewaretoken: window.CSRF_TOKEN, parameters},//parameters,
        dataType: 'json'
    }).done(function (data) {
        if (!data.hasOwnProperty('error')) {
            message_error2(data.error);
            top.location.href = urllist;
            return false;
        } else {
            message_error2(data.error);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("error " + textStatus + " : " + errorThrown);
    }).always(function (data) {
    });
}

function calcularSuma(element) {
    let sum = 0, iva = 0;
    element.gridOptions.api.forEachNodeAfterFilterAndSort(function (rowNode, index) {
        const data = rowNode.data;
        sum = sum + data.total;
        iva = iva + data.iva;
    });
    element.gridOptions.pinnedBottomRowData[0]['total'] = sum;
    element.gridOptions.pinnedBottomRowData[0]['iva'] = iva;
}

// function GenderCellRenderer() {
// }
//
// GenderCellRenderer.prototype.init = function (params) {
//     this.eGui = document.createElement('span');
//     var img = params.value === 'Male' ? 'male.png' : 'female.png';
//     this.eGui.innerHTML =
//         '<img src="https://www.ag-grid.com/example-assets/genders/' +
//         img +
//         '"/> ' +
//         params.value;
// };
//
// GenderCellRenderer.prototype.getGui = function () {
//     return this.eGui;
// };


// Funcion para bloquear un campo by ID, cuando dicho campo es diferente a un valor establecido.
function bloquearCampobyId(fieldName) {
        document.getElementById('id_' + fieldName).readOnly  = true;
}
