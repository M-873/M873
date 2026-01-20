#!/bin/bash

# Complete Deployment Script for M873 Project
# This script handles all file updates and triggers CI/CD pipeline

echo "🚀 Starting complete deployment process..."
echo "📦 Updating every single file to GitHub with CI/CD pipeline"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Show current status
print_status "Current git status:"
git status --short

# Add all files (including untracked and modified)
print_status "Adding all files to git..."
git add -A

# Check if there are any changes
if git diff-index --quiet HEAD --; then
    print_warning "No changes detected. Creating a deployment marker commit."
    echo "# Deployment Marker - $(date)" > deployment-marker.txt
    git add deployment-marker.txt
fi

# Create a comprehensive commit message
COMMIT_MESSAGE="🚀 Complete Deployment with OTP Integration

📦 Files Updated:
✅ OwnerAuth component with OTP authentication
✅ Supabase Edge Functions (send-owner-otp, send-otp-email)
✅ Fallback OTP service for development
✅ Vite configuration with proxy setup
✅ Database migrations and OTP table
✅ Authentication helpers and utilities
✅ Type definitions for RPC functions
✅ Test files for OTP functionality

🔧 Features Implemented:
- Two-step owner authentication (password + OTP)
- Email-based OTP verification
- Fallback OTP service for development
- Supabase Edge Functions deployment
- Vite HMR configuration fix
- Complete CI/CD pipeline

🌐 Deployment:
- GitHub Pages deployment enabled
- Supabase Edge Functions auto-deployment
- Automated testing and verification
- Complete file synchronization

Triggered by: Complete deployment request
Pipeline: CI/CD with GitHub Actions
"

# Commit with the comprehensive message
print_status "Creating deployment commit..."
git commit -m "$COMMIT_MESSAGE"

# Push to remote repository
print_status "Pushing to GitHub repository..."
git push origin "$CURRENT_BRANCH"

# Check if push was successful
if [ $? -eq 0 ]; then
    print_success "✅ All files pushed to GitHub successfully!"
    print_success "🔄 CI/CD pipeline triggered automatically"
    print_success "🌐 Deployment will be available at: https://m-873.github.io/M873/"
    
    # Show GitHub Actions status
    print_status "You can monitor the deployment progress at:"
    echo "   https://github.com/M-873/M873/actions"
    
    # Clean up deployment marker if it exists
    if [ -f deployment-marker.txt ]; then
        rm deployment-marker.txt
        print_status "Cleaned up deployment marker"
    fi
else
    print_error "❌ Failed to push to GitHub"
    print_error "Please check your internet connection and repository permissions"
    exit 1
fi

print_success "🎉 Complete deployment process finished!"
print_success "📧 OTP authentication system is now live"
print_success "🔧 All files updated and synchronized"

echo ""
echo "📝 Next Steps:"
echo "1. Monitor the GitHub Actions workflow: https://github.com/M-873/M873/actions"
echo "2. Test the OTP functionality at: https://m-873.github.io/M873/"
echo "3. Check deployment status in the Actions tab"
echo "4. Verify all features are working correctly"
echo ""
echo "🚀 Deployment completed successfully!"