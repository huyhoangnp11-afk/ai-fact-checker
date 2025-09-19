#!/usr/bin/env python3
"""
Setup script for Bybit Momentum Hunter
Tác giả: AI Assistant
Mô tả: Script cài đặt và cấu hình hệ thống
"""

import os
import sys
import json
import subprocess
import platform

def check_python_version():
    """Kiểm tra phiên bản Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Cần Python 3.8 hoặc cao hơn!")
        print(f"Phiên bản hiện tại: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_requirements():
    """Cài đặt requirements"""
    print("\n📦 Cài đặt dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Cài đặt dependencies thành công!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi cài đặt dependencies: {e}")
        return False

def install_talib():
    """Cài đặt TA-Lib"""
    print("\n📊 Cài đặt TA-Lib...")
    
    system = platform.system().lower()
    
    try:
        if system == "linux":
            # Ubuntu/Debian
            subprocess.check_call(["sudo", "apt-get", "update"])
            subprocess.check_call(["sudo", "apt-get", "install", "-y", "build-essential"])
            subprocess.check_call([sys.executable, "-m", "pip", "install", "TA-Lib"])
        elif system == "darwin":  # macOS
            subprocess.check_call(["brew", "install", "ta-lib"])
            subprocess.check_call([sys.executable, "-m", "pip", "install", "TA-Lib"])
        elif system == "windows":
            print("⚠️  Windows: Vui lòng tải TA-Lib wheel từ:")
            print("https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib")
            print("Sau đó chạy: pip install TA_Lib-0.4.24-cp38-cp38-win_amd64.whl")
            return True
        else:
            print(f"⚠️  Hệ điều hành {system} không được hỗ trợ tự động")
            return True
            
        print("✅ Cài đặt TA-Lib thành công!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi cài đặt TA-Lib: {e}")
        print("💡 Thử cài đặt thủ công:")
        print("pip install TA-Lib")
        return False
    except FileNotFoundError:
        print("⚠️  Không tìm thấy package manager")
        print("💡 Thử cài đặt thủ công:")
        print("pip install TA-Lib")
        return False

def create_config():
    """Tạo file config mẫu"""
    print("\n⚙️  Tạo file config...")
    
    config = {
        "bybit_api": {
            "api_key": "",
            "secret_key": "",
            "base_url": "https://api.bybit.com",
            "testnet": False
        },
        "trading_parameters": {
            "rsi_period": 14,
            "rsi_oversold": 30,
            "rsi_overbought": 70,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_signal": 9,
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
        },
        "notification": {
            "telegram_bot_token": "",
            "telegram_chat_id": "",
            "email_smtp_server": "",
            "email_username": "",
            "email_password": "",
            "email_recipients": []
        },
        "logging": {
            "level": "INFO",
            "file_path": "bybit_momentum_hunter.log",
            "max_file_size": 10485760,
            "backup_count": 5
        }
    }
    
    try:
        with open("my_config.json", "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print("✅ Tạo file config thành công: my_config.json")
        return True
    except Exception as e:
        print(f"❌ Lỗi tạo config: {e}")
        return False

def test_imports():
    """Kiểm tra import các module"""
    print("\n🧪 Kiểm tra imports...")
    
    modules = [
        "requests",
        "pandas", 
        "numpy",
        "talib",
        "aiohttp"
    ]
    
    failed = []
    
    for module in modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
            failed.append(module)
    
    if failed:
        print(f"\n❌ Các module thất bại: {', '.join(failed)}")
        return False
    
    print("✅ Tất cả modules import thành công!")
    return True

def test_bybit_connection():
    """Test kết nối Bybit API"""
    print("\n🌐 Test kết nối Bybit API...")
    
    try:
        import requests
        response = requests.get("https://api.bybit.com/v5/market/time", timeout=10)
        if response.status_code == 200:
            print("✅ Kết nối Bybit API thành công!")
            return True
        else:
            print(f"❌ Lỗi kết nối: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return False

def main():
    """Hàm main"""
    print("🚀 BYBIT MOMENTUM HUNTER - SETUP")
    print("="*50)
    
    # Kiểm tra Python version
    if not check_python_version():
        sys.exit(1)
    
    # Cài đặt requirements
    if not install_requirements():
        print("⚠️  Cài đặt requirements thất bại, tiếp tục...")
    
    # Cài đặt TA-Lib
    if not install_talib():
        print("⚠️  Cài đặt TA-Lib thất bại, tiếp tục...")
    
    # Tạo config
    if not create_config():
        print("❌ Không thể tạo config file!")
        sys.exit(1)
    
    # Test imports
    if not test_imports():
        print("⚠️  Một số modules chưa được cài đặt đúng!")
    
    # Test kết nối
    if not test_bybit_connection():
        print("⚠️  Không thể kết nối đến Bybit API!")
    
    print("\n" + "="*50)
    print("✅ SETUP HOÀN THÀNH!")
    print("="*50)
    
    print("\n📋 BƯỚC TIẾP THEO:")
    print("1. Chỉnh sửa file my_config.json")
    print("2. Thêm API keys vào config (nếu muốn dùng trading bot)")
    print("3. Chạy: python bybit_momentum_hunter.py")
    print("4. Hoặc chạy: python bybit_trading_bot.py (cần API keys)")
    
    print("\n⚠️  LƯU Ý:")
    print("- Bắt đầu với momentum hunter trước")
    print("- Test kỹ trước khi dùng trading bot")
    print("- Luôn quản lý rủi ro cẩn thận")
    
    print("\n🎯 CHÚC BẠN GIAO DỊCH THÀNH CÔNG!")

if __name__ == "__main__":
    main()