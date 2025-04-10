import React, { useState, useEffect } from 'react';
import { List, Button, Card, Typography, Space, Input, message, Spin, Badge, Tag } from 'antd';
import { AppstoreOutlined, SearchOutlined, PoweroffOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

interface AppInfo {
  name: string;
  path: string;
  isRunning: boolean;
}

const AppManager: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // 获取已安装的应用列表
  const getInstalledApps = async () => {
    setLoading(true);
    try {
      // 检查 API 是否可用
      if (typeof window.electronAPI.getInstalledApps !== 'function') {
        message.warning('应用列表功能不可用');
        setApps([]);
        return;
      }

      const appList = await window.electronAPI.getInstalledApps();
      setApps(appList);
      message.success('获取应用列表成功');
    } catch (error) {
      message.error('获取应用列表失败');
      console.error('获取应用列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 启动应用
  const launchApp = async (appPath: string) => {
    try {
      const result = await window.electronAPI.launchApp(appPath);

      if (result.success) {
        message.success(`应用启动成功`);
        // 刷新应用状态
        getInstalledApps();
      } else {
        message.error(`应用启动失败: ${result.message}`);
      }
    } catch (error) {
      message.error('应用启动失败');
      console.error('应用启动失败:', error);
    }
  };

  // 过滤应用列表
  const filteredApps = searchText
    ? apps.filter(app => app.name.toLowerCase().includes(searchText.toLowerCase()))
    : apps;

  // 组件加载时获取应用列表
  useEffect(() => {
    getInstalledApps();
  }, []);

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>应用管理</Title>

        <Paragraph>
          这个示例展示了如何使用 Electron 获取系统中已安装的应用并启动它们。
        </Paragraph>

        <Card
          title={
            <Space>
              <AppstoreOutlined />
              <span>应用列表</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={getInstalledApps}
              loading={loading}
            >
              刷新
            </Button>
          }
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Search
            placeholder="搜索应用"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <List
            itemLayout="horizontal"
            dataSource={filteredApps}
            renderItem={(app) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    icon={<PoweroffOutlined />}
                    onClick={() => launchApp(app.path)}
                    disabled={app.isRunning}
                  >
                    {app.isRunning ? '正在运行' : '启动'}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{app.name}</Text>
                      {app.isRunning && <Badge status="processing" text={<Tag color="green">运行中</Tag>} />}
                    </Space>
                  }
                  description={app.path}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </Spin>
  );
};

export default AppManager; 