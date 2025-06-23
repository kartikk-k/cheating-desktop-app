/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, globalShortcut, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let previousAppBundleId: string | null = null; // Store the previous focused app bundle ID
let movementShortcutsRegistered = false; // Track if movement shortcuts are registered

// Function to get the currently active application bundle ID (macOS)
const getActiveAppBundleId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('osascript -e \'tell application "System Events" to get bundle identifier of first application process whose frontmost is true\'', (error: any, stdout: string) => {
      if (error) {
        resolve(null);
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

// Function to activate an application by bundle ID (macOS)
const activateAppByBundleId = (bundleId: string): Promise<void> => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`osascript -e 'tell application id "${bundleId}" to activate'`, (error: any) => {
      resolve();
    });
  });
};

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // Get screen dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // Calculate window dimensions and position
  const windowWidth = 400;
  const windowHeight = screenHeight - 40; // Full height minus 20px padding on top and bottom
  const windowX = screenWidth - windowWidth - 20; // Right side with 20px padding
  const windowY = 50; // 20px padding from top

  mainWindow = new BrowserWindow({
    show: false,
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    icon: getAssetPath('icon.png'),
    transparent: true,
    frame: false,
    thickFrame: true,
    opacity: 1,
    alwaysOnTop: true,
    skipTaskbar: process.platform === 'win32',
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Hide from dock on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window focus events
  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('window-focus', true);
  });

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('window-focus', false);
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Disable developer tools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.closeDevTools();
  });

  // Prevent opening developer tools via keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      event.preventDefault();
    }
    if (input.control && input.shift && input.key.toLowerCase() === 'c') {
      event.preventDefault();
    }
    if (input.key === 'F12') {
      event.preventDefault();
    }
    
    // Move window with Cmd+Shift+Arrow keys
    if (input.meta && input.shift) {
      if (input.key === 'ArrowUp') {
        event.preventDefault();
        if (mainWindow) {
          const [x, y] = mainWindow.getPosition();
          mainWindow.setPosition(x, y - 50); // Move window up by 50 pixels
        }
      } else if (input.key === 'ArrowDown') {
        event.preventDefault();
        if (mainWindow) {
          const [x, y] = mainWindow.getPosition();
          mainWindow.setPosition(x, y + 50); // Move window down by 50 pixels
        }
      } else if (input.key === 'ArrowLeft') {
        event.preventDefault();
        if (mainWindow) {
          const [x, y] = mainWindow.getPosition();
          mainWindow.setPosition(x - 50, y); // Move window left by 50 pixels
        }
      } else if (input.key === 'ArrowRight') {
        event.preventDefault();
        if (mainWindow) {
          const [x, y] = mainWindow.getPosition();
          mainWindow.setPosition(x + 50, y); // Move window right by 50 pixels
        }
      }
    }
  });

  // Function to register movement shortcuts
  const registerMovementShortcuts = () => {
    if (movementShortcutsRegistered) return;
    
    globalShortcut.register('CommandOrControl+Shift+Up', () => {
      if (mainWindow) {
        const [x, y] = mainWindow.getPosition();
        mainWindow.setPosition(x, y - 50); // Move window up by 50 pixels
      }
    });

    globalShortcut.register('CommandOrControl+Shift+Down', () => {
      if (mainWindow) {
        const [x, y] = mainWindow.getPosition();
        mainWindow.setPosition(x, y + 50); // Move window down by 50 pixels
      }
    });

    globalShortcut.register('CommandOrControl+Shift+Left', () => {
      if (mainWindow) {
        const [x, y] = mainWindow.getPosition();
        mainWindow.setPosition(x - 50, y); // Move window left by 50 pixels
      }
    });

    globalShortcut.register('CommandOrControl+Shift+Right', () => {
      if (mainWindow) {
        const [x, y] = mainWindow.getPosition();
        mainWindow.setPosition(x + 50, y); // Move window right by 50 pixels
      }
    });

    movementShortcutsRegistered = true;
  };

  // Function to unregister movement shortcuts
  const unregisterMovementShortcuts = () => {
    if (!movementShortcutsRegistered) return;
    
    globalShortcut.unregister('CommandOrControl+Shift+Up');
    globalShortcut.unregister('CommandOrControl+Shift+Down');
    globalShortcut.unregister('CommandOrControl+Shift+Left');
    globalShortcut.unregister('CommandOrControl+Shift+Right');
    
    movementShortcutsRegistered = false;
  };

  // Register global shortcut for toggling window visibility
  globalShortcut.register('CommandOrControl+\\', async () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        // Store the current focused app before hiding
        previousAppBundleId = await getActiveAppBundleId();
        mainWindow.hide();
        // Unregister movement shortcuts when window is hidden
        unregisterMovementShortcuts();
        // Focus back to the previous app
        if (previousAppBundleId && previousAppBundleId !== 'com.electron.desktop-daddy') {
          await activateAppByBundleId(previousAppBundleId);
        }
      } else {
        // Store the current focused app before showing
        previousAppBundleId = await getActiveAppBundleId();
        mainWindow.show();
        mainWindow.focus();
        // Register movement shortcuts when window is shown
        registerMovementShortcuts();
      }
    }
  });

  // Register movement shortcuts initially since window will be visible
  registerMovementShortcuts();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
