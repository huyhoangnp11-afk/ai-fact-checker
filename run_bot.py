#!/usr/bin/env python3
"""
Script chạy Bybit Pump Hunter Bot với cấu hình từ file .env
"""

import sys
import os
from bybit_pump_hunter import BybitPumpHunter, TradingConfig
from config import Config
import logging

def setup_logging():
    """Thiết lập logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('bybit_pump_hunter.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

def main():
    """Hàm main"""
    try:
        # Thiết lập logging
        setup_logging()
        logger = logging.getLogger(__name__)
        
        logger.info("🚀 Khởi động Bybit Pump Hunter Bot")
        
        # Validate cấu hình
        try:
            Config.validate()
            logger.info("✅ Cấu hình hợp lệ")
        except ValueError as e:
            logger.error(f"❌ Lỗi cấu hình: {e}")
            logger.error("Vui lòng kiểm tra file .env")
            return
        
        # Tạo TradingConfig từ Config
        trading_config = TradingConfig(
            api_key=Config.BYBIT_API_KEY,
            api_secret=Config.BYBIT_API_SECRET,
            testnet=Config.BYBIT_TESTNET,
            risk_percentage=Config.RISK_PERCENTAGE,
            max_positions=Config.MAX_POSITIONS,
            pump_threshold=Config.PUMP_THRESHOLD,
            volume_threshold=Config.VOLUME_THRESHOLD,
            min_volume_24h=Config.MIN_VOLUME_24H,
            stop_loss_percentage=Config.STOP_LOSS_PERCENTAGE,
            take_profit_percentage=Config.TAKE_PROFIT_PERCENTAGE,
            leverage=Config.LEVERAGE,
            telegram_token=Config.TELEGRAM_TOKEN,
            telegram_chat_id=Config.TELEGRAM_CHAT_ID
        )
        
        # Hiển thị cấu hình
        logger.info("📋 Cấu hình bot:")
        logger.info(f"  - Testnet: {trading_config.testnet}")
        logger.info(f"  - Risk per trade: {trading_config.risk_percentage}%")
        logger.info(f"  - Max positions: {trading_config.max_positions}")
        logger.info(f"  - Pump threshold: {trading_config.pump_threshold}%")
        logger.info(f"  - Stop loss: {trading_config.stop_loss_percentage}%")
        logger.info(f"  - Take profit: {trading_config.take_profit_percentage}%")
        logger.info(f"  - Leverage: {trading_config.leverage}x")
        
        # Khởi tạo và chạy bot
        bot = BybitPumpHunter(trading_config)
        
        # Gửi thông báo khởi động
        bot.send_telegram_message("🚀 Bybit Pump Hunter Bot đã khởi động!")
        
        # Chạy bot
        bot.run_pump_hunter()
        
    except KeyboardInterrupt:
        logger.info("⏹️ Dừng bot theo yêu cầu người dùng")
    except Exception as e:
        logger.error(f"❌ Lỗi không mong muốn: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()