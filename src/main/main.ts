import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Notification, desktopCapturer, BrowserView, powerMonitor } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as url from 'url';
import * as childProcess from 'child_process';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

// 全局变量，用于存储电源事件监听器
let powerEventListeners: Array<{ event: string; callback: any }> = [];
let preventSleepId: number | null = null;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // 出于安全考虑，禁用节点集成
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, '../preload/preload.js'), // 确认此路径是否正确
    },
  });

  // 加载应用
  const startUrl = isDev
    ? 'http://localhost:3000'
    : url.format({
      pathname: path.join(__dirname, '../renderer/index.html'),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.loadURL(startUrl);

  // 打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 关闭窗口时的处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建应用菜单
  createMenu();
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', role: 'reload' },
        { label: '开发者工具', role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

// 当 Electron 完成初始化时，创建浏览器窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用和它们的菜单栏通常会保持活动
  // 直到用户使用 Cmd + Q 明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理

// 获取系统信息
ipcMain.handle('get-system-info', () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    homeDir: os.homedir(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),
  };
});

// 打开文件对话框
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });

  if (canceled) {
    return [];
  }

  return filePaths;
});

// 保存文件对话框
ipcMain.handle('save-file-dialog', async (_event, content: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) {
    return { success: false, message: '操作被取消' };
  }

  try {
    fs.writeFileSync(filePath, content);
    return { success: true, message: '文件保存成功' };
  } catch (error) {
    return { success: false, message: `保存失败: ${error}` };
  }
});

// 读取文件内容
ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, message: `读取失败: ${error}` };
  }
});

// 在默认浏览器中打开链接
ipcMain.handle('open-external-link', async (_event, url: string) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, message: `打开链接失败: ${error}` };
  }
});

// 打开文件管理器并选中文件
ipcMain.handle('show-item-in-folder', async (_event, filePath: string) => {
  try {
    await shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, message: `打开文件管理器失败: ${error}` };
  }
});

// 发送通知
ipcMain.handle('show-notification', (_event, options: { title: string; body: string }) => {
  const { title, body } = options;
  new Notification({ title, body }).show();
  return { success: true };
});

// 获取可用的屏幕源
ipcMain.handle('get-desktop-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });

    return sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.id.includes('screen') ? '屏幕' : '窗口'
    }));
  } catch (error) {
    console.error('获取屏幕源失败:', error);
    return [];
  }
});

// 截取屏幕
ipcMain.handle('capture-screen', async (_event, sourceId: string) => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    const source = sources.find(s => s.id === sourceId);

    if (!source) {
      return { success: false, message: '未找到指定的屏幕源' };
    }

    // 获取缩略图作为截图
    const dataUrl = source.thumbnail.toDataURL();

    return {
      success: true,
      dataUrl
    };
  } catch (error) {
    console.error('屏幕截图失败:', error);
    return { success: false, message: `截图失败: ${error}` };
  }
});

// 保存截图
ipcMain.handle('save-screenshot', async (_event, dataUrl: string) => {
  try {
    // 从数据 URL 中提取 base64 数据
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 显示保存对话框
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '保存截图',
      defaultPath: path.join(app.getPath('pictures'), `screenshot-${Date.now()}.png`),
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, message: '保存操作被取消' };
    }

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    return { success: true };
  } catch (error) {
    console.error('保存截图失败:', error);
    return { success: false, message: `保存截图失败: ${error}` };
  }
});

// 获取已安装的应用列表（简化示例）
ipcMain.handle('get-installed-apps', async () => {
  // 注意: 这是一个简化的示例实现，不同操作系统的应用获取方式可能完全不同
  try {
    let apps = [];

    // 不同系统实现方式不同
    switch (os.platform()) {
      case 'win32':
        // Windows 实现 (简化示例)
        const programFiles = [
          'C:\\Program Files',
          'C:\\Program Files (x86)'
        ];

        for (const dir of programFiles) {
          if (fs.existsSync(dir)) {
            const subDirs = fs.readdirSync(dir);
            for (const subDir of subDirs) {
              const appPath = path.join(dir, subDir);
              if (fs.statSync(appPath).isDirectory()) {
                apps.push({
                  name: subDir,
                  path: appPath,
                  isRunning: Math.random() > 0.7 // 随机模拟应用运行状态
                });
              }
            }
          }
        }
        break;

      case 'darwin':
        // macOS 实现 (简化示例)
        const appDir = '/Applications';
        if (fs.existsSync(appDir)) {
          const appFiles = fs.readdirSync(appDir);
          for (const app of appFiles) {
            if (app.endsWith('.app')) {
              apps.push({
                name: app.replace('.app', ''),
                path: path.join(appDir, app),
                isRunning: Math.random() > 0.7 // 随机模拟应用运行状态
              });
            }
          }
        }
        break;

      case 'linux':
        // Linux 实现 (简化示例)
        const appDirs = [
          '/usr/share/applications',
          path.join(os.homedir(), '.local/share/applications')
        ];

        for (const dir of appDirs) {
          if (fs.existsSync(dir)) {
            const desktopFiles = fs.readdirSync(dir)
              .filter(file => file.endsWith('.desktop'));

            for (const file of desktopFiles) {
              const filePath = path.join(dir, file);
              const appName = file.replace('.desktop', '');

              apps.push({
                name: appName,
                path: filePath,
                isRunning: Math.random() > 0.7 // 随机模拟应用运行状态
              });
            }
          }
        }
        break;
    }

    // 限制返回前10个，避免过多
    return apps.slice(0, 10);
  } catch (error) {
    console.error('获取应用列表失败:', error);
    return [];
  }
});

