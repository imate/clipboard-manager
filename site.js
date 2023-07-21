const { ipcRenderer } = require('electron');
const os = require("os");
window.$ = window.jQuery = require('jquery');

ipcRenderer.send('refresh-list');

ipcRenderer.on('refresh-list', function (e, data) {
    let table = $('table#list');
    let tbody = $('<tbody></tbody>')
    let i = 0;
    data.forEach(element => {
        let tr = $('<tr title="' + encodeHtml(element.value) + '"></tr>');
        tr.append('<td>#' + (i + 1) + '</td>');
        tr.append('<td class="text-muted">' + formatDateIsoString(element.date) + '</td>');
        tr.append('<td>' + encodeHtml(element.value) + '</td>');
        tr.append('<td class="text-end">' + element.value.length + '</td>');
        tr.append('<td class="text-center">' + createRowButtons(i) + '</td>')
        tbody.append(tr);
        i++;
    });
    table.html(tbody);
});

function createRowButtons(i) {
    let html = '<div class="btn-group">';
    html += '<button class="btn btn-sm btn-outline-dark" onclick="copyItem(' + i + ')"><i class="fa-solid fa-clipboard"></i></button>';
    html += '<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteItem(' + i + ')"><i class="fa-solid fa-trash"></i></button>';
    html += '</div>';
    return html;
}

ipcRenderer.on('indicate-listening', function (e, data) {
    if (data) {
        $('#btn-toggle-listening').addClass('btn-success').removeClass('btn-danger');
    } else {
        $('#btn-toggle-listening').addClass('btn-danger').removeClass('btn-success');
    }
});

$('#btn-clear-list').on('click', function () { ipcRenderer.send('clear-list'); });
$('#btn-clear-duplicates').on('click', function () { ipcRenderer.send('clear-duplicates'); });
$('#btn-toggle-listening').on('click', function () { ipcRenderer.send('toggle-listening'); });

function copyItem(i) { ipcRenderer.send('copy-item', i); }
function deleteItem(i) { ipcRenderer.send('delete-item', i); }

function encodeHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function formatDateIsoString(str) { return new Date(str).toTimeString().split(' ')[0]; }

