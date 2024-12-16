import React from 'react';
import { Stock } from '@ant-design/plots';
import { Card, Space, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const INDICATOR_TIPS = {
  MA5: '5日移动平均线，反映短期价格趋势，常用于判断短期支撑和阻力位',
  MA20: '20日移动平均线，反映中期价格趋势，常用于判断中期趋势方向',
  RSI: '相对强弱指标(RSI)，取值0-100，通常高于70视为超买，低于30视为超卖',
  VOL: '成交量，反映市场活跃度和交易参与度的重要指标',
  CHANGE: '涨跌幅，表示当前价格相对前一交易日收盘价的变化百分比'
};

const IndicatorLabel = ({ label, tip }) => (
  <Tooltip title={tip} placement="left">
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {label}
      <InfoCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
    </span>
  </Tooltip>
);

const StockChart = ({ data, analysis, indicators = [], onIndicatorRemove }) => {
  if (!data || !analysis || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const latestData = data[data.length - 1];

  // 格式化数据
  const stockData = data.map(item => ({
    date: item.date,
    open: item.open,
    close: item.close,
    high: item.high,
    low: item.low,
    volume: item.volume,
    ...indicators.reduce((acc, indicator) => {
      if (indicator.type === 'MA') {
        acc[`ma${indicator.params.period}`] = analysis.moving_average[`MA${indicator.params.period}`][data.indexOf(item)];
      }
      return acc;
    }, {})
  }));

  const config = {
    data: stockData,
    xField: 'date',
    yField: ['open', 'close', 'high', 'low'],
    tooltip: {
      crosshairs: {
        type: 'x',
      },
      domStyles: {
        'g2-tooltip': {
          padding: '8px',
          fontSize: '12px',
        },
      },
    },
    slider: {
      start: 0.8,
      end: 1,
    },
    theme: {
      colors10: ['#ef5350', '#26a69a'],
    },
    annotations: indicators.map(indicator => {
      if (indicator.type === 'MA') {
        return {
          type: 'line',
          xField: 'date',
          yField: `ma${indicator.params.period}`,
          style: {
            stroke: indicator.color || '#ffc107',
            lineWidth: 1,
            lineDash: [2, 2],
          },
          label: {
            text: `MA${indicator.params.period}`,
            position: 'left',
            style: {
              fill: indicator.color || '#ffc107',
              fontSize: 12,
            },
          },
        };
      }
      return null;
    }).filter(Boolean),
    yAxis: {
      position: 'right',
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineWidth: 1,
            lineDash: [2, 2],
          },
        },
      },
    },
    stockStyle: {
      stroke: ({ close, open }) => {
        return close > open ? '#ef5350' : '#26a69a';
      },
      fill: ({ close, open }) => {
        return close > open ? '#ef5350' : '#26a69a';
      },
    },
  };

  return (
    <div className="stock-data-container">
      <Space wrap className="indicator-tags">
        {indicators.map(indicator => (
          <Tag
            key={indicator.key}
            closable
            onClose={() => onIndicatorRemove(indicator.key)}
          >
            {indicator.name}
          </Tag>
        ))}
      </Space>
      <div className="chart-area">
        <Stock {...config} />
      </div>
      <div className="stock-info">
        <div className="latest-data">
          <h3>最新行情</h3>
          <table>
            <tbody>
              <tr>
                <td><IndicatorLabel label="最新价" tip={INDICATOR_TIPS.CLOSE} /></td>
                <td>{latestData.close.toFixed(2)}</td>
                <td><IndicatorLabel label="涨跌幅" tip={INDICATOR_TIPS.CHANGE} /></td>
                <td className={latestData.change >= 0 ? 'up' : 'down'}>
                  {latestData.change.toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td><IndicatorLabel label="开盘价" tip={INDICATOR_TIPS.OPEN} /></td>
                <td>{latestData.open.toFixed(2)}</td>
                <td><IndicatorLabel label="成交量" tip={INDICATOR_TIPS.VOL} /></td>
                <td>{(latestData.volume/10000).toFixed(2)}万</td>
              </tr>
              <tr>
                <td><IndicatorLabel label="最高价" tip={INDICATOR_TIPS.HIGH} /></td>
                <td>{latestData.high.toFixed(2)}</td>
                <td><IndicatorLabel label="最低价" tip={INDICATOR_TIPS.LOW} /></td>
                <td>{latestData.low.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockChart; 