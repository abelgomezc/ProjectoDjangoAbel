function get_json_from_script(script_id = "gr_dets") {
    //transforma un scritp tag a JSON
    if (!!script_id) {
        let x = (document.getElementById(script_id) ? JSON.parse(document.getElementById(script_id).textContent) : null)
        return (x != null && Object.keys(x).length > 0 ? x : null)
    } else {
        console.log("script_id is null");
        return null;
    }
}

function pr_renderGrid(element) {
    eval("element.gridOptions.onCellEditingStarted=" + element.gridOptions.onCellEditingStarted);
    if (element.addNewRow.allowAddNewRow) {
        eval("element.addNewRow.addNewRowFnDataJS=" + element.addNewRow.addNewRowFnDataJS);
        let addButton = document.getElementById(element.addNewRow.grid_btn_add);
        addButton.addEventListener("click", function () {
            //agrega la nueva fila con los datos predefinidos
            const res = element.gridOptions.api.applyTransaction({
                add: element.addNewRow.addNewRowFnDataJS()
            });
        });
    }
    if (element.removeSelectedRows.alloRemoveSelectedRows) {
        let delButton = document.getElementById(element.removeSelectedRows.grid_btn_rem);
        //agrega el evento remover filas con la seleccion de datos
        delButton.addEventListener("click", function () {
            element.gridOptions.api.applyTransaction({remove: element.gridOptions.api.getSelectedRows()});
        });
    }
    document.getElementById(element.grid_id + "_title").innerHTML = "<b>" + element.grid_title + "</b>";
    const eGridDiv = document.querySelector('#' + element.grid_id);
    new agGrid.Grid(eGridDiv, element.gridOptions);
}

// metodo de peticion al servidor que devuelve un json
async function sendToServer(url, data = null, method = null, returntype = 1) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    // Default options are marked with *

    const response = await fetch(url, {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        /*
        headers: {
            //'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        */
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data // body data type must match "Content-Type" header
    });

    if (response.status == 200) {
        if (returntype == 1) {
            return response.json(); // parses JSON response into native JavaScript objects
        } else if (returntype == 2) {
            // Usado para retorno de archivos como pdf-images
            return response.blob();
        } else { //3ra opcion response blob con el nombre
            return {blob: response.blob(), name: response.headers.get('Content-Disposition')};
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo a ocurrido durante el proceso: ' + response.statusText,
            footer: '<a href="">Comuníquese con el administrador</a>'
        });
        throw new Error('continuación función sendToServer cancelada');
    }


}

function imprimir_errores(data) {
    let elms = document.querySelectorAll("[id='error']");
    let selects = document.getElementsByClassName("is-invalid");
    for (let i = 0; i < elms.length; i++) {
        elms[i].parentNode.removeChild(elms[i]); //borra los errores en pantalla
    }
    for (let i = 0; i < selects.length; i++) {
        selects[i].classList.remove("is-invalid"); //borra los errores en las listas si existen
    }
    $.each(data, function (key, value) {
        if (key == '__all__') {
            const body = document.querySelector(".content");
            const div = document.createElement("div");  // <div></div>
            div.id = "error"
            div.className = "alert alert-block alert-danger";
            div.innerHTML = "<h4 class='alert-heading'>Errores</h4>";
            div.innerHTML = div.innerHTML + "<ul class='m-0'>";
            for (var i = 0; i < value.length; i++) {
                div.innerHTML = div.innerHTML + "<li>" + value[i] + "</li>";
            }
            div.innerHTML = div.innerHTML + "</ul>";
            body.insertAdjacentElement("afterbegin", div);
        } else {
            let etiqueta = 'id_' + key;
            if (document.getElementById(etiqueta)) {
                document.getElementById(etiqueta).classList.add('is-invalid');
                document.getElementById(etiqueta).insertAdjacentHTML("afterend",
                    "<label id=\"error\" style=\"display:inline;\" class=\"invalid-feedback\"  for=\" " + etiqueta + " \" >" + value + "</label>");
            }
        }
    });
}

//para redeondear un valor
function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

// para formatear un numero
function formatNumber(number, pattern) {
    let fractionDigits = (pattern.split('.')[1] || '').length;

    let formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });

    return formatter.format(number);
}

