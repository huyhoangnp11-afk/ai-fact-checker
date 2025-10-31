# 🎯 Advanced Trading Strategies - Hướng dẫn sử dụng

## Tổng quan

Dự án này bao gồm 3 chiến lược trading với RR tối thiểu 1:3, compound logic và khung thời gian 15m-4h:

1. **Strategy #1**: EMA50 + Fair Value Gap (FVG)
2. **Strategy #2**: Volume Oscillator Reversal
3. **Strategy #3**: Trendline Breakout + Retest

## 🎯 4 Quy tắc nền tảng

### 1. RR tối thiểu 1:3
- Mỗi lệnh chỉ lấy nếu TP ≥ 3×SL
- Ví dụ: rủi ro 20$ → TP tối thiểu 60$
- Loại ngay setup RR ≈ 1:1

### 2. Vốn nhỏ → Rủi ro lớn (20%/lệnh)
- Tài khoản 100$: rủi ro 20$ mỗi lệnh
- Với RR 1:3, thắng 1 lệnh = +60$ (+60%)
- Một lệnh thắng bù được 3 lệnh thua
- **⚠️ CỰC MẠO HIỂM**: 5 thua liên tiếp = mất ~67.2%

### 3. Compound thắng
- Luôn rủi ro theo % số dư hiện tại (không cố định $)
- Ví dụ: 100$ → thắng +60% = 160$. Lệnh sau rủi ro 20% của 160$ (=32$)
- Chuỗi thắng 5 lệnh liên tiếp ≈ 10.49× (vượt 10×)

### 4. Khung thời gian: 15m → 4h
- Tránh Daily (chậm) & 1m (nhiễu cao)
- Tối ưu: 1h hoặc 4h cho RR setup đẹp

## 📈 Chiến lược #1: EMA50 + Fair Value Gap (FVG)

### Cách hoạt động:
1. **Xác định trend** bằng EMA50:
   - Giá > EMA50 & EMA dốc lên → chỉ LONG
   - Giá < EMA50 & EMA dốc xuống → chỉ SHORT

2. **Tìm Fair Value Gap (FVG)** - 3-nến pattern:
   - Bullish FVG: High[nến 1] < Low[nến 3] (không chồng lấn)
   - Bearish FVG: Low[nến 1] > High[nến 3]
   - Ưu tiên gap lớn (>0.3%)

3. **Chờ pullback** lấp FVG:
   - Confluence tốt: pullback chạm EMA50

4. **Entry**:
   - LONG tại vùng Bullish FVG (theo uptrend)
   - SHORT tại vùng Bearish FVG (theo downtrend)
   - SL: ngay dưới/trên mép FVG
   - TP: 3R minimum

### Khi bỏ qua:
- Thị trường đi ngang (EMA phẳng)
- FVG quá mỏng
- Pullback phá vỡ cấu trúc

## 📊 Chiến lược #2: Volume Oscillator (VO) Reversal

### Cách hoạt động:
1. **VO > 30%** → có volume spike
2. **Xác định trend** dẫn tới spike (ví dụ downtrend)
3. **VO rơi xuống < midline (0%)** → momentum yếu đi
4. **Giá tạo tín hiệu đảo chiều** + VO vượt lại midline → xác nhận
5. **Entry theo hướng đảo chiều**:
   - SL: dưới/trên điểm vào đủ "khoảng thở"
   - TP: ≥ 3R

### Thiết lập:
- Volume Oscillator (TradingView default)
- Đường ngang ~30% (spike threshold)
- Midline = 0%

### Lưu ý:
- Nếu VO không thật sự giảm rồi tăng lại → fake
- Tin tức lớn có thể làm VO spike sai lệch

## 📉 Chiến lược #3: Trendline Breakout + Retest

### Cách hoạt động:
1. **Vẽ trendline hợp lệ** (≥3 điểm chạm):
   - Uptrend: nối các đáy
   - Downtrend: nối các đỉnh

2. **Break đáng kể**:
   - Tránh "thò đầu" nhẹ (fake-out)
   - Cần đóng nến vượt rõ

3. **Chờ pullback retest** trendline:
   - Giá quay lại "hôn tạm biệt" đường vừa phá

4. **Entry tại retest**:
   - SL: sát phía bên kia trendline (chặt)
   - TP: ≥ 3R

### Khi bỏ qua:
- Trendline chỉ có 2 điểm chạm (chưa đủ tin cậy)
- Breakout yếu, không retest
- Retest "xuyên thủng" quá sâu

## 💻 Sử dụng trên Web App

### 1. Mở index.html
```bash
# Mở trực tiếp trong browser
open index.html
# hoặc
firefox index.html
```

### 2. Bot sẽ tự động:
- Phân tích 3 chiến lược song song
- Chọn signal có confidence cao nhất
- Validate RR ≥ 1:3
- Tính position size với compound logic (20%/lệnh)
- Hiển thị Entry, SL, TP, RR

