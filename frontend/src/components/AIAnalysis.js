import React from 'react';
import { Card, Typography, Divider, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const { Text } = Typography;

const AIAnalysis = ({ llmAnalysis }) => {
  // 检查并打印接收到的数据结构
  console.log('AI Analysis Data:', llmAnalysis);

  if (!llmAnalysis || !llmAnalysis.llm_analysis) {
    return (
      <Card className="analysis-card" title="AI智能分析">
        <div className="analysis-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin>
            <div style={{ padding: '20px', color: '#666' }}>
              AI分析中...
            </div>
          </Spin>
        </div>
      </Card>
    );
  }

  // 格式化分析文本为Markdown格式
  const formatAnalysisToMarkdown = (text) => {
    const sections = text.split('\n').filter(line => line.trim());
    let markdown = '';

    sections.forEach(section => {
      if (/^\d+\./.test(section)) {
        // 标题行
        markdown += `\n### ${section}\n\n`;
      } else {
        // 内容行
        markdown += `${section}\n\n`;
      }
    });

    return markdown;
  };

  const markdownContent = formatAnalysisToMarkdown(llmAnalysis.llm_analysis);

  return (
    <Card className="analysis-card" title="AI智能分析">
      <div className="analysis-content">
        {/* 分析来源信息 */}
        {llmAnalysis.analysis_type && llmAnalysis.model && (
          <>
            <Text type="secondary">
              分析类型: {llmAnalysis.analysis_type} | 模型: {llmAnalysis.model}
            </Text>
            <Divider />
          </>
        )}

        {/* Markdown 内容 */}
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h3: ({ node, ...props }) => (
                <h3 style={{ 
                  color: '#1890ff',
                  marginTop: '16px',
                  marginBottom: '8px',
                  fontSize: '16px',
                  fontWeight: 500
                }} {...props} />
              ),
              p: ({ node, ...props }) => (
                <p style={{ 
                  marginBottom: '12px',
                  lineHeight: '1.6',
                  color: 'rgba(0, 0, 0, 0.85)'
                }} {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul style={{ 
                  paddingLeft: '20px',
                  marginBottom: '12px'
                }} {...props} />
              ),
              li: ({ node, ...props }) => (
                <li style={{ 
                  marginBottom: '4px',
                  color: 'rgba(0, 0, 0, 0.85)'
                }} {...props} />
              ),
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </Card>
  );
};

export default AIAnalysis; 