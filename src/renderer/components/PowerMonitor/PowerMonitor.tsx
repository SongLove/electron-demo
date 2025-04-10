import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, List, Tag, Statistic, Row, Col, Badge, Button, message, Spin } from 'antd';
import {
  PoweroffOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface PowerState {
  online: boolean;
  charging: boolean;
  level: number;
  remainingTime: number | null; // in seconds
}

interface PowerEvent {
  time: string;
  event: string;
}

const PowerMonitor: React.FC = () => {
  const [powerState, setPowerState] = useState<PowerState>({
    online: true,
    charging: false,
    level: 0,
    remainingTime: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<PowerEvent[]>([]);
  const [preventDisplaySleep, setPreventDisplaySleep] = useState<boolean>(false);

  // 获取电源状态
  const getPowerState = async () => {
    try {
      setLoading(true);

      // 检查 API 是否可用
      if (typeof window.electronAPI.getPowerState !== 'function') {
        message.warning('电源状态功能不可用');
        setPowerState({
          online: true,
          charging: false,
          level: 50,
          remainingTime: null
        });
        return;
      }

      const state = await window.electronAPI.getPowerState();
      setPowerState(state);
    } catch (error) {
      message.error('获取电源状态失败');
      console.error('获取电源状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 设置阻止显示器睡眠
  const togglePreventDisplaySleep = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.setPreventDisplaySleep(!preventDisplaySleep);

      if (result.success) {
        setPreventDisplaySleep(!preventDisplaySleep);
        message.success(`已${!preventDisplaySleep ? '阻止' : '允许'}显示器睡眠`);
      } else {
        message.error(`操作失败: ${result.message}`);
      }
    } catch (error) {
      message.error('设置失败');
      console.error('设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加电源事件到列表
  const addEvent = (eventName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    setEvents(prev => [{
      time: timeStr,
      event: eventName
    }, ...prev].slice(0, 20)); // 只保留最近20条事件
  };

  // 启动电源事件监听
  const startMonitoring = async () => {
    try {
      setLoading(true);
      await window.electronAPI.startPowerMonitoring();
      message.success('开始监听电源事件');
    } catch (error) {
      message.error('启动监听失败');
      console.error('启动监听失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化剩余时间
  const formatRemainingTime = (seconds: number | null) => {
    if (seconds === null) return '未知';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}小时 ${minutes}分钟`;
  };

  // 处理电源事件
  useEffect(() => {
    const handlePowerEvent = (event: any) => {
      const { detail } = event;
      addEvent(detail.event);

      // 如果是电源状态变化，则更新状态
      if (detail.powerState) {
        setPowerState(detail.powerState);
      }
    };

    // 添加事件监听器
    window.addEventListener('power-event', handlePowerEvent);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('power-event', handlePowerEvent);
    };
  }, []);

  // 组件加载时获取电源状态并启动监听
  useEffect(() => {
    getPowerState();
    startMonitoring();

    return () => {
      // 组件卸载时停止监听
      try {
        if (typeof window.electronAPI.stopPowerMonitoring === 'function') {
          window.electronAPI.stopPowerMonitoring();
        }
      } catch (error) {
        console.error('停止电源监听失败:', error);
      }
    };
  }, []);

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>电源管理</Title>

        <Paragraph>
          这个示例展示了如何使用 Electron 的 powerMonitor 功能监控系统电源状态和事件。
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined />
                    <span>电源状态</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={getPowerState}
                  >
                    刷新
                  </Button>
                }
                bordered={false}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="电池电量"
                      value={powerState.level}
                      suffix="%"
                      prefix={<ThunderboltOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="剩余时间"
                      value={formatRemainingTime(powerState.remainingTime)}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Text>电源接入:</Text>
                    <Badge
                      status={powerState.online ? "success" : "error"}
                      text={powerState.online ? "已连接" : "未连接"}
                    />
                  </Space>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Text>充电状态:</Text>
                    <Badge
                      status={powerState.charging ? "processing" : "default"}
                      text={powerState.charging ? "充电中" : "未充电"}
                    />
                  </Space>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    <span>电源设置</span>
                  </Space>
                }
                bordered={false}
              >
                <Paragraph>
                  Electron 允许控制系统的电源管理功能，例如阻止显示器进入睡眠状态。
                </Paragraph>

                <div style={{ marginTop: 16 }}>
                  <Button
                    type={preventDisplaySleep ? "primary" : "default"}
                    danger={preventDisplaySleep}
                    icon={<PoweroffOutlined />}
                    onClick={togglePreventDisplaySleep}
                  >
                    {preventDisplaySleep ? "允许显示器睡眠" : "阻止显示器睡眠"}
                  </Button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    {preventDisplaySleep
                      ? "当前已阻止显示器进入睡眠状态，这会增加电池消耗。"
                      : "当前允许显示器正常进入睡眠状态，这有助于节省电池电量。"}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <PoweroffOutlined />
                <span>电源事件</span>
              </Space>
            }
            bordered={false}
          >
            <Paragraph>
              这里显示系统电源相关的事件，如电源连接/断开、进入/退出睡眠等。
            </Paragraph>

            {events.length > 0 ? (
              <List
                size="small"
                bordered
                dataSource={events}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{item.time}</Tag>
                      <Text>{item.event}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">尚未检测到电源事件，请等待或尝试拔插电源适配器</Text>
              </div>
            )}
          </Card>
        </Space>
      </div>
    </Spin>
  );
};

export default PowerMonitor; 