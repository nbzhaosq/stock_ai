import React from 'react';
import { Card, Table, Typography } from 'antd';

const { Title } = Typography;

const TechnicalIndicators = ({ analysis }) => {
  if (!analysis) return null;

  const columns = [
    {
      title: '指标',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  // 准备表格数据
  const data = [
    {
      key: '1',
      name: 'RSI',
      value: analysis.technical_indicators?.rsi || '-',
      description: 'RSI > 70 超买，< 30 超卖',
    },
    {
      key: '2',
      name: '波动率',
      value: `${analysis.technical_indicators?.volatility || '-'}%`,
      description: '反映价格波动程度',
    },
    {
      key: '3',
      name: 'MA5',
      value: analysis.technical_indicators?.ma5 || '-',
      description: '5日移动平均线',
    },
    {
      key: '4',
      name: 'MA20',
      value: analysis.technical_indicators?.ma20 || '-',
      description: '20日移动平均线',
    },
    {
      key: '5',
      name: '成交量比',
      value: analysis.technical_indicators?.volume_ratio || '-',
      description: '近5日/前5日成交量比',
    },
  ];

  return (
    <Card className="analysis-card">
      <Title level={4}>技术指标分析</Title>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default TechnicalIndicators; 