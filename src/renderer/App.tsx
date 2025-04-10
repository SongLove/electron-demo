import React, { useState, Suspense, lazy } from 'react';
import { Layout, Menu, theme, Typography } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  PrinterOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import SystemInfo from './components/SystemInfo/SystemInfo';
import FileOperation from './components/FileOperation/FileOperation';
import IpcDemo from './components/IpcDemo/IpcDemo';
import ScreenCapture from './components/ScreenCapture/ScreenCapture';
import AppManager from './components/AppManager/AppManager';
import Notifications from './components/Notifications/Notifications';
import PrintDemo from './components/PrintDemo/PrintDemo';
import PowerMonitor from './components/PowerMonitor/PowerMonitor';
import ErrorBoundary from './components/ErrorBoundary';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

// 定义菜单结构，便于维护和扩展
const menuItems = [
  {
    key: 'system',
    icon: <DesktopOutlined />,
    label: '系统功能',
    children: [
      {
        key: '1',
        icon: <InfoCircleOutlined />,
        label: '系统信息',
      },
      {
        key: '8',
        icon: <ThunderboltOutlined />,
        label: '电源管理',
      },
      {
        key: '5',
        icon: <AppstoreOutlined />,
        label: '应用管理',
      },
    ]
  },
  {
    key: 'media',
    icon: <FileOutlined />,
    label: '媒体功能',
    children: [
      {
        key: '2',
        icon: <FileOutlined />,
        label: '文件操作',
      },
      {
        key: '4',
        icon: <DesktopOutlined />,
        label: '屏幕截图',
      },
      {
        key: '7',
        icon: <PrinterOutlined />,
        label: '打印功能',
      },
    ]
  },
  {
    key: 'communication',
    icon: <MessageOutlined />,
    label: '通信功能',
    children: [
      {
        key: '3',
        icon: <MessageOutlined />,
        label: 'IPC 通信',
      },
      {
        key: '6',
        icon: <NotificationOutlined />,
        label: '系统通知',
      },
    ]
  },
];

// 组件映射表，简化组件选择逻辑
const componentMap = {
  '1': SystemInfo,
  '2': FileOperation,
  '3': IpcDemo,
  '4': ScreenCapture,
  '5': AppManager,
  '6': Notifications,
  '7': PrintDemo,
  '8': PowerMonitor,
};

// 使用动态导入替代静态导入
const DebugPanel = lazy(() => import('./components/DebugPanel/DebugPanel'));

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 根据选择的菜单渲染不同的组件
  const renderContent = () => {
    const Component = componentMap[selectedKey as keyof typeof componentMap] || SystemInfo;
    return (
      <ErrorBoundary componentName={`组件 ${selectedKey}`}>
        <Component />
      </ErrorBoundary>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['system']}
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Title level={3} style={{ margin: '0 24px' }}>
            Electron + React + TypeScript + Ant Design 示例
          </Title>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Electron React TypeScript Demo ©{new Date().getFullYear()} Created with Ant Design
        </Footer>
      </Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <DebugPanel />
      </Suspense>
    </Layout>
  );
};

export default App; 