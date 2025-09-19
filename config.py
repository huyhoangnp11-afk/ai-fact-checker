"""
Cấu hình cho Bybit Pump Hunter Bot
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Cấu hình chính"""
    
    # Bybit API
    BYBIT_API_KEY = os.getenv('BYBIT_API_KEY', '')
    BYBIT_API_SECRET = os.getenv('BYBIT_API_SECRET', '')
    BYBIT_TESTNET = os.getenv('BYBIT_TESTNET', 'True').lower() == 'true'
    
    # Trading Parameters
    RISK_PERCENTAGE = float(os.getenv('RISK_PERCENTAGE', '2.0'))
    MAX_POSITIONS = int(os.getenv('MAX_POSITIONS', '5'))
    PUMP_THRESHOLD = float(os.getenv('PUMP_THRESHOLD', '5.0'))
    VOLUME_THRESHOLD = float(os.getenv('VOLUME_THRESHOLD', '200.0'))
    MIN_VOLUME_24H = float(os.getenv('MIN_VOLUME_24H', '1000000'))
    
    # Risk Management
    STOP_LOSS_PERCENTAGE = float(os.getenv('STOP_LOSS_PERCENTAGE', '3.0'))
    TAKE_PROFIT_PERCENTAGE = float(os.getenv('TAKE_PROFIT_PERCENTAGE', '10.0'))
    LEVERAGE = int(os.getenv('LEVERAGE', '3'))
    
    # Telegram Notifications
    TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN', '')
    TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')
    
    # Bot Settings
    SCAN_INTERVAL = int(os.getenv('SCAN_INTERVAL', '30'))  # seconds
    MAX_GAINERS_TO_ANALYZE = int(os.getenv('MAX_GAINERS_TO_ANALYZE', '10'))
    
    # Technical Indicators
    RSI_PERIOD = int(os.getenv('RSI_PERIOD', '14'))
    MACD_FAST = int(os.getenv('MACD_FAST', '12'))
    MACD_SLOW = int(os.getenv('MACD_SLOW', '26'))
    MACD_SIGNAL = int(os.getenv('MACD_SIGNAL', '9'))
    BB_PERIOD = int(os.getenv('BB_PERIOD', '20'))
    BB_STD = float(os.getenv('BB_STD', '2.0'))
    
    # Pump Detection Criteria
    MIN_PUMP_SCORE = int(os.getenv('MIN_PUMP_SCORE', '4'))
    VOLUME_SPIKE_MULTIPLIER = float(os.getenv('VOLUME_SPIKE_MULTIPLIER', '2.0'))
    PRICE_SPIKE_THRESHOLD = float(os.getenv('PRICE_SPIKE_THRESHOLD', '2.0'))
    
    @classmethod
    def validate(cls):
        """Kiểm tra cấu hình"""
        required_fields = [
            'BYBIT_API_KEY',
            'BYBIT_API_SECRET'
        ]
        
        missing_fields = []
        for field in required_fields:
            if not getattr(cls, field):
                missing_fields.append(field)
        
        if missing_fields:
            raise ValueError(f"Thiếu cấu hình: {', '.join(missing_fields)}")
        
        return True