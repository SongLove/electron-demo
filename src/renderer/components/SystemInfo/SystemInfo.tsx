import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Descriptions, Button, Spin, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface SystemInfoData {
  platform: string;
  arch: string;
  cpus: Array<{ model: string; speed: number }>;
  totalMemory: number;
  freeMemory: number;
  homeDir: string;
  hostname: string;
  userInfo: {
    username: string;
    homedir: string;
    shell: string;
  };
}

const SystemInfo: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 格式化内存大小，将字节转换为更易读的格式
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取系统信息
  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      // 调用主进程提供的 API
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      message.error('获取系统信息失败');
      console.error('获取系统信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取系统信息
  useEffect(() => {
    fetchSystemInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载系统信息..." />
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>无法获取系统信息</Title>
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchSystemInfo}>
          重试
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <Title level={2}>系统信息</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchSystemInfo}
            loading={loading}
          >
            刷新
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="基本信息" bordered={false}>
            <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="操作系统">{systemInfo.platform}</Descriptions.Item>
              <Descriptions.Item label="架构">{systemInfo.arch}</Descriptions.Item>
              <Descriptions.Item label="主机名">{systemInfo.hostname}</Descriptions.Item>
              <Descriptions.Item label="用户名">{systemInfo.userInfo.username}</Descriptions.Item>
              <Descriptions.Item label="主目录">{systemInfo.homeDir}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="内存信息" bordered={false}>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="总内存">{formatBytes(systemInfo.totalMemory)}</Descriptions.Item>
              <Descriptions.Item label="可用内存">{formatBytes(systemInfo.freeMemory)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="CPU 信息" bordered={false}>
            {systemInfo.cpus.map((cpu, index) => (
              <Card key={index} type="inner" title={`CPU ${index + 1}`} style={{ marginBottom: 16 }}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="型号">{cpu.model}</Descriptions.Item>
                  <Descriptions.Item label="速度">{`${cpu.speed} MHz`}</Descriptions.Item>
                </Descriptions>
              </Card>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemInfo; 