# 🤖 Bybit Trading Bot - Real-time Analysis

Web app giao dịch Bybit tự động với phân tích kỹ thuật theo thời gian thực và chiến lược giao dịch thông minh.

## ✨ Tính năng

### 🎯 Phân tích kỹ thuật Real-time
- **RSI (Relative Strength Index)** - Xác định vùng quá mua/quá bán
- **MACD (Moving Average Convergence Divergence)** - Phát hiện xu hướng và điểm đảo chiều
- **EMA (Exponential Moving Average)** - EMA 50, 200 cho xu hướng dài hạn
- **Bollinger Bands** - Đo độ biến động và xác định vùng giá

### 📊 3 Chiến lược giao dịch tự động
1. **EMA + RSI Strategy** - Kết hợp xu hướng và momentum
2. **MACD + Bollinger Bands** - Tín hiệu đảo chiều với độ biến động
3. **Multi-Timeframe Trend** - Xác nhận xu hướng đa khung thời gian

### 🚀 Công nghệ
- **Backend**: Node.js + Express + WebSocket
- **Frontend**: HTML5 + Chart.js + Vanilla JavaScript
- **API**: Bybit Public API (v5)
- **Real-time**: WebSocket cho dữ liệu tick-by-tick
- **CORS Solution**: Proxy server để bypass CORS restrictions

## 🛠️ Cài đặt

### Yêu cầu
- Node.js >= 14.0.0
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd ai-fact-checker
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình (Optional)
```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần
```

### Bước 4: Chạy server
```bash
npm start
```

Hoặc sử dụng nodemon cho development:
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 📱 Sử dụng

### Cách 1: Sử dụng app.html (Recommended)

1. Mở trình duyệt và truy cập: `http://localhost:3000/app.html`

2. Chọn cấu hình:
   - **Trading Pair**: BTC/USDT, ETH/USDT, SOL/USDT, etc.
   - **Timeframe**: 1m, 5m, 15m, 1h, 4h, 1D

3. Nhấn **Start** để bắt đầu phân tích

4. Xem kết quả:
   - 📈 **Chart**: Biểu đồ giá real-time với EMA
   - 📊 **Indicators**: RSI, MACD, Bollinger Bands
   - 🎯 **Strategy Signals**: Tín hiệu từ 3 chiến lược
   - 📝 **Logs**: Nhật ký hoạt động

### Cách 2: Sử dụng index.html (Legacy)

1. Mở trình duyệt và truy cập: `http://localhost:3000/index.html`
2. Sử dụng theo hướng dẫn trong file STRATEGY_GUIDE.md

## 🔌 API Endpoints

### Market Data

#### Get Klines (Candlesticks)
```bash
GET /api/bybit/klines?symbol=BTCUSDT&interval=15&limit=200
```

#### Get Ticker
```bash
GET /api/bybit/ticker?symbol=BTCUSDT
```

#### Get Orderbook
```bash
GET /api/bybit/orderbook?symbol=BTCUSDT&limit=25
```

#### Get Recent Trades
```bash
GET /api/bybit/trades?symbol=BTCUSDT&limit=50
```

### Technical Analysis

#### Calculate Indicators
```bash
POST /api/indicators/calculate
Content-Type: application/json

{
  "prices": [50000, 50100, 50200, ...],
  "indicators": ["RSI", "MACD", "EMA", "BB"]
}
```

### Strategy Analysis

#### Analyze Trading Strategy
```bash
POST /api/strategy/analyze
Content-Type: application/json

{
  "symbol": "BTCUSDT",
  "timeframe": "15",
  "strategies": ["ALL"]  // hoặc ["EMA_RSI", "MACD_BB", "MULTI_TF"]
}
```

Response:
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "15",
  "timestamp": 1234567890,
  "currentPrice": 50000,
  "signals": [
    {
      "strategy": "EMA_RSI",
      "signal": "LONG",
      "confidence": 85.5,
      "indicators": {
        "price": 50000,
        "ema50": 49800,
        "ema200": 49500,
        "rsi": 55.2
      }
    }
  ],
  "bestSignal": {
    "strategy": "EMA_RSI",
    "signal": "LONG",
    "confidence": 85.5
  },
  "marketIndicators": {
    "rsi": {
      "current": 55.2,
      "signal": "NEUTRAL"
    },
    "macd": {
      "macd": 123.45,
      "signal": 98.76,
      "histogram": 24.69,
      "trend": "BULLISH"
    }
  }
}
```

## 🔧 Cấu hình nâng cao

### Environment Variables (.env)
```bash
# Server
PORT=3000
NODE_ENV=development

# Bybit API (Optional - for authenticated endpoints)
BYBIT_API_KEY=your_api_key_here
BYBIT_API_SECRET=your_api_secret_here

