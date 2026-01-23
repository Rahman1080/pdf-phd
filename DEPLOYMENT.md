# PDF Studio - VPS Server Deployment Guide

## 🚀 Quick Start (Hostinger VPS)

### Prerequisites
- Ubuntu 20.04+ VPS from Hostinger
- SSH access to your VPS
- A domain (optional, for SSL)

---

## Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 2: Run the Setup Script

Upload and run the setup script:

```bash
# Create project directory
mkdir -p /opt/pdf-studio
cd /opt/pdf-studio

# Download or copy the setup script
# Option A: Copy from your local machine
# scp setup-vps.sh root@YOUR_VPS_IP:/opt/pdf-studio/

# Make executable and run
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

Or install manually:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install LibreOffice (for Office → PDF)
apt install -y libreoffice-common libreoffice-writer libreoffice-calc libreoffice-impress --no-install-recommends

# Install Python and libraries (for PDF → Office)
apt install -y python3 python3-pip default-jre-headless
pip3 install pdf2docx tabula-py pandas openpyxl PyMuPDF python-pptx Pillow

# Install PM2
npm install -g pm2
```

---

## Step 3: Deploy the Server

```bash
cd /opt/pdf-studio

# Upload your server file (from your local machine)
# scp server-enhanced.js root@YOUR_VPS_IP:/opt/pdf-studio/

# Install dependencies
npm init -y
npm install express multer cors

# Start with PM2
pm2 start server-enhanced.js --name pdf-converter
pm2 save
pm2 startup
```

---

## Step 4: Configure Firewall

```bash
ufw allow 3001/tcp
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Step 5: Test the Server

```bash
curl http://localhost:3001
```

You should see:
```json
{
  "status": "OK",
  "version": "2.0.0",
  "platform": "linux",
  "dependencies": {
    "libreOffice": "LibreOffice 7.x.x",
    "python": "Python 3.x.x"
  }
}
```

---

## Step 6: Update Your Frontend

Edit `src/config/api.ts` in your PDF Studio project:

```typescript
// Set your Hostinger VPS IP
const VPS_URL = 'http://YOUR_VPS_IP:3001';

// Or if using a domain with SSL:
const VPS_URL = 'https://api.yourdomain.com';
```

---

## 🔒 Optional: Set Up SSL with NGINX

### Install NGINX and Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### Create NGINX Config

```bash
nano /etc/nginx/sites-available/pdf-studio
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }
}
```

### Enable and Get SSL

```bash
ln -s /etc/nginx/sites-available/pdf-studio /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
certbot --nginx -d api.yourdomain.com
```

---

## 📊 Server Management

### View Logs
```bash
pm2 logs pdf-converter
```

### Restart Server
```bash
pm2 restart pdf-converter
```

### Stop Server
```bash
pm2 stop pdf-converter
```

### Check Status
```bash
pm2 status
```

### Update Server Code
```bash
cd /opt/pdf-studio
# Upload new server-enhanced.js
pm2 restart pdf-converter
```

---

## 🔧 Troubleshooting

### LibreOffice Not Converting
```bash
# Check if LibreOffice is installed
libreoffice --version

# Test conversion manually
libreoffice --headless --convert-to pdf --outdir /tmp /path/to/test.docx
```

### Python Libraries Missing
```bash
# Check Python version
python3 --version

# Reinstall libraries
pip3 install pdf2docx tabula-py pandas openpyxl PyMuPDF python-pptx Pillow --force-reinstall
```

### Permission Issues
```bash
# Make sure temp directory is writable
chmod 755 /tmp/pdf-studio
```

### Port 3001 Not Accessible
```bash
# Check if server is running
pm2 status

# Check firewall
ufw status

# Check if port is listening
netstat -tlnp | grep 3001
```

---

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/convert` | POST | Office → PDF (LibreOffice) |
| `/convert-from-pdf` | POST | PDF → Office (Python) |
| `/extract-text-blocks` | POST | Extract text positions |

---

## 💰 Resource Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 core | 2 cores |
| Storage | 10 GB | 20 GB |
| Ubuntu | 20.04 | 22.04 |

---

## 🔗 Quick Reference

Your VPS API URL: `http://YOUR_VPS_IP:3001`

Test commands:
```bash
# Health check
curl http://YOUR_VPS_IP:3001

# Test Office to PDF
curl -X POST -F "file=@test.docx" http://YOUR_VPS_IP:3001/convert --output result.pdf

# Test PDF to Word
curl -X POST -F "file=@test.pdf" -F "format=docx" http://YOUR_VPS_IP:3001/convert-from-pdf --output result.docx
```
