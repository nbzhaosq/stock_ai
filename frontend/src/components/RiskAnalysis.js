import React from 'react';
import { Card, Typography, List, Tag, Space } from 'antd';

const { Title, Text } = Typography;

const RiskAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const getRiskLevelColor = (level) => {
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
    <Card className="analysis-card">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>风险评估</Title>
          <Space>
            <Text>风险等级：</Text>
            <Tag color={getRiskLevelColor(analysis.risk_level)}>
              {analysis.risk_level}
            </Tag>
            <Text>风险得分：{analysis.risk_score}</Text>
          </Space>
        </div>

        <div>
          <Title level={5}>风险因素</Title>
          <List
            size="small"
            dataSource={analysis.risk_factors}
            renderItem={item => (
              <List.Item>
                <Tag color="red">{item}</Tag>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Title level={5}>机会因素</Title>
          <List
            size="small"
            dataSource={analysis.opportunity_factors}
            renderItem={item => (
              <List.Item>
                <Tag color="green">{item}</Tag>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Title level={5}>趋势分析</Title>
          <List
            size="small"
            dataSource={analysis.price_trend}
            renderItem={item => (
              <List.Item>
                <Space>
                  <Text>{item.name}：</Text>
                  <Tag color={item.change > 0 ? 'red' : 'green'}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div>
          <Title level={5}>操作建议</Title>
          <Text>{analysis.position_advice}</Text>
          <List
            size="small"
            dataSource={analysis.action_advice}
            renderItem={item => (
              <List.Item>
                <Text>{item}</Text>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );
};

export default RiskAnalysis; 