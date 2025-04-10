# Electron + React + TypeScript 桌面应用程序

## 项目简介

这是一个基于 Electron、React、TypeScript 和 Ant Design 构建的桌面应用程序，旨在展示 Electron 的各种核心功能和系统 API 调用能力。本项目可作为学习 Electron 或开发类似桌面应用程序的参考模板，包含了一系列实用的功能示例和最佳实践。

![应用截图](https://via.placeholder.com/800x450.png?text=Electron+React+TypeScript+Demo)

## 功能特点

本项目通过模块化设计展示了 Electron 的多种能力，主要包括：

### 1. 系统功能
- **系统信息**：获取并显示操作系统、CPU、内存等系统详细信息
- **电源管理**：监控电池状态、充电状态、阻止显示器睡眠等电源相关功能
- **应用管理**：列出系统已安装的应用程序并提供启动功能

### 2. 媒体功能
- **文件操作**：打开、读取、保存文件，以及在文件管理器中显示文件
- **屏幕截图**：捕获屏幕或窗口截图并保存
- **打印功能**：打印文档或导出为 PDF 文件

### 3. 通信功能
- **IPC 通信**：演示渲染进程与主进程之间的双向通信
- **系统通知**：发送自定义桌面通知，支持不同紧急程度和进度条

## 技术栈

- **Electron**: v23.x - 跨平台桌面应用程序框架
- **React**: v18.x - 用户界面库
- **TypeScript**: v4.9.x - 静态类型检查的 JavaScript 超集
- **Ant Design**: v5.x - 企业级 UI 设计语言和 React 组件库
- **Webpack**: v5.x - 模块打包器

## 项目结构
├── src/
│ ├── main/ # Electron 主进程代码
│ │ └── main.ts # 主进程入口文件
│ ├── preload/ # 预加载脚本
│ │ └── preload.ts # 预加载脚本入口文件
│ └── renderer/ # React 渲染进程代码
│ ├── App.tsx # React 主组件
│ ├── index.html # HTML 模板
│ ├── index.tsx # 渲染进程入口文件
│ ├── types/ # 类型定义
│ │ └── global.d.ts # 全局类型声明
│ ├── components/ # React 组件
│ │ ├── ErrorBoundary.tsx # 错误边界组件
│ │ ├── FileOperation/ # 文件操作示例组件
│ │ ├── SystemInfo/ # 系统信息示例组件
│ │ ├── IpcDemo/ # IPC 通信示例组件
│ │ ├── ScreenCapture/ # 屏幕截图示例组件
│ │ ├── AppManager/ # 应用管理示例组件
│ │ ├── Notifications/ # 系统通知示例组件
│ │ ├── PrintDemo/ # 打印功能示例组件
│ │ └── PowerMonitor/ # 电源管理示例组件
│ └── styles/ # 样式文件
├── webpack.config.js # Webpack 配置
├── tsconfig.json # TypeScript 配置
├── package.json # 项目配置和依赖
└── README.md # 项目说明文档

### 主进程 (Main Process)

主进程是 Electron 应用的入口点，负责创建窗口、管理应用生命周期以及访问系统 API。

**主要职责**：
- 创建和管理应用窗口
- 处理 IPC (进程间通信) 请求
- 调用系统 API 并返回结果给渲染进程
- 管理菜单、托盘、对话框等原生 UI 元素

**关键模块**：
- **窗口管理**：创建主窗口、处理窗口事件和状态
- **IPC 处理程序**：接收渲染进程请求并响应
- **系统 API 调用**：文件操作、获取系统信息等
- **电源监控**：实现电源状态监控及事件通知

### 预加载脚本 (Preload)

预加载脚本在渲染进程加载前执行，用于安全地将主进程 API 暴露给渲染进程。

**主要职责**：
- 通过 `contextBridge` 安全地暴露 API
- 封装 IPC 通信，提供一致的接口
- 实现上下文隔离，增强安全性

**关键功能**：
- 定义和暴露 `window.electronAPI` 对象
- 为每个功能模块提供对应的 API 方法
- 通过 `ipcRenderer.invoke` 实现异步通信

### 渲染进程 (Renderer Process)

渲染进程运行 React 应用，负责构建用户界面并处理用户交互。

**主要职责**：
- 使用 React 和 Ant Design 构建界面
- 调用预加载脚本提供的 API
- 处理并展示主进程返回的数据
- 管理组件状态和用户交互

**关键组件**：
- **App.tsx**：应用入口和布局组件
- **ErrorBoundary.tsx**：错误捕获与处理
- **系统信息组件**：显示操作系统、硬件信息
- **文件操作组件**：文件选择、保存和读取
- **屏幕截图组件**：捕获和保存屏幕画面
- **更多功能组件**：应用管理、打印、通知等

### 数据流

1. **用户交互** → **渲染进程组件** → **调用 electronAPI** → **预加载脚本**
2. **预加载脚本** → **ipcRenderer.invoke** → **主进程 ipcMain.handle**
3. **主进程执行系统调用** → **返回结果** → **渲染进程更新 UI**

## 跨进程通信模式

项目使用现代的 Electron IPC 通信模式，基于 Promise 的请求-响应模式：

1. **渲染进程** 发起请求：
```typescript
// 例如：获取系统信息
const systemInfo = await window.electronAPI.getSystemInfo();
```

2. **预加载脚本** 中转请求：
```typescript
// 在 preload.ts 中
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
```

3. **主进程** 处理请求：
```typescript
// 在 main.ts 中
ipcMain.handle('get-system-info', () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    // 更多系统信息...
  };
});
```

## 错误处理策略

项目实现了多层次的错误处理机制：

1. **组件级错误处理**：每个功能组件内部使用 try/catch 捕获可能的错误
2. **错误边界组件**：使用 React ErrorBoundary 捕获渲染错误
3. **API 不可用检测**：检查 API 是否存在，提供友好的降级体验
4. **主进程错误处理**：捕获系统 API 调用错误并返回有意义的错误信息

## 关键功能实现

### 系统信息

通过 Node.js 的 `os` 模块获取操作系统信息：

```typescript
// 主进程
ipcMain.handle('get-system-info', () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    // 更多系统信息...
  };
});
```

### 文件操作

使用 Electron 的 `dialog` API 和 Node.js 的 `fs` 模块：

```typescript
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

// 读取文件内容
ipcMain.handle('read-file', async (_event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, message: `读取失败: ${error}` };
  }
});
```

### 屏幕截图

使用 Electron 的 `desktopCapturer` API：

```typescript
// 获取屏幕源
ipcMain.handle('get-desktop-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 150, height: 150 }
  });
  
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    type: source.id.includes('screen') ? '屏幕' : '窗口'
  }));
});

// 捕获屏幕
ipcMain.handle('capture-screen', async (_event, sourceId) => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 1920, height: 1080 }
  });
  
  const source = sources.find(s => s.id === sourceId);
  
  if (!source) {
    return { success: false, message: '未找到指定的屏幕源' };
  }
  
  const dataUrl = source.thumbnail.toDataURL();
  return { success: true, dataUrl };
});
```

### 电源管理

使用 Electron 的 `powerMonitor` API：

```typescript
// 监听电源事件
ipcMain.handle('start-power-monitoring', () => {
  // 定义要监听的电源事件
  const events = ['on-ac', 'on-battery', 'shutdown', 'lock-screen', 'unlock-screen', 'suspend', 'resume'];
  
  // 为每个事件添加监听器
  events.forEach(event => {
    const callback = () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        // 向渲染进程发送电源事件通知
        mainWindow.webContents.executeJavaScript(`
          window.dispatchEvent(new CustomEvent('power-event', { 
            detail: { event: '${event}', powerState: null }
          }));
        `);
      }
    };
    
    powerMonitor.on(event, callback);
    // 保存监听器引用以便后续清理
  });
  
  // 更多实现...
});
```

## 如何运行

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/electron-react-ts-demo.git
cd electron-react-ts-demo
```

2. **安装依赖**
```bash
npm install
```

3. **开发模式启动**
```bash
npm start
```

4. **构建应用**
```bash
npm run build
```

## 安全性考虑

项目遵循 Electron 安全最佳实践：

1. **上下文隔离**：通过启用 `contextIsolation` 隔离渲染进程和预加载脚本
2. **禁用 Node 集成**：在渲染进程中禁用 `nodeIntegration`
3. **安全的 IPC 通信**：使用 `invoke/handle` 模式而非 `send/on`
4. **仅暴露必要 API**：只通过预加载脚本暴露必要的功能
5. **内容安全策略**：控制加载的资源和执行的脚本

## 性能优化

1. **组件懒加载**：使用映射表按需加载组件
2. **错误隔离**：使用错误边界避免整个应用崩溃
3. **API 可用性检查**：在使用 API 前检查其是否可用
4. **异步操作**：使用异步操作避免阻塞主线程

## 注意事项与局限性

- 某些功能可能需要特定操作系统权限才能正常工作
- 应用管理功能是简化的示例实现，不同操作系统的真实应用列表获取方式不同
- 电源管理功能在某些平台上可能有限制
- 打印功能需要系统安装打印机才能正常使用

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 项目
2. 创建特性分支：`git checkout -b my-new-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin my-new-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Ant Design](https://ant.design/)

---

通过这个项目，你可以学习如何结合现代前端技术与 Electron 构建功能丰富的桌面应用程序，展示了从基础的 UI 交互到复杂的系统 API 调用的完整流程。