# Use testnet
USE_TESTNET=false

# Trading Settings
DEFAULT_SYMBOL=BTCUSDT
DEFAULT_TIMEFRAME=15
RISK_PER_TRADE=0.02
```

## 🌐 Giải pháp CORS

App sử dụng backend proxy server để giải quyết vấn đề CORS khi gọi Bybit API:

1. **Proxy Endpoint**: `/api/proxy` - Forward requests to any URL
2. **Direct Endpoints**: `/api/bybit/*` - Pre-configured Bybit endpoints
3. **WebSocket Proxy**: Server tự động forward WebSocket messages từ Bybit

## 📊 Chiến lược giao dịch

### Strategy #1: EMA + RSI
- **Điều kiện LONG**:
  - Price > EMA50 > EMA200
  - RSI > 40 và < 70
  - Confidence: cao hơn khi RSI gần 50

- **Điều kiện SHORT**:
  - Price < EMA50 < EMA200
  - RSI < 60 và > 30
  - Confidence: cao hơn khi RSI gần 50

### Strategy #2: MACD + Bollinger Bands
- **Điều kiện LONG**:
  - MACD bullish crossover + BB position < 30%
  - Hoặc MACD bullish trend + BB position < 40%

- **Điều kiện SHORT**:
  - MACD bearish crossover + BB position > 70%
  - Hoặc MACD bearish trend + BB position > 60%

### Strategy #3: Multi-Timeframe Trend
- **Điều kiện LONG**:
  - Price > EMA50
  - MACD trend = BULLISH
  - RSI > 50 và < 70

- **Điều kiện SHORT**:
  - Price < EMA50
  - MACD trend = BEARISH
  - RSI < 50 và > 30

## ⚠️ Risk Management

- **Position Sizing**: Tính toán dựa trên % risk per trade
- **Stop Loss**: Đặt theo cấu trúc thị trường
- **Take Profit**: Minimum RR 1:3 (theo STRATEGY_GUIDE.md)
- **Max Risk**: Không quá 2-5% tài khoản mỗi lệnh (khuyến nghị)

## 🧪 Testing

### Test API endpoints
```bash
# Health check
curl http://localhost:3000/health

# Get klines
curl "http://localhost:3000/api/bybit/klines?symbol=BTCUSDT&interval=15&limit=10"

# Analyze strategy
curl -X POST http://localhost:3000/api/strategy/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","timeframe":"15"}'
```

## 📁 Cấu trúc dự án

```
ai-fact-checker/
├── server.js                 # Backend server + API
├── app.html                  # Frontend web app (mới)
├── index.html                # Legacy frontend
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── README.md                 # Hướng dẫn này
├── STRATEGY_GUIDE.md         # Chi tiết về các chiến lược
├── TradingView_FVG_Strategy.pine  # Pine Script cho TradingView
└── CNAME                     # GitHub Pages config
```

## 🚀 Deployment

### Deploy lên Heroku
```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy lên Railway
1. Connect GitHub repository
2. Railway tự động detect và deploy
3. Set environment variables trong dashboard

### Deploy lên Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔐 Security

### Lưu ý quan trọng:
1. **KHÔNG commit API keys** vào Git
2. Sử dụng file `.env` và thêm vào `.gitignore`
3. Với production, enable rate limiting
4. Sử dụng HTTPS cho production
5. Validate tất cả user input

### Example .gitignore:
```
node_modules/
.env
.env.local
*.log
```

## 🐛 Troubleshooting

### Lỗi CORS
- Đảm bảo server đang chạy tại `localhost:3000`
- Kiểm tra `API_URL` trong `app.html`

### Không kết nối được Bybit API
- Kiểm tra internet connection
- Verify Bybit API status: https://bybit-exchange.github.io/docs/

### WebSocket không hoạt động
- Kiểm tra firewall settings
- Verify WebSocket URL đúng

## 📚 Tài liệu tham khảo

- [Bybit API Documentation](https://bybit-exchange.github.io/docs/v5/intro)
- [TradingView Pine Script](https://www.tradingview.com/pine-script-docs/en/v5/Introduction.html)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

## ⚖️ Disclaimer

**⚠️ CẢNH BÁO:**
- Đây KHÔNG phải là lời khuyên tài chính
- Trading cryptocurrencies có rủi ro CAO
- Chỉ trade với số tiền bạn có thể mất
- Luôn backtest và paper trade trước khi live
- Bot chỉ cung cấp tín hiệu, quyết định cuối cùng thuộc về bạn

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa

## 🤝 Contributing

Contributions, issues và feature requests được chào đón!

## 👨‍💻 Author

Created with ❤️ for crypto traders

---

**Happy Trading! 🚀📈**
