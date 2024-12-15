import React from 'react';
import { Card, Descriptions, Tag, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const StockAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const getTrendColor = (direction) => {
    return direction === 'up' ? '#f56c6c' : '#67c23a';
  };

  const getRiskColor = (level) => {
    const colors = {
      high: '#f56c6c',
      medium: '#e6a23c',
      low: '#67c23a'
    };
    return colors[level] || '#909399';
  };

  return (
    <div className="stock-analysis">
      <Card title="智能分析报告" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 趋势分析 */}
          <Card type="inner" title="趋势分析">
            <Descriptions column={2}>
              <Descriptions.Item label="趋势方向">
                <Space>
                  {analysis.trend.direction === 'up' ? (
                    <ArrowUpOutlined style={{ color: '#f56c6c' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#67c23a' }} />
                  )}
                  <span style={{ color: getTrendColor(analysis.trend.direction) }}>
                    {analysis.trend.direction === 'up' ? '上升' : '下降'}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="趋势强度">
                <Tag color={analysis.trend.strength > 0.7 ? 'red' : 'blue'}>
                  {(analysis.trend.strength * 100).toFixed(1)}%
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="置信度">
                <Tag color={
                  analysis.trend.confidence === 'high' ? 'green' :
                  analysis.trend.confidence === 'medium' ? 'orange' : 'red'
                }>
                  {analysis.trend.confidence}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 波动性分析 */}
          <Card type="inner" title="波动性分析">
            <Descriptions column={2}>
              <Descriptions.Item label="风险等级">
                <Tag color={getRiskColor(analysis.volatility.risk_level)}>
                  {analysis.volatility.risk_level}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="年化波动率">
                {(analysis.volatility.annual_volatility * 100).toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="价格区间">
                {analysis.volatility.price_range.min.toFixed(2)} - {analysis.volatility.price_range.max.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 支撑阻力位 */}
          <Card type="inner" title="支撑阻力位分析">
            <Descriptions column={2}>
              <Descriptions.Item label="支撑位">
                {analysis.support_resistance.support}
              </Descriptions.Item>
              <Descriptions.Item label="阻力位">
                {analysis.support_resistance.resistance}
              </Descriptions.Item>
              <Descriptions.Item label="当前位置">
                <Tag color="blue">{analysis.support_resistance.position}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 技术指标 */}
          <Card type="inner" title="技术指标分析">
            <Descriptions column={2}>
              <Descriptions.Item label="RSI">
                <Tag color={
                  analysis.technical_indicators.rsi.condition === 'overbought' ? 'red' :
                  analysis.technical_indicators.rsi.condition === 'oversold' ? 'green' : 'blue'
                }>
                  {analysis.technical_indicators.rsi.value}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="MACD趋势">
                <Tag color={analysis.technical_indicators.macd.trend === 'bullish' ? 'red' : 'green'}>
                  {analysis.technical_indicators.macd.trend}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 分析总结 */}
          <Card type="inner" title="分析总结">
            <Paragraph>{analysis.summary}</Paragraph>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default StockAnalysis; 