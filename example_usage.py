#!/usr/bin/env python3
"""
Example usage of the Trading Bot
Demonstrates how to use the bot to fix common trading issues
"""

import asyncio
import json
import os
from decimal import Decimal
from trading_bot import TradingBot, Order, OrderSide, OrderType, InsufficientBalanceError, PrecisionError


async def fix_trading_issues_example():
    """
    Example showing how to fix the common trading issues:
    1. Order quantity has too many decimals (170137)
    2. Insufficient balance (170131)
    3. API Error (10001)
    """
    
    # Load configuration
    with open('config.json', 'r') as f:
        config = json.load(f)
    
    # Initialize bot
    async with TradingBot(
        api_key=config['api']['api_key'],
        api_secret=config['api']['api_secret'],
        base_url=config['api']['base_url']
    ) as bot:
        
        try:
            print("🔧 Fixing Trading Bot Issues...")
            print("=" * 50)
            
            # 1. Fix decimal precision issues
            print("\n1. 🔢 Fixing Decimal Precision Issues")
            print("-" * 40)
            
            symbol = "TOSHIUSDT"
            
            # Get symbol information to understand precision requirements
            symbol_info = await bot.get_symbol_info(symbol)
            print(f"Symbol: {symbol_info.symbol}")
            print(f"Base Asset Precision: {symbol_info.base_asset_precision}")
            print(f"Quote Precision: {symbol_info.quote_precision}")
            
            # Example of fixing precision issues
            raw_quantity = Decimal("123.456789012345678")  # Too many decimals
            
            # Fix precision automatically
            fixed_quantity = bot.precision_handler.round_quantity(symbol, raw_quantity)
            print(f"Raw quantity: {raw_quantity}")
            print(f"Fixed quantity: {fixed_quantity}")
            
            # Validate the fixed quantity
            is_valid = bot.precision_handler.validate_quantity(symbol, fixed_quantity)
            print(f"Quantity valid: {is_valid}")
            
            # 2. Fix insufficient balance issues
            print("\n2. 💰 Fixing Insufficient Balance Issues")
            print("-" * 40)
            
            # Get current balances
            balances = await bot.get_account_balance()
            print("Current balances:")
            for asset, balance in balances.items():
                if balance.free > 0:
                    print(f"  {asset}: {balance.free} (free), {balance.total} (total)")
            
            # Get current price
            current_price = await bot.get_ticker_price(symbol)
            print(f"\nCurrent {symbol} price: {current_price}")
            
            # Calculate maximum order size based on available balance
            usdt_balance = balances.get('USDT', bot.balance_manager.balances.get('USDT'))
            if usdt_balance and usdt_balance.free > 0:
                max_order_value = usdt_balance.free * Decimal('0.95')  # Use 95% of balance
                max_quantity = max_order_value / current_price
                max_quantity = bot.precision_handler.round_quantity(symbol, max_quantity)
                
                print(f"Maximum order size: {max_quantity} {symbol}")
                print(f"Order value: {max_quantity * current_price} USDT")
            
            # 3. Demonstrate proper order placement with validation
            print("\n3. ✅ Proper Order Placement with Validation")
            print("-" * 40)
            
            # Create a test order (small amount)
            test_quantity = Decimal("10")  # Small test amount
            test_quantity = bot.precision_handler.round_quantity(symbol, test_quantity)
            
            test_order = Order(
                symbol=symbol,
                side=OrderSide.BUY,
                type=OrderType.MARKET,
                quantity=test_quantity
            )
            
            # Validate the order before placing
            is_valid, error_msg = bot.balance_manager.validate_order(test_order, current_price)
            print(f"Order validation: {'✅ Valid' if is_valid else '❌ Invalid'}")
            if not is_valid:
                print(f"Validation error: {error_msg}")
            else:
                print("Order can be placed successfully")
                
                # Uncomment the next line to actually place the order (BE CAREFUL!)
                # order_id = await bot.place_order(test_order)
                # print(f"Order placed with ID: {order_id}")
            
            # 4. Demonstrate OCO order fallback
            print("\n4. 🎯 OCO Order Fallback Mechanism")
            print("-" * 40)
            
            # Example OCO order parameters
            oco_quantity = Decimal("100")
            oco_quantity = bot.precision_handler.round_quantity(symbol, oco_quantity)
            
            limit_price = current_price * Decimal('1.01')  # 1% above current price
            stop_price = current_price * Decimal('0.99')   # 1% below current price
            
            print(f"OCO Order parameters:")
            print(f"  Quantity: {oco_quantity}")
            print(f"  Limit Price: {limit_price}")
            print(f"  Stop Price: {stop_price}")
            
            # Uncomment to test OCO fallback
            # oco_result = await bot.create_oco_order(
            #     symbol=symbol,
            #     side=OrderSide.BUY,
            #     quantity=oco_quantity,
            #     limit_price=limit_price,
            #     stop_price=stop_price
            # )
            # print(f"OCO order created: {oco_result}")
            
            # 5. Error handling demonstration
            print("\n5. 🛡️ Error Handling Demonstration")
            print("-" * 40)
            
            # Demonstrate error handling for precision issues
            try:
                invalid_quantity = Decimal("123.4567890123456789")  # Too many decimals
                bot.precision_handler.round_quantity(symbol, invalid_quantity)
            except Exception as e:
                print(f"Precision error caught: {e}")
            
            # Demonstrate error handling for insufficient balance
            try:
                huge_order = Order(
                    symbol=symbol,
                    side=OrderSide.BUY,
                    type=OrderType.MARKET,
                    quantity=Decimal("999999999")  # Huge amount
                )
                
                is_valid, error_msg = bot.balance_manager.validate_order(huge_order, current_price)
                if not is_valid:
                    print(f"Insufficient balance error: {error_msg}")
                    
            except Exception as e:
                print(f"Balance error caught: {e}")
            
            print("\n✅ All trading issues have been addressed!")
            print("=" * 50)
            
        except Exception as e:
            print(f"❌ Error during execution: {e}")
            import traceback
            traceback.print_exc()


