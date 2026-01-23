#!/bin/bash

# =========================================================
# PDF Studio Server - Hostinger VPS Setup Script
# =========================================================
# 
# HOW TO USE:
# 1. Upload this script to your VPS
# 2. Make it executable: chmod +x setup-vps.sh
# 3. Run as root: sudo ./setup-vps.sh
#
# This script will:
# - Install Node.js 18+
# - Install LibreOffice (for Office to PDF)
# - Install Python 3 and required libraries
# - Install PM2 for process management
# - Configure firewall
# - Set up the PDF conversion server
#
# =========================================================

set -e  # Exit on error

echo "==========================================================="
echo "PDF Studio Server - VPS Setup"
echo "==========================================================="

# Update system
echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "[2/7] Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install LibreOffice
echo "[3/7] Installing LibreOffice (headless)..."
apt install -y libreoffice-common libreoffice-writer libreoffice-calc libreoffice-impress --no-install-recommends

# Install Python 3 and pip
echo "[4/7] Installing Python 3 and pip..."
apt install -y python3 python3-pip python3-venv

# Install Python dependencies
echo "[5/7] Installing Python libraries for conversion..."
pip3 install --upgrade pip
pip3 install pdf2docx tabula-py pandas openpyxl PyMuPDF python-pptx Pillow

# Install Java (required for tabula-py)
echo "[5b/7] Installing Java (for tabula-py)..."
apt install -y default-jre-headless

# Install PM2
echo "[6/7] Installing PM2 for process management..."
npm install -g pm2

# Configure firewall
echo "[7/7] Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 3001/tcp
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "y" | ufw enable || true
fi

echo ""
echo "==========================================================="
echo "SETUP COMPLETE!"
echo "==========================================================="
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Upload your project files to the VPS:"
echo "   scp -r ./server-enhanced.js ./package.json root@YOUR_VPS_IP:/opt/pdf-studio/"
echo ""
echo "2. Navigate to project directory:"
echo "   cd /opt/pdf-studio"
echo ""
echo "3. Install Node dependencies:"
echo "   npm install express multer cors"
echo ""
echo "4. Start the server with PM2:"
echo "   pm2 start server-enhanced.js --name pdf-converter"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. Test the server:"
echo "   curl http://localhost:3001"
echo ""
echo "6. Your API will be available at:"
echo "   http://YOUR_VPS_IP:3001"
echo ""
echo "==========================================================="
echo ""
echo "OPTIONAL - Set up NGINX for SSL:"
echo ""
echo "apt install -y nginx certbot python3-certbot-nginx"
echo "certbot --nginx -d api.yourdomain.com"
echo ""
echo "Then add to /etc/nginx/sites-available/pdf-studio:"
echo ""
echo "server {"
echo "    listen 443 ssl;"
echo "    server_name api.yourdomain.com;"
echo "    "
echo "    location / {"
echo "        proxy_pass http://localhost:3001;"
echo "        proxy_http_version 1.1;"
echo "        proxy_set_header Host \$host;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "        client_max_body_size 100M;"
echo "    }"
echo "}"
echo ""
echo "==========================================================="
