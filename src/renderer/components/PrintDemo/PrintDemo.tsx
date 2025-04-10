import React, { useState } from 'react';
import { Button, Card, Typography, Space, Radio, Select, message, Spin, Input, Form } from 'antd';
import { PrinterOutlined, FileTextOutlined, FileAddOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PrintDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printMode, setPrintMode] = useState<string>('silent');

  // 获取可用的打印机
  const getPrinters = async () => {
    try {
      setLoading(true);

      // 检查 API 是否可用
      if (typeof window.electronAPI.getPrinters !== 'function') {
        message.warning('打印机列表功能不可用');
        setPrinters([]);
        return;
      }

      const printerList = await window.electronAPI.getPrinters();
      setPrinters(printerList);

      if (printerList.length > 0) {
        setSelectedPrinter(printerList[0].name);
      }

      message.success('获取打印机列表成功');
    } catch (error) {
      message.error('获取打印机列表失败');
      console.error('获取打印机列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打印内容
  const printContent = async (values: any) => {
    const { content } = values;

    if (!selectedPrinter) {
      message.warning('请先选择一个打印机');
      return;
    }

    try {
      setLoading(true);
      const result = await window.electronAPI.printContent({
        content,
        printerName: selectedPrinter,
        silent: printMode === 'silent',
        printBackground: true,
        copies: 1
      });

      if (result.success) {
        message.success('打印操作成功');
      } else {
        message.error(`打印操作失败: ${result.message}`);
      }
    } catch (error) {
      message.error('打印操作失败');
      console.error('打印操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打印到PDF
  const printToPDF = async () => {
    try {
      setLoading(true);

      // 检查 API 是否可用
      if (typeof window.electronAPI.printToPDF !== 'function') {
        message.warning('PDF打印功能不可用');
        return;
      }

      const result = await window.electronAPI.printToPDF({
        content: form.getFieldValue('content'),
        landscape: false,
        marginsType: 0, // 这个参数已不再支持，但为了接口兼容保留
        printBackground: true,
        printSelectionOnly: false, // 这个参数已不再支持，但为了接口兼容保留
        pageSize: 'A4'
      });

      if (result.success) {
        message.success('PDF生成成功');
      } else {
        message.error(`PDF生成失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      message.error('PDF生成失败');
      console.error('PDF生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={2}>打印功能</Title>

        <Paragraph>
          这个示例展示了如何使用 Electron 的打印功能将内容发送到打印机或生成PDF文件。
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card
            title={
              <Space>
                <PrinterOutlined />
                <span>打印设置</span>
              </Space>
            }
            bordered={false}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={getPrinters}
                style={{ marginBottom: 16 }}
              >
                获取打印机列表
              </Button>

              {printers.length > 0 && (
                <>
                  <Text strong>选择打印机:</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={selectedPrinter}
                    onChange={(value) => setSelectedPrinter(value)}
                  >
                    {printers.map((printer) => (
                      <Option key={printer.name} value={printer.name}>
                        {printer.name} {printer.isDefault ? '(默认)' : ''}
                      </Option>
                    ))}
                  </Select>

                  <Text strong style={{ marginTop: 16 }}>打印模式:</Text>
                  <Radio.Group
                    value={printMode}
                    onChange={(e) => setPrintMode(e.target.value)}
                  >
                    <Radio value="silent">静默打印</Radio>
                    <Radio value="prompt">显示打印对话框</Radio>
                  </Radio.Group>
                </>
              )}
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>打印内容</span>
              </Space>
            }
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={printContent}
              initialValues={{
                content: '这是要打印的测试内容。\n\n您可以在这里输入任何文本。\n\n这些内容将被发送到打印机进行打印。'
              }}
            >
              <Form.Item
                name="content"
                label="要打印的内容"
                rules={[{ required: true, message: '请输入要打印的内容' }]}
              >
                <TextArea rows={6} placeholder="请输入要打印的内容" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PrinterOutlined />}
                    disabled={printers.length === 0}
                  >
                    打印内容
                  </Button>
                  <Button
                    type="default"
                    icon={<FileAddOutlined />}
                    onClick={printToPDF}
                  >
                    导出为PDF
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </Spin>
  );
};

export default PrintDemo;