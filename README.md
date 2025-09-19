# 🚀 Bybit Momentum Hunter - Thuật Toán Săn Coin Tăng

Hệ thống giao dịch tự động sử dụng các chỉ báo kỹ thuật để tìm và giao dịch các coin có momentum tăng trên sàn Bybit.

## 📋 Tính Năng Chính

### 🔍 Bybit Momentum Hunter
- **Quét thị trường tự động**: Tìm kiếm các coin có tiềm năng tăng giá
- **Chỉ báo kỹ thuật**: RSI, MACD, Volume Analysis, Price Momentum
- **Hệ thống điểm số**: Đánh giá tín hiệu từ 0-100 điểm
- **Quét liên tục**: Theo dõi thị trường 24/7
- **Watchlist**: Lưu trữ các coin tiềm năng

### 🤖 Trading Bot
- **Giao dịch tự động**: Tự động đặt lệnh dựa trên tín hiệu
- **Quản lý rủi ro**: Stop Loss, Take Profit, Position Sizing
- **Thống kê chi tiết**: Theo dõi hiệu suất giao dịch
- **Bảo vệ vốn**: Giới hạn số giao dịch và vị thế

## 🛠️ Cài Đặt

### Yêu Cầu Hệ Thống
- Python 3.8+
- Kết nối Internet ổn định
- Tài khoản Bybit (để sử dụng Trading Bot)

### Cài Đặt Dependencies

```bash
# Clone repository
git clone <repository-url>
cd bybit-momentum-hunter

# Cài đặt dependencies
pip install -r requirements.txt

# Cài đặt TA-Lib (có thể cần cài đặt thêm)
# Ubuntu/Debian:
sudo apt-get install build-essential
pip install TA-Lib

# Windows:
# Tải file wheel từ https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
pip install TA_Lib-0.4.24-cp38-cp38-win_amd64.whl
```

### Cấu Hình

1. **Sao chép file config mẫu**:
```bash
cp config.json my_config.json
```

2. **Chỉnh sửa file config**:
```json
{
  "bybit_api": {
    "api_key": "YOUR_API_KEY",
    "secret_key": "YOUR_SECRET_KEY",
    "base_url": "https://api.bybit.com",
    "testnet": false
  },
  "trading_parameters": {
    "rsi_period": 14,
    "rsi_oversold": 30,
    "rsi_overbought": 70,
    "volume_threshold": 1.5,
    "price_change_threshold": 5.0,
    "min_volume_24h": 1000000,
    "max_coins_analyze": 100,
    "refresh_interval": 300
  },
  "risk_management": {
    "max_position_size": 0.1,
    "stop_loss_percentage": 0.05,
    "take_profit_percentage": 0.15,
    "max_daily_trades": 10,
    "max_concurrent_positions": 5
  }
}
```

## 🚀 Sử Dụng

### 1. Chạy Momentum Hunter (Chỉ Phân Tích)

```bash
python bybit_momentum_hunter.py
```

**Menu lựa chọn**:
- `1`: Quét một lần
- `2`: Quét liên tục (24h)
- `3`: Xem watchlist
- `4`: Thoát

### 2. Chạy Trading Bot (Giao Dịch Tự Động)

```bash
python bybit_trading_bot.py
```

**⚠️ Lưu ý quan trọng**:
- Bot sẽ tự động giao dịch với tiền thật
- Đảm bảo đã test kỹ trên testnet trước
- Bắt đầu với số tiền nhỏ để test
- Luôn theo dõi bot khi chạy

### 3. Chạy Script Setup

```bash
python setup.py
```

Script này sẽ:
- Kiểm tra dependencies
- Tạo file config mẫu
- Hướng dẫn cài đặt API keys

## 📊 Chỉ Báo Kỹ Thuật

### RSI (Relative Strength Index)
- **Mục đích**: Xác định overbought/oversold
- **Tham số**: 14 periods
- **Tín hiệu**: RSI < 30 (oversold), RSI > 70 (overbought)

### MACD (Moving Average Convergence Divergence)
- **Mục đích**: Xác định momentum và trend
- **Tham số**: Fast=12, Slow=26, Signal=9
- **Tín hiệu**: MACD > Signal (bullish), MACD < Signal (bearish)

### Volume Analysis
- **Mục đích**: Xác nhận sức mạnh của tín hiệu
- **Tín hiệu**: Volume > 1.5x average volume

