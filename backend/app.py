from flask import Flask, jsonify, request
from flask_cors import CORS
from services.stock_service import get_stock_data, format_stock_symbol
from services.data_analysis import analyze_stock_data
from services.analysis_service import StockAnalyzer
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
import logging
import asyncio
import numpy as np
import os
from config import DEEPSEEK_API_KEY  # 导入配置
import json

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('stock_app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 使用配置文件中的API密钥
os.environ["DEEPSEEK_API_KEY"] = DEEPSEEK_API_KEY

def analyze_stock_risk(data, analysis):
    """分析股票风险和给出建议"""
    try:
        # 获取最新数据
        latest_price = data[-1]['close']
        latest_ma5 = analysis['moving_average']['MA5'][-1]
        latest_ma20 = analysis['moving_average']['MA20'][-1]
        rsi = analysis['rsi'][-1]
        volatility = analysis['volatility']
        
        # 计算价格趋势
        price_trend = []
        trends = {
            '日线': 1,
            '周线': 5,
            '月线': 20,
            '季线': 60
        }
        
        for period_name, days in trends.items():
            if len(data) >= days:
                change = (latest_price - data[-days]['close']) / data[-days]['close'] * 100
                price_trend.append({
                    'name': period_name,
                    'change': round(change, 2),
                    'trend': '上涨' if change > 0 else '下跌'
                })

        # 计算支撑位和压力位
        support_resistance = calculate_support_resistance(data, latest_price)
        
        # 计算成交量分析
        volume_analysis = analyze_volume(data)
        
        # 趋势强度分析
        trend_strength = analyze_trend_strength(data, analysis)
        
        # 综合分析
        risk_factors = []
        opportunity_factors = []
        risk_level = "中等"
        risk_score = 50  # 基础风险分数
        
        # RSI 分析
        if rsi > 70:
            risk_factors.append(f"RSI超买({rsi:.2f} > 70)，股价可能存在回调风险")
            risk_score += 20
        elif rsi < 30:
            opportunity_factors.append(f"RSI超卖({rsi:.2f} < 30)，股价可能存在反弹机会")
            risk_score -= 10
        
        # 波动率分析
        if volatility > 0.03:
            risk_factors.append(f"波动率较高({volatility * 100:.2f}%)，注意控制仓位")
            risk_score += 15
        elif volatility < 0.01:
            opportunity_factors.append(f"波动率较低({volatility * 100:.2f}%)，可能存在��破机会")
        
        # 均线分析
        if latest_price < latest_ma5 < latest_ma20:
            risk_factors.append("价格处于双均线下方，可能处于下跌趋势")
            risk_score += 15
        elif latest_price > latest_ma5 > latest_ma20:
            opportunity_factors.append("价格处于双均线上方，可能处于上涨趋势")
            risk_score -= 10
            
        # 成交量分析
        if volume_analysis['volume_trend'] == '放量':
            if trend_strength['trend'] == '上涨':
                opportunity_factors.append("放量上涨，上涨趋势确立")
                risk_score -= 10
            elif trend_strength['trend'] == '下跌':
                risk_factors.append("放量下跌，下跌趋势确立")
                risk_score += 15
        elif volume_analysis['volume_trend'] == '缩量':
            if trend_strength['trend'] == '上涨':
                risk_factors.append("缩量上涨，上涨动能不足")
                risk_score += 10
            elif trend_strength['trend'] == '下跌':
                opportunity_factors.append("缩量下跌，下跌动能减弱")
                risk_score -= 5

        # 趋势强度分析
        if trend_strength['strength'] > 0.7:
            if trend_strength['trend'] == '上涨':
                opportunity_factors.append(f"强势上涨，趋势强度{trend_strength['strength']:.2f}")
            else:
                risk_factors.append(f"强势下跌，趋势强度{trend_strength['strength']:.2f}")
                risk_score += 20
        
        # 支撑位/压力位分析
        price_position = analyze_price_position(latest_price, support_resistance)
        if price_position['position'] == 'near_support':
            opportunity_factors.append(f"接近支撑位{price_position['level']:.2f}，可能存在反弹机会")
        elif price_position['position'] == 'near_resistance':
            risk_factors.append(f"接近压力位{price_position['level']:.2f}，注意突破确认")
            risk_score += 10

        # 根据风险分数确定风险等级
        if risk_score >= 70:
            risk_level = "较高"
        elif risk_score <= 30:
            risk_level = "较低"
        
        # 如果没有风险因素，添加默认提示
        if not risk_factors and not opportunity_factors:
            risk_factors.append("当前未发现明显风险信号")
            risk_level = "较低"
        
        # 趋势判断
        trend = trend_strength['trend']
        
        # 操作建议
        position_advice = generate_position_advice(
            risk_level, 
            trend_strength, 
            volume_analysis, 
            price_position
        )
        
        # 具体操作建议
        action_advice = generate_action_advice(
            trend_strength,
            volume_analysis,
            price_position,
            risk_level
        )
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "opportunity_factors": opportunity_factors,
            "trend": trend,
            "trend_strength": trend_strength,
            "price_trend": price_trend,
            "volume_analysis": volume_analysis,
            "support_resistance": support_resistance,
            "position_advice": position_advice,
            "action_advice": action_advice,
            "technical_indicators": {
                "rsi": round(rsi, 2),
                "volatility": round(volatility * 100, 2),
                "ma5": round(latest_ma5, 2),
                "ma20": round(latest_ma20, 2),
                "volume_ratio": round(volume_analysis['volume_ratio'], 2)
            }
        }
    except Exception as e:
        logger.error(f"分析错误: {str(e)}")
        return None