### 3. Xem logs:
```
🎯 ═══ ANALYZING 3 ADVANCED STRATEGIES (RR 1:3) ═══
📈 Strategy #1 (EMA50+FVG): LONG - BULLISH trend + FVG pullback
📊 Strategy #2 (VO Reversal): WAIT - No volume spike detected
📉 Strategy #3 (Trendline): WAIT - No breakout + retest pattern found

✅ BEST SIGNAL: LONG (Confidence: 85%)
   Entry: 50234.50
   Stop Loss: 49732.18 (1.00%)
   Take Profit: 51738.14 (3.00%)
   RR: 1:3.0 ✅
   Position Size: 0.3984 units
   Risk Amount: $20.00 (20%)
```

## 📊 Sử dụng Pine Script trên TradingView

### 1. Copy code từ file `TradingView_FVG_Strategy.pine`

### 2. Thêm vào TradingView:
1. Mở TradingView → Pine Editor (dưới chart)
2. Paste code vào
3. Click "Save" → đặt tên indicator
4. Click "Add to Chart"

### 3. Cấu hình:
- **Strategy Selection**: Bật/tắt từng chiến lược
- **Risk Management**:
  - Min RR: 3.0 (default)
  - Risk per trade: 20% (default)
- **Alerts**: Enable alerts cho tín hiệu

### 4. Tính năng:
- ✅ Hiển thị FVG zones (hộp xanh/đỏ)
- ✅ Vẽ EMA50
- ✅ Signal labels với RR, TP, SL
- ✅ Dashboard hiển thị stats
- ✅ Alerts tự động khi có signal

## 📊 Position Sizing Calculator

### Công thức:
```javascript
riskAmount = balance × (riskPercent / 100)
riskPerUnit = |entry - stopLoss|
positionSize = riskAmount / riskPerUnit
```

### Ví dụ:
- Balance: $100
- Risk: 20%
- Entry: $50,000
- SL: $49,000
- Risk per unit: $1,000

```
riskAmount = 100 × 0.2 = $20
positionSize = 20 / 1000 = 0.02 BTC
```

Nếu thắng (RR 1:3):
```
TP = 50000 + (1000 × 3) = $53,000
Profit = 0.02 × 3000 = $60
New Balance = $160 (+60%)
```

Lệnh tiếp theo:
```
riskAmount = 160 × 0.2 = $32
positionSize = 32 / 1000 = 0.032 BTC
```

## ⚠️ Quản trị rủi ro & Tâm lý

### Rủi ro với 20%/lệnh:
- 3 thua liên tiếp: còn 51.2% (-48.8%)
- 4 thua liên tiếp: còn 41% (-59%)
- 5 thua liên tiếp: còn 32.8% (-67.2%)

### Chuỗi thắng (compound):
- 5 win liên tiếp: 100 → 1049 (+949%, ~10.5×)
- 10 win liên tiếp: 100 → 10,995 (+10,895%, ~110×)

### Nhưng...
- 5 win → 1 loss: 1049 → 839 (-20%)
- Expectancy quan trọng hơn chuỗi thắng

### Backtest checklist:
- [ ] Test ≥50 lệnh trên mỗi chiến lược
- [ ] Chỉ nhận kèo đúng checklist
- [ ] Ghi R mỗi lệnh
- [ ] Tính winrate, expectancy, max DD
- [ ] Nếu RR trung bình < 2.2 → giảm rủi ro

### Journal:
- Ảnh chart trước entry
- Lý do entry
- R thực nhận
- Cảm xúc
- Có tuân thủ plan?

## 🎯 Checklist vào lệnh

- [ ] RR ≥ 1:3
- [ ] Không ngược trend (trừ strategy #2 có logic đảo chiều)
- [ ] Không có tin tức lớn sắp nổ
- [ ] Entry theo setup (FVG/VO/Retest)
- [ ] SL đặt ở chỗ "sai luận điểm"
- [ ] TP đặt 3R (hoặc chốt 1 phần ở 2R, dời SL về BE)

## 🚀 TL;DR Cheat Sheet

### Khung: 15m–4h | RR ≥ 1:3 | Risk 20%/lệnh + compound

**#1 Trend Pullback (EMA50 + FVG)**:
- Theo trend, vào khi pullback lấp FVG
- Ưu tiên gap lớn, confluence EMA50
- SL ngoài FVG, TP ≥ 3R

**#2 Volume Reversal (VO)**:
- VO > 30% (spike) → VO < midline (yếu) → giá đảo + VO > midline → vào ngược trend cũ
- SL đủ thở, TP ≥ 3R

**#3 Trendline Breakout + Retest**:
- Trendline ≥3 điểm chạm
- Đợi break → chờ retest → vào
- SL sát line, TP ≥ 3R

**Luôn backtest! Cân rủi ro: 20%/lệnh = cực gắt!**

## 📚 Tham khảo

### Indicators cần cài (TradingView):
- Volume Oscillator (built-in)
- EMA (built-in)

### Đọc thêm:
- Fair Value Gap (FVG): ICT concepts
- Volume analysis: Wyckoff method
- Risk management: Van Tharp - Trade Your Way to Financial Freedom

---

**⚠️ DISCLAIMER**: Đây KHÔNG phải khuyến nghị tài chính. 20% risk/trade cực kỳ mạo hiểm. Chỉ dùng với vốn bạn có thể mất 100%. Backtest kỹ trước khi live trade!