### Price Momentum
- **Mục đích**: Đo lường tốc độ thay đổi giá
- **Tín hiệu**: Thay đổi giá 24h > 5%

## 🎯 Hệ Thống Điểm Số

### Cách Tính Điểm
- **RSI Oversold**: +20 điểm
- **RSI Bullish (50-70)**: +15 điểm
- **MACD Bullish Crossover**: +20 điểm
- **MACD Histogram Positive**: +10 điểm
- **High Volume (>1.5x)**: +25 điểm
- **Above Average Volume (>1.2x)**: +15 điểm
- **Strong Price Gain (>5%)**: +25 điểm
- **Moderate Price Gain (>2%)**: +15 điểm

### Mức Khuyến Nghị
- **90-100 điểm**: MẠNH_MUA
- **70-89 điểm**: MUA
- **50-69 điểm**: THEO_DÕI
- **30-49 điểm**: THẬN_TRỌNG
- **0-29 điểm**: TRÁNH

## ⚠️ Quản Lý Rủi Ro

### Risk Management
- **Position Sizing**: Tối đa 10% số dư mỗi lệnh
- **Stop Loss**: 5% dưới giá entry
- **Take Profit**: 15% trên giá entry
- **Max Positions**: Tối đa 5 vị thế cùng lúc
- **Daily Trades**: Tối đa 10 giao dịch/ngày

### Lưu Ý An Toàn
1. **Test trước**: Luôn test trên testnet trước
2. **Số tiền nhỏ**: Bắt đầu với số tiền nhỏ
3. **Theo dõi**: Không để bot chạy không giám sát
4. **Backup**: Lưu backup config và logs
5. **API Keys**: Bảo mật API keys cẩn thận

## 📈 Hiệu Suất

### Thống Kê Giao Dịch
- Tổng số giao dịch
- Tỷ lệ thắng/thua
- Tổng PnL
- PnL theo ngày
- Vị thế đang mở

### Logging
- Log chi tiết mọi hoạt động
- Lưu tín hiệu vào file JSON
- Backup logs tự động

## 🔧 Tùy Chỉnh

### Thay Đổi Tham Số
Chỉnh sửa file `config.json`:

```json
{
  "trading_parameters": {
    "rsi_period": 14,           // Chu kỳ RSI
    "volume_threshold": 1.5,    // Ngưỡng volume
    "price_change_threshold": 5.0, // Ngưỡng thay đổi giá
    "refresh_interval": 300     // Thời gian refresh (giây)
  }
}
```

### Thêm Chỉ Báo Mới
1. Thêm function tính toán trong `calculate_technical_indicators()`
2. Cập nhật logic trong `calculate_momentum_score()`
3. Thêm vào config nếu cần

## 🆘 Troubleshooting

### Lỗi Thường Gặp

**1. Lỗi "No module named 'talib'"**
```bash
pip install TA-Lib
# Hoặc cài đặt từ wheel file cho Windows
```

**2. Lỗi API connection**
- Kiểm tra API keys
- Kiểm tra kết nối Internet
- Kiểm tra rate limit

**3. Lỗi "Insufficient balance"**
- Kiểm tra số dư tài khoản
- Giảm `max_position_size` trong config

**4. Bot không giao dịch**
- Kiểm tra `max_daily_trades` và `max_concurrent_positions`
- Kiểm tra điều kiện trong `_should_trade()`

### Log Files
- `bybit_momentum_hunter.log`: Log chính
- `momentum_signals_*.json`: Tín hiệu đã lưu
- Check logs để debug

## 📞 Hỗ Trợ

### Liên Hệ
- **Email**: support@example.com
- **Telegram**: @your_telegram
- **GitHub Issues**: Tạo issue trên repository

### Đóng Góp
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## ⚖️ Disclaimer

**⚠️ CẢNH BÁO QUAN TRỌNG**:

- Đây là công cụ phân tích và giao dịch tự động
- **KHÔNG PHẢI** lời khuyên đầu tư
- Giao dịch cryptocurrency có rủi ro cao
- Có thể mất toàn bộ số tiền đầu tư
- Luôn thực hiện nghiên cứu riêng
- Chỉ đầu tư số tiền có thể chấp nhận mất

**Tác giả không chịu trách nhiệm về bất kỳ tổn thất tài chính nào.**

## 📄 License

MIT License - Xem file `LICENSE` để biết thêm chi tiết.

---

**Happy Trading! 🚀📈**