// 启动应用
ipcMain.handle('launch-app', async (_event, appPath: string) => {
  try {
    // 不同平台使用不同的启动方法
    let command = '';

    switch (os.platform()) {
      case 'win32':
        command = `start "" "${appPath}"`;
        break;
      case 'darwin':
        command = `open "${appPath}"`;
        break;
      case 'linux':
        command = `xdg-open "${appPath}"`;
        break;
      default:
        return { success: false, message: '不支持的操作系统' };
    }

    childProcess.exec(command);
    return { success: true };
  } catch (error) {
    console.error('启动应用失败:', error);
    return { success: false, message: `启动失败: ${error}` };
  }
});

// 发送自定义通知
ipcMain.handle('show-custom-notification', (_event, options: {
  title: string;
  body: string;
  urgency: string;
  sound: boolean;
}) => {
  try {
    const { title, body, urgency, sound } = options;

    const notification = new Notification({
      title,
      body,
      silent: !sound
    });

    notification.show();
    return { success: true };
  } catch (error) {
    console.error('发送通知失败:', error);
    return { success: false, message: `发送通知失败: ${error}` };
  }
});

// 发送进度通知
ipcMain.handle('show-progress-notification', (_event, options: { title: string; body: string }) => {
  try {
    const { title, body } = options;

    const notification = new Notification({
      title,
      body,
      silent: false
    });

    notification.show();

    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setProgressBar(progress);
      }

      if (progress >= 1) {
        clearInterval(interval);

        // 进度完成后发送一个新通知
        const completedNotification = new Notification({
          title: '下载完成',
          body: '文件已成功下载'
        });

        completedNotification.show();

        // 重置进度条
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setProgressBar(-1);
        }
      }
    }, 500);

    return { success: true };
  } catch (error) {
    console.error('发送进度通知失败:', error);
    return { success: false, message: `发送进度通知失败: ${error}` };
  }
});

// 获取打印机列表
ipcMain.handle('get-printers', async () => {
  try {
    if (!mainWindow) {
      return [];
    }

    // 使用 getPrintersAsync 代替已弃用的 getPrinters
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map(printer => ({
      name: printer.name,
      isDefault: printer.isDefault
    }));
  } catch (error) {
    console.error('获取打印机列表失败:', error);
    return [];
  }
});

// 打印内容
ipcMain.handle('print-content', async (_event, options: {
  content: string;
  printerName: string;
  silent: boolean;
  printBackground: boolean;
  copies: number;
}) => {
  try {
    if (!mainWindow) {
      return { success: false, message: '主窗口不存在' };
    }

    const { content, printerName, silent, printBackground, copies } = options;

    // 创建一个临时窗口来渲染要打印的内容
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <html>
        <head>
          <title>打印内容</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `));

    // 等待内容加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 打印内容
    printWindow.webContents.print({
      silent,
      printBackground,
      deviceName: printerName,
      copies
    }, (success, reason) => {
      printWindow.close();

      if (!success) {
        console.error('打印失败:', reason);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('打印失败:', error);
    return { success: false, message: `打印失败: ${error}` };
  }
});

// 打印到PDF
ipcMain.handle('print-to-pdf', async (_event, options: {
  content: string;
  landscape: boolean;
  marginsType: number;
  printBackground: boolean;
  printSelectionOnly: boolean;
  pageSize: string;
}) => {
  try {
    if (!mainWindow) {
      return { success: false, message: '主窗口不存在' };
    }

    const { content, landscape, printBackground, pageSize } = options;

    // 创建一个临时窗口来渲染要打印的内容
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <html>
        <head>
          <title>打印内容</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `));

    // 等待内容加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 修改这里，只使用支持的属性
    const pdfData = await printWindow.webContents.printToPDF({
      landscape,
      printBackground,
      pageSize: pageSize as any
    });

    printWindow.close();

    // 显示保存对话框
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '保存PDF',
      defaultPath: path.join(app.getPath('documents'), `document-${Date.now()}.pdf`),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, message: '保存操作被取消' };
    }

    // 写入文件
    fs.writeFileSync(filePath, pdfData);

    // 打开PDF
    shell.openPath(filePath);

    return { success: true };
  } catch (error) {
    console.error('生成PDF失败:', error);
    return { success: false, message: `生成PDF失败: ${error}` };
  }
});