def calculate_support_resistance(data, current_price):
    """计算支撑位和压力位"""
    prices = [d['low'] for d in data] + [d['high'] for d in data]
    prices.sort()
    
    support_levels = []
    resistance_levels = []
    
    for price in prices:
        if price < current_price:
            if not support_levels or abs(price - support_levels[-1]) > current_price * 0.01:
                support_levels.append(price)
        else:
            if not resistance_levels or abs(price - resistance_levels[-1]) > current_price * 0.01:
                resistance_levels.append(price)
    
    return {
        "support": support_levels[-3:] if support_levels else [],
        "resistance": resistance_levels[:3] if resistance_levels else []
    }

def analyze_volume(data):
    """分析成交量"""
    recent_volume = sum(d['volume'] for d in data[-5:]) / 5
    old_volume = sum(d['volume'] for d in data[-10:-5]) / 5
    volume_ratio = recent_volume / old_volume
    
    volume_trend = '平稳'
    if volume_ratio > 1.5:
        volume_trend = '放量'
    elif volume_ratio < 0.7:
        volume_trend = '缩量'
    
    return {
        "volume_ratio": volume_ratio,
        "volume_trend": volume_trend,
        "description": f"近5日成交量为前5日的{volume_ratio:.2f}倍"
    }

def analyze_trend_strength(data, analysis):
    """分析趋势强度"""
    try:
        if not data or len(data) < 20:  # 确保有足够的数据点
            return None
            
        # 计算方向一致性
        price_changes = [data[i]['close'] - data[i-1]['close'] for i in range(1, len(data))]
        direction_consistency = sum(1 for x in price_changes[-20:] if x > 0) / 20
        
        # 计算突破强度
        ma_distance = 0
        if analysis and 'moving_average' in analysis:
            ma20 = analysis['moving_average']['MA20'][-1]
            ma_distance = (data[-1]['close'] - ma20) / ma20
        else:
            # 如果没有提供分析数据，计算简单的价格偏离度
            avg_price = sum(d['close'] for d in data[-20:]) / 20
            ma_distance = (data[-1]['close'] - avg_price) / avg_price
        
        # 计算趋势强度
        strength = (direction_consistency + abs(ma_distance)) / 2
        
        trend = '上涨' if direction_consistency > 0.5 else '下跌'
        
        return {
            "trend": trend,
            "strength": strength,
            "direction_consistency": direction_consistency,
            "ma_distance": ma_distance
        }
    except Exception as e:
        logger.error(f"分析趋势强度失败: {str(e)}")
        return None

def analyze_price_position(price, support_resistance):
    """分析价格位置"""
    if support_resistance['support']:
        nearest_support = max(support_resistance['support'])
        if abs(price - nearest_support) / price < 0.02:
            return {"position": "near_support", "level": nearest_support}
    
    if support_resistance['resistance']:
        nearest_resistance = min(support_resistance['resistance'])
        if abs(price - nearest_resistance) / price < 0.02:
            return {"position": "near_resistance", "level": nearest_resistance}
    
    return {"position": "middle", "level": None}

