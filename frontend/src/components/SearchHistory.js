import React from 'react';

const SearchHistory = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="search-history">
      <div className="history-header">
        <h3>搜索历史</h3>
        <button onClick={onClear} className="clear-history">清除历史</button>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="history-item"
            onClick={() => onSelect(item)}
          >
            <span className="market-tag">{item.market}</span>
            <span className="symbol">{item.symbol}</span>
            <span className="time">{new Date(item.time).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory; 