import React from 'react';
import { Space, Tag, Button } from 'antd';
import { ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const SearchHistoryBar = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="search-history-bar">
      <div className="history-content">
        <ClockCircleOutlined className="history-icon" />
        <Space size={[8, 8]} wrap>
          {history.map((item, index) => (
            <Tag
              key={index}
              color="blue"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(item)}
            >
              {item.market}:{item.symbol}
            </Tag>
          ))}
        </Space>
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={onClear}
          size="small"
        >
          清空历史
        </Button>
      </div>
    </div>
  );
};

export default SearchHistoryBar; 