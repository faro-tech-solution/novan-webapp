# Docker Deployment Guide for Hostinger VPS

This guide explains how to deploy the Novan Webapp to a Hostinger VPS using Docker and GitHub Actions for automated deployments.

> **Note**: This project supports both staging and production deployments. For detailed information about staging/production workflow, see [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md).

## 📋 Prerequisites

1. **Hostinger VPS** with:
   - Ubuntu 20.04 or higher
   - Docker installed
   - SSH access configured
   - Port 3000 (production) and 3001 (staging) open in firewall

2. **GitHub Repository** with:
   - GitHub Actions enabled
   - Secrets configured (see below)

## 🚀 Setup Instructions

### 1. VPS Initial Setup

SSH into your Hostinger VPS and run the following commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

#### Required Secrets:
- `VPS_HOST`: Your VPS IP address or domain
- `VPS_USERNAME`: SSH username (usually `root` or `ubuntu`)
- `VPS_SSH_KEY`: Your private SSH key (the entire content of `~/.ssh/id_rsa` or similar)
- `VPS_PORT`: SSH port (default: 22, optional)

#### Environment Variables (for the application):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key
- `DATABASE_URL`: Database connection string
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

#### Optional (if using Docker Hub):
- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_TOKEN`: Your Docker Hub access token

### 3. Generate SSH Key for GitHub Actions

On your local machine or VPS:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key

# Copy public key to VPS authorized_keys
ssh-copy-id -i ~/.ssh/github_actions_key.pub user@your-vps-ip

# Display private key (copy this to GitHub Secrets as VPS_SSH_KEY)
cat ~/.ssh/github_actions_key
```

### 4. Configure Firewall

On your VPS:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow application port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 5. Set up Nginx Reverse Proxy (Recommended)

If you want to use a domain name and SSL:

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/novan-webapp
```

Add the following configuration:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/novan-webapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Set up SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## 🚢 Deployment Process

### Automated Deployment (via GitHub Actions)

1. Push to `main` or `master` branch
2. GitHub Actions will automatically:
   - Build the Docker image
   - Transfer it to your VPS
   - Stop the old container
   - Start the new container
   - Clean up old images

### Manual Deployment

If you need to deploy manually:

```bash
# On your local machine
docker build -t novan-webapp:latest .
docker save novan-webapp:latest | gzip > novan-webapp.tar.gz

# Transfer to VPS
scp novan-webapp.tar.gz user@your-vps-ip:/tmp/

# On VPS
ssh user@your-vps-ip
docker load < /tmp/novan-webapp.tar.gz
docker stop novan-webapp || true
docker rm novan-webapp || true
docker run -d \
  --name novan-webapp \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /opt/novan-webapp/.env \
  novan-webapp:latest
```

## 🔧 Management Commands

### View Logs
```bash
docker logs -f novan-webapp
```

### Stop Container
```bash
docker stop novan-webapp
```

### Start Container
```bash
docker start novan-webapp
```

### Restart Container
```bash
docker restart novan-webapp
```

### Update Environment Variables
```bash
# Edit .env file
nano /opt/novan-webapp/.env

# Restart container
docker restart novan-webapp
```

### Rollback to Previous Version
```bash
docker stop novan-webapp
docker rm novan-webapp
docker tag novan-webapp:old novan-webapp:latest
docker run -d \
  --name novan-webapp \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /opt/novan-webapp/.env \
  novan-webapp:latest
```

## 🔍 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs novan-webapp

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Check Docker status
docker ps -a
```

### Permission issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Build fails
- Check that `next.config.js` has `output: 'standalone'`
- Verify all dependencies are in `package.json`
- Check Docker build logs for specific errors

### Application not accessible
- Verify firewall rules: `sudo ufw status`
- Check if container is running: `docker ps`
- Verify port mapping: `docker port novan-webapp`
- Check Nginx configuration if using reverse proxy: `sudo nginx -t`

## 📝 Notes

- The application runs on port 3000 by default
- Environment variables are loaded from `/opt/novan-webapp/.env` on the VPS
- Old Docker images are automatically cleaned up to save space
- The deployment script automatically handles container restarts
- Health checks are configured in docker-compose.yml

## 🔒 Security Recommendations

1. **Use SSH keys instead of passwords**
2. **Keep Docker and system updated**: `sudo apt update && sudo apt upgrade`
3. **Use non-root user for Docker** (optional)
4. **Set up fail2ban** for SSH protection
5. **Regular backups** of your `.env` file and database
6. **Monitor logs** regularly for suspicious activity
7. **Use HTTPS** with SSL certificates

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)

