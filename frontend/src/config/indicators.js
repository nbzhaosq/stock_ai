// 指标配置
export const INDICATORS = {
  MA: {
    name: '移动平均线',
    description: '简单移动平均线，用于判断价格趋势，常用于判断支撑和阻力位',
    type: 'MA',
    defaultParams: {
      period: 5
    },
    paramDescriptions: {
      period: '计算周期，常用值：5、10、20、60'
    },
    tips: [
      '当价格上穿/下穿MA时可能形成买入/卖出信号',
      'MA向上倾斜表示上升趋势，向下倾斜表示下降趋势',
      '多条MA由上到下排列表示强势，反之表示弱势'
    ]
  },
  EMA: {
    name: '指数移动平均线',
    description: '对近期数据加权的移动平均线，对价格变化的反应更加敏感',
    type: 'EMA',
    defaultParams: {
      period: 12
    },
    paramDescriptions: {
      period: '计算周期，常用值：12、26'
    },
    tips: [
      'EMA对近期价格变化更敏感，能更快反映趋势变化',
      '可以与MA结合使用，判断趋势的强弱',
      'EMA交叉可能产生交易信号'
    ]
  },
  MACD: {
    name: '指数平滑异同移动平均线',
    description: '基于两���不同周期的移动平均线，用于判断趋势的强弱和买卖时机',
    type: 'MACD',
    defaultParams: {
      fast: 12,
      slow: 26,
      signal: 9
    },
    paramDescriptions: {
      fast: '快线周期，通常为12',
      slow: '慢线周期，通常为26',
      signal: '信号线周期，通常为9'
    },
    tips: [
      'MACD金叉（DIF上穿DEA）可能是买入信号',
      'MACD死叉（DIF下穿DEA）可能是卖出信号',
      '柱状图由负转正可能是底部反转信号',
      '柱状图由正转负可能是顶部反转信号'
    ]
  },
  RSI: {
    name: '相对强弱指标',
    description: '衡量价格动量的技术指标，用于判断超买超卖',
    type: 'RSI',
    defaultParams: {
      period: 14
    },
    paramDescriptions: {
      period: '计算周期，常用值：6、14、24'
    },
    tips: [
      'RSI>70通常认为处于超买区域',
      'RSI<30通常认为处于超卖区域',
      'RSI背离可能预示趋势反转',
      '可以使用多周期RSI进行交叉分析'
    ]
  },
  KDJ: {
    name: '随机指标',
    description: '基于价格波动范围的技术指标，用于判断超买超卖和价格趋势',
    type: 'KDJ',
    defaultParams: {
      period: 9,
      k: 3,
      d: 3
    },
    paramDescriptions: {
      period: '观察周期，通常为9',
      k: 'K值平滑因子，通常为3',
      d: 'D值平滑因子，通常为3'
    },
    tips: [
      'K线上穿D线可能是买入信号',
      'K线下穿D线可能是卖出信号',
      'KDJ>80可能处于超买区域',
      'KDJ<20可能处于超卖区域',
      'KDJ指标背离可能预示趋势反转'
    ]
  }
};

// 获取指标配置
export const getIndicatorConfig = (type) => {
  return INDICATORS[type] || null;
};

// 获取指标默认参数
export const getDefaultParams = (type) => {
  return INDICATORS[type]?.defaultParams || {};
}; 