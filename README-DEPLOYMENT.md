# 🚀 M873 GitHub Pages Deployment

## Quick Start

Your M873 site is now configured for automated GitHub Pages deployment! Follow these steps to get your site live:

## 1. GitHub Repository Setup

### Create Repository
1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name it `m873-next-horizon-main` (or your preferred name)
4. Keep it public for GitHub Pages
5. Don't initialize with README (we already have one)

### Add Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## 2. Environment Variables

### GitHub Secrets
Go to Settings → Secrets and variables → Actions, add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy Project URL and Anon Key

## 3. Deploy Your Site

### Option A: Automated Deployment
```bash
# Commit your changes
git add .
git commit -m "Initial deployment setup"
git push origin main

# GitHub Actions will automatically deploy!
```

### Option B: Using Deployment Script
```bash
# Make the script executable (first time only)
chmod +x scripts/deploy.sh

# Run deployment script
./scripts/deploy.sh
```

### Option C: Manual Steps
```bash
# Build the project
npm run build

# Push to GitHub
git push origin main

# Monitor deployment in GitHub Actions
```

## 4. Monitor Deployment

1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the deployment progress
4. ✅ Green checkmark = Success!

## 5. Visit Your Site

Once deployment is complete, your site will be available at:

**`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`**

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Build and deploy to GitHub Pages
```

## 🔧 Configuration Files

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Purpose**: Automated CI/CD pipeline
- **Triggers**: Push to main branch, pull requests

### Vite Configuration
- **File**: `vite.config.ts`
- **Base Path**: Configured for GitHub Pages
- **Build**: Optimized for production

### Environment Setup
- **File**: `.gitignore`
- **Purpose**: Excludes sensitive files from git
- **Includes**: Environment variables, build outputs, OS files

## 🚨 Troubleshooting

### Build Failed?
1. Check GitHub Actions logs
2. Verify environment variables
3. Test locally: `npm run build`

### 404 Errors?
1. Check repository name in `vite.config.ts`
2. Verify GitHub Pages settings
3. Ensure base path is correct

### Supabase Connection Issues?
1. Check CORS settings in Supabase
2. Verify API keys are correct
3. Test locally first

### Deployment Stuck?
1. Check GitHub Actions status
2. Cancel and re-run the workflow
3. Check repository permissions

## 📋 Deployment Checklist

- [ ] GitHub repository created
- [ ] Remote origin added
- [ ] Supabase credentials obtained
- [ ] GitHub secrets configured
- [ ] Code committed and pushed
- [ ] GitHub Actions workflow triggered
- [ ] Deployment successful
- [ ] Site accessible at GitHub Pages URL

## 🎯 Next Steps

1. **Customize**: Update content, colors, branding
2. **Features**: Add new pages and functionality
3. **Domain**: Set up custom domain (optional)
4. **Analytics**: Add tracking and monitoring
5. **SEO**: Optimize for search engines

## 📞 Support

- **GitHub Actions**: Check Actions tab for logs
- **Build Issues**: Run `npm run build` locally
- **Supabase**: Verify project settings and API keys
- **Vite**: Check configuration and build output

---

**🎉 Your M873 AI Platform is ready for deployment!**

The CI/CD pipeline will automatically deploy every time you push to the main branch. Happy coding! 🚀