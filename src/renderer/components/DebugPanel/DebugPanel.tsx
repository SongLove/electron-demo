import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Divider, Modal, message, Input } from 'antd';
import { BugOutlined, ReloadOutlined, FolderOpenOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取日志
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 检查 API 是否可用
      if (typeof (window.electronAPI as any)?.getLogs !== 'function') {
        message.warning('日志功能不可用');
        setLogs('Log API not available. This might be due to a preload script issue.');
        return;
      }

      const logContent = await (window.electronAPI as any).getLogs();
      setLogs(logContent);
    } catch (error) {
      console.error('获取日志失败:', error);
      setLogs(`Error fetching logs: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 打开日志目录
  const openLogsDirectory = async () => {
    try {
      if (typeof (window.electronAPI as any)?.openLogsDirectory !== 'function') {
        message.warning('打开日志目录功能不可用');
        return;
      }

      await (window.electronAPI as any).openLogsDirectory();
    } catch (error) {
      console.error('打开日志目录失败:', error);
      message.error('打开日志目录失败');
    }
  };

  // 显示日志对话框
  const showLogModal = () => {
    fetchLogs();
    setIsModalVisible(true);
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<BugOutlined />}
        onClick={showLogModal}
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
      >
        调试面板
      </Button>

      <Modal
        title="应用程序日志"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
            刷新日志
          </Button>,
          <Button key="open" type="primary" icon={<FolderOpenOutlined />} onClick={openLogsDirectory}>
            打开日志目录
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <TextArea
          value={logs}
          readOnly
          autoSize={{ minRows: 15, maxRows: 30 }}
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>
    </div>
  );
};

export default DebugPanel; 