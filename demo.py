#!/usr/bin/env python3
"""
Demo script for Bybit Momentum Hunter
Tác giả: AI Assistant
Mô tả: Script demo để hiển thị cách hoạt động của thuật toán
"""

import json
from datetime import datetime
from bybit_momentum_hunter import BybitMomentumHunter, MomentumSignal

def demo_momentum_analysis():
    """Demo phân tích momentum"""
    print("🚀 BYBIT MOMENTUM HUNTER - DEMO")
    print("="*60)
    
    # Khởi tạo hunter
    hunter = BybitMomentumHunter()
    
    print("📊 Đang quét thị trường...")
    
    # Quét thị trường
    signals = hunter.scan_market()
    
    if not signals:
        print("❌ Không tìm thấy tín hiệu nào!")
        return
    
    # Hiển thị top 5 tín hiệu
    print(f"\n🎯 TOP {min(5, len(signals))} TÍN HIỆU MOMENTUM:")
    print("-" * 60)
    
    for i, signal in enumerate(signals[:5], 1):
        print(f"\n{i}. {signal.symbol}")
        print(f"   💰 Giá: ${signal.current_price:,.4f}")
        print(f"   📊 Điểm: {signal.score:.1f}/100")
        print(f"   🎯 Khuyến nghị: {signal.recommendation}")
        print(f"   📈 RSI: {signal.rsi:.2f}")
        print(f"   📊 MACD: {signal.macd:.6f}")
        print(f"   📊 Volume Ratio: {signal.volume_ratio:.2f}x")
        print(f"   📈 24h Change: {signal.price_change_24h:+.2f}%")
        
        # Giải thích điểm số
        explain_score(signal)
    
    # Lưu kết quả
    hunter.save_signals_to_file(signals, "demo_signals.json")
    print(f"\n💾 Đã lưu {len(signals)} tín hiệu vào demo_signals.json")
    
    # Hiển thị thống kê
    show_statistics(signals)

def explain_score(signal: MomentumSignal):
    """Giải thích điểm số của tín hiệu"""
    reasons = []
    
    # RSI analysis
    if signal.rsi < 30:
        reasons.append("RSI Oversold (+20)")
    elif 50 < signal.rsi < 70:
        reasons.append("RSI Bullish (+15)")
    
    # MACD analysis
    if signal.macd > signal.macd_signal:
        reasons.append("MACD Bullish Crossover (+20)")
    
    # Volume analysis
    if signal.volume_ratio > 1.5:
        reasons.append("High Volume (+25)")
    elif signal.volume_ratio > 1.2:
        reasons.append("Above Avg Volume (+15)")
    
    # Price change analysis
    if signal.price_change_24h > 5:
        reasons.append("Strong Price Gain (+25)")
    elif signal.price_change_24h > 2:
        reasons.append("Moderate Price Gain (+15)")
    
    if reasons:
        print(f"   🔍 Lý do: {', '.join(reasons)}")

def show_statistics(signals):
    """Hiển thị thống kê"""
    print("\n" + "="*60)
    print("📊 THỐNG KÊ TÍN HIỆU")
    print("="*60)
    
    # Đếm theo mức khuyến nghị
    recommendations = {}
    for signal in signals:
        rec = signal.recommendation
        recommendations[rec] = recommendations.get(rec, 0) + 1
    
    print("📈 Phân bố khuyến nghị:")
    for rec, count in recommendations.items():
        print(f"   {rec}: {count} coin")
    
    # Thống kê điểm số
    scores = [s.score for s in signals]
    avg_score = sum(scores) / len(scores)
    max_score = max(scores)
    min_score = min(scores)
    
    print(f"\n📊 Thống kê điểm số:")
    print(f"   Điểm trung bình: {avg_score:.1f}")
    print(f"   Điểm cao nhất: {max_score:.1f}")
    print(f"   Điểm thấp nhất: {min_score:.1f}")
    
    # Top sectors
    print(f"\n🏆 Top 3 coin có điểm cao nhất:")
    for i, signal in enumerate(signals[:3], 1):
        print(f"   {i}. {signal.symbol}: {signal.score:.1f} điểm")

def demo_config_explanation():
    """Giải thích cấu hình"""
    print("\n" + "="*60)
    print("⚙️  GIẢI THÍCH CẤU HÌNH")
    print("="*60)
    
    config_explanations = {
        "rsi_period": "Chu kỳ tính RSI (mặc định 14)",
        "rsi_oversold": "Ngưỡng RSI oversold (mặc định 30)",
        "rsi_overbought": "Ngưỡng RSI overbought (mặc định 70)",
        "volume_threshold": "Ngưỡng volume tối thiểu (mặc định 1.5x)",
        "price_change_threshold": "Ngưỡng thay đổi giá 24h (mặc định 5%)",
        "min_volume_24h": "Volume 24h tối thiểu (USD)",
        "max_coins_analyze": "Số coin tối đa phân tích",
        "refresh_interval": "Thời gian refresh (giây)"
    }
    
    for param, explanation in config_explanations.items():
        print(f"📌 {param}: {explanation}")

def demo_trading_strategy():
    """Demo chiến lược giao dịch"""
    print("\n" + "="*60)
    print("🎯 CHIẾN LƯỢC GIAO DỊCH")
    print("="*60)
    
    strategies = [
        {
            "name": "Conservative",
            "min_score": 80,
            "position_size": 0.05,
            "stop_loss": 0.03,
            "take_profit": 0.10,
            "description": "An toàn, chỉ giao dịch tín hiệu rất mạnh"
        },
        {
            "name": "Moderate", 
            "min_score": 70,
            "position_size": 0.08,
            "stop_loss": 0.05,
            "take_profit": 0.15,
            "description": "Cân bằng giữa rủi ro và lợi nhuận"
        },
        {
            "name": "Aggressive",
            "min_score": 60,
            "position_size": 0.10,
            "stop_loss": 0.07,
            "take_profit": 0.20,
            "description": "Mạo hiểm hơn, nhiều cơ hội hơn"
        }
    ]
    
    for strategy in strategies:
        print(f"\n📊 {strategy['name']} Strategy:")
        print(f"   Điểm tối thiểu: {strategy['min_score']}")
        print(f"   Kích thước vị thế: {strategy['position_size']*100}%")
        print(f"   Stop Loss: {strategy['stop_loss']*100}%")
        print(f"   Take Profit: {strategy['take_profit']*100}%")
        print(f"   Mô tả: {strategy['description']}")

def main():
    """Hàm main demo"""
    try:
        # Demo chính
        demo_momentum_analysis()
        
        # Demo cấu hình
        demo_config_explanation()
        
        # Demo chiến lược
        demo_trading_strategy()
        
        print("\n" + "="*60)
        print("🎉 DEMO HOÀN THÀNH!")
        print("="*60)
        print("\n💡 GỢI Ý:")
        print("- Chạy 'python bybit_momentum_hunter.py' để quét thực tế")
        print("- Chỉnh sửa config để tùy chỉnh thuật toán")
        print("- Test trên paper trading trước khi dùng tiền thật")
        print("- Luôn quản lý rủi ro cẩn thận!")
        
    except Exception as e:
        print(f"❌ Lỗi trong demo: {e}")
        print("💡 Kiểm tra kết nối Internet và thử lại")

if __name__ == "__main__":
    main()