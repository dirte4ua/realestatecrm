# VPS Deployment Guide

## Server: 159.203.136.140
## Domain: realestatecrm.stackforgeit.com

### Initial Setup

1. **Push code to GitHub:**
   ```powershell
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Update deploy.sh with your GitHub repo URL:**
   - Edit `deploy.sh` line 11: `REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"`

3. **Copy deployment script to server:**
   ```powershell
   scp deploy.sh root@159.203.136.140:/root/
   ```

4. **SSH into server and run deployment:**
   ```powershell
   ssh root@159.203.136.140
   chmod +x /root/deploy.sh
   /root/deploy.sh
   ```

### What the Script Does

1. Installs Node.js 20.x
2. Installs PM2 (process manager)
3. Installs Nginx (reverse proxy)
4. Clones your repository to `/var/www/realestatecrm`
5. Sets up environment variables
6. Builds the Next.js app
7. Configures Nginx as reverse proxy
8. Starts app with PM2
9. Installs SSL certificate with Let's Encrypt

### Post-Deployment

**Check app status:**
```bash
pm2 status
pm2 logs realestatecrm
```

**View logs:**
```bash
pm2 logs realestatecrm --lines 100
```

**Restart app:**
```bash
pm2 restart realestatecrm
```

**Update app (pull latest changes):**
```bash
cd /var/www/realestatecrm
git pull origin main
npm install
npm run build
pm2 restart realestatecrm
```

### Nginx Commands

**Check config:**
```bash
sudo nginx -t
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate

The script automatically installs a Let's Encrypt SSL certificate.
It will auto-renew. To manually renew:
```bash
sudo certbot renew
```

### Firewall

Make sure ports 80 and 443 are open:
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Troubleshooting

**App not starting:**
- Check logs: `pm2 logs realestatecrm`
- Verify environment variables in `/var/www/realestatecrm/.env`
- Check Node.js version: `node -v` (should be 20.x)

**502 Bad Gateway:**
- Check if app is running: `pm2 status`
- Check Nginx config: `sudo nginx -t`
- View Nginx errors: `sudo tail -f /var/log/nginx/error.log`

**Database connection errors:**
- Verify DATABASE_URL in .env
- Check if DigitalOcean database allows connections from your VPS IP
- Add VPS IP to database trusted sources in DigitalOcean

### DNS Setup

Make sure your A record points to the server:
```
A    realestatecrm.stackforgeit.com    159.203.136.140
```

Wait 5-10 minutes for DNS propagation, then visit:
https://realestatecrm.stackforgeit.com
