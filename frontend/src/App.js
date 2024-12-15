import React, { useState, useEffect } from 'react';
import { Layout, theme, message, Row, Col, Card, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import axios from 'axios';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import TradingTools from './components/TradingTools';
import StockAnalysis from './components/StockAnalysis';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [stockData, setStockData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeIndicators, setActiveIndicators] = useState([]);
  const { token } = theme.useToken();

  // 从localStorage加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleAnalysis = async (market, symbol) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stock/${market}/${symbol}/analysis`
      );
      setAnalysisData(response.data.data);
    } catch (error) {
      message.error('获取分析数据失败');
    }
  };

  const updateSearchHistory = (market, symbol) => {
    const newItem = {
      market,
      symbol,
      time: new Date().toISOString()
    };

    // 移除重复项并限制历史记录数量为5条
    const filteredHistory = searchHistory.filter(
      item => !(item.market === market && item.symbol === symbol)
    );
    const newHistory = [newItem, ...filteredHistory].slice(0, 5);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleDataReceived = async (data, searchInfo) => {
    if (data && data.data && data.analysis) {
      setStockData(data);
      updateSearchHistory(searchInfo.market, searchInfo.symbol);
      await handleAnalysis(searchInfo.market, searchInfo.symbol);
    }
  };

  const handleHistorySelect = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stock/${item.market}/${item.symbol}`
      );
      handleDataReceived(response.data, item);
    } catch (error) {
      message.error('获取历史数据失败');
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    message.success('搜索历史已清空');
  };

  const handleIndicatorSelect = (indicator) => {
    // 检查是否已存在相同类型的指标
    const existingIndex = activeIndicators.findIndex(i => i.type === indicator.type);
    
    if (existingIndex >= 0) {
      // 如果已存在，更新参数
      const newIndicators = [...activeIndicators];
      newIndicators[existingIndex] = indicator;
      setActiveIndicators(newIndicators);
      message.info(`已更新 ${indicator.name} 指标`);
    } else {
      // 如果不存在，添加新指标
      setActiveIndicators([...activeIndicators, indicator]);
      message.success(`已添加 ${indicator.name} 指标`);
    }
  };

  const handleIndicatorRemove = (type) => {
    setActiveIndicators(activeIndicators.filter(i => i.type !== type));
    message.success('已移除指标');
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header" style={{ background: token.colorBgContainer }}>
        <div className="header-content">
          <div className="logo">
            <Button 
              type="text" 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerVisible(true)}
              style={{ marginRight: 8 }}
            />
            股票分析
          </div>
          <div className="search-area">
            <StockSearch onDataReceived={handleDataReceived} />
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card className="chart-card">
              {stockData ? (
                stockData.data && stockData.analysis ? (
                  <StockChart 
                    data={stockData.data} 
                    analysis={stockData.analysis}
                    indicators={activeIndicators}
                    onIndicatorRemove={handleIndicatorRemove}
                  />
                ) : (
                  <div className="error-message">
                    数据格式错误
                  </div>
                )
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                      <path d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
                      <path d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <div className="empty-text">
                    <h3>暂无数据</h3>
                    <p>请在上方搜索框输入股票代码进行查询</p>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <Drawer
        title="工具箱"
        placement="left"
        width={240}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
        maskClosable={true}
      >
        <TradingTools onIndicatorSelect={handleIndicatorSelect} />
      </Drawer>
    </Layout>
  );
}

export default App; 