def generate_position_advice(risk_level, trend_strength, volume_analysis, price_position):
    """生成仓位建议"""
    base_position = {
        "较高": 30,
        "中等": 50,
        "较低": 70
    }[risk_level]
    
    position_advice = f"���议仓位制在{base_position}%以下"
    
    if trend_strength['strength'] > 0.7 and trend_strength['trend'] == '上涨':
        position_advice += "，可以适当增加仓位"
    elif trend_strength['strength'] > 0.7 and trend_strength['trend'] == '下跌':
        position_advice += "，建议降低仓位"
    
    if volume_analysis['volume_trend'] == '放量':
        position_advice += "，注意成交量变化"
    
    if price_position['position'] != 'middle':
        position_advice += "，关注价格突破情况"
    
    return position_advice

def generate_action_advice(trend_strength, volume_analysis, price_position, risk_level):
    """生成具体操作建议"""
    advices = []
    
    # 趋势强度建议
    if trend_strength['strength'] > 0.7:
        if trend_strength['trend'] == '上涨':
            advices.append("趋势强劲，可以考虑逢低买入")
        else:
            advices.append("下跌趋势明显，建议观望或减仓")
    else:
        advices.append("趋势不明确，建议等待明确信号")
    
    # 成交量建议
    if volume_analysis['volume_trend'] == '放量':
        if trend_strength['trend'] == '上涨':
            advices.append("放量上涨，可以适度跟进")
        else:
            advices.append("放量下跌，建������避风险")
    elif volume_analysis['volume_trend'] == '缩量':
        advices.append("成交量萎缩，建议等待成交量放大")
    
    # 价格位置建议
    if price_position['position'] == 'near_support':
        advices.append(f"接近支撑位{price_position['level']:.2f}，可以考虑少量试探性买入")
    elif price_position['position'] == 'near_resistance':
        advices.append(f"接近压力位{price_position['level']:.2f}，建议设置止损")
    
    # 风险等级建议
    if risk_level == "较高":
        advices.append("当前风险较高，建���以观���为主")
    
    return advices

def get_market_index_data(market):
    """获取大盘指数数据"""
    try:
        # 根据市场获取对应的指数
        index_symbol = {
            'CN': {
                'SH': '000001',  # 上证指数
                'SZ': '399001'   # 深证成指
            },
            'US': '^GSPC'           # 标普500
        }.get(market)
        
        if not index_symbol:
            return None
            
        # 获取指数数据
        if market == 'CN':
            # 根据股票代码判断使用哪个指数
            index_data = get_stock_data('CN', index_symbol['SH'])  # 直接使用带后缀的代���
        else:
            index_data = get_stock_data(market, index_symbol)
            
        return index_data
    except Exception as e:
        logger.error(f"获取大盘数据失败: {str(e)}")
        return None

def analyze_market_trend(index_data):
    """分析大盘走势"""
    if not index_data or len(index_data) < 60:  # 确保有足够的数据点
        logger.warning("大盘数据不足或为空")
        return None
        
    try:
        # 计算大盘趋势
        latest_price = index_data[-1]['close']
        periods = {
            '日': 1,
            '周': 5,
            '��': 20,
            '季': 60
        }
        
        trends = {}
        for name, days in periods.items():
            if len(index_data) >= days:
                change = (latest_price - index_data[-days]['close']) / index_data[-days]['close'] * 100
                trends[name] = {
                    'change': round(change, 2),
                    'trend': '上涨' if change > 0 else '下跌'
                }
        
        # 计算大盘强度
        strength = analyze_trend_strength(index_data, None)
        if not strength:  # 检查强度计算结果
            return None
            
        # 计算市场情绪
        sentiment = analyze_market_sentiment(index_data)
        if not sentiment:  # 检查情绪分析结果
            return None
        
        return {
            'trends': trends,
            'strength': strength,
            'sentiment': sentiment
        }
    except Exception as e:
        logger.error(f"分析大盘走势失败: {str(e)}")
        return None

