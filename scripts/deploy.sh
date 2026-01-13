#!/bin/bash

# M873 Deployment Script
# This script helps with deployment to GitHub Pages

set -e

echo "🚀 Starting M873 deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote repository found. Please set up your GitHub repository first."
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes."
    read -p "Do you want to commit them? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
    fi
fi

# Build the project
print_status "Building the project..."
npm run build

if [ $? -eq 0 ]; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed. Please check the errors above."
    exit 1
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_status "✅ Push successful!"
    print_status "🎉 Deployment initiated! Check your GitHub repository Actions tab."
    echo "Your site will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
else
    print_error "❌ Push failed. Please check your GitHub repository settings."
    exit 1
fi

print_status "🚀 Deployment process completed!"
print_status "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click on the 'Actions' tab"
echo "3. Monitor the deployment progress"
echo "4. Once complete, visit your deployed site"
echo ""
echo "For troubleshooting, check the DEPLOYMENT.md file"