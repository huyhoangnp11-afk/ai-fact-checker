#!/usr/bin/env python3
"""
Advanced Trading Bot with Proper Decimal Handling and Error Management
Addresses common issues like decimal precision, insufficient balance, and API errors
"""

import asyncio
import logging
import time
from decimal import Decimal, ROUND_DOWN, ROUND_UP
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import json
import hashlib
import hmac
import aiohttp
from datetime import datetime, timezone


class OrderType(Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP_LIMIT = "STOP_LIMIT"


class OrderSide(Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderStatus(Enum):
    NEW = "NEW"
    FILLED = "FILLED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    CANCELED = "CANCELED"
    REJECTED = "REJECTED"


@dataclass
class SymbolInfo:
    """Symbol information with precision requirements"""
    symbol: str
    base_asset: str
    quote_asset: str
    base_asset_precision: int
    quote_precision: int
    filters: Dict
    status: str


@dataclass
class Order:
    """Order structure"""
    symbol: str
    side: OrderSide
    type: OrderType
    quantity: Decimal
    price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None
    time_in_force: str = "GTC"
    order_id: Optional[str] = None
    status: OrderStatus = OrderStatus.NEW


@dataclass
class Balance:
    """Account balance information"""
    asset: str
    free: Decimal
    locked: Decimal
    
    @property
    def total(self) -> Decimal:
        return self.free + self.locked


class PrecisionHandler:
    """Handles decimal precision for different symbols"""
    
    def __init__(self):
        self.symbol_info_cache: Dict[str, SymbolInfo] = {}
    
    def round_quantity(self, symbol: str, quantity: Decimal) -> Decimal:
        """Round quantity to appropriate precision for the symbol"""
        if symbol not in self.symbol_info_cache:
            raise ValueError(f"Symbol {symbol} not found in cache")
        
        symbol_info = self.symbol_info_cache[symbol]
        precision = symbol_info.base_asset_precision
        
        # Round down to avoid exceeding precision
        multiplier = Decimal(10 ** precision)
        rounded = (quantity * multiplier).quantize(Decimal('1'), rounding=ROUND_DOWN)
        return rounded / multiplier
    
    def round_price(self, symbol: str, price: Decimal) -> Decimal:
        """Round price to appropriate precision for the symbol"""
        if symbol not in self.symbol_info_cache:
            raise ValueError(f"Symbol {symbol} not found in cache")
        
        symbol_info = self.symbol_info_cache[symbol]
        precision = symbol_info.quote_precision
        
        # Round to appropriate precision
        multiplier = Decimal(10 ** precision)
        rounded = (price * multiplier).quantize(Decimal('1'), rounding=ROUND_UP)
        return rounded / multiplier
    
    def validate_quantity(self, symbol: str, quantity: Decimal) -> bool:
        """Validate if quantity meets minimum requirements"""
        if symbol not in self.symbol_info_cache:
            return False
        
        symbol_info = self.symbol_info_cache[symbol]
        
        # Check minimum quantity from filters
        for filter_item in symbol_info.filters:
            if filter_item.get('filterType') == 'LOT_SIZE':
                min_qty = Decimal(filter_item.get('minQty', '0'))
                max_qty = Decimal(filter_item.get('maxQty', '999999999'))
                step_size = Decimal(filter_item.get('stepSize', '0'))
                
                if quantity < min_qty or quantity > max_qty:
                    return False
                
                # Check step size
                if step_size > 0:
                    remainder = quantity % step_size
                    if remainder != 0:
                        return False
        
        return True
    
    def update_symbol_info(self, symbol_info: SymbolInfo):
        """Update symbol information cache"""
        self.symbol_info_cache[symbol_info.symbol] = symbol_info


class BalanceManager:
    """Manages account balances and validates orders"""
    
    def __init__(self):
        self.balances: Dict[str, Balance] = {}
    
    def update_balance(self, asset: str, free: Decimal, locked: Decimal):
        """Update balance for an asset"""
        self.balances[asset] = Balance(asset, free, locked)
    
    def get_available_balance(self, asset: str) -> Decimal:
        """Get available balance for an asset"""
        return self.balances.get(asset, Balance(asset, Decimal('0'), Decimal('0'))).free
    
    def validate_order(self, order: Order, current_price: Decimal) -> Tuple[bool, str]:
        """Validate if order can be placed with current balance"""
        if order.side == OrderSide.BUY:
            quote_asset = order.symbol.split('USDT')[1] if 'USDT' in order.symbol else order.symbol.split('USDT')[0]
            if quote_asset == 'USDT':
                required_balance = order.quantity * (order.price or current_price)
                available = self.get_available_balance('USDT')
                
                if required_balance > available:
                    return False, f"Insufficient USDT balance. Required: {required_balance}, Available: {available}"
        else:  # SELL
            base_asset = order.symbol.replace('USDT', '')
            available = self.get_available_balance(base_asset)
            
            if order.quantity > available:
                return False, f"Insufficient {base_asset} balance. Required: {order.quantity}, Available: {available}"
        
        return True, "Order validated"


class TradingBot:
    """Main trading bot class with comprehensive error handling"""
    
    def __init__(self, api_key: str, api_secret: str, base_url: str = "https://api.bybit.com"):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url
        
        self.precision_handler = PrecisionHandler()
        self.balance_manager = BalanceManager()
        
        self.session: Optional[aiohttp.ClientSession] = None
        self.logger = self._setup_logger()
        
        # Retry configuration
        self.max_retries = 3
        self.retry_delay = 1.0
        self.timeout = 30
        
        # Order tracking
        self.active_orders: Dict[str, Order] = {}
        self.order_history: List[Order] = []
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('TradingBot')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def _generate_signature(self, params: str) -> str:
        """Generate API signature"""
        return hmac.new(
            self.api_secret.encode('utf-8'),
            params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    async def _make_request(self, method: str, endpoint: str, params: Dict = None, 
                          headers: Dict = None) -> Dict:
        """Make authenticated API request with retry logic"""
        if not self.session:
            raise RuntimeError("Bot not initialized. Use async context manager.")
        
        if params is None:
            params = {}
        
        if headers is None:
            headers = {}
        
        # Add timestamp
        timestamp = str(int(time.time() * 1000))
        params['timestamp'] = timestamp
        
        # Create query string
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        
        # Generate signature
        signature = self._generate_signature(query_string)
        params['signature'] = signature
        
        # Add API key to headers
        headers['X-BAPI-API-KEY'] = self.api_key
        
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                self.logger.info(f"Making {method} request to {endpoint} (attempt {attempt + 1})")
                
                async with self.session.request(
                    method, url, params=params, headers=headers
                ) as response:
                    data = await response.json()
                    
                    if response.status == 200:
                        if data.get('retCode') == 0:
                            return data
                        else:
                            error_msg = data.get('retMsg', 'Unknown error')
                            self.logger.error(f"API Error: {error_msg}")
                            
                            # Handle specific errors
                            if data.get('retCode') == 10001:
                                self.logger.warning("API Error (10001), retrying...")
                                await asyncio.sleep(self.retry_delay * (attempt + 1))
                                continue
                            elif data.get('retCode') == 170131:
                                raise InsufficientBalanceError(f"Insufficient balance: {error_msg}")
                            elif data.get('retCode') == 170137:
                                raise PrecisionError(f"Quantity precision error: {error_msg}")
                            else:
                                raise APIError(f"API Error {data.get('retCode')}: {error_msg}")
                    else:
                        self.logger.error(f"HTTP Error {response.status}: {data}")
                        if attempt < self.max_retries - 1:
                            await asyncio.sleep(self.retry_delay * (attempt + 1))
                            continue
                        else:
                            raise APIError(f"HTTP Error {response.status}")
                            
            except aiohttp.ClientError as e:
                self.logger.error(f"Network error: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue
                else:
                    raise APIError(f"Network error: {e}")
        
        raise APIError("Max retries exceeded")
    
    async def get_symbol_info(self, symbol: str) -> SymbolInfo:
        """Get symbol information including precision requirements"""
        endpoint = "/v5/market/instruments-info"
        params = {"category": "spot", "symbol": symbol}
        
        response = await self._make_request("GET", endpoint, params)
        
        if response['result']['list']:
            symbol_data = response['result']['list'][0]
            
            symbol_info = SymbolInfo(
                symbol=symbol_data['symbol'],
                base_asset=symbol_data['baseCoin'],
                quote_asset=symbol_data['quoteCoin'],
                base_asset_precision=int(symbol_data['lotSizeFilter']['basePrecision']),
                quote_precision=int(symbol_data['priceFilter']['tickSize'].count('0')),
                filters=symbol_data.get('filters', {}),
                status=symbol_data['status']
            )
            
            self.precision_handler.update_symbol_info(symbol_info)
            return symbol_info
        else:
            raise ValueError(f"Symbol {symbol} not found")
    
    async def get_account_balance(self) -> Dict[str, Balance]:
        """Get account balance"""
        endpoint = "/v5/account/wallet-balance"
        params = {"accountType": "UNIFIED"}
        
        response = await self._make_request("GET", endpoint, params)
        
        balances = {}
        for account in response['result']['list']:
            for coin in account['coin']:
                asset = coin['coin']
                free = Decimal(coin['free'])
                locked = Decimal(coin['locked'])
                balances[asset] = Balance(asset, free, locked)
                self.balance_manager.update_balance(asset, free, locked)
        
        return balances
    
    async def get_ticker_price(self, symbol: str) -> Decimal:
        """Get current ticker price"""
        endpoint = "/v5/market/tickers"
        params = {"category": "spot", "symbol": symbol}
        
        response = await self._make_request("GET", endpoint, params)
        
        if response['result']['list']:
            return Decimal(response['result']['list'][0]['lastPrice'])
        else:
            raise ValueError(f"No price data for {symbol}")
    
    async def place_order(self, order: Order) -> str:
        """Place an order with proper validation and precision handling"""
        try:
            # Get current price for validation
            current_price = await self.get_ticker_price(order.symbol)
            
            # Validate balance
            is_valid, error_msg = self.balance_manager.validate_order(order, current_price)
            if not is_valid:
                raise InsufficientBalanceError(error_msg)
            
            # Round quantities and prices to proper precision
            order.quantity = self.precision_handler.round_quantity(order.symbol, order.quantity)
            if order.price:
                order.price = self.precision_handler.round_price(order.symbol, order.price)
            
            # Validate quantity precision
            if not self.precision_handler.validate_quantity(order.symbol, order.quantity):
                raise PrecisionError(f"Invalid quantity precision for {order.symbol}")
            
            # Prepare order parameters
            endpoint = "/v5/order/create"
            params = {
                "category": "spot",
                "symbol": order.symbol,
                "side": order.side.value,
                "orderType": order.type.value,
                "qty": str(order.quantity),
                "timeInForce": order.time_in_force
            }
            
            if order.price:
                params["price"] = str(order.price)
            
            if order.stop_price:
                params["stopPrice"] = str(order.stop_price)
            
            self.logger.info(f"Placing {order.side.value} order for {order.quantity} {order.symbol} @ {order.price or 'MARKET'}")
            
            response = await self._make_request("POST", endpoint, params)
            
            order_id = response['result']['orderId']
            order.order_id = order_id
            self.active_orders[order_id] = order
            
            self.logger.info(f"✅ Order placed successfully. Order ID: {order_id}")
            return order_id
            
        except Exception as e:
            self.logger.error(f"❌ Failed to place order: {e}")
            raise
    
    async def cancel_order(self, order_id: str, symbol: str) -> bool:
        """Cancel an active order"""
        endpoint = "/v5/order/cancel"
        params = {
            "category": "spot",
            "symbol": symbol,
            "orderId": order_id
        }
        
        try:
            response = await self._make_request("POST", endpoint, params)
            
            if response['result']['orderId']:
                if order_id in self.active_orders:
                    del self.active_orders[order_id]
                self.logger.info(f"✅ Order {order_id} cancelled successfully")
                return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to cancel order {order_id}: {e}")
            return False
    
    async def get_order_status(self, order_id: str, symbol: str) -> OrderStatus:
        """Get order status"""
        endpoint = "/v5/order/realtime"
        params = {
            "category": "spot",
            "symbol": symbol,
            "orderId": order_id
        }
        
        response = await self._make_request("GET", endpoint, params)
        
        if response['result']['list']:
            order_data = response['result']['list'][0]
            status_str = order_data['orderStatus']
            
            status_mapping = {
                'New': OrderStatus.NEW,
                'Filled': OrderStatus.FILLED,
                'PartiallyFilled': OrderStatus.PARTIALLY_FILLED,
                'Cancelled': OrderStatus.CANCELED,
                'Rejected': OrderStatus.REJECTED
            }
            
            return status_mapping.get(status_str, OrderStatus.NEW)
        else:
            raise ValueError(f"Order {order_id} not found")
    
    async def create_oco_order(self, symbol: str, side: OrderSide, quantity: Decimal, 
                             limit_price: Decimal, stop_price: Decimal) -> Dict[str, str]:
        """Create OCO (One-Cancels-Other) order using fallback mechanism"""
        self.logger.info(f"Creating OCO order for {symbol} - {side.value} {quantity}")
        
        # Since spot OCO might not be supported, we'll implement a fallback mechanism
        # This creates a limit order and monitors it manually
        
        try:
            # Create the main limit order
            limit_order = Order(
                symbol=symbol,
                side=side,
                type=OrderType.LIMIT,
                quantity=quantity,
                price=limit_price
            )
            
            limit_order_id = await self.place_order(limit_order)
            
            # Store stop price for monitoring
            limit_order.stop_price = stop_price
            
            self.logger.info(f"✅ OCO fallback activated for {symbol}")
            self.logger.info(f"Limit order created: {limit_order_id}")
            
            return {
                "limit_order_id": limit_order_id,
                "status": "OCO_FALLBACK_ACTIVE"
            }
            
        except Exception as e:
            self.logger.error(f"❌ OCO fallback failed for {symbol}: {e}")
            raise
    
    async def monitor_oco_orders(self):
        """Monitor OCO orders and execute stop logic"""
        while True:
            try:
                for order_id, order in list(self.active_orders.items()):
                    if hasattr(order, 'stop_price') and order.stop_price:
                        current_price = await self.get_ticker_price(order.symbol)
                        
                        # Check if stop condition is met
                        if order.side == OrderSide.BUY and current_price <= order.stop_price:
                            self.logger.info(f"Stop condition met for {order.symbol}: {current_price} <= {order.stop_price}")
                            await self.cancel_order(order_id, order.symbol)
                        elif order.side == OrderSide.SELL and current_price >= order.stop_price:
                            self.logger.info(f"Stop condition met for {order.symbol}: {current_price} >= {order.stop_price}")
                            await self.cancel_order(order_id, order.symbol)
                
                await asyncio.sleep(1)  # Check every second
                
            except Exception as e:
                self.logger.error(f"Error in OCO monitoring: {e}")
                await asyncio.sleep(5)


class TradingBotError(Exception):
    """Base exception for trading bot errors"""
    pass


class InsufficientBalanceError(TradingBotError):
    """Raised when there's insufficient balance for an order"""
    pass


class PrecisionError(TradingBotError):
    """Raised when there's a precision error with quantities or prices"""
    pass


class APIError(TradingBotError):
    """Raised when there's an API error"""
    pass


# Example usage
async def main():
    """Example usage of the trading bot"""
    
    # Initialize bot (replace with your actual API credentials)
    async with TradingBot(
        api_key="your_api_key_here",
        api_secret="your_api_secret_here"
    ) as bot:
        
        try:
            # Get symbol information
            symbol_info = await bot.get_symbol_info("TOSHIUSDT")
            print(f"Symbol info: {symbol_info}")
            
            # Get account balance
            balances = await bot.get_account_balance()
            print(f"Account balances: {balances}")
            
            # Get current price
            current_price = await bot.get_ticker_price("TOSHIUSDT")
            print(f"Current TOSHIUSDT price: {current_price}")
            
            # Example: Create a small test order (uncomment to test)
            # order = Order(
            #     symbol="TOSHIUSDT",
            #     side=OrderSide.BUY,
            #     type=OrderType.MARKET,
            #     quantity=Decimal("10")  # Small test amount
            # )
            # order_id = await bot.place_order(order)
            # print(f"Order placed: {order_id}")
            
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())