// Permite mostrar correctamento los elementos de lista en grids (Sycfusion no tiene un metodo predeterminado para esto)
function onOpen() {
    // find the popup list
    const list = document.querySelector('.e-popup .e-list-parent');

    // iterate through each list item
    const items = list.querySelectorAll('.e-list-item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // remove the text-overflow style to show full text
        item.style.textOverflow = 'initial';
        item.style.whiteSpace = 'normal';
    }
}


function limpia_subtotales_ven(prefijo_tabla) {
    // console.log('updateSubtotales', this.items);
    document.querySelector('#id_' + prefijo_tabla + '_subtot_coniva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtot_siniva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtot_exeiva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtot_noobjiva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotsd_coniva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotsd_siniva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotsd_exeiva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotsd_noobjiva').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotalsd').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_dsctodet').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_dsctopct').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_dsctoval').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_subtotal').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_dsctotot').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_iceval').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_ivaval').value = 0.0;
    document.querySelector('#id_' + prefijo_tabla + '_total').value = 0.0;
}

function getStringCurrentDate() {
    //const d = new Date();
    //let day = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    const fechaActual = new Date();
    // obtiene el año, mes y día de la fecha actual
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    const dia = fechaActual.getDate();

    // formatea la fecha d/m/yyyy
    return `${dia < 10 ? '0' : ''}${dia}/${mes < 10 ? '0' : ''}${mes}/${anio}`;
}

// // Agrergar indice secuencial a los elementos (registros de una grilla)
// function addIndexToItems(elementos) {
//     let i = 1;
//     elementos.forEach(elemento => {
//         elemento.id = i;
//         i++;
//     });
//     return elementos;
// }
//
// // Concatena dos arreglos
// function appendItems(arr1, arr2) {
//     return arr1.concat(arr2);
// }

function fn_generateDownloadPdf(data, rep_nombre) {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = rep_nombre + '.pdf'; //pdf name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

//validar numero de cedula
function validarIdentificacion() {
    var form_id = $('form').attr('id');
    var l_ident = document.forms[form_id]["prs_identificacion"].value;
    console.log('noches' + l_ident);
    if (!(l_ident == '' || l_ident == null)) {
        form = document.querySelector('#' + form_id);
        fields = new FormData(form);
        fields.append('CONSULT', l_ident);
        sendToServer(url = form.action, data = fields, method = 'post')
            .then(data => {
                let elms = document.querySelectorAll("[id='error']");
                for (var i = 0; i < elms.length; i++) {
                    elms[i].parentNode.removeChild(elms[i]);
                    var element = document.getElementById("id_prs_identificacion");
                    element.classList.remove("is-invalid");
                }
                if (data.prs_identificacion) { //si encuentra errores en la identificacion
                    imprimir_errores(data);
                } else if (data.url_edit) { // si la identifiacion existe redirige
                    window.location.replace(data.url_edit);
                } else if (data.a == 1) { //cuando no hay persona existente y va a ser nueva

                } else { //cuando ya existe y rellenamos el formulario
                    document.forms[form_id]["prs_nombres"].value = data[0].fields.prs_nombres;
                    document.forms[form_id]["prs_apellidos"].value = data[0].fields.prs_apellidos;
                    document.forms[form_id]["prs_dirprinc"].value = data[0].fields.prs_dirprinc;
                    document.forms[form_id]["prs_dirsecun"].value = data[0].fields.prs_dirsecun;
                    document.forms[form_id]["prs_dirnum"].value = data[0].fields.prs_dirnum;
                    document.forms[form_id]["prs_telef1"].value = data[0].fields.prs_telef1;
                    document.forms[form_id]["prs_numtlf2"].value = data[0].fields.prs_numtlf2;
                    document.forms[form_id]["prs_numcel"].value = data[0].fields.prs_numcel;
                    document.forms[form_id]["prs_email"].value = data[0].fields.prs_email;
                    if (document.forms[form_id]["prs_fechanac"]) {
                        document.forms[form_id]["prs_fechanac"].value = data[0].fields.prs_fechanac;
                    }
                    $("#id_prs_identificacion").addClass("disablegrid ");
                    $("#id_tid_id").addClass("disablegrid");
                    $("#id_tid_id").addClass("disablegrid ");
                    $('#id_tid_id').attr('readonly', true);
                    $('#id_prs_identificacion').attr('readonly', true);
                }
            }).catch((error) => {
                console.log("Error: " + error);
            }
        );
    }

}