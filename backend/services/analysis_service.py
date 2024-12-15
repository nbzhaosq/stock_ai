import numpy as np
import pandas as pd
from scipy import stats
import logging

logger = logging.getLogger(__name__)

class StockAnalyzer:
    def __init__(self, data):
        self.df = pd.DataFrame(data)
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df = self.df.sort_values('date')

    def analyze(self):
        """综合分析股票数据"""
        try:
            analysis = {
                'trend': self._analyze_trend(),
                'volatility': self._analyze_volatility(),
                'support_resistance': self._find_support_resistance(),
                'technical_indicators': self._analyze_technical_indicators(),
                'summary': None
            }
            
            # 生成综合分析结论
            analysis['summary'] = self._generate_summary(analysis)
            
            logger.info('智能分析完成')
            return analysis
            
        except Exception as e:
            logger.error(f'智能分析失败: {str(e)}', exc_info=True)
            raise

    def _analyze_trend(self):
        """分析价格趋势"""
        try:
            closes = self.df['close'].values
            days = np.arange(len(closes))
            slope, intercept, r_value, p_value, std_err = stats.linregress(days, closes)
            
            # 计算趋势强度
            trend_strength = abs(r_value)
            
            # 计算近期趋势
            short_term_change = (closes[-1] - closes[-5]) / closes[-5] * 100 if len(closes) >= 5 else 0
            
            return {
                'direction': 'up' if slope > 0 else 'down',
                'strength': trend_strength,
                'slope': slope,
                'r_squared': r_value ** 2,
                'short_term_change': short_term_change,
                'confidence': 'high' if trend_strength > 0.7 else 'medium' if trend_strength > 0.3 else 'low'
            }
        except Exception as e:
            logger.error(f'趋势分析失败: {str(e)}')
            return None

    def _analyze_volatility(self):
        """分析波动性"""
        try:
            returns = self.df['close'].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)  # 年化波动率
            
            # 计算波动区间
            price_range = {
                'max': self.df['high'].max(),
                'min': self.df['low'].min(),
                'range_percent': (self.df['high'].max() - self.df['low'].min()) / self.df['low'].min() * 100
            }
            
            return {
                'annual_volatility': volatility,
                'price_range': price_range,
                'risk_level': 'high' if volatility > 0.3 else 'medium' if volatility > 0.15 else 'low'
            }
        except Exception as e:
            logger.error(f'波动性分析失败: {str(e)}')
            return None

    def _find_support_resistance(self):
        """寻找支撑位和阻力位"""
        try:
            prices = self.df['close'].values
            
            # 使用简单的百分位数方法
            support = np.percentile(prices, 25)
            resistance = np.percentile(prices, 75)
            
            current_price = prices[-1]
            
            return {
                'support': round(support, 2),
                'resistance': round(resistance, 2),
                'position': 'near_support' if current_price - support < (resistance - support) * 0.3 else 
                           'near_resistance' if resistance - current_price < (resistance - support) * 0.3 else
                           'middle_range'
            }
        except Exception as e:
            logger.error(f'支撑阻力位分析失败: {str(e)}')
            return None

    def _analyze_technical_indicators(self):
        """分析技术指标"""
        try:
            # 计算MACD
            exp1 = self.df['close'].ewm(span=12, adjust=False).mean()
            exp2 = self.df['close'].ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9, adjust=False).mean()
            
            # 计算RSI
            delta = self.df['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            current_rsi = rsi.iloc[-1]
            current_macd = macd.iloc[-1]
            current_signal = signal.iloc[-1]
            
            return {
                'macd': {
                    'value': round(current_macd, 3),
                    'signal': round(current_signal, 3),
                    'histogram': round(current_macd - current_signal, 3),
                    'trend': 'bullish' if current_macd > current_signal else 'bearish'
                },
                'rsi': {
                    'value': round(current_rsi, 2),
                    'condition': 'overbought' if current_rsi > 70 else 'oversold' if current_rsi < 30 else 'neutral'
                }
            }
        except Exception as e:
            logger.error(f'技术指标分析失败: {str(e)}')
            return None

    def _generate_summary(self, analysis):
        """生成综合分析结论"""
        try:
            trend = analysis['trend']
            volatility = analysis['volatility']
            support_resistance = analysis['support_resistance']
            indicators = analysis['technical_indicators']
            
            summary = []
            
            # 趋势分析
            trend_text = (
                f"股票处于{'上升' if trend['direction'] == 'up' else '下降'}趋势，"
                f"趋势强度{trend['strength']:.2f}，"
                f"置信度{trend['confidence']}。"
            )
            summary.append(trend_text)
            
            # 波动性分析
            volatility_text = (
                f"波动风险{volatility['risk_level']}，"
                f"年化波动率{volatility['annual_volatility']:.2%}。"
            )
            summary.append(volatility_text)
            
            # 支撑阻力位分析
            position_text = {
                'near_support': '接近支撑位',
                'near_resistance': '接近阻力位',
                'middle_range': '处于中间区域'
            }
            support_resistance_text = (
                f"当前价格{position_text[support_resistance['position']]}，"
                f"支撑位{support_resistance['support']}，"
                f"阻力位{support_resistance['resistance']}。"
            )
            summary.append(support_resistance_text)
            
            # 技术指标分析
            indicators_text = (
                f"RSI为{indicators['rsi']['value']}，"
                f"处于{indicators['rsi']['condition']}状态；"
                f"MACD显示{indicators['macd']['trend']}信号。"
            )
            summary.append(indicators_text)
            
            # 生成建议
            suggestion = self._generate_suggestion(analysis)
            summary.append(suggestion)
            
            return ' '.join(summary)
            
        except Exception as e:
            logger.error(f'生成分析总结失败: {str(e)}')
            return "无法生成分析总结"

    def _generate_suggestion(self, analysis):
        """生成交易建议"""
        try:
            trend = analysis['trend']
            rsi = analysis['technical_indicators']['rsi']
            macd = analysis['technical_indicators']['macd']
            position = analysis['support_resistance']['position']
            
            signals = []
            
            # 趋势信号
            if trend['direction'] == 'up' and trend['confidence'] == 'high':
                signals.append(1)
            elif trend['direction'] == 'down' and trend['confidence'] == 'high':
                signals.append(-1)
                
            # RSI信号
            if rsi['condition'] == 'oversold':
                signals.append(1)
            elif rsi['condition'] == 'overbought':
                signals.append(-1)
                
            # MACD信号
            if macd['trend'] == 'bullish':
                signals.append(1)
            elif macd['trend'] == 'bearish':
                signals.append(-1)
                
            # 支撑阻力位信号
            if position == 'near_support':
                signals.append(1)
            elif position == 'near_resistance':
                signals.append(-1)
                
            # 综合信号
            avg_signal = sum(signals) / len(signals) if signals else 0
            
            if avg_signal > 0.5:
                return "综合分析建议：可考虑买入"
            elif avg_signal < -0.5:
                return "综合分析建议：可考虑卖出"
            else:
                return "综合分析建议：建议观望"
            
        except Exception as e:
            logger.error(f'生成交易建议失败: {str(e)}')
            return "无法生成交易建议" 