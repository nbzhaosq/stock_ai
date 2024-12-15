import React from 'react';
import { Card, Tag, List, Space, Progress, Divider } from 'antd';
import {
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const RiskTag = ({ level }) => {
  const color = {
    '较高': 'red',
    '中等': 'orange',
    '较低': 'green',
  }[level] || 'blue';
  
  return <Tag color={color}>{level}</Tag>;
};

const TrendIcon = ({ trend }) => {
  if (trend === '上涨') return <ArrowUpOutlined style={{ color: '#f56c6c' }} />;
  if (trend === '下跌') return <ArrowDownOutlined style={{ color: '#67c23a' }} />;
  return <MinusOutlined style={{ color: '#909399' }} />;
};

const MarketAnalysis = ({ marketAnalysis }) => {
  if (!marketAnalysis) return null;

  const { market_analysis, relative_strength, conclusions } = marketAnalysis;
  const { trends, sentiment } = market_analysis;

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>大盘分析：</h4>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 大盘趋势 */}
        <div>
          {Object.entries(trends).map(([period, data]) => (
            <Tag 
              key={period}
              color={data.change >= 0 ? '#f56c6c' : '#67c23a'}
              style={{ margin: '0 8px 8px 0' }}
            >
              {period}线{data.trend} {data.change >= 0 ? '+' : ''}{data.change}%
            </Tag>
          ))}
        </div>

        {/* 市场情绪 */}
        <div>
          市场情绪：
          <Tag color={
            sentiment.state === '乐观' ? 'green' :
            sentiment.state === '悲观' ? 'red' : 'orange'
          }>
            {sentiment.state}
          </Tag>
          <span style={{ color: '#666', marginLeft: 8 }}>
            (情绪指数: {sentiment.score})
          </span>
        </div>

        {/* 相对强度 */}
        <div>
          相对强度：
          <span style={{ 
            color: relative_strength > 1 ? '#f56c6c' : '#67c23a',
            fontWeight: 500
          }}>
            {relative_strength.toFixed(2)}
          </span>
          <span style={{ color: '#666', marginLeft: 8 }}>
            ({relative_strength > 1 ? '强于' : '弱于'}大盘)
          </span>
        </div>

        {/* 情绪因素 */}
        <List
          size="small"
          dataSource={sentiment.factors}
          renderItem={item => (
            <List.Item>
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                {item}
              </Space>
            </List.Item>
          )}
        />

        {/* 分析结论 */}
        {conclusions.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>分析结论：</div>
            <div style={{ color: '#666' }}>
              {conclusions.join(' ')}
            </div>
          </div>
        )}
      </Space>
    </div>
  );
};

const SmartAnalysis = ({ analysis }) => {
  const { smart_analysis } = analysis;
  
  if (!smart_analysis) return null;
  
  const {
    risk_level,
    risk_score,
    risk_factors,
    opportunity_factors,
    trend,
    trend_strength,
    price_trend,
    volume_analysis,
    support_resistance,
    position_advice,
    action_advice,
    technical_indicators
  } = smart_analysis;

  return (
    <Card 
      title="智能分析" 
      size="small"
      className="analysis-card"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>风险评估：<RiskTag level={risk_level} /></div>
            <Progress 
              percent={risk_score} 
              size="small"
              status={risk_score >= 70 ? "exception" : risk_score <= 30 ? "success" : "active"}
            />
          </Space>
        </div>
        
        <div>
          <Space align="center">
            市场趋势：
            <TrendIcon trend={trend} />
            <span>{trend}</span>
            {trend_strength && (
              <span style={{ color: '#666' }}>
                (强度: {(trend_strength.strength * 100).toFixed(1)}%)
              </span>
            )}
          </Space>
        </div>

        {price_trend && price_trend.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px' }}>价格趋势：</h4>
            <List
              size="small"
              dataSource={price_trend}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <span>{item.name}：</span>
                    <span style={{ 
                      color: item.change >= 0 ? '#f56c6c' : '#67c23a',
                      fontWeight: 500
                    }}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </span>
                    <span style={{ color: '#666' }}>
                      ({item.trend})
                    </span>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}

        {volume_analysis && (
          <div>
            <h4 style={{ margin: '0 0 8px' }}>成交量分析：</h4>
            <div style={{ color: '#666' }}>{volume_analysis.description}</div>
          </div>
        )}

        {support_resistance && (
          <div>
            <h4 style={{ margin: '0 0 8px' }}>支撑压力位：</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              {support_resistance.resistance.length > 0 && (
                <div>
                  压力位：
                  <Space>
                    {support_resistance.resistance.map((level, index) => (
                      <Tag key={index} color="red">{level.toFixed(2)}</Tag>
                    ))}
                  </Space>
                </div>
              )}
              {support_resistance.support.length > 0 && (
                <div>
                  支撑位：
                  <Space>
                    {support_resistance.support.map((level, index) => (
                      <Tag key={index} color="green">{level.toFixed(2)}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          </div>
        )}
        
        {risk_factors.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px' }}>风险因素：</h4>
            <List
              size="small"
              dataSource={risk_factors}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    {item}
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}

        {opportunity_factors.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px' }}>机会因素：</h4>
            <List
              size="small"
              dataSource={opportunity_factors}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    {item}
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div>
          <h4 style={{ margin: '0 0 8px' }}>操作建议：</h4>
          <div style={{ color: '#666' }}>
            <p>{position_advice}</p>
            {action_advice.map((advice, index) => (
              <p key={index} style={{ margin: '4px 0' }}>{advice}</p>
            ))}
          </div>
        </div>

        {/* 添加大盘分析 */}
        {smart_analysis.market_analysis && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <MarketAnalysis marketAnalysis={smart_analysis.market_analysis} />
          </>
        )}
      </Space>
    </Card>
  );
};

export default SmartAnalysis; 