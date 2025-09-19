#!/usr/bin/env python3
"""
Bybit Pump Hunter Bot
Thuật toán tự động săn coin tăng giá trên sàn Bybit
"""

import ccxt
import pandas as pd
import numpy as np
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import talib
import requests
from dataclasses import dataclass

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bybit_pump_hunter.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class TradingConfig:
    """Cấu hình trading"""
    api_key: str
    api_secret: str
    testnet: bool = True
    risk_percentage: float = 2.0  # % rủi ro mỗi lệnh
    max_positions: int = 5
    pump_threshold: float = 5.0  # % tăng giá để phát hiện pump
    volume_threshold: float = 200.0  # % tăng volume
    min_volume_24h: float = 1000000  # Volume tối thiểu 24h (USDT)
    stop_loss_percentage: float = 3.0  # % stop loss
    take_profit_percentage: float = 10.0  # % take profit
    leverage: int = 3
    telegram_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class BybitPumpHunter:
    """Bot săn coin pump trên Bybit"""
    
    def __init__(self, config: TradingConfig):
        self.config = config
        self.exchange = self._init_exchange()
        self.active_positions = {}
        self.watchlist = []
        self.last_signals = {}
        
    def _init_exchange(self) -> ccxt.Exchange:
        """Khởi tạo kết nối Bybit"""
        try:
            exchange = ccxt.bybit({
                'apiKey': self.config.api_key,
                'secret': self.config.api_secret,
                'sandbox': self.config.testnet,
                'enableRateLimit': True,
                'options': {
                    'defaultType': 'future',  # Sử dụng futures
                }
            })
            
            # Test kết nối
            balance = exchange.fetch_balance()
            logger.info(f"Kết nối Bybit thành công! Balance: {balance['USDT']['free']:.2f} USDT")
            return exchange
            
        except Exception as e:
            logger.error(f"Lỗi kết nối Bybit: {e}")
            raise
    
    def get_top_gainers(self, limit: int = 50) -> List[Dict]:
        """Lấy danh sách coin tăng giá mạnh nhất"""
        try:
            tickers = self.exchange.fetch_tickers()
            gainers = []
            
            for symbol, ticker in tickers.items():
                if symbol.endswith('/USDT') and ticker['percentage'] is not None:
                    if (ticker['percentage'] > self.config.pump_threshold and 
                        ticker['quoteVolume'] and 
                        ticker['quoteVolume'] > self.config.min_volume_24h):
                        
                        gainers.append({
                            'symbol': symbol,
                            'price': ticker['last'],
                            'change_24h': ticker['percentage'],
                            'volume_24h': ticker['quoteVolume'],
                            'high_24h': ticker['high'],
                            'low_24h': ticker['low']
                        })
            
            # Sắp xếp theo % tăng giá
            gainers.sort(key=lambda x: x['change_24h'], reverse=True)
            return gainers[:limit]
            
        except Exception as e:
            logger.error(f"Lỗi lấy top gainers: {e}")
            return []
    
    def analyze_pump_signal(self, symbol: str) -> Dict:
        """Phân tích tín hiệu pump cho một coin"""
        try:
            # Lấy dữ liệu OHLCV
            ohlcv = self.exchange.fetch_ohlcv(symbol, '1m', limit=100)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            # Tính các chỉ báo kỹ thuật
            df['sma_5'] = talib.SMA(df['close'], timeperiod=5)
            df['sma_20'] = talib.SMA(df['close'], timeperiod=20)
            df['rsi'] = talib.RSI(df['close'], timeperiod=14)
            df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
            df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(df['close'])
            
            # Tính volume moving average
            df['volume_sma'] = talib.SMA(df['volume'], timeperiod=20)
            
            # Lấy dữ liệu mới nhất
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            # Tính % thay đổi volume
            volume_change = ((latest['volume'] - prev['volume']) / prev['volume']) * 100
            
            # Tính % thay đổi giá
            price_change = ((latest['close'] - prev['close']) / prev['close']) * 100
            
            # Điều kiện pump
            pump_conditions = {
                'volume_spike': volume_change > self.config.volume_threshold,
                'price_spike': price_change > 2.0,
                'rsi_oversold': latest['rsi'] < 30,
                'macd_bullish': latest['macd'] > latest['macd_signal'],
                'price_above_sma5': latest['close'] > latest['sma_5'],
                'volume_above_avg': latest['volume'] > latest['volume_sma'] * 2
            }
            
            # Tính điểm pump
            pump_score = sum(pump_conditions.values())
            
            return {
                'symbol': symbol,
                'pump_score': pump_score,
                'price_change': price_change,
                'volume_change': volume_change,
                'rsi': latest['rsi'],
                'conditions': pump_conditions,
                'timestamp': latest['timestamp']
            }
            
        except Exception as e:
            logger.error(f"Lỗi phân tích {symbol}: {e}")
            return {}
    
    def calculate_position_size(self, symbol: str, entry_price: float) -> float:
        """Tính toán kích thước position"""
        try:
            balance = self.exchange.fetch_balance()
            available_balance = balance['USDT']['free']
            
            # Tính position size dựa trên risk percentage
            risk_amount = available_balance * (self.config.risk_percentage / 100)
            stop_loss_distance = entry_price * (self.config.stop_loss_percentage / 100)
            
            # Position size = risk_amount / stop_loss_distance
            position_size = risk_amount / stop_loss_distance
            
            # Áp dụng leverage
            position_size *= self.config.leverage
            
            # Giới hạn tối đa 10% balance
            max_position = available_balance * 0.1 / entry_price
            position_size = min(position_size, max_position)
            
            return round(position_size, 3)
            
        except Exception as e:
            logger.error(f"Lỗi tính position size: {e}")
            return 0
    
    def open_long_position(self, symbol: str, analysis: Dict) -> bool:
        """Mở position long"""
        try:
            if len(self.active_positions) >= self.config.max_positions:
                logger.warning(f"Đã đạt giới hạn {self.config.max_positions} positions")
                return False
            
            # Lấy giá hiện tại
            ticker = self.exchange.fetch_ticker(symbol)
            entry_price = ticker['last']
            
            # Tính position size
            position_size = self.calculate_position_size(symbol, entry_price)
            if position_size <= 0:
                logger.warning(f"Position size quá nhỏ cho {symbol}")
                return False
            
            # Tính stop loss và take profit
            stop_loss = entry_price * (1 - self.config.stop_loss_percentage / 100)
            take_profit = entry_price * (1 + self.config.take_profit_percentage / 100)
            
            # Đặt lệnh market buy
            order = self.exchange.create_market_buy_order(symbol, position_size)
            
            # Lưu thông tin position
            position_info = {
                'symbol': symbol,
                'side': 'long',
                'entry_price': entry_price,
                'size': position_size,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'entry_time': datetime.now(),
                'analysis': analysis
            }
            
            self.active_positions[symbol] = position_info
            
            # Gửi thông báo
            message = f"""
🚀 MỞ POSITION LONG
Symbol: {symbol}
Entry Price: ${entry_price:.4f}
Size: {position_size}
Stop Loss: ${stop_loss:.4f}
Take Profit: ${take_profit:.4f}
Pump Score: {analysis.get('pump_score', 0)}/6
Volume Change: {analysis.get('volume_change', 0):.1f}%
            """
            self.send_telegram_message(message)
            
            logger.info(f"Mở position long {symbol} thành công")
            return True
            
        except Exception as e:
            logger.error(f"Lỗi mở position {symbol}: {e}")
            return False
    
    def close_position(self, symbol: str, reason: str = "Manual") -> bool:
        """Đóng position"""
        try:
            if symbol not in self.active_positions:
                logger.warning(f"Không tìm thấy position {symbol}")
                return False
            
            position = self.active_positions[symbol]
            
            # Đặt lệnh market sell
            order = self.exchange.create_market_sell_order(symbol, position['size'])
            
            # Tính P&L
            current_price = self.exchange.fetch_ticker(symbol)['last']
            pnl = (current_price - position['entry_price']) * position['size']
            pnl_percentage = (current_price - position['entry_price']) / position['entry_price'] * 100
            
            # Gửi thông báo
            message = f"""
📊 ĐÓNG POSITION
Symbol: {symbol}
Entry Price: ${position['entry_price']:.4f}
Exit Price: ${current_price:.4f}
P&L: ${pnl:.2f} ({pnl_percentage:.2f}%)
Reason: {reason}
            """
            self.send_telegram_message(message)
            
            # Xóa khỏi active positions
            del self.active_positions[symbol]
            
            logger.info(f"Đóng position {symbol} thành công. P&L: {pnl:.2f}")
            return True
            
        except Exception as e:
            logger.error(f"Lỗi đóng position {symbol}: {e}")
            return False
    
    def check_stop_loss_take_profit(self):
        """Kiểm tra stop loss và take profit"""
        try:
            for symbol, position in list(self.active_positions.items()):
                current_price = self.exchange.fetch_ticker(symbol)['last']
                
                # Kiểm tra stop loss
                if current_price <= position['stop_loss']:
                    self.close_position(symbol, "Stop Loss")
                
                # Kiểm tra take profit
                elif current_price >= position['take_profit']:
                    self.close_position(symbol, "Take Profit")
                    
        except Exception as e:
            logger.error(f"Lỗi kiểm tra SL/TP: {e}")
    
    def send_telegram_message(self, message: str):
        """Gửi thông báo Telegram"""
        if not self.config.telegram_token or not self.config.telegram_chat_id:
            return
        
        try:
            url = f"https://api.telegram.org/bot{self.config.telegram_token}/sendMessage"
            data = {
                'chat_id': self.config.telegram_chat_id,
                'text': message,
                'parse_mode': 'HTML'
            }
            requests.post(url, data=data, timeout=10)
            
        except Exception as e:
            logger.error(f"Lỗi gửi Telegram: {e}")
    
    def run_pump_hunter(self):
        """Chạy bot săn pump"""
        logger.info("🚀 Bắt đầu Bybit Pump Hunter Bot")
        
        while True:
            try:
                # Lấy top gainers
                gainers = self.get_top_gainers(20)
                logger.info(f"Tìm thấy {len(gainers)} coin tăng giá")
                
                # Phân tích từng coin
                for gainer in gainers[:10]:  # Chỉ phân tích top 10
                    symbol = gainer['symbol']
                    
                    # Bỏ qua nếu đã có position
                    if symbol in self.active_positions:
                        continue
                    
                    # Phân tích tín hiệu pump
                    analysis = self.analyze_pump_signal(symbol)
                    
                    if analysis and analysis.get('pump_score', 0) >= 4:
                        logger.info(f"Tín hiệu pump mạnh cho {symbol}: {analysis['pump_score']}/6")
                        
                        # Mở position long
                        self.open_long_position(symbol, analysis)
                        
                        # Nghỉ 5 giây giữa các lệnh
                        time.sleep(5)
                
                # Kiểm tra stop loss và take profit
                self.check_stop_loss_take_profit()
                
                # Hiển thị trạng thái
                logger.info(f"Active positions: {len(self.active_positions)}")
                for symbol, pos in self.active_positions.items():
                    current_price = self.exchange.fetch_ticker(symbol)['last']
                    pnl = (current_price - pos['entry_price']) / pos['entry_price'] * 100
                    logger.info(f"{symbol}: {pnl:.2f}%")
                
                # Nghỉ 30 giây trước khi quét lại
                time.sleep(30)
                
            except KeyboardInterrupt:
                logger.info("Dừng bot...")
                break
            except Exception as e:
                logger.error(f"Lỗi trong main loop: {e}")
                time.sleep(60)  # Nghỉ 1 phút nếu có lỗi

def main():
    """Hàm main"""
    # Cấu hình bot
    config = TradingConfig(
        api_key="YOUR_BYBIT_API_KEY",
        api_secret="YOUR_BYBIT_API_SECRET",
        testnet=True,  # Đặt False cho live trading
        risk_percentage=2.0,
        max_positions=3,
        pump_threshold=5.0,
        volume_threshold=200.0,
        stop_loss_percentage=3.0,
        take_profit_percentage=10.0,
        leverage=3,
        telegram_token="YOUR_TELEGRAM_BOT_TOKEN",
        telegram_chat_id="YOUR_TELEGRAM_CHAT_ID"
    )
    
    # Khởi tạo và chạy bot
    bot = BybitPumpHunter(config)
    bot.run_pump_hunter()

if __name__ == "__main__":
    main()