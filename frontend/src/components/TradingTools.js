import React, { useState } from 'react';
import { Tabs, Button, Space, Collapse } from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  PlusOutlined,
  MinusOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  EditOutlined,
  BgColorsOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import IndicatorSettings from './IndicatorSettings';
import { getIndicatorConfig } from '../config/indicators';

const { Panel } = Collapse;

const ToolButton = ({ icon, title, desc, onClick }) => (
  <Button icon={icon} onClick={onClick}>
    <div className="tool-btn-content">
      <span className="tool-btn-title">{title}</span>
      {desc && <span className="tool-btn-desc">{desc}</span>}
    </div>
  </Button>
);

const TradingTools = ({ onIndicatorSelect }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentIndicator, setCurrentIndicator] = useState(null);

  const handleIndicatorClick = (type) => {
    const config = getIndicatorConfig(type);
    if (config) {
      setCurrentIndicator({
        type: config.type,
        name: config.name,
        params: { ...config.defaultParams }
      });
      setSettingsVisible(true);
    }
  };

  const handleSettingsOk = (values) => {
    if (onIndicatorSelect) {
      onIndicatorSelect(values);
    }
    setSettingsVisible(false);
  };

  return (
    <div className="trading-tools">
      <Tabs
        defaultActiveKey="indicators"
        tabPosition="left"
        items={[
          {
            key: 'indicators',
            label: '指标',
            children: (
              <div className="tools-section">
                <Collapse
                  ghost
                  defaultActiveKey={[]}
                  expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                  )}
                >
                  <Panel header="均线" key="ma">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <ToolButton
                        icon={<LineChartOutlined />}
                        title="MA - 移动平均线"
                        desc="简单移动平均线，反映价格趋势"
                        onClick={() => handleIndicatorClick('MA')}
                      />
                      <ToolButton
                        icon={<LineChartOutlined />}
                        title="EMA - 指数移动平均线"
                        desc="对近期数据加权的移动平均线"
                        onClick={() => handleIndicatorClick('EMA')}
                      />
                    </Space>
                  </Panel>
                  <Panel header="趋势" key="trend">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <ToolButton
                        icon={<BarChartOutlined />}
                        title="MACD - 指数平滑异同"
                        desc="基于均线的趋势动量指标"
                        onClick={() => handleIndicatorClick('MACD')}
                      />
                      <ToolButton
                        icon={<DotChartOutlined />}
                        title="RSI - 相对强弱指标"
                        desc="衡量价格动量的技术指标"
                        onClick={() => handleIndicatorClick('RSI')}
                      />
                      <ToolButton
                        icon={<AreaChartOutlined />}
                        title="KDJ - 随机指标"
                        desc="反映价格超买超卖的技术指标"
                        onClick={() => handleIndicatorClick('KDJ')}
                      />
                    </Space>
                  </Panel>
                  <Panel header="其他" key="other">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <ToolButton
                        icon={<PlusOutlined />}
                        title="添加自定义指标"
                        desc="添加其他技术分析指标"
                      />
                    </Space>
                  </Panel>
                </Collapse>
              </div>
            ),
          },
          {
            key: 'drawings',
            label: '画线',
            children: (
              <div className="tools-section">
                <Collapse
                  ghost
                  defaultActiveKey={[]}
                  expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                  )}
                >
                  <Panel header="基础线型" key="basic">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <ToolButton
                        icon={<EditOutlined />}
                        title="趋势线"
                        desc="绘制价格趋势���"
                      />
                      <ToolButton
                        icon={<MinusOutlined />}
                        title="水平线"
                        desc="绘制水平支撑/阻力线"
                      />
                      <ToolButton
                        icon={<MinusOutlined rotate={90} />}
                        title="垂直线"
                        desc="绘制垂直时间分割线"
                      />
                    </Space>
                  </Panel>
                  <Panel header="图形" key="shapes">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <ToolButton
                        icon={<BorderOutlined />}
                        title="矩形"
                        desc="绘制矩形区域"
                      />
                      <ToolButton
                        icon={<RadiusSettingOutlined />}
                        title="圆形"
                        desc="绘制圆形/椭圆区域"
                      />
                      <ToolButton
                        icon={<BgColorsOutlined />}
                        title="区域"
                        desc="标记自定义区域"
                      />
                    </Space>
                  </Panel>
                </Collapse>
              </div>
            ),
          },
        ]}
      />
      <IndicatorSettings
        visible={settingsVisible}
        indicator={currentIndicator}
        onOk={handleSettingsOk}
        onCancel={() => setSettingsVisible(false)}
      />
    </div>
  );
};

export default TradingTools; 