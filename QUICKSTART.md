# ⚡ Quick Start - Bybit Trading Bot

## 🚀 Khởi động trong 3 phút

### Bước 1: Cài đặt (1 phút)
```bash
# Clone project (nếu chưa có)
git clone <repository-url>
cd ai-fact-checker

# Cài đặt dependencies
npm install
```

### Bước 2: Khởi động server (30 giây)
```bash
npm start
```

Đợi cho đến khi thấy:
```
🚀 Bybit Trading Bot - Server Started 🚀
Port: 3000
Status: ✅ Running
```

### Bước 3: Mở trình duyệt (30 giây)
Truy cập: **http://localhost:3000/app.html**

### Bước 4: Bắt đầu trading! (1 phút)
1. ✅ Chọn **Trading Pair** (BTC/USDT, ETH/USDT, etc.)
2. ✅ Chọn **Timeframe** (15m, 1h, 4h)
3. ✅ Nhấn nút **Start** ▶
4. ✅ Xem tín hiệu và phân tích real-time!

---

## 📊 Giao diện chính

```
┌─────────────────────────────────────────┐
│  🤖 Bybit Trading Bot                   │
│  [BTC/USDT] [15m] [▶ Start] [⏸ Stop]   │
└─────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────┐
│ Giá       │ RSI       │ MACD      │ BB        │
│ $50,000   │ 55.2      │ Bullish   │ Neutral   │
└───────────┴───────────┴───────────┴───────────┘

┌─────────────────────────────────────────┐
│  📈 Price Chart (Real-time)             │
│  [Biểu đồ giá với EMA 50, EMA 200]     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📊 Tín hiệu chiến lược                 │
│  ┌─────────────────────────────────┐   │
│  │ 📈 EMA + RSI Strategy           │   │
│  │ Signal: LONG (85% confidence)   │   │
│  │ Entry: $50,000 | TP: $51,500    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🎯 Đọc tín hiệu

### Tín hiệu LONG (Mua) 🟢
- **Confidence > 80%**: Tín hiệu mạnh, cân nhắc vào lệnh
- **Confidence 60-80%**: Tín hiệu trung bình, chờ xác nhận thêm
- **Confidence < 60%**: Tín hiệu yếu, bỏ qua

### Tín hiệu SHORT (Bán) 🔴
- Tương tự như LONG nhưng hướng ngược lại

### Tín hiệu NEUTRAL (Chờ) ⚪
- Chưa có setup rõ ràng, không vào lệnh

---

## 📈 3 Chiến lược

### 1️⃣ EMA + RSI
- **Tốt cho**: Xu hướng rõ ràng
- **Thời điểm**: Khi thị trường trending

### 2️⃣ MACD + Bollinger Bands
- **Tốt cho**: Điểm đảo chiều
- **Thời điểm**: Khi volume spike và có divergence

### 3️⃣ Multi-Timeframe Trend
- **Tốt cho**: Xác nhận xu hướng
- **Thời điểm**: Khi nhiều timeframe đồng thuận

---

## ⚙️ Cài đặt khuyến nghị

### Khung thời gian theo style trading:

| Style Trading | Timeframe | Số lệnh/ngày | Hold time |
|--------------|-----------|--------------|-----------|
| Scalping     | 1m, 5m    | 10-20        | 1-10 min  |
| Day Trading  | 15m, 1h   | 3-8          | 1-4 hours |
| Swing        | 4h, 1D    | 1-3          | 1-7 days  |

### Khuyến nghị cho người mới:
- **Timeframe**: 1h hoặc 4h
- **Risk per trade**: 1-2% (không phải 20% như aggressive strategies)
- **Take Profit**: Minimum RR 1:2 hoặc 1:3
- **Stop Loss**: Luôn đặt SL

---

## 🔥 Tips nhanh

### ✅ NÊN:
- Backtest trước khi live trade
- Đặt Stop Loss cho mọi lệnh
- Trade theo plan, không theo cảm xúc
- Journal mọi giao dịch
- Kiểm tra tin tức trước khi vào lệnh

### ❌ KHÔNG NÊN:
- Revenge trading sau khi thua
- Over-leverage
- FOMO vào lệnh
- Bỏ qua Stop Loss
- Trade khi mệt mỏi hoặc stress

---

## 🆘 Troubleshooting nhanh

### Lỗi: "Cannot connect to server"
```bash
# Kiểm tra server có chạy không
curl http://localhost:3000/health

# Nếu không, restart server
npm start
```

### Lỗi: "CORS policy"
- Đảm bảo truy cập qua `localhost:3000`, không phải `file://`
- Server phải đang chạy

### Không có tín hiệu
- Đợi thêm vài phút để bot phân tích
- Thử đổi timeframe khác
- Kiểm tra logs ở cuối trang

---

## 📚 Đọc thêm

- **README.md**: Tài liệu đầy đủ
- **INSTALLATION.md**: Hướng dẫn cài đặt chi tiết
- **STRATEGY_GUIDE.md**: Chi tiết về các chiến lược

---

## ⚠️ Disclaimer

**QUAN TRỌNG:**
- Bot chỉ cung cấp tín hiệu, KHÔNG tự động trade
- Đây KHÔNG phải lời khuyên tài chính
- Luôn DYOR (Do Your Own Research)
- Chỉ trade với tiền bạn có thể mất
- Backtest và paper trade trước khi live

---

## 🎓 Learning Path

### Tuần 1: Học cơ bản
- [ ] Hiểu các chỉ báo (RSI, MACD, EMA, BB)
- [ ] Đọc STRATEGY_GUIDE.md
- [ ] Xem bot chạy, không vào lệnh

### Tuần 2-3: Paper Trading
- [ ] Ghi lại tín hiệu bot
- [ ] Vào lệnh trên giấy/Excel
- [ ] Tính toán R:R, winrate

### Tuần 4+: Live với vốn nhỏ
- [ ] Bắt đầu với $50-100
- [ ] Risk 1% per trade ($0.5-1)
- [ ] Journal mọi lệnh
- [ ] Review hàng tuần

---

## 🚀 Next Steps

1. **Start server**: `npm start`
2. **Open browser**: http://localhost:3000/app.html
3. **Press Start button**: Bắt đầu phân tích
4. **Watch & Learn**: Quan sát tín hiệu
5. **Paper trade**: Test trên giấy trước
6. **Go live**: Khi đã tự tin

---

**Happy Trading! 📈💰**

Có câu hỏi? Đọc README.md hoặc tạo issue trên GitHub!