async def monitor_trading_session():
    """
    Example of monitoring a trading session with proper error handling
    """
    
    print("🔍 Starting Trading Session Monitor")
    print("=" * 40)
    
    # Load configuration
    with open('config.json', 'r') as f:
        config = json.load(f)
    
    async with TradingBot(
        api_key=config['api']['api_key'],
        api_secret=config['api']['api_secret'],
        base_url=config['api']['base_url']
    ) as bot:
        
        try:
            # Start OCO monitoring in background
            monitor_task = asyncio.create_task(bot.monitor_oco_orders())
            
            # Monitor active orders
            while True:
                try:
                    # Check active orders
                    if bot.active_orders:
                        print(f"Active orders: {len(bot.active_orders)}")
                        for order_id, order in bot.active_orders.items():
                            status = await bot.get_order_status(order_id, order.symbol)
                            print(f"  Order {order_id}: {status.value}")
                    
                    # Update balances
                    balances = await bot.get_account_balance()
                    usdt_balance = balances.get('USDT')
                    if usdt_balance:
                        print(f"USDT Balance: {usdt_balance.free} (free), {usdt_balance.total} (total)")
                    
                    await asyncio.sleep(10)  # Check every 10 seconds
                    
                except KeyboardInterrupt:
                    print("\n🛑 Stopping monitor...")
                    break
                except Exception as e:
                    print(f"Monitor error: {e}")
                    await asyncio.sleep(5)
            
            # Cancel monitoring task
            monitor_task.cancel()
            try:
                await monitor_task
            except asyncio.CancelledError:
                pass
                
        except Exception as e:
            print(f"❌ Monitor error: {e}")


if __name__ == "__main__":
    print("🚀 Trading Bot Issue Fixer")
    print("Choose an option:")
    print("1. Fix trading issues (demo)")
    print("2. Monitor trading session")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        asyncio.run(fix_trading_issues_example())
    elif choice == "2":
        asyncio.run(monitor_trading_session())
    else:
        print("Invalid choice. Running demo...")
        asyncio.run(fix_trading_issues_example())