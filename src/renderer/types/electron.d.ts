// 如果这个文件不存在，您需要创建它
interface ElectronAPI {
  // 已有的其他API方法

  // 添加日志相关的方法
  getLogs: () => Promise<string>;
  openLogsDirectory: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { }; 