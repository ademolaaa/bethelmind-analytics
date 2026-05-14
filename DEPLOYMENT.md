# Hostinger Deployment Configuration for Academic Writing Service

## Server Requirements
- Node.js 16+ (LTS recommended)
- NPM 8+ or Yarn 1.22+
- PM2 for process management
- Nginx for reverse proxy
- SSL Certificate (Let's Encrypt recommended)

## Environment Variables
Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Facebook Pixel Configuration
FACEBOOK_PIXEL_ID=your_facebook_pixel_id_here

# WhatsApp Bot Configuration
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_MAX_LEADS=1000

# Database Configuration (if using)
DATABASE_URL=your_database_url_here

# Security Configuration
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com

# Email Configuration (for notifications)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=your_email@yourdomain.com
EMAIL_PASS=your_email_password
```

## Deployment Steps

### 1. Server Setup
```bash
# Connect to your Hostinger VPS via SSH
ssh your-username@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Application Deployment
```bash
# Create application directory
mkdir -p /var/www/academic-writing-service
cd /var/www/academic-writing-service

# Clone your repository (or upload files)
git clone your-repository-url .

# Install dependencies
npm install

# Build the React application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'academic-writing-service',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/academic-writing-service
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Serve static files
    location / {
        root /var/www/academic-writing-service/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # WhatsApp bot endpoints
    location /whatsapp/ {
        proxy_pass http://localhost:3001/whatsapp/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Scraping endpoints
    location /scrape/ {
        proxy_pass http://localhost:3001/scrape/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/academic-writing-service /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 5. Performance Optimization
```bash
# Enable HTTP/2
sudo nano /etc/nginx/sites-available/academic-writing-service
```

Add `http2` to the listen directive:
```nginx
listen 443 ssl http2;
```

```bash
# Optimize Nginx worker processes
sudo nano /etc/nginx/nginx.conf
```

Update worker processes:
```nginx
worker_processes auto;
worker_connections 2048;
```

### 6. Database Setup (Optional)
If using PostgreSQL:
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
CREATE DATABASE academic_writing_db;
CREATE USER academic_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE academic_writing_db TO academic_user;
\q
```

### 7. Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Create monitoring script
cat > /var/www/academic-writing-service/monitor.sh << EOF
#!/bin/bash
# System monitoring script

echo "=== System Resources ==="
free -h
df -h
uptime

echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

echo "=== Recent Errors ==="
tail -20 /var/log/nginx/error.log
EOF

chmod +x /var/www/academic-writing-service/monitor.sh
```

## Post-Deployment Checklist

- [ ] Application is accessible at your domain
- [ ] SSL certificate is properly installed
- [ ] All API endpoints are working
- [ ] WhatsApp bot is functional
- [ ] Scraping system is operational
- [ ] Facebook Pixel is tracking correctly
- [ ] Dashboard is accessible and functional
- [ ] PM2 process is running
- [ ] Nginx is serving static files
- [ ] Error logs are clean
- [ ] Performance monitoring is active

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -ti:3001 | xargs sudo kill -9
   ```

2. **PM2 Process Won't Start**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

3. **Nginx Configuration Errors**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/academic-writing-service
   sudo chmod -R 755 /var/www/academic-writing-service
   ```

## Backup Strategy

```bash
# Create backup script
cat > /var/www/academic-writing-service/backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/academic-writing-service"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/academic-writing-service

# Backup database (if using)
# pg_dump academic_writing_db > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/academic-writing-service/backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /var/www/academic-writing-service/backup.sh" | sudo crontab -
```

## Performance Monitoring

Access monitoring dashboard:
- PM2: `pm2 monit`
- Nginx: Check `/var/log/nginx/access.log`
- Application: Check PM2 logs `pm2 logs academic-writing-service`

## Support

For deployment issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `./monitor.sh`
4. Restart services if needed: `pm2 restart all && sudo systemctl restart nginx`