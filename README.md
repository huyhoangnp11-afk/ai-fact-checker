# Bybit Pump Hunter Bot 🚀

Thuật toán tự động săn coin tăng giá trên sàn Bybit sử dụng các chỉ báo kỹ thuật và phân tích volume.

## ✨ Tính năng chính

### 🎯 Phát hiện Pump Coin
- **Volume Spike Detection**: Phát hiện coin có volume tăng đột biến
- **Price Momentum Analysis**: Phân tích momentum giá với RSI, MACD, Stochastic
- **Technical Breakout**: Nhận diện breakout từ Bollinger Bands, Support/Resistance
- **Market Structure**: Phân tích cấu trúc thị trường với ADX, Pivot Points
- **Volatility Expansion**: Phát hiện mở rộng volatility với ATR
- **Order Flow Analysis**: Phân tích dòng tiền với OBV, MFI, A/D

### 🛡️ Quản lý rủi ro
- **Position Sizing**: Tính toán kích thước position dựa trên risk percentage
- **Stop Loss**: Tự động đặt stop loss
- **Take Profit**: Tự động chốt lời
- **Max Positions**: Giới hạn số lượng position đồng thời
- **Risk Management**: Quản lý rủi ro theo tỷ lệ phần trăm

### 📱 Thông báo
- **Telegram Integration**: Gửi thông báo real-time qua Telegram
- **Trade Alerts**: Thông báo khi mở/đóng position
- **P&L Tracking**: Theo dõi lãi/lỗ chi tiết

## 🚀 Cài đặt

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Cấu hình API
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật thông tin API trong `.env`:
```env
# Bybit API
BYBIT_API_KEY=your_bybit_api_key
BYBIT_API_SECRET=your_bybit_api_secret
BYBIT_TESTNET=True

# Telegram
TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Chạy bot
```bash
python bybit_pump_hunter.py
```

## ⚙️ Cấu hình

### Trading Parameters
- `RISK_PERCENTAGE`: Tỷ lệ rủi ro mỗi lệnh (mặc định: 2%)
- `MAX_POSITIONS`: Số lượng position tối đa (mặc định: 5)
- `PUMP_THRESHOLD`: Ngưỡng tăng giá để phát hiện pump (mặc định: 5%)
- `VOLUME_THRESHOLD`: Ngưỡng tăng volume (mặc định: 200%)

### Risk Management
- `STOP_LOSS_PERCENTAGE`: Tỷ lệ stop loss (mặc định: 3%)
- `TAKE_PROFIT_PERCENTAGE`: Tỷ lệ take profit (mặc định: 10%)
- `LEVERAGE`: Đòn bẩy (mặc định: 3x)

### Technical Indicators
- `RSI_PERIOD`: Chu kỳ RSI (mặc định: 14)
- `MACD_FAST/SLOW/SIGNAL`: Tham số MACD
- `BB_PERIOD`: Chu kỳ Bollinger Bands (mặc định: 20)

## 📊 Thuật toán phát hiện tín hiệu

### 1. Volume Spike Detection
```python
# Phát hiện volume tăng đột biến
volume_vs_sma5 = current_volume / volume_sma_5
volume_vs_sma20 = current_volume / volume_sma_20

if volume_vs_sma5 > 3.0:  # Volume gấp 3 lần trung bình 5 phiên
    signal_strength += 2
```

### 2. Price Momentum Analysis
```python
# Phân tích momentum với nhiều chỉ báo
rsi = talib.RSI(close_prices, 14)
macd, macd_signal, macd_hist = talib.MACD(close_prices)
stoch_k, stoch_d = talib.STOCH(high, low, close)

# Điều kiện momentum tích cực
if rsi > 50 and rsi < 80 and macd > macd_signal:
    momentum_score += 2
```

### 3. Technical Breakout
```python
# Phát hiện breakout từ Bollinger Bands
bb_upper, bb_middle, bb_lower = talib.BBANDS(close_prices)

if current_price > bb_upper:  # Breakout khỏi BB upper
    breakout_score += 2
```

### 4. Composite Scoring
```python
# Tính điểm tổng hợp có trọng số
composite_score = (
    volume_spike_score * 0.25 +
    price_momentum_score * 0.20 +
    technical_breakout_score * 0.20 +
    market_structure_score * 0.15 +
    volatility_expansion_score * 0.10 +
    order_flow_score * 0.10
)
```

## 🎯 Chiến lược trading

### Entry Conditions
1. **Pump Score ≥ 4/6**: Điểm tổng hợp đạt ngưỡng
2. **Volume Spike**: Volume tăng > 200% so với trung bình
3. **Price Momentum**: RSI > 50, MACD bullish
4. **Technical Breakout**: Giá breakout khỏi resistance
5. **Market Structure**: ADX > 25, trend bullish

### Exit Conditions
1. **Stop Loss**: Giá giảm 3% từ entry
2. **Take Profit**: Giá tăng 10% từ entry
3. **Time-based**: Giữ position tối đa 4 giờ
4. **Signal Reversal**: Tín hiệu chuyển sang bearish

## 📈 Ví dụ sử dụng

### Khởi tạo bot
```python
from bybit_pump_hunter import BybitPumpHunter, TradingConfig

config = TradingConfig(
    api_key="your_api_key",
    api_secret="your_api_secret",
    testnet=True,
    risk_percentage=2.0,
    max_positions=3,
    pump_threshold=5.0
)

bot = BybitPumpHunter(config)
bot.run_pump_hunter()
```

### Phân tích tín hiệu nâng cao
```python
from advanced_signals import AdvancedSignalDetector

detector = AdvancedSignalDetector()
analysis = detector.calculate_composite_score(df)

if analysis['composite_score'] >= 6.0:
    print(f"Tín hiệu mạnh: {analysis['recommendation']}")
```

## ⚠️ Cảnh báo rủi ro

1. **Trading có rủi ro cao**: Cryptocurrency trading có thể dẫn đến mất tiền
2. **Test trước khi live**: Luôn test trên testnet trước khi trade thật
3. **Quản lý rủi ro**: Không bao giờ đầu tư quá khả năng tài chính
4. **Theo dõi thường xuyên**: Bot cần được giám sát và điều chỉnh

## 🔧 Troubleshooting

### Lỗi kết nối API
```bash
# Kiểm tra API key và secret
# Đảm bảo IP được whitelist trên Bybit
# Kiểm tra permissions của API key
```

### Lỗi cài đặt TA-Lib
```bash
# Ubuntu/Debian
sudo apt-get install build-essential
pip install TA-Lib

# macOS
brew install ta-lib
pip install TA-Lib

# Windows
# Tải file wheel từ https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
```

## 📝 Logs

Bot sẽ tạo file log `bybit_pump_hunter.log` để theo dõi:
- Các giao dịch được thực hiện
- Lỗi và cảnh báo
- Thống kê performance

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

**⚠️ Disclaimer**: Bot này chỉ dành cho mục đích giáo dục và nghiên cứu. Trading cryptocurrency có rủi ro cao và có thể dẫn đến mất tiền. Người dùng tự chịu trách nhiệm về các quyết định trading của mình.