import React, { useState } from 'react';
import { Button, Card, Image, Space, Typography, Row, Col, Select, message, Spin } from 'antd';
import { DesktopOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ScreenCapture: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');

  // 获取可用的屏幕源
  const getSources = async () => {
    try {
      setLoading(true);

      // 检查 API 是否可用
      if (typeof window.electronAPI.getDesktopSources !== 'function') {
        message.warning('屏幕源列表功能不可用');
        setSources([]);
        return;
      }

      const sourceList = await window.electronAPI.getDesktopSources();
      setSources(sourceList);

      if (sourceList.length > 0) {
        setSelectedSource(sourceList[0].id);
      }

      message.success('获取屏幕源列表成功');
    } catch (error) {
      message.error('获取屏幕源列表失败');
      console.error('获取屏幕源列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 截取屏幕
  const captureScreen = async () => {
    if (!selectedSource) {
      message.warning('请先选择一个屏幕源');
      return;
    }

    try {
      setLoading(true);
      const result = await window.electronAPI.captureScreen(selectedSource);

      if (result.success) {
        setImageUrl(result.dataUrl || '');
        message.success('屏幕截图成功');
      } else {
        message.error(`屏幕截图失败: ${result.message}`);
      }
    } catch (error) {
      message.error('屏幕截图失败');
      console.error('屏幕截图失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存截图
  const saveScreenshot = async () => {
    if (!imageUrl) {
      message.warning('请先截取屏幕');
      return;
    }

    try {
      setLoading(true);
      const result = await window.electronAPI.saveScreenshot(imageUrl);

      if (result.success) {
        message.success('截图保存成功');
      } else {
        message.error(`截图保存失败: ${result.message}`);
      }
    } catch (error) {
      message.error('截图保存失败');
      console.error('截图保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>屏幕截图</Title>

        <Paragraph>
          这个示例展示了如何使用 Electron 的 desktopCapturer API 来获取屏幕截图。
        </Paragraph>

        <Card title="截图操作" bordered={false} style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Button
                  type="primary"
                  icon={<DesktopOutlined />}
                  onClick={getSources}
                  style={{ marginBottom: 16 }}
                >
                  获取屏幕源列表
                </Button>
              </Col>
            </Row>

            {sources.length > 0 && (
              <Row gutter={16} align="middle">
                <Col span={16}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择要截图的窗口或屏幕"
                    value={selectedSource}
                    onChange={(value) => setSelectedSource(value)}
                  >
                    {sources.map((source) => (
                      <Option key={source.id} value={source.id}>
                        {source.name} ({source.type})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    onClick={captureScreen}
                  >
                    截取屏幕
                  </Button>
                </Col>
              </Row>
            )}

            {imageUrl && (
              <>
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={saveScreenshot}
                    style={{ marginBottom: 16 }}
                  >
                    保存截图
                  </Button>
                </div>

                <div style={{ border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}>
                  <Image
                    src={imageUrl}
                    alt="屏幕截图"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </>
            )}
          </Space>
        </Card>
      </div>
    </Spin>
  );
};

export default ScreenCapture; 