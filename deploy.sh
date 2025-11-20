#!/bin/bash

# Real Estate CRM Deployment Script
# Server: 159.203.136.140
# Domain: realestatecrm.stackforgeit.com

set -e

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="/var/www/realestatecrm"
REPO_URL="YOUR_GITHUB_REPO_URL"  # Update this
DOMAIN="realestatecrm.stackforgeit.com"

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Create app directory
echo "📁 Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone or pull repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOL
DATABASE_URL="postgresql://doadmin:AVNS_KnKkxaC9ISU7o23wDmf@db-users-do-user-17695676-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require&schema=realestate_crm"
NEXTAUTH_SECRET="16Piw/jlgyoTHNr+ybpCpczCyejzjVtHWiS6KgxUyfk="
NEXTAUTH_URL="https://$DOMAIN"
NODE_ENV="production"
EOL

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Build application
echo "🔨 Building application..."
npm run build

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start/Restart application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete realestatecrm || true
pm2 start npm --name "realestatecrm" -- start
pm2 save
pm2 startup

# Install SSL certificate with Certbot
echo "🔒 Installing SSL certificate..."
if ! command -v certbot &> /dev/null; then
    sudo apt-get install -y certbot python3-certbot-nginx
fi
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email stephan.reese@gmail.com

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://$DOMAIN"
echo ""
echo "📊 Useful commands:"
echo "  pm2 logs realestatecrm    - View application logs"
echo "  pm2 restart realestatecrm - Restart the application"
echo "  pm2 status                - Check application status"
