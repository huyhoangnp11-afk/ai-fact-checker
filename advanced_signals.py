"""
Advanced Signal Detection Module
Các thuật toán nâng cao để phát hiện tín hiệu pump coin
"""

import pandas as pd
import numpy as np
import talib
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class AdvancedSignalDetector:
    """Bộ phát hiện tín hiệu nâng cao"""
    
    def __init__(self):
        self.signal_weights = {
            'volume_spike': 0.25,
            'price_momentum': 0.20,
            'technical_breakout': 0.20,
            'market_structure': 0.15,
            'volatility_expansion': 0.10,
            'order_flow': 0.10
        }
    
    def detect_volume_spike(self, df: pd.DataFrame) -> Dict:
        """Phát hiện volume spike"""
        try:
            # Tính volume moving averages
            df['volume_sma_5'] = talib.SMA(df['volume'], timeperiod=5)
            df['volume_sma_20'] = talib.SMA(df['volume'], timeperiod=20)
            df['volume_ema_10'] = talib.EMA(df['volume'], timeperiod=10)
            
            latest = df.iloc[-1]
            
            # Volume spike indicators
            volume_vs_sma5 = latest['volume'] / latest['volume_sma_5'] if latest['volume_sma_5'] > 0 else 0
            volume_vs_sma20 = latest['volume'] / latest['volume_sma_20'] if latest['volume_sma_20'] > 0 else 0
            volume_vs_ema10 = latest['volume'] / latest['volume_ema_10'] if latest['volume_ema_10'] > 0 else 0
            
            # Tính điểm volume spike
            volume_score = 0
            if volume_vs_sma5 > 3.0:
                volume_score += 2
            elif volume_vs_sma5 > 2.0:
                volume_score += 1
            
            if volume_vs_sma20 > 2.5:
                volume_score += 2
            elif volume_vs_sma20 > 1.5:
                volume_score += 1
            
            if volume_vs_ema10 > 2.0:
                volume_score += 1
            
            return {
                'score': min(volume_score, 5),
                'volume_vs_sma5': volume_vs_sma5,
                'volume_vs_sma20': volume_vs_sma20,
                'volume_vs_ema10': volume_vs_ema10,
                'is_spike': volume_vs_sma5 > 2.0
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect volume spike: {e}")
            return {'score': 0, 'is_spike': False}
    
    def detect_price_momentum(self, df: pd.DataFrame) -> Dict:
        """Phát hiện momentum giá"""
        try:
            # Tính các chỉ báo momentum
            df['rsi'] = talib.RSI(df['close'], timeperiod=14)
            df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
            df['stoch_k'], df['stoch_d'] = talib.STOCH(df['high'], df['low'], df['close'])
            df['williams_r'] = talib.WILLR(df['high'], df['low'], df['close'])
            
            # Tính rate of change
            df['roc'] = talib.ROC(df['close'], timeperiod=10)
            
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            momentum_score = 0
            
            # RSI momentum
            if latest['rsi'] > 50 and latest['rsi'] < 80:
                momentum_score += 1
            elif latest['rsi'] > 70:
                momentum_score += 0.5
            
            # MACD momentum
            if latest['macd'] > latest['macd_signal']:
                momentum_score += 1
            if latest['macd_hist'] > prev['macd_hist']:
                momentum_score += 1
            
            # Stochastic momentum
            if latest['stoch_k'] > latest['stoch_d'] and latest['stoch_k'] > 50:
                momentum_score += 1
            
            # Williams %R momentum
            if latest['williams_r'] > -50:
                momentum_score += 1
            
            # Rate of change
            if latest['roc'] > 2.0:
                momentum_score += 1
            
            return {
                'score': min(momentum_score, 5),
                'rsi': latest['rsi'],
                'macd': latest['macd'],
                'macd_signal': latest['macd_signal'],
                'stoch_k': latest['stoch_k'],
                'williams_r': latest['williams_r'],
                'roc': latest['roc']
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect price momentum: {e}")
            return {'score': 0}
    
    def detect_technical_breakout(self, df: pd.DataFrame) -> Dict:
        """Phát hiện breakout kỹ thuật"""
        try:
            # Bollinger Bands
            df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(df['close'])
            
            # Support/Resistance levels
            df['high_20'] = talib.MAX(df['high'], timeperiod=20)
            df['low_20'] = talib.MIN(df['low'], timeperiod=20)
            
            # Moving averages
            df['sma_20'] = talib.SMA(df['close'], timeperiod=20)
            df['ema_20'] = talib.EMA(df['close'], timeperiod=20)
            df['sma_50'] = talib.SMA(df['close'], timeperiod=50)
            
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            breakout_score = 0
            
            # Bollinger Band breakout
            if latest['close'] > latest['bb_upper']:
                breakout_score += 2
            elif latest['close'] > latest['bb_middle']:
                breakout_score += 1
            
            # Resistance breakout
            if latest['close'] > latest['high_20']:
                breakout_score += 2
            
            # Moving average breakout
            if latest['close'] > latest['sma_20'] and prev['close'] <= prev['sma_20']:
                breakout_score += 1
            
            if latest['close'] > latest['ema_20'] and prev['close'] <= prev['ema_20']:
                breakout_score += 1
            
            # Volume confirmation
            if latest['volume'] > latest['volume'].rolling(20).mean().iloc[-1] * 1.5:
                breakout_score += 1
            
            return {
                'score': min(breakout_score, 5),
                'bb_position': (latest['close'] - latest['bb_lower']) / (latest['bb_upper'] - latest['bb_lower']),
                'resistance_break': latest['close'] > latest['high_20'],
                'sma_break': latest['close'] > latest['sma_20'],
                'ema_break': latest['close'] > latest['ema_20']
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect technical breakout: {e}")
            return {'score': 0}
    
    def detect_market_structure(self, df: pd.DataFrame) -> Dict:
        """Phân tích cấu trúc thị trường"""
        try:
            # Tính các mức pivot
            df['pivot'] = (df['high'] + df['low'] + df['close']) / 3
            df['r1'] = 2 * df['pivot'] - df['low']
            df['s1'] = 2 * df['pivot'] - df['high']
            df['r2'] = df['pivot'] + (df['high'] - df['low'])
            df['s2'] = df['pivot'] - (df['high'] - df['low'])
            
            # Trend analysis
            df['adx'] = talib.ADX(df['high'], df['low'], df['close'], timeperiod=14)
            df['plus_di'] = talib.PLUS_DI(df['high'], df['low'], df['close'], timeperiod=14)
            df['minus_di'] = talib.MINUS_DI(df['high'], df['low'], df['close'], timeperiod=14)
            
            latest = df.iloc[-1]
            
            structure_score = 0
            
            # ADX strength
            if latest['adx'] > 25:
                structure_score += 1
            if latest['adx'] > 40:
                structure_score += 1
            
            # Directional movement
            if latest['plus_di'] > latest['minus_di']:
                structure_score += 1
            
            # Pivot level position
            if latest['close'] > latest['r1']:
                structure_score += 1
            elif latest['close'] > latest['pivot']:
                structure_score += 0.5
            
            # Higher highs and higher lows
            recent_highs = df['high'].tail(5)
            recent_lows = df['low'].tail(5)
            
            if len(recent_highs) >= 3:
                if recent_highs.iloc[-1] > recent_highs.iloc[-2] > recent_highs.iloc[-3]:
                    structure_score += 1
            
            if len(recent_lows) >= 3:
                if recent_lows.iloc[-1] > recent_lows.iloc[-2] > recent_lows.iloc[-3]:
                    structure_score += 1
            
            return {
                'score': min(structure_score, 5),
                'adx': latest['adx'],
                'plus_di': latest['plus_di'],
                'minus_di': latest['minus_di'],
                'trend_strength': latest['adx'],
                'trend_direction': 'bullish' if latest['plus_di'] > latest['minus_di'] else 'bearish'
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect market structure: {e}")
            return {'score': 0}
    
    def detect_volatility_expansion(self, df: pd.DataFrame) -> Dict:
        """Phát hiện mở rộng volatility"""
        try:
            # ATR (Average True Range)
            df['atr'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
            df['atr_sma'] = talib.SMA(df['atr'], timeperiod=20)
            
            # Volatility ratio
            df['volatility_ratio'] = df['atr'] / df['atr_sma']
            
            # Price range expansion
            df['daily_range'] = (df['high'] - df['low']) / df['close']
            df['range_sma'] = talib.SMA(df['daily_range'], timeperiod=20)
            df['range_ratio'] = df['daily_range'] / df['range_sma']
            
            latest = df.iloc[-1]
            
            volatility_score = 0
            
            # ATR expansion
            if latest['volatility_ratio'] > 1.5:
                volatility_score += 2
            elif latest['volatility_ratio'] > 1.2:
                volatility_score += 1
            
            # Daily range expansion
            if latest['range_ratio'] > 1.5:
                volatility_score += 2
            elif latest['range_ratio'] > 1.2:
                volatility_score += 1
            
            # Volume-volatility correlation
            if latest['volume'] > df['volume'].rolling(20).mean().iloc[-1] * 1.5:
                volatility_score += 1
            
            return {
                'score': min(volatility_score, 5),
                'atr': latest['atr'],
                'volatility_ratio': latest['volatility_ratio'],
                'range_ratio': latest['range_ratio'],
                'is_expanding': latest['volatility_ratio'] > 1.2
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect volatility expansion: {e}")
            return {'score': 0}
    
    def detect_order_flow(self, df: pd.DataFrame) -> Dict:
        """Phân tích order flow (giả lập)"""
        try:
            # Tính buying/selling pressure từ price action
            df['price_change'] = df['close'].pct_change()
            df['volume_change'] = df['volume'].pct_change()
            
            # On Balance Volume
            df['obv'] = talib.OBV(df['close'], df['volume'])
            df['obv_sma'] = talib.SMA(df['obv'], timeperiod=20)
            
            # Money Flow Index
            df['mfi'] = talib.MFI(df['high'], df['low'], df['close'], df['volume'], timeperiod=14)
            
            # Accumulation/Distribution
            df['ad'] = talib.AD(df['high'], df['low'], df['close'], df['volume'])
            
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            order_flow_score = 0
            
            # OBV trend
            if latest['obv'] > latest['obv_sma']:
                order_flow_score += 1
            
            # MFI buying pressure
            if latest['mfi'] > 50:
                order_flow_score += 1
            if latest['mfi'] > 70:
                order_flow_score += 1
            
            # AD trend
            if latest['ad'] > prev['ad']:
                order_flow_score += 1
            
            # Volume-price correlation
            if latest['price_change'] > 0 and latest['volume_change'] > 0:
                order_flow_score += 1
            
            return {
                'score': min(order_flow_score, 5),
                'obv': latest['obv'],
                'mfi': latest['mfi'],
                'ad': latest['ad'],
                'buying_pressure': latest['mfi'] > 50
            }
            
        except Exception as e:
            logger.error(f"Lỗi detect order flow: {e}")
            return {'score': 0}
    
    def calculate_composite_score(self, df: pd.DataFrame) -> Dict:
        """Tính điểm tổng hợp"""
        try:
            signals = {
                'volume_spike': self.detect_volume_spike(df),
                'price_momentum': self.detect_price_momentum(df),
                'technical_breakout': self.detect_technical_breakout(df),
                'market_structure': self.detect_market_structure(df),
                'volatility_expansion': self.detect_volatility_expansion(df),
                'order_flow': self.detect_order_flow(df)
            }
            
            # Tính điểm tổng hợp có trọng số
            composite_score = 0
            for signal_name, signal_data in signals.items():
                weight = self.signal_weights.get(signal_name, 0)
                score = signal_data.get('score', 0)
                composite_score += score * weight
            
            # Chuẩn hóa về thang điểm 0-10
            composite_score = composite_score * 2
            
            return {
                'composite_score': round(composite_score, 2),
                'signals': signals,
                'recommendation': self._get_recommendation(composite_score)
            }
            
        except Exception as e:
            logger.error(f"Lỗi tính composite score: {e}")
            return {'composite_score': 0, 'signals': {}, 'recommendation': 'HOLD'}
    
    def _get_recommendation(self, score: float) -> str:
        """Đưa ra khuyến nghị dựa trên điểm số"""
        if score >= 8.0:
            return 'STRONG_BUY'
        elif score >= 6.0:
            return 'BUY'
        elif score >= 4.0:
            return 'WEAK_BUY'
        elif score >= 2.0:
            return 'HOLD'
        else:
            return 'SELL'