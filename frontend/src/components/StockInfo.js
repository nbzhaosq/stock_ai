import React from 'react';
import { Card, Descriptions, Typography, Space, Tag } from 'antd';
import { GlobalOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const StockInfo = ({ stockInfo }) => {
  if (!stockInfo) return null;

  return (
    <Card title="公司信息" className="stock-info-card">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="行业">{stockInfo.sector}</Descriptions.Item>
          <Descriptions.Item label="细分行业">{stockInfo.industry}</Descriptions.Item>
          <Descriptions.Item label="市值">
            <Text type="success">{stockInfo.market_cap_fmt}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="日均成交量">
            {stockInfo.avg_volume ? (stockInfo.avg_volume / 10000).toFixed(2) + '万' : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="市盈率">
            {stockInfo.pe_ratio ? stockInfo.pe_ratio.toFixed(2) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="市净率">
            {stockInfo.pb_ratio ? stockInfo.pb_ratio.toFixed(2) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="股息率">
            {stockInfo.dividend_yield ? (stockInfo.dividend_yield * 100).toFixed(2) + '%' : '-'}
          </Descriptions.Item>
        </Descriptions>

        {stockInfo.description && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>公司简介：</Text>
            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
              {stockInfo.description}
            </Paragraph>
          </div>
        )}

        <Space wrap>
          {stockInfo.website && (
            <Tag icon={<GlobalOutlined />}>
              <a href={stockInfo.website} target="_blank" rel="noopener noreferrer">
                公司网站
              </a>
            </Tag>
          )}
          {stockInfo.employees && (
            <Tag icon={<TeamOutlined />}>
              {stockInfo.employees.toLocaleString()}名员工
            </Tag>
          )}
          {stockInfo.country && (
            <Tag icon={<GlobalOutlined />}>
              {stockInfo.country}
            </Tag>
          )}
          {stockInfo.currency && (
            <Tag icon={<DollarOutlined />}>
              {stockInfo.currency}
            </Tag>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default StockInfo; 