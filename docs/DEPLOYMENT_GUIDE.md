# Deployment Guide

## 🚀 Overview

The Novan Webapp now ships as a containerized Next.js application. Production images are built with the repository `Dockerfile`, and automated builds run through GitHub Actions. This document walks through the workflow end to end—from configuring Supabase to shipping a Docker image.

## 🌍 Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Development (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_dev_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_dev_anon_key
NODE_ENV=development
```

#### Production (`.env.production`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_prod_anon_key
NODE_ENV=production
```

Keep secrets out of source control—use repository/environment secrets in CI and your container platform.

### Supabase Configuration

1. **Create Production Project**
   - Provision a Supabase project for production.
   - Configure authentication, storage, and database settings.
2. **Apply Migrations**
   ```bash
   # Apply all migrations to production database
   sudo yarn migrate:sync
   ```
3. **Environment Variables**
   - Copy the production Supabase URL and anon key.
   - Update the `.env.production` file or GitHub Actions secrets.

## 📦 Docker Build Process

### Local Build Testing

The production image is defined in the root `Dockerfile` using a multi-stage build with a hardened runtime (non-root user, standalone Next.js output).

```bash
# Build the production image
docker build -t novan-webapp:latest .

# Run the container locally
docker run --rm -p 3000:3000 --env-file .env.production novan-webapp:latest
```

### Using Docker Compose

A lightweight `docker-compose.yml` is provided to mirror the production image locally:

```bash
docker compose up --build app
```

By default it builds the `app` service image (`novan-webapp-app:latest`) and loads `.env.production`. Override with `--env-file` or by editing the compose file for your environment.

### Build Optimization

The Dockerfile bakes in recommended optimizations:
- **Multi-stage builds** to keep the runtime image lean.
- **Next.js standalone output** for a minimal runtime dependency graph.
- **Non-root runtime user** for tighter security.
- **Layer caching** through dependency/install/build separation.

## 🔄 Continuous Integration & Delivery

### Workflow Overview

GitHub Actions builds and tests the container image on each push and pull request. Successful builds can be pushed to a registry (GHCR, Docker Hub, AWS ECR, etc.) by extending the provided workflow.

### Secrets

Add the following secrets in the repository settings as needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Registry credentials (`GHCR_TOKEN`, `AWS_ACCESS_KEY_ID`, etc.) if you publish images.

### Manual Deployment

Deploy the image to your hosting provider of choice (ECS, Fly.io, Render, Kubernetes, etc.). Each platform will want the image URI and environment variables from the previous sections.

## 🧪 Testing Deployment

### Pre-Deployment Checklist

- [ ] All automated checks pass.
- [ ] `docker build` succeeds locally.
- [ ] Environment variables configured for the target environment.
- [ ] Database migrations applied.
- [ ] Supabase production environment verified.

### Post-Deployment Verification

1. **Functionality Testing**
   - Verify authentication flows and database operations.
   - Test API routes exposed by Next.js.
2. **Performance Testing**
   - Validate page load times and caching behaviour.
3. **Security Testing**
   - Confirm HTTPS, headers, and IAM settings on the host platform.

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Inspect local build output
docker build -t novan-webapp:debug .

# Start a shell in the builder stage for debugging
docker build --target builder -t novan-webapp:builder .
docker run -it novan-webapp:builder /bin/bash
```

#### Environment Variables
- Confirm the correct `.env` file or GitHub secret is being used.
- Avoid trailing spaces and ensure quoting rules match the host platform.

#### Database Connectivity
- Validate Supabase credentials.
- Confirm migrations ran successfully.
- Check outbound network rules from your hosting provider.

### Rollback Strategy

1. **Container Rollback**
   - Re-deploy a previous image tag.
   - Roll back Git tags or branches if necessary.
2. **Database Rollback**
   - Revert migrations or restore from a snapshot.
   - Coordinate changes across application and database layers.

## 📊 Monitoring and Analytics

- Track Core Web Vitals using your preferred monitoring stack.
- Enable application logging (stdout/stderr) and ship logs to a centralized service.
- Configure alerting around error rates, latency, and deployment outcomes.

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Supabase Production Guide](https://supabase.com/docs)


