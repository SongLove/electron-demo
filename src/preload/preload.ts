import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // 文件操作
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (content: string) => ipcRenderer.invoke('save-file-dialog', content),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // 外部操作
  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),
  showItemInFolder: (filePath: string) => ipcRenderer.invoke('show-item-in-folder', filePath),

  // 通知
  showNotification: (options: { title: string; body: string }) =>
    ipcRenderer.invoke('show-notification', options),

  // 屏幕截图
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  captureScreen: (sourceId: string) => ipcRenderer.invoke('capture-screen', sourceId),
  saveScreenshot: (dataUrl: string) => ipcRenderer.invoke('save-screenshot', dataUrl),

  // 应用管理
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  launchApp: (appPath: string) => ipcRenderer.invoke('launch-app', appPath),

  // 增强通知
  showCustomNotification: (options: {
    title: string;
    body: string;
    urgency: string;
    sound: boolean;
  }) => ipcRenderer.invoke('show-custom-notification', options),

  showProgressNotification: (options: {
    title: string;
    body: string;
  }) => ipcRenderer.invoke('show-progress-notification', options),

  // 打印功能
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printContent: (options: {
    content: string;
    printerName: string;
    silent: boolean;
    printBackground: boolean;
    copies: number;
  }) => ipcRenderer.invoke('print-content', options),

  printToPDF: (options: {
    content: string;
    landscape: boolean;
    marginsType: number;
    printBackground: boolean;
    printSelectionOnly: boolean;
    pageSize: string;
  }) => ipcRenderer.invoke('print-to-pdf', options),

  // 电源管理
  getPowerState: () => ipcRenderer.invoke('get-power-state'),
  setPreventDisplaySleep: (prevent: boolean) => ipcRenderer.invoke('set-prevent-display-sleep', prevent),
  startPowerMonitoring: () => ipcRenderer.invoke('start-power-monitoring'),
  stopPowerMonitoring: () => ipcRenderer.invoke('stop-power-monitoring'),
}); 