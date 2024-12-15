import sqlite3
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class StockDatabase:
    def __init__(self, db_path='stock_data.db'):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """初始化数据库表"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # 创建股票数据表
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS stock_data (
                        symbol TEXT,
                        market TEXT,
                        data JSON,
                        last_update TIMESTAMP,
                        PRIMARY KEY (symbol, market)
                    )
                ''')
                conn.commit()
                logger.info('数据库初始化成功')
        except Exception as e:
            logger.error(f'数据库初始化失败: {str(e)}', exc_info=True)
            raise

    def get_stock_data(self, market, symbol):
        """获取股票数据"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    'SELECT data, last_update FROM stock_data WHERE symbol = ? AND market = ?',
                    (symbol, market)
                )
                result = cursor.fetchone()
                if result:
                    data, last_update = result
                    last_update = datetime.fromisoformat(last_update)
                    logger.info(f'从数据库获取数据成功 - {market}:{symbol}, 最后更新: {last_update}')
                    return json.loads(data), last_update
                return None, None
        except Exception as e:
            logger.error(f'从数据库获取数据失败: {str(e)}', exc_info=True)
            return None, None

    def save_stock_data(self, market, symbol, data):
        """保存股票数据"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                now = datetime.now().isoformat()
                cursor.execute('''
                    INSERT OR REPLACE INTO stock_data (symbol, market, data, last_update)
                    VALUES (?, ?, ?, ?)
                ''', (symbol, market, json.dumps(data), now))
                conn.commit()
                logger.info(f'数据保存到数据���成功 - {market}:{symbol}')
        except Exception as e:
            logger.error(f'保存数据到数据库失败: {str(e)}', exc_info=True)
            raise 