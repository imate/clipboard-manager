const { app, BrowserWindow, ipcMain } = require('electron')
const clipboardListener = require('clipboard-event');
const clipboardy = require('clipboardy');
const jp = require("fs-jetpack");

const JSON_FILE_NAME = 'clipboard.json';

let mainWindow;
let jetpack = jp.cwd(app.getPath('userData'));

let logger = {
    log: function (message) {
        console.log(message);
    }
};

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 640, height: 480,
        icon: 'assets/favicon.ico',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    })

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });

let dataSource;// = [];
clipboardListener.startListening();

clipboardListener.on('change', () => {
    try {
        dataSource.unshift({ date: new Date().toISOString(), value: clipboardy.readSync() });
        refreshList();
    } catch (ex) {
        logger.log('Error on clipboardListener change event: ' + ex.message);
    }
});


function refreshList() {
    if (dataSource) {
        jetpack.write(JSON_FILE_NAME, dataSource);
    } else {
        try {
            dataSource = JSON.parse(jetpack.read(JSON_FILE_NAME));
        } catch (ex) {
            logger.log(ex.message);
            dataSource = [];
        }
    }
    mainWindow.webContents.send('refresh-list', dataSource);
}

ipcMain.on('copy-item', async function (e, i) {
    let value = dataSource[i].value
    dataSource.splice(i, 1);
    clipboardy.writeSync(value);
});

ipcMain.on('delete-item', async function (e, i) {
    dataSource.splice(i, 1);
    refreshList();
});

ipcMain.on('clear-duplicates', async function (e) {
    let tempDS = [];
    dataSource.forEach(element => {
        if (!tempDS.some(x => x.value === element.value)) {
            tempDS.push(element);
        }
    });
    dataSource = tempDS;
    refreshList();
});

ipcMain.on('clear-list', async function (e) {
    dataSource = [];
    refreshList();
});

ipcMain.on('refresh-list', async function (e) {
    refreshList();
});

let listening = true;

ipcMain.on('toggle-listening', async function (e) {
    try {
        if (listening) {
            clipboardListener.stopListening();
        } else {
            clipboardListener.startListening();
        }
        listening = !listening;
        mainWindow.webContents.send('indicate-listening', listening);
    } catch (ex) {
        logger.log(ex.message);
    }
});