import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def analyze_stock_data(data):
    """
    对股票数据进行基本分析
    """
    try:
        df = pd.DataFrame(data)
        logger.info(f'开始分析数据，数据点数: {len(df)}')
        
        analysis = {
            'moving_average': {
                'MA5': calculate_ma(df, 5),
                'MA20': calculate_ma(df, 20),
                'MA60': calculate_ma(df, 60)
            },
            'volatility': calculate_volatility(df),
            'rsi': calculate_rsi(df)
        }
        
        # 处理 NaN 值
        for key in analysis['moving_average']:
            analysis['moving_average'][key] = [
                round(float(x), 2) if pd.notnull(x) else None 
                for x in analysis['moving_average'][key]
            ]
        
        analysis['rsi'] = [
            round(float(x), 2) if pd.notnull(x) else None 
            for x in analysis['rsi']
        ]
        
        analysis['volatility'] = (
            round(float(analysis['volatility']), 4) 
            if pd.notnull(analysis['volatility']) 
            else 0
        )
        
        logger.info('数据分析完成')
        return analysis
        
    except Exception as e:
        logger.error(f'数据分析失败: {str(e)}', exc_info=True)
        raise

def calculate_ma(df, window):
    """计算移动平均"""
    try:
        ma = df['close'].rolling(window=window, min_periods=1).mean()
        logger.info(f'计算 MA{window} 完成')
        return ma.tolist()
    except Exception as e:
        logger.error(f'计算 MA{window} 失败: {str(e)}')
        return [None] * len(df)

def calculate_volatility(df):
    """计算波动率"""
    try:
        volatility = df['close'].pct_change().std() * np.sqrt(252)
        logger.info('计算波动率完成')
        return float(volatility) if pd.notnull(volatility) else 0
    except Exception as e:
        logger.error(f'计算波动率失败: {str(e)}')
        return 0

def calculate_rsi(df, periods=14):
    """计算RSI指标"""
    try:
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=periods, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=periods, min_periods=1).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        logger.info('计算 RSI 完成')
        return rsi.tolist()
    except Exception as e:
        logger.error(f'计算 RSI 失败: {str(e)}')
        return [None] * len(df) 