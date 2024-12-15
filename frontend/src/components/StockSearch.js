import React, { useState, useEffect } from 'react';
import { Select, Button, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const StockSearch = ({ onDataReceived }) => {
  const [market, setMarket] = useState('CN');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // 从localStorage加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = async (refresh = false, searchMarket = market, searchSymbol = symbol) => {
    if (!searchSymbol) {
      message.warning('请输入股票代码');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/stock/${searchMarket}/${searchSymbol}`,
        { params: { refresh } }
      );
      onDataReceived(response.data, { market: searchMarket, symbol: searchSymbol });
      
      // 更新搜索历史
      updateSearchHistory(searchMarket, searchSymbol);
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error(error.response?.data?.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const updateSearchHistory = (market, symbol) => {
    const newItem = {
      market,
      symbol,
      time: new Date().toISOString()
    };

    const filteredHistory = searchHistory.filter(
      item => !(item.market === market && item.symbol === symbol)
    );
    const newHistory = [newItem, ...filteredHistory].slice(0, 5);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    message.success('搜索历史已清空');
  };

  const dropdownRender = () => (
    <div className="search-history-dropdown">
      <div className="history-header">
        <HistoryOutlined /> 搜索历史
      </div>
      {searchHistory.length > 0 ? (
        <>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => {
                setSymbol(item.symbol);
                setMarket(item.market);
                handleSearch(false, item.market, item.symbol);
              }}
            >
              <span className="history-market">{item.market}</span>
              <span className="history-symbol">{item.symbol}</span>
              <span className="history-time">
                {new Date(item.time).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="history-footer">
            <Button 
              type="text" 
              icon={<DeleteOutlined />}
              size="small"
              onClick={handleClearHistory}
              block
            >
              清空历史记录
            </Button>
          </div>
        </>
      ) : (
        <div className="history-empty">暂无搜索历史</div>
      )}
    </div>
  );

  return (
    <div className="stock-search-container">
      <div className="search-bar">
        <Space.Compact style={{ width: '100%' }}>
          <Select
            value={market}
            onChange={setMarket}
            style={{ width: 100 }}
          >
            <Option value="CN">A股</Option>
            <Option value="US">美股</Option>
          </Select>
          <Select
            value={symbol}
            onChange={setSymbol}
            style={{ flex: 1 }}
            showSearch
            placeholder={market === 'CN' ? '输入股票代码（如：600000）' : '输入股票代码（如：AAPL）'}
            dropdownRender={dropdownRender}
            allowClear
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: '300px' }}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={() => handleSearch(false)}
            loading={loading}
          >
            搜索
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleSearch(true)}
            loading={loading}
          >
            刷新
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default StockSearch; 