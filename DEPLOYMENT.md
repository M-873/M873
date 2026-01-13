# M873 Deployment Guide

## GitHub Pages Deployment with CI/CD

This guide walks you through deploying the M873 site to GitHub Pages with automated CI/CD pipeline.

## Prerequisites

1. **GitHub Account**: You'll need a GitHub account
2. **Repository**: Create a new repository on GitHub (e.g., `m873-site`)
3. **Supabase Account**: Ensure you have your Supabase credentials ready

## Step 1: Environment Setup

### Set up GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Update Repository Settings

1. Go to Settings → Pages
2. Source: Deploy from a branch → GitHub Actions
3. Save the changes

## Step 2: Local Setup

### Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - M873 AI Platform"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to main branch
git push -u origin main
```

### Update vite.config.ts

The configuration has been updated to support GitHub Pages deployment:

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/'
```

Make sure to replace `YOUR_REPO_NAME` with your actual repository name.

## Step 3: CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Builds** the project on every push to main
2. **Deploys** to GitHub Pages
3. **Handles** environment variables securely
4. **Optimizes** for production

### Workflow Features

- **Node.js 18**: Latest LTS version
- **Dependency Caching**: Fast builds with npm cache
- **Environment Variables**: Secure handling of Supabase credentials
- **GitHub Pages**: Automatic deployment with proper permissions
- **Build Optimization**: Production-ready builds

## Step 4: Deployment Process

### Automatic Deployment

Every time you push to the `main` branch:

1. GitHub Actions triggers the build
2. Dependencies are installed and cached
3. Project is built with production optimizations
4. Built files are deployed to GitHub Pages
5. Site is available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Manual Deployment

You can also manually trigger deployment:

1. Go to Actions tab in your repository
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## Step 5: Post-Deployment

### Verify Deployment

1. Check the Actions tab for successful builds
2. Visit your deployed site URL
3. Test all functionality (auth, dashboard, etc.)

### Update Site

To update your site:

```bash
# Make changes locally
# Test locally with: npm run dev

# Commit and push
git add .
git commit -m "Update: description of changes"
git push origin main

# GitHub Actions will automatically deploy the updates
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the Actions tab for error logs
2. **Missing Environment Variables**: Ensure GitHub secrets are set correctly
3. **404 Errors**: Verify the `base` path in `vite.config.ts`
4. **Supabase Connection**: Check CORS settings in Supabase dashboard

### Build Logs

Check the GitHub Actions logs for detailed build information:
- Go to Actions tab → Select the workflow run → Check build steps

### Local Testing

Test the production build locally:

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

## Advanced Configuration

### Custom Domain (Optional)

To use a custom domain:

1. Go to Settings → Pages → Custom domain
2. Add your domain (e.g., `m873.yourdomain.com`)
3. Update DNS settings as instructed
4. Update `base` in `vite.config.ts` to `/`

### Branch Protection

Consider setting up branch protection for `main`:
- Settings → Branches → Add rule for `main`
- Require pull request reviews
- Require status checks to pass

## Support

For issues related to:
- **Build Process**: Check GitHub Actions logs
- **Supabase**: Verify your project settings and API keys
- **React/Vite**: Test locally first before deploying

---

**Your M873 site is now ready for automated deployment! 🚀**