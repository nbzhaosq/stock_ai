import React from 'react';
import { Modal, Form, InputNumber, Space, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { getIndicatorConfig } from '../config/indicators';

const { Option } = Select;

// 常用参数预设
const PRESETS = {
  MA: {
    period: [5, 10, 20, 60, 120, 250],
  },
  EMA: {
    period: [12, 26, 50, 100, 200],
  },
  RSI: {
    period: [6, 14, 24],
  },
  MACD: {
    combinations: [
      { fast: 12, slow: 26, signal: 9, label: '标准' },
      { fast: 10, slow: 20, signal: 5, label: '快速' },
      { fast: 5, slow: 35, signal: 5, label: '自适应' },
    ],
  },
  KDJ: {
    combinations: [
      { period: 9, k: 3, d: 3, label: '标准' },
      { period: 14, k: 3, d: 3, label: '长周期' },
      { period: 5, k: 3, d: 3, label: '短周期' },
    ],
  },
};

const IndicatorSettings = ({ visible, indicator, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const config = indicator ? getIndicatorConfig(indicator.type) : null;

  // 处理预设值选择
  const handlePresetSelect = (preset) => {
    if (typeof preset === 'number') {
      form.setFieldsValue({ period: preset });
    } else {
      form.setFieldsValue({ params: preset });
    }
  };

  const getPresetSelector = () => {
    const presets = PRESETS[indicator?.type];
    if (!presets) return null;

    if (presets.period) {
      return (
        <Form.Item label="常用值">
          <Select
            placeholder="选择常用值"
            onChange={handlePresetSelect}
            style={{ width: '100%' }}
          >
            {presets.period.map(p => (
              <Option key={p} value={p}>{p}周期</Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    if (presets.combinations) {
      return (
        <Form.Item label="参数组合">
          <Select
            placeholder="选择参数组合"
            onChange={(_, option) => handlePresetSelect(option.preset)}
            style={{ width: '100%' }}
          >
            {presets.combinations.map((combo, index) => (
              <Option 
                key={index} 
                value={index}
                preset={combo}
              >
                {combo.label} ({Object.entries(combo)
                  .filter(([key]) => key !== 'label')
                  .map(([key, value]) => `${key}:${value}`)
                  .join(', ')})
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }
  };

  const getFields = () => {
    if (!config) return null;

    switch (indicator.type) {
      case 'MA':
      case 'EMA':
      case 'RSI':
        return (
          <>
            {getPresetSelector()}
            <Form.Item 
              label={
                <Space>
                  周期
                  <Tooltip title={config.paramDescriptions.period}>
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              name="period"
              rules={[{ required: true, message: '请输入周期' }]}
              extra={`建议值: ${PRESETS[indicator.type].period.join(', ')}`}
            >
              <InputNumber min={1} max={200} />
            </Form.Item>
          </>
        );
      case 'MACD':
      case 'KDJ':
        return (
          <>
            {getPresetSelector()}
            {Object.entries(config.paramDescriptions).map(([key, desc]) => (
              <Form.Item 
                key={key}
                label={
                  <Space>
                    {desc.split('，')[0]}
                    <Tooltip title={desc}>
                      <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                name={['params', key]}
                rules={[{ required: true }]}
                extra={key === 'period' ? `建议值: ${PRESETS[indicator.type].period?.join(', ')}` : ''}
              >
                <InputNumber min={1} max={100} />
              </Form.Item>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={config?.name || '指标设置'}
      open={visible}
      onOk={() => {
        form.validateFields().then(values => {
          onOk({ ...indicator, ...values });
          form.resetFields();
        });
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      {config && (
        <>
          <p style={{ color: '#666', marginBottom: 16 }}>{config.description}</p>
          <Form
            form={form}
            layout="vertical"
            initialValues={indicator}
          >
            {getFields()}
          </Form>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>使用提示：</div>
            <ul style={{ color: '#666', paddingLeft: 20, margin: 0 }}>
              {config.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Modal>
  );
};

export default IndicatorSettings; 