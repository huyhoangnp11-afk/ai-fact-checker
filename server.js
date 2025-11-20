/**
 * Bybit Trading Bot - Backend Proxy Server
 * Giải quyết vấn đề CORS và xử lý API calls
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Bybit API Configuration
const BYBIT_API_BASE = 'https://api.bybit.com';
const BYBIT_API_TESTNET = 'https://api-testnet.bybit.com';

// WebSocket URLs
const WS_PUBLIC_MAINNET = 'wss://stream.bybit.com/v5/public/linear';
const WS_PUBLIC_TESTNET = 'wss://stream-testnet.bybit.com/v5/public/linear';

// === CORS Proxy Endpoint ===
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', data, headers } = req.body;

    const response = await axios({
      url,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// === Bybit Public API Endpoints ===

// Get market data (klines/candlesticks)
app.get('/api/bybit/klines', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', interval = '15', limit = 200 } = req.query;

    const response = await axios.get(`${BYBIT_API_BASE}/v5/market/kline`, {
      params: {
        category: 'linear',
        symbol,
        interval,
        limit
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Klines error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get ticker info
app.get('/api/bybit/ticker', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT' } = req.query;

    const response = await axios.get(`${BYBIT_API_BASE}/v5/market/tickers`, {
      params: {
        category: 'linear',
        symbol
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Ticker error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get orderbook
app.get('/api/bybit/orderbook', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', limit = 25 } = req.query;

    const response = await axios.get(`${BYBIT_API_BASE}/v5/market/orderbook`, {
      params: {
        category: 'linear',
        symbol,
        limit
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Orderbook error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get instruments info
app.get('/api/bybit/instruments', async (req, res) => {
  try {
    const { symbol } = req.query;

    const response = await axios.get(`${BYBIT_API_BASE}/v5/market/instruments-info`, {
      params: {
        category: 'linear',
        symbol
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Instruments error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get recent trades
app.get('/api/bybit/trades', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', limit = 50 } = req.query;

    const response = await axios.get(`${BYBIT_API_BASE}/v5/market/recent-trade`, {
      params: {
        category: 'linear',
        symbol,
        limit
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Trades error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// === Technical Analysis Endpoints ===

// Calculate indicators
app.post('/api/indicators/calculate', async (req, res) => {
  try {
    const { prices, indicators = ['RSI', 'MACD', 'EMA', 'BB'] } = req.body;

    if (!prices || !Array.isArray(prices)) {
      return res.status(400).json({ error: 'Prices array is required' });
    }

    const results = {};

    // RSI
    if (indicators.includes('RSI')) {
      results.RSI = calculateRSI(prices, 14);
    }

    // MACD
    if (indicators.includes('MACD')) {
      results.MACD = calculateMACD(prices);
    }

    // EMA
    if (indicators.includes('EMA')) {
      results.EMA = {
        ema9: calculateEMA(prices, 9),
        ema21: calculateEMA(prices, 21),
        ema50: calculateEMA(prices, 50),
        ema200: calculateEMA(prices, 200)
      };
    }

    // Bollinger Bands
    if (indicators.includes('BB')) {
      results.BB = calculateBollingerBands(prices, 20, 2);
    }

    res.json(results);
  } catch (error) {
    console.error('Indicator calculation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// === Technical Indicators Functions ===

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  // First average
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiValues = [];

  // Calculate RSI for each point
  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];

    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  return {
    current: rsiValues[rsiValues.length - 1],
    values: rsiValues,
    signal: rsiValues[rsiValues.length - 1] > 70 ? 'OVERBOUGHT' :
            rsiValues[rsiValues.length - 1] < 30 ? 'OVERSOLD' : 'NEUTRAL'
  };
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  const emaValues = [ema];

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaValues.push(ema);
  }

  return {
    current: emaValues[emaValues.length - 1],
    values: emaValues
  };
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (prices.length < slowPeriod) return null;

  const fastEMA = calculateEMA(prices, fastPeriod).values;
  const slowEMA = calculateEMA(prices, slowPeriod).values;

  const macdLine = [];
  for (let i = 0; i < fastEMA.length; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod).values;
  const histogram = [];

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
  }

  const currentHistogram = histogram[histogram.length - 1];
  const prevHistogram = histogram[histogram.length - 2];

  return {
    macd: macdLine[macdLine.length - 1],
    signal: signalLine[signalLine.length - 1],
    histogram: currentHistogram,
    trend: currentHistogram > 0 ? 'BULLISH' : 'BEARISH',
    crossover: (prevHistogram < 0 && currentHistogram > 0) ? 'BULLISH_CROSS' :
               (prevHistogram > 0 && currentHistogram < 0) ? 'BEARISH_CROSS' : 'NONE'
  };
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;

  const sma = prices.slice(-period).reduce((a, b) => a + b) / period;

  const squaredDiffs = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = sma + (standardDeviation * stdDev);
  const lower = sma - (standardDeviation * stdDev);
  const currentPrice = prices[prices.length - 1];

  const position = ((currentPrice - lower) / (upper - lower)) * 100;

  return {
    upper,
    middle: sma,
    lower,
    currentPrice,
    position,
    signal: position > 80 ? 'OVERBOUGHT' : position < 20 ? 'OVERSOLD' : 'NEUTRAL'
  };
}

// === Trading Strategy Engine ===

app.post('/api/strategy/analyze', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', timeframe = '15', strategies = ['ALL'] } = req.body;

    // Fetch market data
    const klinesResponse = await axios.get(`${BYBIT_API_BASE}/v5/market/kline`, {
      params: {
        category: 'linear',
        symbol,
        interval: timeframe,
        limit: 200
      }
    });

    const klines = klinesResponse.data.result.list.reverse();
    const closes = klines.map(k => parseFloat(k[4]));
    const highs = klines.map(k => parseFloat(k[2]));
    const lows = klines.map(k => parseFloat(k[3]));
    const volumes = klines.map(k => parseFloat(k[5]));

    // Calculate indicators
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);
    const ema50 = calculateEMA(closes, 50);
    const ema200 = calculateEMA(closes, 200);
    const bb = calculateBollingerBands(closes, 20, 2);

    // Analyze strategies
    const signals = [];

    // Strategy 1: EMA + RSI
    if (strategies.includes('ALL') || strategies.includes('EMA_RSI')) {
      const currentPrice = closes[closes.length - 1];
      const ema50Value = ema50.current;
      const ema200Value = ema200.current;

      let signal = 'NEUTRAL';
      let confidence = 0;

      if (currentPrice > ema50Value && ema50Value > ema200Value && rsi.current < 70 && rsi.current > 40) {
        signal = 'LONG';
        confidence = 70 + (60 - rsi.current) * 0.5;
      } else if (currentPrice < ema50Value && ema50Value < ema200Value && rsi.current > 30 && rsi.current < 60) {
        signal = 'SHORT';
        confidence = 70 + (rsi.current - 40) * 0.5;
      }

      signals.push({
        strategy: 'EMA_RSI',
        signal,
        confidence: Math.min(confidence, 95),
        indicators: {
          price: currentPrice,
          ema50: ema50Value,
          ema200: ema200Value,
          rsi: rsi.current
        }
      });
    }

    // Strategy 2: MACD + Bollinger Bands
    if (strategies.includes('ALL') || strategies.includes('MACD_BB')) {
      let signal = 'NEUTRAL';
      let confidence = 0;

      if (macd.crossover === 'BULLISH_CROSS' && bb.position < 30) {
        signal = 'LONG';
        confidence = 85;
      } else if (macd.crossover === 'BEARISH_CROSS' && bb.position > 70) {
        signal = 'SHORT';
        confidence = 85;
      } else if (macd.trend === 'BULLISH' && bb.position < 40) {
        signal = 'LONG';
        confidence = 65;
      } else if (macd.trend === 'BEARISH' && bb.position > 60) {
        signal = 'SHORT';
        confidence = 65;
      }

      signals.push({
        strategy: 'MACD_BB',
        signal,
        confidence: Math.min(confidence, 95),
        indicators: {
          macd: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          bbPosition: bb.position
        }
      });
    }

    // Strategy 3: Multi-timeframe trend
    if (strategies.includes('ALL') || strategies.includes('MULTI_TF')) {
      const currentPrice = closes[closes.length - 1];
      const ema50Value = ema50.current;

      let signal = 'NEUTRAL';
      let confidence = 0;

      if (currentPrice > ema50Value && macd.trend === 'BULLISH' && rsi.current > 50 && rsi.current < 70) {
        signal = 'LONG';
        confidence = 75;
      } else if (currentPrice < ema50Value && macd.trend === 'BEARISH' && rsi.current < 50 && rsi.current > 30) {
        signal = 'SHORT';
        confidence = 75;
      }

      signals.push({
        strategy: 'MULTI_TF',
        signal,
        confidence: Math.min(confidence, 95),
        indicators: {
          price: currentPrice,
          ema50: ema50Value,
          macdTrend: macd.trend,
          rsi: rsi.current
        }
      });
    }

    // Get best signal
    const bestSignal = signals.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    , signals[0]);

    res.json({
      symbol,
      timeframe,
      timestamp: Date.now(),
      currentPrice: closes[closes.length - 1],
      signals,
      bestSignal,
      marketIndicators: {
        rsi,
        macd,
        ema50: ema50.current,
        ema200: ema200.current,
        bollingerBands: bb
      }
    });

  } catch (error) {
    console.error('Strategy analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// === Health Check ===
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Bybit Trading Bot API'
  });
});

// === Start Server ===
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           🚀 Bybit Trading Bot - Server Started 🚀            ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:          ${PORT}                                           ║
║  Environment:   ${process.env.NODE_ENV || 'development'}                              ║
║  API Base:      ${BYBIT_API_BASE}                  ║
║  Status:        ✅ Running                                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                         ║
║  • GET  /health                                               ║
║  • GET  /api/bybit/klines                                     ║
║  • GET  /api/bybit/ticker                                     ║
║  • GET  /api/bybit/orderbook                                  ║
║  • GET  /api/bybit/instruments                                ║
║  • GET  /api/bybit/trades                                     ║
║  • POST /api/indicators/calculate                             ║
║  • POST /api/strategy/analyze                                 ║
║  • POST /api/proxy                                            ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// === WebSocket Server for Real-time Data ===
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket client connected');

  let bybitWs = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.action === 'subscribe') {
        const { symbol = 'BTCUSDT', channels = ['kline.15'] } = data;

        // Connect to Bybit WebSocket
        bybitWs = new WebSocket(WS_PUBLIC_MAINNET);

        bybitWs.on('open', () => {
          // Subscribe to channels
          channels.forEach(channel => {
            const subscribeMsg = {
              op: 'subscribe',
              args: [`${channel}.${symbol}`]
            };
            bybitWs.send(JSON.stringify(subscribeMsg));
          });

          ws.send(JSON.stringify({ status: 'subscribed', symbol, channels }));
        });

        bybitWs.on('message', (bybitData) => {
          // Forward Bybit data to client
          ws.send(bybitData.toString());
        });

        bybitWs.on('error', (error) => {
          console.error('Bybit WebSocket error:', error.message);
          ws.send(JSON.stringify({ error: 'Bybit WebSocket error', message: error.message }));
        });
      }

      if (data.action === 'unsubscribe') {
        if (bybitWs) {
          bybitWs.close();
          bybitWs = null;
        }
        ws.send(JSON.stringify({ status: 'unsubscribed' }));
      }

    } catch (error) {
      console.error('WebSocket message error:', error.message);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    if (bybitWs) {
      bybitWs.close();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
