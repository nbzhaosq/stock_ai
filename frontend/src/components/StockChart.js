import React, { useRef, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import {
  Chart,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { InfoCircleOutlined } from '@ant-design/icons';
import SmartAnalysis from './SmartAnalysis';

// 注册插件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  annotationPlugin
);

const INDICATOR_TIPS = {
  MA5: '5日移动平均线，反映短期价格趋势，常用于判断短期支撑和阻力位',
  MA20: '20日移动平均线，反映中期价格趋势，常用于判断中期趋势方向',
  RSI: '相对强弱指标(RSI)，取值0-100，通常高于70视为超买，低于30视为超卖',
  VOL: '成交量，反映市场活跃度和交易参与度的重要指标',
  CHANGE: '涨跌幅，表示当前价格相对前一交易日收盘价的变化百分比',
  VOLATILITY: '波动率，反映价格波动的剧烈程度，越高表示价格波动越大',
  HIGH: '最高价，当日交易中出现的最高成交价格',
  LOW: '最低价，当日交易中出现的最低成交价格',
  OPEN: '开盘价，当日第一笔成交价格',
  CLOSE: '收盘价，当日最后一笔成交价格'
};

const IndicatorLabel = ({ label, tip }) => (
  <Tooltip title={tip} placement="left">
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {label}
      <InfoCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
    </span>
  </Tooltip>
);

// 计算移动平均线
const calculateMA = (data, period) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push(sum / period);
  }
  return result;
};

// 计算指数移动平均线
const calculateEMA = (data, period) => {
  const result = [];
  const k = 2 / (period + 1);
  
  // 第一个值使用简单平均
  let ema = data[0].close;
  result.push(ema);
  
  // 计算后续值
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    result.push(ema);
  }
  return result;
};

// 计算MACD
const calculateMACD = (data, { fast = 12, slow = 26, signal = 9 } = {}) => {
  const fastEMA = calculateEMA(data, fast);
  const slowEMA = calculateEMA(data, slow);
  const dif = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // 计算MACD信号线（DIF的9日EMA）
  const signalData = dif.map((value, i) => ({
    close: value,
    date: data[i].date
  }));
  const dea = calculateEMA(signalData, signal);
  
  // 计算MACD柱状图
  const macd = dif.map((dif, i) => (dif - dea[i]) * 2);
  
  return { dif, dea, macd };
};

// 计算RSI
const calculateRSI = (data, period = 14) => {
  const result = [];
  let gains = 0;
  let losses = 0;
  
  // 计算第一个RSI
  for (let i = 1; i < period; i++) {
    const change = data[i].close - data[i-1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rsi = 100 - (100 / (1 + avgGain / avgLoss));
  result.push(rsi);
  
  // 计算后续的RSI
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i-1].close;
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
    rsi = 100 - (100 / (1 + avgGain / avgLoss));
    result.push(rsi);
  }
  
  return result;
};

// 计算KDJ
const calculateKDJ = (data, period = 9) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    // 计算RSV
    let high = -Infinity;
    let low = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      high = Math.max(high, data[j].high);
      low = Math.min(low, data[j].low);
    }
    const rsv = ((data[i].close - low) / (high - low)) * 100;
    
    // 计算KDJ
    const prev = result[i - 1] || { k: 50, d: 50, j: 50 };
    const k = (2/3) * prev.k + (1/3) * rsv;
    const d = (2/3) * prev.d + (1/3) * k;
    const j = 3 * k - 2 * d;
    
    result.push({ k, d, j });
  }
  return result;
};

// 辅助函数：计算指标数据
const calculateIndicatorData = (data, indicator) => {
  switch (indicator.type) {
    case 'MA':
      return calculateMA(data, indicator.params.period);
    case 'EMA':
      return calculateEMA(data, indicator.params.period);
    case 'MACD': {
      const { dif } = calculateMACD(data, indicator.params);
      return dif;  // 只显示DIF线
    }
    case 'RSI':
      return calculateRSI(data, indicator.params.period);
    case 'KDJ': {
      const kdj = calculateKDJ(data, indicator.params.period);
      return kdj.map(v => v ? v.k : null);  // 只显示K线
    }
    default:
      return [];
  }
};

// 辅助函数：获取指标颜色
const getIndicatorColor = (type) => {
  const colors = {
    MA: 'rgb(255, 99, 132)',
    EMA: 'rgb(54, 162, 235)',
    MACD: 'rgb(255, 159, 64)',
    RSI: 'rgb(75, 192, 192)',
    KDJ: 'rgb(153, 102, 255)',
  };
  return colors[type] || 'rgb(201, 203, 207)';
};

