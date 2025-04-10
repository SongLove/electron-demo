import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, Space, Typography, Slider, message, Spin } from 'antd';
import { NotificationOutlined, SoundOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Notifications: React.FC = () => {
  const [form] = Form.useForm();
  const [urgency, setUrgency] = useState<string>('normal');
  const [loading, setLoading] = useState<boolean>(false);

  // 发送自定义通知
  const sendNotification = async (values: any) => {
    const { title, body, sound } = values;

    try {
      setLoading(true);
      const result = await window.electronAPI.showCustomNotification({
        title,
        body,
        urgency,
        sound
      });

      if (result.success) {
        message.success('通知发送成功');
      } else {
        message.error(`通知发送失败: ${result.message}`);
      }
    } catch (error) {
      message.error('通知发送失败');
      console.error('通知发送失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送带有进度条的通知
  const sendProgressNotification = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.showProgressNotification({
        title: '下载进度',
        body: '文件下载中，请稍候...'
      });

      if (result.success) {
        message.success('进度通知开始');
      } else {
        message.error(`进度通知失败: ${result.message}`);
      }
    } catch (error) {
      message.error('进度通知失败');
      console.error('进度通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>系统通知</Title>

        <Paragraph>
          这个示例展示了如何使用 Electron 发送各种类型的系统通知。
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
            title={
              <Space>
                <NotificationOutlined />
                <span>基本通知</span>
              </Space>
            }
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={sendNotification}
              initialValues={{
                title: '通知标题',
                body: '这是一条来自 Electron 的通知',
                sound: true
              }}
            >
              <Form.Item
                name="title"
                label="通知标题"
                rules={[{ required: true, message: '请输入通知标题' }]}
              >
                <Input placeholder="请输入通知标题" />
              </Form.Item>

              <Form.Item
                name="body"
                label="通知内容"
                rules={[{ required: true, message: '请输入通知内容' }]}
              >
                <TextArea rows={3} placeholder="请输入通知内容" />
              </Form.Item>

              <Form.Item label="紧急程度">
                <Radio.Group value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <Radio.Button value="low">低</Radio.Button>
                  <Radio.Button value="normal">中</Radio.Button>
                  <Radio.Button value="critical">高</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="sound" valuePropName="checked" label="播放声音">
                <Radio.Group>
                  <Radio value={true}>开启</Radio>
                  <Radio value={false}>关闭</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<BellOutlined />}>
                  发送通知
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title={
              <Space>
                <SoundOutlined />
                <span>进度通知</span>
              </Space>
            }
            bordered={false}
          >
            <Paragraph>
              这个示例将发送一个带有进度条的通知，模拟文件下载过程。
            </Paragraph>

            <Button
              type="primary"
              onClick={sendProgressNotification}
              icon={<BellOutlined />}
            >
              发送进度通知
            </Button>
          </Card>
        </Space>
      </div>
    </Spin>
  );
};

export default Notifications; 