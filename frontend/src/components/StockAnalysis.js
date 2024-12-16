import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';

const { Title, Text, Paragraph } = Typography;

const StockAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const getTrendColor = (trend) => {
    if (!trend) return 'default';
    return trend === '上涨' ? 'red' : trend === '下跌' ? 'green' : 'blue';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case '较高':
        return 'red';
      case '较低':
        return 'green';
      default:
        return 'orange';
    }
  };

  return (
    <Card className="analysis-card" title="智能分析">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 趋势分析 */}
        <div>
          <Title level={5}>趋势分析</Title>
          {analysis.price_trend?.map((item, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <Space>
                <Text>{item.name}：</Text>
                <Tag color={getTrendColor(item.trend)}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </Tag>
              </Space>
            </div>
          ))}
        </div>

        {/* 风险评估 */}
        <div>
          <Title level={5}>风险评估</Title>
          <Space>
            <Text>风险等级：</Text>
            <Tag color={getRiskColor(analysis.risk_level)}>
              {analysis.risk_level}
            </Tag>
          </Space>
          <Paragraph>
            {analysis.position_advice}
          </Paragraph>
        </div>

        {/* 市场分析 */}
        {analysis.market_analysis && (
          <div>
            <Title level={5}>市场分析</Title>
            {analysis.market_analysis.conclusions?.map((conclusion, index) => (
              <Paragraph key={index}>
                {conclusion}
              </Paragraph>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default StockAnalysis; 