const StockChart = ({ data, analysis, indicators = [], onIndicatorRemove }) => {
  const chartRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  if (!data || !analysis || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  try {
    const latestData = data[data.length - 1];

    if (!latestData.close || !latestData.date) {
      console.error('Missing required fields in data');
      return null;
    }

    if (!analysis.moving_average || !analysis.moving_average.MA5) {
      console.error('Missing analysis data');
      return null;
    }

    // 判断指标是否需要独立Y轴
    const needsSeparateAxis = (type) => ['RSI', 'KDJ'].includes(type);

    // 创建Y轴配置
    const createYAxes = () => {
      const axes = {
        price: {
          type: 'linear',
          position: 'right',
          beginAtZero: false,
          ticks: {
            callback: value => value.toFixed(2),
            font: { size: 11 }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      };

      indicators.forEach((indicator, index) => {
        if (needsSeparateAxis(indicator.type)) {
          axes[indicator.type] = {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            max: 100,
            min: 0,
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              font: { size: 11 }
            }
          };
        }
      });

      return axes;
    };

    const chartData = {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: '收盘价',
          data: data.map(item => item.close),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: 'price'
        },
        ...indicators.map(indicator => ({
          label: indicator.name,
          data: calculateIndicatorData(data, indicator),
          borderColor: getIndicatorColor(indicator.type),
          backgroundColor: 'transparent',
          tension: 0.1,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          yAxisID: needsSeparateAxis(indicator.type) ? indicator.type : 'price'
        }))
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            boxWidth: 20,
            padding: 15,
            font: { size: 12 },
            generateLabels: (chart) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              return labels.map(label => ({
                ...label,
                text: label.text + (indicators.find(i => i.name === label.text)?.params 
                  ? ` (${Object.values(indicators.find(i => i.name === label.text).params).join(',')})` 
                  : ''),
                onClick: () => {
                  if (label.text !== '收盘价') {
                    const indicator = indicators.find(i => i.name === label.text.split(' ')[0]);
                    if (indicator) {
                      onIndicatorRemove(indicator.type);
                    }
                  }
                }
              }));
            }
          }
        },
        title: {
          display: true,
          text: '股票价格走势',
          font: {
            size: 14,
            weight: 500
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const dataIndex = context.dataIndex;
              const item = data[dataIndex];
              if (item && context.dataset.label === '收盘价') {
                return [
                  `收盘: ${item.close.toFixed(2)}`,
                  `开盘: ${item.open.toFixed(2)}`,
                  `最高: ${item.high.toFixed(2)}`,
                  `最低: ${item.low.toFixed(2)}`,
                  `涨跌幅: ${item.change.toFixed(2)}%`,
                  `成交量: ${(item.volume/10000).toFixed(2)}万`
                ];
              }
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        },
        annotation: {
          annotations: selectedPoint ? {
            point: {
              type: 'point',
              xValue: selectedPoint.x,
              yValue: selectedPoint.y,
              backgroundColor: 'rgba(255, 99, 132, 0.25)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
              radius: 4
            },
            line1: {
              type: 'line',
              xMin: selectedPoint.x,
              xMax: selectedPoint.x,
              borderColor: 'rgba(102, 102, 102, 0.5)',
              borderWidth: 1,
              borderDash: [2, 2]
            },
            line2: {
              type: 'line',
              yMin: selectedPoint.y,
              yMax: selectedPoint.y,
              borderColor: 'rgba(102, 102, 102, 0.5)',
              borderWidth: 1,
              borderDash: [2, 2]
            }
          } : {}
        }
      },
      scales: {
        ...createYAxes(),
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
            font: { size: 11 }
          }
        }
      }
    };

    const handleClick = (event) => {
      const chart = chartRef.current;
      if (!chart) return;

      const points = chart.getElementsAtEventForMode(
        event,
        'index',
        { intersect: false },
        true
      );

      if (points.length) {
        const point = points[0];
        setSelectedPoint({
          x: point.index,
          y: data[point.index].close
        });
      }
    };

    return (
      <div className="stock-data-container">
        <div className="chart-area">
          <Line 
            ref={chartRef}
            data={chartData} 
            options={options}
            onClick={handleClick}
          />
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
          <div className="technical-analysis">
            <SmartAnalysis analysis={analysis} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return null;
  }
};

export default StockChart; 