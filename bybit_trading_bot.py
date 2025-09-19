#!/usr/bin/env python3
"""
Bybit Trading Bot - Hệ thống giao dịch tự động
Tác giả: AI Assistant
Mô tả: Bot giao dịch tự động dựa trên tín hiệu momentum từ Bybit Momentum Hunter
"""

import hashlib
import hmac
import time
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass
from bybit_momentum_hunter import BybitMomentumHunter, MomentumSignal
import threading
import queue

logger = logging.getLogger(__name__)

@dataclass
class TradeOrder:
    """Lớp lưu trữ thông tin lệnh giao dịch"""
    symbol: str
    side: str  # 'Buy' hoặc 'Sell'
    order_type: str  # 'Market' hoặc 'Limit'
    quantity: float
    price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    timestamp: datetime
    signal_score: float
    reason: str

@dataclass
class Position:
    """Lớp lưu trữ thông tin vị thế"""
    symbol: str
    side: str
    size: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    timestamp: datetime

class BybitTradingBot:
    """Bot giao dịch tự động trên Bybit"""
    
    def __init__(self, api_key: str, secret_key: str, config_file: str = "config.json"):
        """
        Khởi tạo trading bot
        
        Args:
            api_key: API key của Bybit
            secret_key: Secret key của Bybit
            config_file: Đường dẫn file config
        """
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = "https://api.bybit.com"
        
        # Load config
        with open(config_file, 'r') as f:
            self.config = json.load(f)
        
        # Khởi tạo momentum hunter
        self.hunter = BybitMomentumHunter(api_key, secret_key)
        
        # Danh sách vị thế đang mở
        self.positions = {}
        
        # Queue để xử lý tín hiệu
        self.signal_queue = queue.Queue()
        
        # Thống kê giao dịch
        self.trade_stats = {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'total_pnl': 0.0,
            'daily_pnl': 0.0,
            'last_reset_date': datetime.now().date()
        }
        
        # Session cho API calls
        self.session = requests.Session()
        
    def _generate_signature(self, params: str) -> str:
        """Tạo chữ ký cho API request"""
        return hmac.new(
            self.secret_key.encode('utf-8'),
            params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    def _make_authenticated_request(self, method: str, endpoint: str, params: Dict = None) -> Dict:
        """
        Thực hiện API request có xác thực
        
        Args:
            method: HTTP method (GET, POST)
            endpoint: API endpoint
            params: Tham số request
            
        Returns:
            Response data
        """
        if params is None:
            params = {}
        
        # Thêm timestamp
        timestamp = str(int(time.time() * 1000))
        params['api_key'] = self.api_key
        params['timestamp'] = timestamp
        
        # Tạo chữ ký
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        signature = self._generate_signature(query_string)
        params['sign'] = signature
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == 'GET':
                response = self.session.get(url, params=params)
            else:
                response = self.session.post(url, json=params)
            
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"Lỗi API request: {e}")
            return {'retCode': -1, 'retMsg': str(e)}
    
    def get_account_balance(self) -> Dict:
        """Lấy thông tin số dư tài khoản"""
        try:
            response = self._make_authenticated_request('GET', '/v5/account/wallet-balance')
            if response['retCode'] == 0:
                return response['result']
            else:
                logger.error(f"Lỗi lấy số dư: {response['retMsg']}")
                return {}
        except Exception as e:
            logger.error(f"Lỗi khi lấy số dư: {e}")
            return {}
    
    def get_open_positions(self) -> List[Position]:
        """Lấy danh sách vị thế đang mở"""
        try:
            response = self._make_authenticated_request('GET', '/v5/position/list')
            if response['retCode'] == 0:
                positions = []
                for pos_data in response['result']['list']:
                    if float(pos_data['size']) > 0:  # Chỉ lấy vị thế có size > 0
                        position = Position(
                            symbol=pos_data['symbol'],
                            side=pos_data['side'],
                            size=float(pos_data['size']),
                            entry_price=float(pos_data['avgPrice']),
                            current_price=float(pos_data['markPrice']),
                            unrealized_pnl=float(pos_data['unrealisedPnl']),
                            stop_loss=float(pos_data['stopLoss']) if pos_data['stopLoss'] else None,
                            take_profit=float(pos_data['takeProfit']) if pos_data['takeProfit'] else None,
                            timestamp=datetime.now()
                        )
                        positions.append(position)
                return positions
            else:
                logger.error(f"Lỗi lấy vị thế: {response['retMsg']}")
                return []
        except Exception as e:
            logger.error(f"Lỗi khi lấy vị thế: {e}")
            return []
    
    def calculate_position_size(self, symbol: str, signal_score: float, current_price: float) -> float:
        """
        Tính toán kích thước vị thế dựa trên rủi ro
        
        Args:
            symbol: Mã coin
            signal_score: Điểm tín hiệu
            current_price: Giá hiện tại
            
        Returns:
            Kích thước vị thế (USD)
        """
        # Lấy số dư tài khoản
        balance_data = self.get_account_balance()
        if not balance_data:
            return 0
        
        # Lấy số dư USDT
        usdt_balance = 0
        for coin in balance_data.get('list', []):
            for currency in coin.get('coin', []):
                if currency['coin'] == 'USDT':
                    usdt_balance = float(currency['walletBalance'])
                    break
        
        if usdt_balance <= 0:
            return 0
        
        # Tính kích thước vị thế dựa trên điểm tín hiệu
        base_size = usdt_balance * self.config['risk_management']['max_position_size']
        
        # Điều chỉnh theo điểm tín hiệu
        if signal_score >= 90:
            size_multiplier = 1.0
        elif signal_score >= 80:
            size_multiplier = 0.8
        elif signal_score >= 70:
            size_multiplier = 0.6
        elif signal_score >= 60:
            size_multiplier = 0.4
        else:
            size_multiplier = 0.2
        
        position_size = base_size * size_multiplier
        
        # Đảm bảo không vượt quá giới hạn
        max_size = usdt_balance * 0.5  # Tối đa 50% số dư
        return min(position_size, max_size)
    
    def place_order(self, order: TradeOrder) -> bool:
        """
        Đặt lệnh giao dịch
        
        Args:
            order: Thông tin lệnh
            
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            # Tính toán kích thước vị thế
            position_size = self.calculate_position_size(order.symbol, order.signal_score, order.price or 0)
            if position_size <= 0:
                logger.warning(f"Không thể đặt lệnh cho {order.symbol}: Không đủ số dư")
                return False
            
            # Tính số lượng coin
            quantity = position_size / order.price if order.price else 0
            
            # Chuẩn bị tham số
            params = {
                'category': 'spot',
                'symbol': order.symbol,
                'side': order.side,
                'orderType': order.order_type,
                'qty': str(quantity),
                'timeInForce': 'GTC'
            }
            
            if order.price:
                params['price'] = str(order.price)
            
            # Đặt lệnh
            response = self._make_authenticated_request('POST', '/v5/order/create', params)
            
            if response['retCode'] == 0:
                logger.info(f"Đặt lệnh thành công: {order.symbol} {order.side} {quantity}")
                
                # Đặt stop loss và take profit nếu có
                if order.stop_loss or order.take_profit:
                    self._set_stop_loss_take_profit(order.symbol, order.stop_loss, order.take_profit)
                
                # Cập nhật thống kê
                self.trade_stats['total_trades'] += 1
                
                return True
            else:
                logger.error(f"Lỗi đặt lệnh: {response['retMsg']}")
                return False
                
        except Exception as e:
            logger.error(f"Lỗi khi đặt lệnh: {e}")
            return False
    
    def _set_stop_loss_take_profit(self, symbol: str, stop_loss: float, take_profit: float):
        """Đặt stop loss và take profit"""
        try:
            params = {
                'category': 'spot',
                'symbol': symbol,
                'stopLoss': str(stop_loss),
                'takeProfit': str(take_profit)
            }
            
            response = self._make_authenticated_request('POST', '/v5/position/trading-stop', params)
            
            if response['retCode'] == 0:
                logger.info(f"Đặt SL/TP thành công cho {symbol}")
            else:
                logger.error(f"Lỗi đặt SL/TP: {response['retMsg']}")
                
        except Exception as e:
            logger.error(f"Lỗi khi đặt SL/TP: {e}")
    
    def close_position(self, symbol: str, reason: str = "Manual") -> bool:
        """
        Đóng vị thế
        
        Args:
            symbol: Mã coin
            reason: Lý do đóng
            
        Returns:
            True nếu thành công
        """
        try:
            # Lấy thông tin vị thế hiện tại
            positions = self.get_open_positions()
            position = None
            
            for pos in positions:
                if pos.symbol == symbol:
                    position = pos
                    break
            
            if not position:
                logger.warning(f"Không tìm thấy vị thế cho {symbol}")
                return False
            
            # Đặt lệnh đóng ngược
            side = 'Sell' if position.side == 'Buy' else 'Buy'
            
            order = TradeOrder(
                symbol=symbol,
                side=side,
                order_type='Market',
                quantity=position.size,
                price=None,
                stop_loss=None,
                take_profit=None,
                timestamp=datetime.now(),
                signal_score=0,
                reason=reason
            )
            
            success = self.place_order(order)
            if success:
                logger.info(f"Đóng vị thế {symbol} thành công: {reason}")
                
                # Cập nhật thống kê
                if position.unrealized_pnl > 0:
                    self.trade_stats['winning_trades'] += 1
                else:
                    self.trade_stats['losing_trades'] += 1
                
                self.trade_stats['total_pnl'] += position.unrealized_pnl
                self.trade_stats['daily_pnl'] += position.unrealized_pnl
            
            return success
            
        except Exception as e:
            logger.error(f"Lỗi khi đóng vị thế {symbol}: {e}")
            return False
    
    def process_signal(self, signal: MomentumSignal):
        """
        Xử lý tín hiệu momentum
        
        Args:
            signal: Tín hiệu momentum
        """
        try:
            # Kiểm tra điều kiện giao dịch
            if not self._should_trade(signal):
                return
            
            # Kiểm tra số lượng vị thế tối đa
            current_positions = self.get_open_positions()
            if len(current_positions) >= self.config['risk_management']['max_concurrent_positions']:
                logger.warning(f"Đã đạt giới hạn số vị thế tối đa: {len(current_positions)}")
                return
            
            # Kiểm tra số lượng giao dịch trong ngày
            if self.trade_stats['total_trades'] >= self.config['risk_management']['max_daily_trades']:
                logger.warning("Đã đạt giới hạn số giao dịch trong ngày")
                return
            
            # Tạo lệnh giao dịch
            order = self._create_trade_order(signal)
            if not order:
                return
            
            # Đặt lệnh
            success = self.place_order(order)
            if success:
                logger.info(f"Giao dịch thành công: {signal.symbol} - {signal.recommendation}")
                self.positions[signal.symbol] = signal
            
        except Exception as e:
            logger.error(f"Lỗi xử lý tín hiệu {signal.symbol}: {e}")
    
    def _should_trade(self, signal: MomentumSignal) -> bool:
        """
        Kiểm tra xem có nên giao dịch hay không
        
        Args:
            signal: Tín hiệu momentum
            
        Returns:
            True nếu nên giao dịch
        """
        # Chỉ giao dịch các tín hiệu mạnh
        if signal.score < 70:
            return False
        
        # Kiểm tra RSI không quá overbought
        if signal.rsi > 80:
            return False
        
        # Kiểm tra volume đủ lớn
        if signal.volume_ratio < 1.2:
            return False
        
        # Kiểm tra thay đổi giá không quá lớn (tránh FOMO)
        if signal.price_change_24h > 20:
            return False
        
        return True
    
    def _create_trade_order(self, signal: MomentumSignal) -> Optional[TradeOrder]:
        """
        Tạo lệnh giao dịch từ tín hiệu
        
        Args:
            signal: Tín hiệu momentum
            
        Returns:
            TradeOrder hoặc None
        """
        try:
            # Tính stop loss và take profit
            stop_loss = signal.current_price * (1 - self.config['risk_management']['stop_loss_percentage'])
            take_profit = signal.current_price * (1 + self.config['risk_management']['take_profit_percentage'])
            
            order = TradeOrder(
                symbol=signal.symbol,
                side='Buy',
                order_type='Market',
                quantity=0,  # Sẽ được tính trong place_order
                price=signal.current_price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                timestamp=datetime.now(),
                signal_score=signal.score,
                reason=f"Momentum signal - Score: {signal.score}"
            )
            
            return order
            
        except Exception as e:
            logger.error(f"Lỗi tạo lệnh giao dịch: {e}")
            return None
    
    def monitor_positions(self):
        """Theo dõi và quản lý các vị thế đang mở"""
        try:
            positions = self.get_open_positions()
            
            for position in positions:
                # Kiểm tra stop loss
                if position.stop_loss:
                    if (position.side == 'Buy' and position.current_price <= position.stop_loss) or \
                       (position.side == 'Sell' and position.current_price >= position.stop_loss):
                        self.close_position(position.symbol, "Stop Loss")
                        continue
                
                # Kiểm tra take profit
                if position.take_profit:
                    if (position.side == 'Buy' and position.current_price >= position.take_profit) or \
                       (position.side == 'Sell' and position.current_price <= position.take_profit):
                        self.close_position(position.symbol, "Take Profit")
                        continue
                
                # Kiểm tra thời gian giữ vị thế (tối đa 24h)
                if datetime.now() - position.timestamp > timedelta(hours=24):
                    self.close_position(position.symbol, "Time Limit")
                    continue
                
                # Cập nhật PnL
                self.trade_stats['daily_pnl'] += position.unrealized_pnl - getattr(position, 'last_pnl', 0)
                position.last_pnl = position.unrealized_pnl
            
        except Exception as e:
            logger.error(f"Lỗi khi theo dõi vị thế: {e}")
    
    def print_trade_stats(self):
        """In thống kê giao dịch"""
        print("\n" + "="*60)
        print("📊 THỐNG KÊ GIAO DỊCH")
        print("="*60)
        print(f"Tổng số giao dịch: {self.trade_stats['total_trades']}")
        print(f"Giao dịch thắng: {self.trade_stats['winning_trades']}")
        print(f"Giao dịch thua: {self.trade_stats['losing_trades']}")
        
        if self.trade_stats['total_trades'] > 0:
            win_rate = (self.trade_stats['winning_trades'] / self.trade_stats['total_trades']) * 100
            print(f"Tỷ lệ thắng: {win_rate:.2f}%")
        
        print(f"Tổng PnL: ${self.trade_stats['total_pnl']:.2f}")
        print(f"PnL hôm nay: ${self.trade_stats['daily_pnl']:.2f}")
        
        # Hiển thị vị thế đang mở
        positions = self.get_open_positions()
        if positions:
            print(f"\nVị thế đang mở: {len(positions)}")
            for pos in positions:
                print(f"  {pos.symbol}: {pos.side} {pos.size} @ ${pos.entry_price:.4f} | PnL: ${pos.unrealized_pnl:.2f}")
        
        print("="*60)
    
    def run_trading_bot(self):
        """Chạy bot giao dịch"""
        logger.info("🚀 Bắt đầu Bybit Trading Bot...")
        
        # Thread để xử lý tín hiệu
        def signal_processor():
            while True:
                try:
                    signal = self.signal_queue.get(timeout=1)
                    self.process_signal(signal)
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Lỗi xử lý tín hiệu: {e}")
        
        # Khởi động thread xử lý tín hiệu
        signal_thread = threading.Thread(target=signal_processor, daemon=True)
        signal_thread.start()
        
        # Vòng lặp chính
        while True:
            try:
                # Quét thị trường
                signals = self.hunter.scan_market()
                
                # Thêm tín hiệu tốt vào queue
                for signal in signals:
                    if signal.score >= 70:  # Chỉ xử lý tín hiệu mạnh
                        self.signal_queue.put(signal)
                
                # Theo dõi vị thế
                self.monitor_positions()
                
                # In thống kê
                self.print_trade_stats()
                
                # Chờ đến lần quét tiếp theo
                time.sleep(self.config['trading_parameters']['refresh_interval'])
                
            except KeyboardInterrupt:
                logger.info("Dừng bot do người dùng yêu cầu...")
                break
            except Exception as e:
                logger.error(f"Lỗi trong bot: {e}")
                time.sleep(60)

def main():
    """Hàm main"""
    print("🤖 BYBIT TRADING BOT - BOT GIAO DỊCH TỰ ĐỘNG")
    print("="*60)
    
    # Nhập API keys
    api_key = input("Nhập Bybit API Key: ").strip()
    secret_key = input("Nhập Bybit Secret Key: ").strip()
    
    if not api_key or not secret_key:
        print("❌ Cần có API Key và Secret Key!")
        return
    
    try:
        # Khởi tạo bot
        bot = BybitTradingBot(api_key, secret_key)
        
        # Kiểm tra kết nối
        balance = bot.get_account_balance()
        if not balance:
            print("❌ Không thể kết nối đến Bybit API!")
            return
        
        print("✅ Kết nối thành công!")
        
        # Chạy bot
        bot.run_trading_bot()
        
    except Exception as e:
        logger.error(f"Lỗi khởi động bot: {e}")
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    main()