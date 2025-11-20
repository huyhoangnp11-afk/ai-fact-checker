# 🚀 Hướng dẫn cài đặt chi tiết

## Phương án 1: Cài đặt trên Local (Recommended cho Development)

### Bước 1: Cài đặt Node.js
1. Tải Node.js từ: https://nodejs.org/ (khuyến nghị phiên bản LTS)
2. Kiểm tra cài đặt:
```bash
node --version  # Phải >= 14.0.0
npm --version
```

### Bước 2: Clone hoặc download project
```bash
# Nếu dùng Git:
git clone <repository-url>
cd ai-fact-checker

# Hoặc download ZIP và giải nén
```

### Bước 3: Cài đặt dependencies
```bash
npm install
```

Output mong đợi:
```
added 100+ packages in 10s
```

### Bước 4: Khởi động server
```bash
npm start
```

Output mong đợi:
```
╔═══════════════════════════════════════════════════════════════╗
║           🚀 Bybit Trading Bot - Server Started 🚀            ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:          3000                                          ║
║  Environment:   development                                   ║
║  API Base:      https://api.bybit.com                         ║
║  Status:        ✅ Running                                     ║
╚═══════════════════════════════════════════════════════════════╝
```

### Bước 5: Mở trình duyệt
Truy cập: `http://localhost:3000/app.html`

---

## Phương án 2: Deploy lên Cloud

### 2A. Deploy lên Heroku (Free tier available)

#### Yêu cầu:
- Tài khoản Heroku (đăng ký tại: https://heroku.com)
- Git đã được cài đặt

#### Các bước:

1. **Cài đặt Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (download từ)
https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login vào Heroku**
```bash
heroku login
```

3. **Tạo Heroku app**
```bash
heroku create your-trading-bot-name
```

4. **Deploy**
```bash
git push heroku main
```

5. **Mở app**
```bash
heroku open
```

Truy cập: `https://your-trading-bot-name.herokuapp.com/app.html`

### 2B. Deploy lên Railway (Recommended - Dễ hơn)

#### Các bước:

1. **Đăng ký Railway**: https://railway.app

2. **New Project** → **Deploy from GitHub repo**

3. **Chọn repository** của bạn

4. **Railway tự động detect** và deploy

5. **Nhấn vào URL** Railway cung cấp → Thêm `/app.html`

### 2C. Deploy lên Render (Free tier)

#### Các bước:

1. **Đăng ký Render**: https://render.com

2. **New** → **Web Service**

3. **Connect repository**

4. **Cấu hình**:
   - Name: `bybit-trading-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Create Web Service**

6. Truy cập URL được cung cấp + `/app.html`

---

## Phương án 3: Chạy trên VPS (Ubuntu)

### Yêu cầu:
- VPS Ubuntu 20.04+ (DigitalOcean, Linode, AWS EC2, etc.)
- SSH access

### Các bước:

1. **SSH vào VPS**
```bash
ssh user@your-vps-ip
```

2. **Cài đặt Node.js**
```bash
# Cài Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra
node --version
npm --version
```

3. **Clone project**
```bash
git clone <repository-url>
cd ai-fact-checker
```

4. **Cài đặt dependencies**
```bash
npm install
```

5. **Cài đặt PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

6. **Khởi động với PM2**
```bash
pm2 start server.js --name bybit-bot
pm2 save
pm2 startup
```

7. **Cài đặt Nginx (Optional - cho HTTPS)**
```bash
sudo apt install nginx
```

Tạo file `/etc/nginx/sites-available/trading-bot`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt:
```bash
sudo ln -s /etc/nginx/sites-available/trading-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Cài đặt SSL với Certbot (Optional)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Truy cập: `https://your-domain.com/app.html`

---

## Troubleshooting

### ❌ Lỗi: "Cannot find module 'express'"
```bash
# Chạy lại:
npm install
```

### ❌ Lỗi: "Port 3000 already in use"
```bash
# Tìm process đang dùng port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process hoặc đổi PORT trong .env:
PORT=3001
```

### ❌ Lỗi: "CORS policy"
- Đảm bảo server đang chạy
- Kiểm tra `API_URL` trong `app.html` đúng với server URL

### ❌ Lỗi: "WebSocket connection failed"
- Kiểm tra firewall
- Verify server hỗ trợ WebSocket
- Với Nginx, cần cấu hình proxy cho WebSocket

### ❌ Không kết nối được Bybit API
- Kiểm tra internet
- Verify Bybit API status: https://bybit-exchange.github.io/docs/
- Thử dùng VPN nếu bị chặn vùng địa lý

---

## Environment Variables (Advanced)

Tạo file `.env`:
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```bash
# Server
PORT=3000
NODE_ENV=production

# Bybit API (Optional - chỉ cho authenticated endpoints)
BYBIT_API_KEY=your_key
BYBIT_API_SECRET=your_secret

# Settings
USE_TESTNET=false
DEFAULT_SYMBOL=BTCUSDT
DEFAULT_TIMEFRAME=15
```

---

## Kiểm tra cài đặt thành công

### Test 1: Health check
```bash
curl http://localhost:3000/health
```

Expected output:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Bybit Trading Bot API"
}
```

### Test 2: Get market data
```bash
curl "http://localhost:3000/api/bybit/ticker?symbol=BTCUSDT"
```

Expected: JSON response với giá BTC hiện tại

### Test 3: Analyze strategy
```bash
curl -X POST http://localhost:3000/api/strategy/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","timeframe":"15"}'
```

Expected: JSON response với signals và indicators

---

## Cập nhật phiên bản mới

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install

# Restart server
pm2 restart bybit-bot  # Nếu dùng PM2
# hoặc
npm start
```

---

## Gỡ cài đặt

```bash
# Stop server
pm2 stop bybit-bot  # Nếu dùng PM2
pm2 delete bybit-bot

# Xóa project
cd ..
rm -rf ai-fact-checker

# Xóa dependencies global (optional)
npm uninstall -g pm2
```

---

**Cần hỗ trợ? Tạo issue tại repository! 🚀**
