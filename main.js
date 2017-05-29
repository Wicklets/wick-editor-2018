// https://electron.atom.io/docs/tutorial/quick-start/

const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
     width: 1281,
     height: 800,
     minWidth: 800,
     minHeight: 600,
     show: false,
     /*frame: false,*/
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'editor.html'),
    protocol: 'file:',
    slashes: true
  }))

  //https://electron.atom.io/docs/api/browser-window/
  // 'graceful show'
  win.once('ready-to-show', () => {
    win.show()
    console.log(win)
  });

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Disable menubar
  win.setMenu(null);


  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    app.quit()
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.