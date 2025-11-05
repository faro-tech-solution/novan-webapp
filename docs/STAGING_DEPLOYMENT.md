# Staging and Production Deployment Guide

This guide explains how to configure and deploy both staging and production environments using GitHub Actions.

## 🌍 Environment Overview

The project supports two deployment environments:

1. **Staging** (`staging` branch)
   - Development mode (`NODE_ENV=development`)
   - Port: `3001`
   - Container: `novan-webapp-staging`
   - Uses staging environment variables

2. **Production** (`main` branch)
   - Production mode (`NODE_ENV=production`)
   - Port: `3000`
   - Container: `novan-webapp-prod`
   - Uses production environment variables

## 🔧 Configuration

### GitHub Secrets Setup

You need to configure separate secrets for staging and production environments in your GitHub repository.

#### Required Secrets for Both Environments:

**Production Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production Supabase anonymous key
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Production Turnstile site key
- `TURNSTILE_SECRET_KEY` - Production Turnstile secret key
- `DATABASE_URL` - Production database URL
- `SUPABASE_SERVICE_ROLE_KEY` - Production Supabase service role key

**Staging Secrets:**
- `STAGING_NEXT_PUBLIC_SUPABASE_URL` - Staging Supabase URL
- `STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY` - Staging Supabase anonymous key
- `STAGING_NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Staging Turnstile site key
- `STAGING_TURNSTILE_SECRET_KEY` - Staging Turnstile secret key
- `STAGING_DATABASE_URL` - Staging database URL
- `STAGING_SUPABASE_SERVICE_ROLE_KEY` - Staging Supabase service role key

**Shared Secrets:**
- `VPS_HOST` - Your VPS IP address or domain
- `VPS_USERNAME` - SSH username
- `VPS_SSH_KEY` - Private SSH key
- `VPS_PORT` - SSH port (default: 22, optional)

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed above

## 🚀 Deployment Workflow

### Automatic Deployment

The workflow automatically deploys based on the branch:

#### Staging Deployment
- **Trigger**: Push to `staging` branch
- **Environment**: Staging (development mode)
- **Port**: 3001
- **Container**: `novan-webapp-staging`

#### Production Deployment
- **Trigger**: Push to `main` or `master` branch
- **Environment**: Production
- **Port**: 3000
- **Container**: `novan-webapp-prod`

### Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Hostinger VPS** workflow
3. Click **Run workflow**
4. Choose environment: `staging` or `production`
5. Click **Run workflow**

## 📋 Deployment Process

### What Happens During Deployment

1. **Build Phase**
   - Checks out code
   - Determines environment (staging/production)
   - Builds Docker image with appropriate `NODE_ENV`
   - Tags image accordingly

2. **Transfer Phase**
   - Saves Docker image as artifact
   - Transfers image to VPS via SCP

3. **Deployment Phase**
   - Loads Docker image on VPS
   - Stops old container (if exists)
   - Starts new container with:
     - Appropriate environment variables
     - Correct port mapping
     - Proper container name

4. **Cleanup Phase**
   - Removes temporary files
   - Cleans up old Docker images

## 🔍 Verifying Deployment

### Check Staging Deployment

```bash
# SSH into VPS
ssh user@your-vps-ip

# Check staging container
docker ps | grep novan-webapp-staging

# View staging logs
docker logs novan-webapp-staging

# Check staging port
curl http://localhost:3001
```

### Check Production Deployment

```bash
# Check production container
docker ps | grep novan-webapp-prod

# View production logs
docker logs novan-webapp-prod

# Check production port
curl http://localhost:3000
```

## 🛠️ Local Testing

### Test Staging Build Locally

```bash
# Build staging image
docker build --build-arg NODE_ENV=development -t novan-webapp:staging .

# Run staging container
docker run -p 3001:3000 \
  --env-file .env.staging \
  novan-webapp:staging
```

### Test Production Build Locally

```bash
# Build production image
docker build --build-arg NODE_ENV=production -t novan-webapp:prod .

# Run production container
docker run -p 3000:3000 \
  --env-file .env.production \
  novan-webapp:prod
```

### Using Docker Compose

```bash
# Run staging environment
docker-compose -f docker-compose.staging.yml up -d

# Run production environment
docker-compose -f docker-compose.yml up -d
```

## 🔄 Branch Strategy

### Recommended Workflow

1. **Feature Development**
   - Create feature branch from `staging`
   - Develop and test locally
   - Push to feature branch

2. **Staging Deployment**
   - Merge feature branch to `staging`
   - Automatic deployment to staging environment
   - Test in staging environment

3. **Production Deployment**
   - Merge `staging` to `main`
   - Automatic deployment to production environment
   - Monitor production deployment

### Branch Protection (Recommended)

Set up branch protection rules in GitHub:

1. **Staging Branch**
   - Require pull request reviews
   - Require status checks to pass
   - Allow force pushes (optional)

2. **Main Branch**
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - No force pushes

## 🔧 Troubleshooting

### Staging Container Not Starting

```bash
# Check logs
docker logs novan-webapp-staging

# Verify environment variables
docker exec novan-webapp-staging env

# Check port availability
sudo netstat -tulpn | grep 3001
```

### Production Container Not Starting

```bash
# Check logs
docker logs novan-webapp-prod

# Verify environment variables
docker exec novan-webapp-prod env

# Check port availability
sudo netstat -tulpn | grep 3000
```

### Environment Variables Not Loading

- Verify secrets are correctly set in GitHub
- Check that secret names match exactly (case-sensitive)
- Ensure staging secrets have `STAGING_` prefix
- Verify VPS can access the secrets during deployment

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Stop conflicting containers
docker stop <container-name>
```

## 📊 Monitoring Both Environments

### View All Containers

```bash
docker ps -a | grep novan-webapp
```

### Monitor Resource Usage

```bash
# Staging
docker stats novan-webapp-staging

# Production
docker stats novan-webapp-prod
```

### View Logs

```bash
# Staging logs
docker logs -f novan-webapp-staging

# Production logs
docker logs -f novan-webapp-prod
```

## 🔐 Security Best Practices

1. **Separate Credentials**
   - Use different Supabase projects for staging and production
   - Use different database instances
   - Never share production secrets with staging

2. **Access Control**
   - Limit who can merge to `main` branch
   - Require code reviews for production deployments
   - Monitor deployment logs

3. **Environment Isolation**
   - Ensure staging and production are completely isolated
   - Use different ports to prevent conflicts
   - Use different container names

## 📚 Additional Resources

- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