def analyze_market_sentiment(index_data):
    """分析市场情绪"""
    try:
        if not index_data or len(index_data) < 20:  # 确保有足够的数据点
            return None
            
        # 计算最近20天的上涨天数
        up_days = sum(1 for i in range(1, min(20, len(index_data)))
                     if index_data[-i]['close'] > index_data[-i-1]['close'])
        
        # 计算成交量变化
        recent_volume = sum(d['volume'] for d in index_data[-5:]) / 5
        old_volume = sum(d['volume'] for d in index_data[-10:-5]) / 5
        volume_ratio = recent_volume / old_volume if old_volume > 0 else 1.0
        
        # 计算波动率
        returns = [(index_data[i]['close'] - index_data[i-1]['close']) / index_data[i-1]['close']
                  for i in range(1, len(index_data))]
        volatility = np.std(returns) * np.sqrt(252)  # 年化波动率
        
        # 综合评估市场情绪
        sentiment_score = 0
        sentiment_factors = []
        
        # ��据上涨天数评估
        if up_days >= 15:
            sentiment_score += 30
            sentiment_factors.append("市场持续上涨，情绪偏乐观")
        elif up_days <= 5:
            sentiment_score -= 30
            sentiment_factors.append("市场持续下跌，情绪偏悲观")
        
        # 根据成交量评估
        if volume_ratio > 1.5:
            sentiment_score += 20
            sentiment_factors.append("成交量明显放大，市场活跃度提升")
        elif volume_ratio < 0.7:
            sentiment_score -= 20
            sentiment_factors.append("成交量明显萎缩，市场活跃度下降")
        
        # 根据波动率评估
        if volatility > 0.3:  # 30%的年化波动率
            sentiment_score -= 10
            sentiment_factors.append("市场波动剧烈，风险偏好降低")
        elif volatility < 0.1:  # 10%的年化波动率
            sentiment_score += 10
            sentiment_factors.append("市场波动平稳，风险偏好适")
        
        # 确定情绪状态
        if sentiment_score >= 30:
            sentiment = "乐观"
        elif sentiment_score <= -30:
            sentiment = "悲观"
        else:
            sentiment = "中性"
            
        return {
            'score': sentiment_score,
            'state': sentiment,
            'factors': sentiment_factors,
            'metrics': {
                'up_days_ratio': round(up_days / 20 * 100, 2),
                'volume_ratio': round(volume_ratio, 2),
                'volatility': round(volatility * 100, 2)
            }
        }
    except Exception as e:
        logger.error(f"分析市场情绪失败: {str(e)}")
        return None

def analyze_stock_with_market(stock_data, market_data):
    """结合大盘走势分析个股"""
    try:
        market_analysis = analyze_market_trend(market_data)
        if not market_analysis:
            return None
            
        # 计算个股相对大盘的表现
        relative_strength = calculate_relative_strength(stock_data, market_data)
        
        # 生成分析结论
        conclusions = []
        
        # 大盘趋势分析
        market_trend = market_analysis['trends'].get('周', {}).get('trend')
        if market_trend:
            conclusions.append(f"大盘{market_trend}趋势下，")
            if relative_strength > 1.1:
                conclusions.append("个股表现强于大盘，可能存在独立行情")
            elif relative_strength < 0.9:
                conclusions.append("个股表现弱于大盘，需要关注基本面变化")
            else:
                conclusions.append("个股走势与大盘同步")
        
        # 市场情绪分析
        sentiment = market_analysis['sentiment']['state']
        if sentiment == "乐观":
            conclusions.append("市场情绪偏乐观，可以适当提高仓位")
        elif sentiment == "悲观":
            conclusions.append("市场情绪偏悲观，建议降低仓位")
        
        return {
            'market_analysis': market_analysis,
            'relative_strength': round(relative_strength, 2),
            'conclusions': conclusions
        }
    except Exception as e:
        logger.error(f"结合大盘分析���败: {str(e)}")
        return None

def calculate_relative_strength(stock_data, market_data):
    """计算个股相对大盘的强度"""
    try:
        # 计算最近20天的收益率
        stock_return = (stock_data[-1]['close'] - stock_data[-20]['close']) / stock_data[-20]['close']
        market_return = (market_data[-1]['close'] - market_data[-20]['close']) / market_data[-20]['close']
        
        # 计算相对强度
        relative_strength = (1 + stock_return) / (1 + market_return)
        return relative_strength
    except Exception:
        return 1.0