// ================== 电源管理相关 API ==================

// 获取系统电源状态
ipcMain.handle('get-power-state', () => {
  // 注意：为了演示目的，我们模拟电源状态数据
  // 实际应用中应使用系统API获取真实数据
  const online = Math.random() > 0.3; // 随机模拟是否连接电源
  const charging = online && Math.random() > 0.3; // 连接电源时随机模拟是否充电
  const level = Math.floor(Math.random() * 100); // 随机电量级别

  // 计算剩余时间
  let remainingTime = null;
  if (!online) {
    // 未连接电源时，计算剩余时间
    remainingTime = Math.floor(level * 60); // 简单假设 1% 电量 = 60秒
  }

  return {
    online,
    charging,
    level,
    remainingTime
  };
});

// 设置阻止显示器睡眠
ipcMain.handle('set-prevent-display-sleep', async (_event, prevent: boolean) => {
  try {
    // 如果之前设置过，先取消
    if (preventSleepId !== null) {
      // 实际应用中使用 powerSaveBlocker.stop(preventSleepId);
      preventSleepId = null;
    }

    if (prevent) {
      // 阻止显示器睡眠
      // 实际应用中使用 preventSleepId = powerSaveBlocker.start('prevent-display-sleep');
      preventSleepId = 123; // 模拟 ID
    }

    return { success: true };
  } catch (error) {
    console.error('设置阻止显示器睡眠失败:', error);
    return { success: false, message: `设置失败: ${error}` };
  }
});

// 开始监听电源事件
ipcMain.handle('start-power-monitoring', () => {
  try {
    // 清理之前的监听器
    powerEventListeners.forEach(({ event, callback }) => {
      if (typeof callback === 'function') {
        powerMonitor.removeListener(event as any, callback);
      }
    });
    powerEventListeners = [];

    // 定义要监听的电源事件
    const events = [
      'on-ac', 'on-battery', 'shutdown', 'lock-screen', 'unlock-screen',
      'suspend', 'resume'
    ];

    // 为每个事件添加监听器
    events.forEach(event => {
      const callback = () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          // 向渲染进程发送电源事件通知
          mainWindow.webContents.executeJavaScript(`
            window.dispatchEvent(new CustomEvent('power-event', { 
              detail: { 
                event: '${event}',
                powerState: null
              }
            }));
          `);
        }
      };

      powerMonitor.on(event as any, callback);
      powerEventListeners.push({ event, callback });
    });

    // 定期更新电源状态 - 使用一个函数变量方便后续清理
    const updateInterval = setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        // 获取最新电源状态
        const powerState = {
          online: Math.random() > 0.3,
          charging: Math.random() > 0.3,
          level: Math.floor(Math.random() * 100),
          remainingTime: Math.floor(Math.random() * 7200)
        };

        // 向渲染进程发送电源状态更新
        mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(new CustomEvent('power-event', { 
            detail: { 
              event: 'power-state-update',
              powerState: ${JSON.stringify(powerState)}
            }
          }));
        `);
      }
    }, 30000); // 每30秒更新一次

    // 保存定时器引用以便清理
    powerEventListeners.push({ event: 'interval', callback: updateInterval });

    return { success: true };
  } catch (error) {
    console.error('开始监听电源事件失败:', error);
    return { success: false, message: `启动失败: ${error}` };
  }
});

// 停止监听电源事件
ipcMain.handle('stop-power-monitoring', () => {
  try {
    // 清理所有事件监听器
    powerEventListeners.forEach(({ event, callback }) => {
      if (event === 'interval') {
        clearInterval(callback);
      } else if (typeof callback === 'function') {
        powerMonitor.removeListener(event as any, callback);
      }
    });

    powerEventListeners = [];
    return { success: true };
  } catch (error) {
    console.error('停止电源监听失败:', error);
    return { success: false, message: `停止失败: ${error}` };
  }
}); 