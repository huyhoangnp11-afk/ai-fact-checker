# 🚀 Quick Start Guide - Bybit Momentum Hunter

## ⚡ Bắt Đầu Nhanh

### 1. Cài Đặt
```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy setup script
python setup.py
```

### 2. Chạy Demo
```bash
# Xem demo cách hoạt động
python demo.py
```

### 3. Sử Dụng Momentum Hunter
```bash
# Quét thị trường (chỉ phân tích, không giao dịch)
python bybit_momentum_hunter.py
```

### 4. Sử Dụng Trading Bot (Cần API Keys)
```bash
# Giao dịch tự động (CẦN API KEYS)
python bybit_trading_bot.py
```

## 🎯 Tính Năng Chính

### Bybit Momentum Hunter
- ✅ Quét thị trường tự động
- ✅ Chỉ báo RSI, MACD, Volume
- ✅ Hệ thống điểm số 0-100
- ✅ Khuyến nghị MUA/BÁN
- ✅ Quét liên tục 24/7
- ✅ Lưu tín hiệu vào file

### Trading Bot
- ✅ Giao dịch tự động
- ✅ Quản lý rủi ro (SL/TP)
- ✅ Position sizing thông minh
- ✅ Thống kê giao dịch
- ✅ Bảo vệ vốn

## 📊 Cách Hoạt Động

### 1. Quét Thị Trường
- Lấy danh sách coin từ Bybit
- Lọc coin có volume > $1M
- Tính toán chỉ báo kỹ thuật

### 2. Tính Điểm Momentum
- **RSI**: Oversold (+20), Bullish (+15)
- **MACD**: Bullish crossover (+20), Histogram (+10)
- **Volume**: High volume (+25), Above avg (+15)
- **Price**: Strong gain (+25), Moderate gain (+15)

### 3. Khuyến Nghị
- **90-100 điểm**: MẠNH_MUA
- **70-89 điểm**: MUA
- **50-69 điểm**: THEO_DÕI
- **30-49 điểm**: THẬN_TRỌNG
- **0-29 điểm**: TRÁNH

## ⚙️ Cấu Hình

### File: my_config.json
```json
{
  "trading_parameters": {
    "rsi_period": 14,
    "volume_threshold": 1.5,
    "price_change_threshold": 5.0,
    "refresh_interval": 300
  },
  "risk_management": {
    "max_position_size": 0.1,
    "stop_loss_percentage": 0.05,
    "take_profit_percentage": 0.15,
    "max_daily_trades": 10
  }
}
```

## 🛡️ Quản Lý Rủi Ro

### Risk Management
- **Position Size**: Tối đa 10% số dư
- **Stop Loss**: 5% dưới entry
- **Take Profit**: 15% trên entry
- **Max Positions**: 5 vị thế cùng lúc
- **Daily Trades**: 10 giao dịch/ngày

### Lưu Ý An Toàn
1. **Test trước**: Dùng testnet trước
2. **Số tiền nhỏ**: Bắt đầu với ít tiền
3. **Theo dõi**: Không để bot tự chạy
4. **Backup**: Lưu config và logs

## 📈 Ví Dụ Kết Quả

```
🚀 BYBIT MOMENTUM HUNTER - TÍN HIỆU COIN TĂNG
================================================================================
Thời gian: 2024-01-15 14:30:25
Số lượng tín hiệu: 8
--------------------------------------------------------------------------------

1. BTCUSDT
   💰 Giá hiện tại: $42,350.0000
   📊 Điểm số: 85.0/100
   🎯 Khuyến nghị: MUA
   📈 RSI: 45.23
   📊 MACD: 0.000125
   📊 Volume Ratio: 2.15x
   📈 Thay đổi 24h: +6.78%

2. ETHUSDT
   💰 Giá hiện tại: $2,650.0000
   📊 Điểm số: 78.5/100
   🎯 Khuyến nghị: MUA
   📈 RSI: 52.18
   📊 MACD: 0.000089
   📊 Volume Ratio: 1.85x
   📈 Thay đổi 24h: +4.23%
```

## 🔧 Troubleshooting

### Lỗi Thường Gặp

**1. "No module named 'talib'"**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential
pip install TA-Lib

# Windows - tải wheel file
pip install TA_Lib-0.4.24-cp38-cp38-win_amd64.whl
```

**2. "API connection failed"**
- Kiểm tra kết nối Internet
- Kiểm tra API keys
- Kiểm tra rate limit

**3. "Insufficient balance"**
- Kiểm tra số dư tài khoản
- Giảm `max_position_size` trong config

## 📞 Hỗ Trợ

### Liên Hệ
- **GitHub Issues**: Tạo issue trên repository
- **Email**: support@example.com

### Tài Liệu
- **README.md**: Hướng dẫn chi tiết
- **demo.py**: Script demo
- **config.json**: File cấu hình mẫu

## ⚖️ Disclaimer

**⚠️ CẢNH BÁO QUAN TRỌNG**:

- Đây là công cụ phân tích, KHÔNG PHẢI lời khuyên đầu tư
- Giao dịch crypto có rủi ro cao, có thể mất toàn bộ tiền
- Luôn thực hiện nghiên cứu riêng
- Chỉ đầu tư số tiền có thể chấp nhận mất

---

**Chúc bạn giao dịch thành công! 🚀📈**