def get_llm_analysis(stock_data, technical_analysis):
    """使用LangChain和Deepseek模型分析股票趋势"""
    try:
        # 初始化ChatOpenAI（使用Deepseek模型）
        llm = ChatOpenAI(
            model="deepseek-chat",
            openai_api_key=DEEPSEEK_API_KEY,
            openai_api_base="https://api.deepseek.com/v1",
            temperature=0.7
        )
        
        # 创建分析提示模板
        prompt_template = ChatPromptTemplate.from_template(
            """
            作为一个专业的股票分析师，请基于以下数据分析该股票的走势：
            
            最近的股票数据:
            {stock_data}
            
            技术指标数据:
            {technical_indicators}
            
            请提供以下分析：
            1. 总体趋势判断
            2. 主要支撑和阻力位
            3. 短期投资建议
            4. 需要关注的风险点
            
            请用专业的角度进行分析，并给出具体的数据支持。
            """
        )
        
        # 创建分析链
        chain = prompt_template | llm
        
        # 准备输入数据
        recent_data = stock_data[-5:]  # 最近5天数据
        technical_indicators = {
            'RSI': technical_analysis.get('rsi', [])[-1] if technical_analysis.get('rsi') else None,
            'MA5': technical_analysis['moving_average']['MA5'][-1] if technical_analysis.get('moving_average') else None,
            'MA20': technical_analysis['moving_average']['MA20'][-1] if technical_analysis.get('moving_average') else None,
            'volatility': technical_analysis.get('volatility'),
        }
        
        # 格式化数据为更易读的格式
        formatted_data = []
        for day in recent_data:
            formatted_data.append({
                '日期': day.get('date', ''),
                '开盘': round(day.get('open', 0), 2),
                '最高': round(day.get('high', 0), 2),
                '最低': round(day.get('low', 0), 2),
                '��盘': round(day.get('close', 0), 2),
                '成交量': day.get('volume', 0)
            })

        formatted_indicators = {
            'RSI指标': round(technical_indicators['RSI'], 2) if technical_indicators['RSI'] else None,
            '5日均线': round(technical_indicators['MA5'], 2) if technical_indicators['MA5'] else None,
            '20日均线': round(technical_indicators['MA20'], 2) if technical_indicators['MA20'] else None,
            '波动率': f"{round(technical_indicators['volatility'] * 100, 2)}%" if technical_indicators['volatility'] else None
        }
        
        # 执行分析
        response = chain.invoke({
            "stock_data": json.dumps(formatted_data, indent=2, ensure_ascii=False),
            "technical_indicators": json.dumps(formatted_indicators, indent=2, ensure_ascii=False)
        }).content
        
        logger.info(f"AI分析响应: {response}")
        
        # 如果响应为空，返回默认分析
        if not response:
            return {
                "llm_analysis": "AI分析服务暂时不可用，请稍后重试。",
                "analysis_type": "AI智能分析",
                "model": "deepseek-chat"
            }
        
        return {
            "llm_analysis": response,
            "analysis_type": "AI智能分析",
            "model": "deepseek-chat"
        }
        
    except Exception as e:
        logger.error(f"LLM分析失败: {str(e)}", exc_info=True)
        return {
            "llm_analysis": f"AI分析生成失败: {str(e)}",
            "analysis_type": "AI智能分析",
            "model": "deepseek-chat"
        }

# 修改主要的分析函数
@app.route('/api/stock/<market>/<symbol>', methods=['GET'])
def get_stock(market, symbol):
    try:
        logger.info(f'收到请求 - 市场: {market}, 股票代码: {symbol}')
        period = request.args.get('period', '1y')
        refresh = request.args.get('refresh', '').lower() == 'true'
        
        # 获取个股数据
        data = get_stock_data(market, symbol, period, refresh)
        analysis = analyze_stock_data(data)
        
        # 获取大盘数据
        market_data = get_market_index_data(market)
        
        # 添加智能分析
        smart_analysis = analyze_stock_risk(data, analysis)
        
        # 添加LLM分析
        llm_analysis = get_llm_analysis(data, analysis)
        logger.info(f'LLM分析结果: {llm_analysis}')
        smart_analysis['llm_analysis'] = llm_analysis or {
            "llm_analysis": "AI分析服务暂时不可用，请稍后重试。",
            "analysis_type": "AI智能分析",
            "model": "deepseek-chat"
        }
        
        # 添加大盘分析
        if market_data:
            market_analysis = analyze_stock_with_market(data, market_data)
            if market_analysis:
                smart_analysis['market_analysis'] = market_analysis
        
        analysis['smart_analysis'] = smart_analysis

        return jsonify({
            'status': 'success',
            'data': data,
            'analysis': analysis
        })
    except Exception as e:
        logger.error(f'处理请求时发生错误: {str(e)}', exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/stock/<market>/<symbol>/analysis', methods=['GET'])
def analyze_stock(market, symbol):
    try:
        logger.info(f'收到分析请求 - 市场: {market}, 股票代码: {symbol}')
        
        # 获取股票数据
        data = get_stock_data(market, symbol)
        
        # 创建分析器并执行分析
        analyzer = StockAnalyzer(data)
        analysis_result = analyzer.analyze()
        
        logger.info('分析完成')
        return jsonify({
            'status': 'success',
            'data': analysis_result
        })
    except Exception as e:
        logger.error(f'分析请求处理失败: {str(e)}', exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    logger.info('股票数据分析服务启动')
    app.run(debug=True) 