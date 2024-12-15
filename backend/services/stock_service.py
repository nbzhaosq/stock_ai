import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from services.database import StockDatabase

logger = logging.getLogger(__name__)
db = StockDatabase()

def create_session():
    """创建带有代理和重试机制的会话"""
    session = requests.Session()
    
    # 设置代理
    proxies = {
        'http': 'http://127.0.0.1:1024',
        'https': 'http://127.0.0.1:1024'
    }
    session.proxies = proxies
    
    # 设置重试机制
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    logger.info('创建代理会话 - 代理地址: http://127.0.0.1:1024')
    return session

def format_stock_symbol(market, symbol):
    """格式化股票代码"""
    if market == 'CN':
        symbol = symbol.zfill(6)  # 补齐6位
        if symbol.startswith('6'):
            return f"{symbol}.SS"
        else:
            return f"{symbol}.SZ"
    elif market == 'US':
        return symbol
    return symbol

def fetch_stock_data_from_network(market, symbol, period='1y'):
    """从网络获取股票数据"""
    try:
        session = create_session()
        stock = yf.Ticker(symbol, session=session)
        df = stock.history(period=period)
        
        if df.empty:
            raise Exception('未获取到数据')
            
        data = []
        for index, row in df.iterrows():
            try:
                data_point = {
                    'date': index.strftime('%Y-%m-%d'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': float(row['Volume']),
                    'change': float((row['Close'] - row['Open']) / row['Open'] * 100)
                }
                data.append(data_point)
            except Exception as e:
                logger.warning(f'处理数据点时出错: {str(e)}，跳过此数据点')
                continue
        
        return data
    except Exception as e:
        logger.error(f"从网络获取数据失败: {str(e)}")
        return None

def get_stock_data(market, symbol, period='1y', refresh=False):
    """获取股票数据，优先从数据库获取"""
    try:
        # 格式化股票代码
        formatted_symbol = format_stock_symbol(market, symbol)
        logger.info(f'开始获取股票数据 - 市场: {market}, 原始代码: {symbol}, 格式化后: {formatted_symbol}')
        
        # 如果不是强制刷新，先尝试从数据库获取
        if not refresh:
            db_data = db.get_stock_data(market, formatted_symbol)
            if db_data and validate_stock_data(db_data):
                logger.info(f'从数据库获取到数据 - 数据点数: {len(db_data)}')
                return db_data
        
        # 从网络获取数据
        logger.info('从网络获取数据')
        data = fetch_stock_data_from_network(market, formatted_symbol, period)
        
        if not data:
            raise Exception('获取数据失败')
            
        # 保存到数据库
        logger.info('保存数据到数据库')
        db.save_stock_data(market, formatted_symbol, data)
        
        logger.info(f'数据获取成功 - 数据点数: {len(data)}')
        return data
    except Exception as e:
        error_msg = f"获取股票数据失败: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)

def validate_stock_data(data):
    """验证股票数据的完整性"""
    if not data or not isinstance(data, list):
        return False
        
    required_fields = ['date', 'open', 'high', 'low', 'close', 'volume', 'change']
    
    for item in data:
        if not all(field in item for field in required_fields):
            return False
        if not all(isinstance(item[field], (int, float)) for field in required_fields if field != 'date'):
            return False
            
    return True

def check_data_freshness(data, max_age_days=1):
    """检查数据是否需要更新"""
    if not data:
        return True
        
    latest_date = datetime.strptime(data[-1]['date'], '%Y-%m-%d')
    age = datetime.now() - latest_date
    
    return age.days >= max_age_days
  