#!/usr/bin/env python3
"""
Bybit Momentum Hunter - Algorithm for finding coins with upward momentum
Tác giả: AI Assistant
Mô tả: Thuật toán săn coin tăng trên Bybit sử dụng các chỉ báo kỹ thuật
"""

import requests
import pandas as pd
import numpy as np
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import talib
from dataclasses import dataclass
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import warnings
warnings.filterwarnings('ignore')

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bybit_momentum_hunter.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class MomentumSignal:
    """Lớp lưu trữ tín hiệu momentum"""
    symbol: str
    current_price: float
    rsi: float
    macd: float
    macd_signal: float
    volume_ratio: float
    price_change_24h: float
    score: float
    timestamp: datetime
    recommendation: str

class BybitMomentumHunter:
    """Lớp chính cho thuật toán săn coin tăng trên Bybit"""
    
    def __init__(self, api_key: str = "", secret_key: str = ""):
        """
        Khởi tạo Bybit Momentum Hunter
        
        Args:
            api_key: API key của Bybit (để trống nếu chỉ dùng public data)
            secret_key: Secret key của Bybit (để trống nếu chỉ dùng public data)
        """
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = "https://api.bybit.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'BybitMomentumHunter/1.0'
        })
        
        # Cấu hình tham số
        self.config = {
            'rsi_period': 14,
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'macd_fast': 12,
            'macd_slow': 26,
            'macd_signal': 9,
            'volume_threshold': 1.5,  # Tỷ lệ volume tối thiểu
            'price_change_threshold': 5.0,  # Thay đổi giá 24h tối thiểu (%)
            'min_volume_24h': 1000000,  # Volume 24h tối thiểu (USD)
            'max_coins_analyze': 100,  # Số coin tối đa để phân tích
            'refresh_interval': 300,  # Thời gian refresh (giây)
        }
        
        # Danh sách coin đang theo dõi
        self.watchlist = []
        self.momentum_signals = []
        
    def get_coin_list(self) -> List[Dict]:
        """
        Lấy danh sách các coin từ Bybit
        
        Returns:
            List các coin với thông tin cơ bản
        """
        try:
            url = f"{self.base_url}/v5/market/tickers"
            params = {
                'category': 'spot',
                'limit': self.config['max_coins_analyze']
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data['retCode'] == 0:
                coins = []
                for ticker in data['result']['list']:
                    # Chỉ lấy các coin có volume đủ lớn
                    if float(ticker.get('turnover24h', 0)) >= self.config['min_volume_24h']:
                        coins.append({
                            'symbol': ticker['symbol'],
                            'price': float(ticker['lastPrice']),
                            'volume24h': float(ticker.get('turnover24h', 0)),
                            'priceChange24h': float(ticker.get('price24hPcnt', 0)) * 100
                        })
                
                logger.info(f"Lấy được {len(coins)} coin từ Bybit")
                return coins
            else:
                logger.error(f"Lỗi API Bybit: {data['retMsg']}")
                return []
                
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách coin: {e}")
            return []
    
    def get_klines_data(self, symbol: str, interval: str = "1h", limit: int = 200) -> Optional[pd.DataFrame]:
        """
        Lấy dữ liệu kline (nến) cho một coin
        
        Args:
            symbol: Mã coin (VD: BTCUSDT)
            interval: Khung thời gian (1m, 5m, 15m, 30m, 1h, 4h, 1d)
            limit: Số lượng nến
            
        Returns:
            DataFrame chứa dữ liệu OHLCV
        """
        try:
            url = f"{self.base_url}/v5/market/kline"
            params = {
                'category': 'spot',
                'symbol': symbol,
                'interval': interval,
                'limit': limit
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data['retCode'] == 0:
                klines = data['result']['list']
                
                # Chuyển đổi sang DataFrame
                df = pd.DataFrame(klines, columns=[
                    'timestamp', 'open', 'high', 'low', 'close', 'volume', 'turnover'
                ])
                
                # Chuyển đổi kiểu dữ liệu
                df['timestamp'] = pd.to_datetime(df['timestamp'].astype(int), unit='ms')
                for col in ['open', 'high', 'low', 'close', 'volume', 'turnover']:
                    df[col] = df[col].astype(float)
                
                # Sắp xếp theo thời gian
                df = df.sort_values('timestamp').reset_index(drop=True)
                
                return df
            else:
                logger.warning(f"Không thể lấy dữ liệu kline cho {symbol}: {data['retMsg']}")
                return None
                
        except Exception as e:
            logger.warning(f"Lỗi khi lấy dữ liệu kline cho {symbol}: {e}")
            return None
    
    def calculate_technical_indicators(self, df: pd.DataFrame) -> Dict:
        """
        Tính toán các chỉ báo kỹ thuật
        
        Args:
            df: DataFrame chứa dữ liệu OHLCV
            
        Returns:
            Dict chứa các chỉ báo đã tính toán
        """
        if df is None or len(df) < 50:
            return {}
        
        try:
            # RSI
            rsi = talib.RSI(df['close'].values, timeperiod=self.config['rsi_period'])
            
            # MACD
            macd, macd_signal, macd_hist = talib.MACD(
                df['close'].values,
                fastperiod=self.config['macd_fast'],
                slowperiod=self.config['macd_slow'],
                signalperiod=self.config['macd_signal']
            )
            
            # Volume ratio (so sánh volume hiện tại với trung bình)
            volume_ma = df['volume'].rolling(window=20).mean()
            volume_ratio = df['volume'].iloc[-1] / volume_ma.iloc[-1] if volume_ma.iloc[-1] > 0 else 0
            
            # Price momentum (thay đổi giá trong 24h)
            price_change_24h = ((df['close'].iloc[-1] - df['close'].iloc[-24]) / df['close'].iloc[-24]) * 100 if len(df) >= 24 else 0
            
            return {
                'rsi': rsi[-1] if not np.isnan(rsi[-1]) else 50,
                'macd': macd[-1] if not np.isnan(macd[-1]) else 0,
                'macd_signal': macd_signal[-1] if not np.isnan(macd_signal[-1]) else 0,
                'macd_hist': macd_hist[-1] if not np.isnan(macd_hist[-1]) else 0,
                'volume_ratio': volume_ratio,
                'price_change_24h': price_change_24h,
                'current_price': df['close'].iloc[-1]
            }
            
        except Exception as e:
            logger.warning(f"Lỗi khi tính toán chỉ báo kỹ thuật: {e}")
            return {}
    
    def calculate_momentum_score(self, indicators: Dict) -> Tuple[float, str]:
        """
        Tính điểm momentum và đưa ra khuyến nghị
        
        Args:
            indicators: Dict chứa các chỉ báo kỹ thuật
            
        Returns:
            Tuple (điểm số, khuyến nghị)
        """
        if not indicators:
            return 0, "KHÔNG_CÓ_DỮ_LIỆU"
        
        score = 0
        reasons = []
        
        # Điểm RSI
        rsi = indicators['rsi']
        if rsi < self.config['rsi_oversold']:
            score += 20
            reasons.append("RSI_Oversold")
        elif rsi > 50 and rsi < self.config['rsi_overbought']:
            score += 15
            reasons.append("RSI_Bullish")
        
        # Điểm MACD
        macd = indicators['macd']
        macd_signal = indicators['macd_signal']
        macd_hist = indicators['macd_hist']
        
        if macd > macd_signal:
            score += 20
            reasons.append("MACD_Bullish_Crossover")
        
        if macd_hist > 0:
            score += 10
            reasons.append("MACD_Histogram_Positive")
        
        # Điểm Volume
        volume_ratio = indicators['volume_ratio']
        if volume_ratio > self.config['volume_threshold']:
            score += 25
            reasons.append("High_Volume")
        elif volume_ratio > 1.2:
            score += 15
            reasons.append("Above_Average_Volume")
        
        # Điểm Price Change
        price_change = indicators['price_change_24h']
        if price_change > self.config['price_change_threshold']:
            score += 25
            reasons.append("Strong_Price_Gain")
        elif price_change > 2:
            score += 15
            reasons.append("Moderate_Price_Gain")
        
        # Đưa ra khuyến nghị
        if score >= 80:
            recommendation = "MẠNH_MUA"
        elif score >= 60:
            recommendation = "MUA"
        elif score >= 40:
            recommendation = "THEO_DÕI"
        elif score >= 20:
            recommendation = "THẬN_TRỌNG"
        else:
            recommendation = "TRÁNH"
        
        return score, recommendation
    
    def analyze_coin(self, coin_info: Dict) -> Optional[MomentumSignal]:
        """
        Phân tích một coin cụ thể
        
        Args:
            coin_info: Thông tin cơ bản của coin
            
        Returns:
            MomentumSignal nếu có tín hiệu tốt
        """
        symbol = coin_info['symbol']
        
        # Lấy dữ liệu kline
        df = self.get_klines_data(symbol, interval="1h", limit=200)
        if df is None:
            return None
        
        # Tính toán chỉ báo kỹ thuật
        indicators = self.calculate_technical_indicators(df)
        if not indicators:
            return None
        
        # Tính điểm momentum
        score, recommendation = self.calculate_momentum_score(indicators)
        
        # Tạo tín hiệu momentum
        signal = MomentumSignal(
            symbol=symbol,
            current_price=indicators['current_price'],
            rsi=indicators['rsi'],
            macd=indicators['macd'],
            macd_signal=indicators['macd_signal'],
            volume_ratio=indicators['volume_ratio'],
            price_change_24h=indicators['price_change_24h'],
            score=score,
            timestamp=datetime.now(),
            recommendation=recommendation
        )
        
        return signal
    
    def scan_market(self) -> List[MomentumSignal]:
        """
        Quét toàn bộ thị trường để tìm các coin có momentum tốt
        
        Returns:
            List các tín hiệu momentum
        """
        logger.info("Bắt đầu quét thị trường...")
        
        # Lấy danh sách coin
        coins = self.get_coin_list()
        if not coins:
            logger.error("Không thể lấy danh sách coin")
            return []
        
        # Lọc các coin có tiềm năng
        potential_coins = []
        for coin in coins:
            if (coin['priceChange24h'] > 2 and  # Tăng ít nhất 2% trong 24h
                coin['volume24h'] > self.config['min_volume_24h']):
                potential_coins.append(coin)
        
        logger.info(f"Tìm thấy {len(potential_coins)} coin có tiềm năng")
        
        # Phân tích từng coin
        signals = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.analyze_coin, coin) for coin in potential_coins[:20]]
            
            for future in futures:
                try:
                    signal = future.result(timeout=30)
                    if signal and signal.score >= 40:  # Chỉ lấy các tín hiệu có điểm >= 40
                        signals.append(signal)
                except Exception as e:
                    logger.warning(f"Lỗi khi phân tích coin: {e}")
        
        # Sắp xếp theo điểm số
        signals.sort(key=lambda x: x.score, reverse=True)
        
        logger.info(f"Tìm thấy {len(signals)} tín hiệu momentum tốt")
        return signals
    
    def print_signals(self, signals: List[MomentumSignal]):
        """
        In ra các tín hiệu momentum
        
        Args:
            signals: List các tín hiệu momentum
        """
        if not signals:
            print("Không tìm thấy tín hiệu momentum nào!")
            return
        
        print("\n" + "="*80)
        print("🚀 BYBIT MOMENTUM HUNTER - TÍN HIỆU COIN TĂNG")
        print("="*80)
        print(f"Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Số lượng tín hiệu: {len(signals)}")
        print("-"*80)
        
        for i, signal in enumerate(signals[:10], 1):  # Chỉ hiển thị top 10
            print(f"\n{i}. {signal.symbol}")
            print(f"   💰 Giá hiện tại: ${signal.current_price:,.4f}")
            print(f"   📊 Điểm số: {signal.score:.1f}/100")
            print(f"   🎯 Khuyến nghị: {signal.recommendation}")
            print(f"   📈 RSI: {signal.rsi:.2f}")
            print(f"   📊 MACD: {signal.macd:.6f}")
            print(f"   📊 MACD Signal: {signal.macd_signal:.6f}")
            print(f"   📊 Volume Ratio: {signal.volume_ratio:.2f}x")
            print(f"   📈 Thay đổi 24h: {signal.price_change_24h:+.2f}%")
        
        print("\n" + "="*80)
        print("⚠️  LƯU Ý: Đây chỉ là tín hiệu tham khảo, không phải lời khuyên đầu tư!")
        print("⚠️  Luôn thực hiện nghiên cứu riêng và quản lý rủi ro cẩn thận!")
        print("="*80)
    
    def save_signals_to_file(self, signals: List[MomentumSignal], filename: str = None):
        """
        Lưu tín hiệu vào file JSON
        
        Args:
            signals: List các tín hiệu momentum
            filename: Tên file (nếu None thì tự động tạo)
        """
        if filename is None:
            filename = f"momentum_signals_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            signals_data = []
            for signal in signals:
                signals_data.append({
                    'symbol': signal.symbol,
                    'current_price': signal.current_price,
                    'rsi': signal.rsi,
                    'macd': signal.macd,
                    'macd_signal': signal.macd_signal,
                    'volume_ratio': signal.volume_ratio,
                    'price_change_24h': signal.price_change_24h,
                    'score': signal.score,
                    'timestamp': signal.timestamp.isoformat(),
                    'recommendation': signal.recommendation
                })
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(signals_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Đã lưu {len(signals)} tín hiệu vào file {filename}")
            
        except Exception as e:
            logger.error(f"Lỗi khi lưu tín hiệu vào file: {e}")
    
    def run_continuous_scan(self, duration_hours: int = 24):
        """
        Chạy quét liên tục trong một khoảng thời gian
        
        Args:
            duration_hours: Số giờ chạy liên tục
        """
        logger.info(f"Bắt đầu quét liên tục trong {duration_hours} giờ...")
        
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=duration_hours)
        
        while datetime.now() < end_time:
            try:
                # Quét thị trường
                signals = self.scan_market()
                
                # In kết quả
                self.print_signals(signals)
                
                # Lưu vào file
                self.save_signals_to_file(signals)
                
                # Lưu tín hiệu tốt nhất vào watchlist
                top_signals = [s for s in signals if s.score >= 70]
                if top_signals:
                    self.watchlist.extend(top_signals)
                    logger.info(f"Thêm {len(top_signals)} coin vào watchlist")
                
                # Chờ đến lần quét tiếp theo
                logger.info(f"Chờ {self.config['refresh_interval']} giây trước khi quét lại...")
                time.sleep(self.config['refresh_interval'])
                
            except KeyboardInterrupt:
                logger.info("Dừng quét do người dùng yêu cầu...")
                break
            except Exception as e:
                logger.error(f"Lỗi trong quá trình quét: {e}")
                time.sleep(60)  # Chờ 1 phút trước khi thử lại
        
        logger.info("Hoàn thành quét liên tục")

