# Push to GitHub - Quick Steps

## Step 1: Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `workout-tracker`
3. Choose Public or Private
4. **DON'T** check "Initialize with README"
5. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repo, GitHub will show you a URL like:
`https://github.com/YOUR_USERNAME/workout-tracker.git`

Run these commands (replace YOUR_USERNAME with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git
git branch -M main
git push -u origin main
```

If GitHub asked you to use SSH instead, use:
```bash
git remote add origin git@github.com:YOUR_USERNAME/workout-tracker.git
git branch -M main
git push -u origin main
```

## Troubleshooting

**If asked for username/password:**
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
  - Create one at: https://github.com/settings/tokens
  - Select "repo" scope
  - Copy the token and use it as the password

**If you get "remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git
```

