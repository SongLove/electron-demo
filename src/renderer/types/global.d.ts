interface ElectronAPI {
  // 系统信息
  getSystemInfo: () => Promise<any>;

  // 文件操作
  openFileDialog: () => Promise<string[]>;
  saveFileDialog: (content: string) => Promise<{ success: boolean; message?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; message?: string }>;

  // 外部操作
  openExternalLink: (url: string) => Promise<{ success: boolean; message?: string }>;
  showItemInFolder: (filePath: string) => Promise<{ success: boolean; message?: string }>;

  // 通知
  showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;

  // 新增 API
  // 屏幕截图
  getDesktopSources: () => Promise<Array<{ id: string; name: string; type: string }>>;
  captureScreen: (sourceId: string) => Promise<{ success: boolean; dataUrl?: string; message?: string }>;
  saveScreenshot: (dataUrl: string) => Promise<{ success: boolean; message?: string }>;

  // 应用管理
  getInstalledApps: () => Promise<Array<{ name: string; path: string; isRunning: boolean }>>;
  launchApp: (appPath: string) => Promise<{ success: boolean; message?: string }>;

  // 增强通知
  showCustomNotification: (options: {
    title: string;
    body: string;
    urgency: string;
    sound: boolean;
  }) => Promise<{ success: boolean; message?: string }>;

  showProgressNotification: (options: {
    title: string;
    body: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // 打印功能
  getPrinters: () => Promise<Array<{ name: string; isDefault: boolean }>>;
  printContent: (options: {
    content: string;
    printerName: string;
    silent: boolean;
    printBackground: boolean;
    copies: number;
  }) => Promise<{ success: boolean; message?: string }>;

  printToPDF: (options: {
    content: string;
    landscape: boolean;
    marginsType: number;
    printBackground: boolean;
    printSelectionOnly: boolean;
    pageSize: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // 电源管理功能
  getPowerState: () => Promise<{
    online: boolean;
    charging: boolean;
    level: number;
    remainingTime: number | null;
  }>;

  setPreventDisplaySleep: (prevent: boolean) => Promise<{ success: boolean; message?: string }>;

  startPowerMonitoring: () => Promise<{ success: boolean; message?: string }>;

  stopPowerMonitoring: () => Promise<{ success: boolean; message?: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
} 