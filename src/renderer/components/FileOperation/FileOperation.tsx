import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Space,
  Typography,
  List,
  message,
  Divider,
  Modal,
  Spin
} from 'antd';
import {
  FolderOpenOutlined,
  SaveOutlined,
  FileTextOutlined,
  FolderViewOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const FileOperation: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [textToSave, setTextToSave] = useState<string>('在此输入要保存的内容...');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileModalVisible, setFileModalVisible] = useState<boolean>(false);
  const [currentFileContent, setCurrentFileContent] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');

  // 打开文件选择对话框
  const handleOpenFileDialog = async () => {
    setLoading(true);
    try {
      const filePaths = await window.electronAPI.openFileDialog();
      setSelectedFiles(filePaths);

      if (filePaths.length > 0) {
        message.success(`已选择 ${filePaths.length} 个文件`);
      } else {
        message.info('未选择任何文件');
      }
    } catch (error) {
      message.error('打开文件对话框失败');
      console.error('打开文件对话框失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存文件
  const handleSaveFile = async () => {
    if (!textToSave.trim()) {
      message.warning('请输入要保存的内容');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.saveFileDialog(textToSave);

      if (result.success) {
        message.success('文件保存成功');
      } else {
        message.error(`文件保存失败: ${result.message}`);
      }
    } catch (error) {
      message.error('保存文件失败');
      console.error('保存文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 读取文件内容
  const handleReadFile = async (filePath: string) => {
    setLoading(true);
    try {
      const result = await window.electronAPI.readFile(filePath);

      if (result.success) {
        setCurrentFileContent(result.content || '');
        setCurrentFileName(filePath.split(/[/\\]/).pop() || '');
        setFileModalVisible(true);
      } else {
        message.error(`读取文件失败: ${result.message}`);
      }
    } catch (error) {
      message.error('读取文件失败');
      console.error('读取文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 在文件管理器中显示文件
  const handleShowInFolder = async (filePath: string) => {
    try {
      const result = await window.electronAPI.showItemInFolder(filePath);

      if (!result.success) {
        message.error(`打开文件管理器失败: ${result.message}`);
      }
    } catch (error) {
      message.error('打开文件管理器失败');
      console.error('打开文件管理器失败:', error);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>文件操作</Title>

        <Card title="打开文件" bordered={false} style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<FolderOpenOutlined />}
              onClick={handleOpenFileDialog}
              style={{ marginBottom: 16 }}
            >
              选择文件
            </Button>

            {selectedFiles.length > 0 && (
              <>
                <Text strong>已选择的文件:</Text>
                <List
                  bordered
                  dataSource={selectedFiles}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="read"
                          type="link"
                          icon={<FileTextOutlined />}
                          onClick={() => handleReadFile(item)}
                        >
                          查看
                        </Button>,
                        <Button
                          key="folder"
                          type="link"
                          icon={<FolderViewOutlined />}
                          onClick={() => handleShowInFolder(item)}
                        >
                          定位
                        </Button>
                      ]}
                    >
                      {item}
                    </List.Item>
                  )}
                />
              </>
            )}
          </Space>
        </Card>

        <Card title="保存文件" bordered={false}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={6}
              value={textToSave}
              onChange={(e) => setTextToSave(e.target.value)}
              placeholder="输入要保存的内容..."
            />

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveFile}
              style={{ marginTop: 16 }}
            >
              保存文件
            </Button>
          </Space>
        </Card>

        <Modal
          title={`文件内容: ${currentFileName}`}
          open={fileModalVisible}
          onCancel={() => setFileModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setFileModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          <pre style={{
            maxHeight: '400px',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px'
          }}>
            {currentFileContent}
          </pre>
        </Modal>
      </div>
    </Spin>
  );
};

export default FileOperation; 