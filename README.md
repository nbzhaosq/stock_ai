# 智能股票分析系统

这是一个使用 Python 后端和 React 前端构建的智能股票分析系统，由 Cursor AI 辅助开发。该系统提供股票数据可视化、技术分析、风险评估和 AI 智能分析等功能。

## 功能特点

- 🎯 实时股票数据查询和展示
- 📊 K线图和技术指标分析
- 🤖 AI 智能分析和建议
- 💹 风险评估和趋势预测
- 🏢 公司基本面数据展示
- 📱 响应式设计，支持移动端

## 环境要求

- Python 3.8+
- Node.js 16+
- pnpm 或 npm
- MySQL 数据库

## 快速开始

### 后端设置

1. 创建并激活虚拟环境：

``` bash
cd backend
python -m venv venv
Windows
venv\Scripts\activate
Linux/Mac
source venv/bin/activate
```

2. 安装依赖：

``` bash
pip install -r requirements.txt
```

3. 配置环境变量：

复制示例配置文件
``` bash
cp config.py.example config.py
```
编辑 config.py 文件，填入必要的配置信息：
- 数据库连接信息
- API 密钥
- 其他配置项

4. 启动后端服务：

``` bash
python app.py
```

### 前端设置

1. 安装依赖：

``` bash
cd frontend
pnpm install # 或 npm install
```

2. 启动开发服务器：

``` bash
pnpm dev # 或 npm run dev
```

## 项目结构

``` 
.
├── backend/ # 后端代码
│ ├── services/ # 业务逻辑服务
│ ├── app.py # 主应用入口
│ └── requirements.txt # Python 依赖
├── frontend/ # 前端代码
│ ├── src/ # 源代码
│ │ ├── components/ # React 组件
│ │ └── App.js # 主应用组件
│ └── package.json # 前端依赖配置
└── README.md # 项目文档
```



## 主要依赖

后端：
- Flask: Web 框架
- yfinance: 股票数据获取
- pandas: 数据处理
- langchain: AI 分析支持
- sqlite: 数据库连接

前端：
- React: UI 框架
- Ant Design: 组件库
- Chart.js: 图表绘制
- Axios: HTTP 客户端

## 开发说明

本项目由 Cursor AI 辅助开发，集成了多个先进的技术特性：

- 使用 Flask 构建轻量级后端 API
- 采用 React + Ant Design 构建现代化前端界面
- 集成 yfinance 提供实时股票数据
- 使用 langchain 实现智能分析功能
- 支持技术指标和 K 线图分析

## 注意事项

1. 确保已安装所有必要的依赖
2. 配置文件中的敏感信息请妥善保管
3. 开发环境和生产环境的配置可能需要分别设置
4. 注意 API 调用频率限制

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License

## 致谢

本项目由 Cursor AI 辅助开发，感谢以下开源项目的支持：

- React
- Ant Design
- Flask
- yfinance
- langchain

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

---
Powered by Cursor AI