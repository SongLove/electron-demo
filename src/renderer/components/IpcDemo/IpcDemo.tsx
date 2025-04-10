import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Space,
  Typography,
  message,
  Divider,
  Form,
  Row,
  Col
} from 'antd';
import {
  LinkOutlined,
  NotificationOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const IpcDemo: React.FC = () => {
  const [linkUrl, setLinkUrl] = useState<string>('https://electronjs.org');
  const [notificationTitle, setNotificationTitle] = useState<string>('通知标题');
  const [notificationBody, setNotificationBody] = useState<string>('这是一条来自 Electron 的通知');

  // 在默认浏览器中打开链接
  const handleOpenExternalLink = async () => {
    if (!linkUrl) {
      message.warning('请输入有效的 URL');
      return;
    }

    // 简单的 URL 验证
    if (!/^https?:\/\/.+/.test(linkUrl)) {
      message.warning('请输入有效的 URL (以 http:// 或 https:// 开头)');
      return;
    }

    try {
      const result = await window.electronAPI.openExternalLink(linkUrl);

      if (!result.success) {
        message.error(`打开链接失败: ${result.message}`);
      }
    } catch (error) {
      message.error('打开链接失败');
      console.error('打开链接失败:', error);
    }
  };

  // 显示系统通知
  const handleShowNotification = async () => {
    if (!notificationTitle.trim()) {
      message.warning('请输入通知标题');
      return;
    }

    try {
      const result = await window.electronAPI.showNotification({
        title: notificationTitle,
        body: notificationBody
      });

      if (result.success) {
        message.success('通知已发送');
      }
    } catch (error) {
      message.error('发送通知失败');
      console.error('发送通知失败:', error);
    }
  };

  return (
    <div>
      <Title level={2}>IPC 通信示例</Title>

      <Paragraph>
        这些示例展示了如何使用 Electron 的 IPC 机制在渲染进程和主进程之间进行通信。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="打开外部链接" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form layout="vertical">
                <Form.Item
                  label="链接地址"
                  extra="将在默认浏览器中打开此链接"
                >
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="请输入 URL (以 http:// 或 https:// 开头)"
                    prefix={<LinkOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={handleOpenExternalLink}
                  >
                    打开链接
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="发送系统通知" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form layout="vertical">
                <Form.Item label="通知标题">
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="请输入通知标题"
                  />
                </Form.Item>

                <Form.Item label="通知内容">
                  <TextArea
                    rows={3}
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    placeholder="请输入通知内容"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    icon={<NotificationOutlined />}
                    onClick={handleShowNotification}
                  >
                    发送通知
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="其他 IPC 示例" bordered={false}>
        <Paragraph>
          在当前应用中，我们已经使用了以下 IPC 通信:
        </Paragraph>
        <ul>
          <li>获取系统信息 (在"系统信息"标签页)</li>
          <li>打开文件对话框 (在"文件操作"标签页)</li>
          <li>保存文件 (在"文件操作"标签页)</li>
          <li>读取文件内容 (在"文件操作"标签页)</li>
          <li>在文件管理器中显示文件 (在"文件操作"标签页)</li>
        </ul>
        <Paragraph>
          所有这些功能都是通过 Electron 的 IPC 在渲染进程和主进程之间实现通信的示例。
        </Paragraph>
      </Card>
    </div>
  );
};

export default IpcDemo; 