def main():
    """Hàm main để chạy chương trình"""
    print("🚀 BYBIT MOMENTUM HUNTER - THUẬT TOÁN SĂN COIN TĂNG")
    print("="*60)
    
    # Khởi tạo hunter
    hunter = BybitMomentumHunter()
    
    # Menu lựa chọn
    while True:
        print("\nChọn chế độ:")
        print("1. Quét một lần")
        print("2. Quét liên tục")
        print("3. Xem watchlist")
        print("4. Thoát")
        
        choice = input("\nNhập lựa chọn (1-4): ").strip()
        
        if choice == "1":
            print("\n🔍 Đang quét thị trường...")
            signals = hunter.scan_market()
            hunter.print_signals(signals)
            hunter.save_signals_to_file(signals)
            
        elif choice == "2":
            try:
                hours = int(input("Nhập số giờ chạy liên tục (mặc định 24): ") or "24")
                hunter.run_continuous_scan(hours)
            except ValueError:
                print("Số giờ không hợp lệ!")
                
        elif choice == "3":
            if hunter.watchlist:
                print("\n📋 WATCHLIST:")
                hunter.print_signals(hunter.watchlist[-10:])  # Hiển thị 10 coin gần nhất
            else:
                print("\nWatchlist trống!")
                
        elif choice == "4":
            print("\n👋 Tạm biệt!")
            break
            
        else:
            print("Lựa chọn không hợp lệ!")

if __name__ == "__main__":
    main()