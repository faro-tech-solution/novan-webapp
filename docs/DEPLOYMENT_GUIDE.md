# Deployment Guide

## 🚀 Overview

The Novan Webapp is a Next.js application. This document walks through the workflow end to end—from configuring Supabase to preparing a production build ready to deploy on your hosting platform.

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

## 📦 Build Process

### Local Build Testing

Generate a production build locally to verify the application before deploying:

```bash
sudo yarn install --frozen-lockfile
sudo yarn build
sudo yarn start
```

### Build Optimization

Recommended practices:
- **Environment parity** between staging and production to avoid surprises.
- **Static asset caching** via your hosting provider or CDN.
- **CI builds** that run tests and produce deployment artifacts.

## 🔄 Continuous Integration & Delivery

### Workflow Overview

GitHub Actions builds and tests the application on each push and pull request. Successful builds can be deployed to your runtime (Vercel, Netlify, AWS, etc.) by extending the provided workflow.

### Secrets

Add the following secrets in the repository settings as needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Registry credentials (`GHCR_TOKEN`, `AWS_ACCESS_KEY_ID`, etc.) if you publish images.

### Manual Deployment

Deploy the build output to your hosting provider of choice (Vercel, Netlify, Fly.io, Render, custom Node host, etc.). Each platform will want the environment variables from the previous sections.

## 🧪 Testing Deployment

### Pre-Deployment Checklist

- [ ] All automated checks pass.
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
- Inspect local build output from `sudo yarn build`.
- Re-run builds locally with `NODE_ENV=production sudo yarn build` to reproduce CI issues.

#### Environment Variables
- Confirm the correct `.env` file or GitHub secret is being used.
- Avoid trailing spaces and ensure quoting rules match the host platform.

#### Database Connectivity
- Validate Supabase credentials.
- Confirm migrations ran successfully.
- Check outbound network rules from your hosting provider.

### Rollback Strategy

1. **Application Rollback**
   - Re-deploy a previous release artifact or commit.
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
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Supabase Production Guide](https://supabase.com/docs)


