# Deploying Quask to Vercel

This guide will help you deploy your Quask application to Vercel with your custom domain.

## 📋 Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. Your DeepSeek API key (get it from https://platform.deepseek.com/api_keys)

## 🚀 Deployment Steps

### Step 1: Upload to GitHub

1. Download and unzip this folder
2. Go to GitHub and create a new repository
3. Upload all files from this folder to your GitHub repository
4. Make sure your `CNAME` file contains your custom domain

### Step 2: Connect to Vercel

1. Go to https://vercel.com and log in
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Configure the project:
   - **Framework Preset**: Select **"Other"**
   - **Build Command**: Leave blank (or `npm install`)
   - **Output Directory**: Leave as `.`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables (IMPORTANT!)

Before deploying, you MUST add your API key:

1. In the Vercel project settings, scroll down to **Environment Variables**
2. Add a new variable:
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: Your actual DeepSeek API key (starts with `sk-`)
   - **Environment**: Select all (Production, Preview, Development)
3. Click "Add"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `https://your-project.vercel.app`

### Step 5: Add Your Custom Domain

1. Go to your Vercel project settings
2. Click on the "Domains" tab
3. Add your custom domain
4. Follow Vercel's instructions to:
   - Add DNS records to your domain provider
   - Verify domain ownership
5. Once verified, your site will be available at your custom domain!

## 🔒 Security

✅ **Your API key is now secure!**

- The API key is stored as an environment variable on Vercel's servers
- It's never exposed in your website code
- Users can't see it or steal it
- Only your serverless functions can access it

## 📁 Project Structure

```
quask/
├── api/                    # Vercel serverless functions (API endpoints)
│   ├── fact-check.js
│   ├── question-generator.js
│   ├── answer-evaluation.js
│   └── text-extraction.js
├── lib/                    # Core function logic (unchanged from original)
│   ├── fact-check.js
│   ├── question-generator.js
│   ├── answer-evaluation.js
│   └── text-extraction.js
├── assets/                 # Images and static assets
├── *.html                  # Your web pages
├── *.css                   # Stylesheets
├── script.js               # Main JavaScript
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── CNAME                   # Your custom domain
```

## 🔄 Updates

When you make changes:

1. Push changes to your GitHub repository
2. Vercel automatically detects and deploys updates
3. Your site updates in 1-2 minutes

## ⚙️ How It Works

### Original Setup (Won't Work on GitHub Pages)
- Used `server.js` to run a Node.js server
- Server kept your API key safe
- GitHub Pages can't run servers ❌

### New Vercel Setup (Works Perfectly!)
- API endpoints in `/api` folder run as serverless functions
- Each function runs on-demand when called
- API key stored securely in Vercel environment variables ✅
- Frontend (HTML/CSS/JS) served as static files
- Everything works together seamlessly!

## 🛠️ What Was Changed

### Changed Files:
- **NEW**: `api/fact-check.js` - Vercel wrapper (calls original logic)
- **NEW**: `api/question-generator.js` - Vercel wrapper (calls original logic)
- **NEW**: `api/answer-evaluation.js` - Vercel wrapper (calls original logic)
- **NEW**: `api/text-extraction.js` - Vercel wrapper (calls original logic)
- **NEW**: `vercel.json` - Vercel configuration
- **NEW**: `lib/` folder - Your original API functions (100% unchanged!)

### Unchanged:
- ✅ All HTML files
- ✅ All CSS files
- ✅ All JavaScript frontend code
- ✅ Firebase authentication
- ✅ All assets
- ✅ **All core function logic** (moved to `/lib` folder, zero changes!)

## 📞 API Endpoints

After deployment, your API endpoints will be:
- `https://your-domain.com/api/fact-check`
- `https://your-domain.com/api/question-generator`
- `https://your-domain.com/api/answer-evaluation`
- `https://your-domain.com/api/text-extraction`

Your frontend code already uses these paths, so everything will work automatically!

## ✅ Testing

After deployment:
1. Visit your website
2. Try the fact-checker feature
3. Generate questions
4. All features should work with your DeepSeek API!

## 🆘 Troubleshooting

### API Features Not Working?
- Check that you added the `DEEPSEEK_API_KEY` environment variable in Vercel
- Make sure the key starts with `sk-`
- Redeploy after adding environment variables

### Domain Not Working?
- Wait 24-48 hours for DNS propagation
- Double-check DNS records with your domain provider
- Make sure CNAME file contains your domain name

### Build Failed?
- Check the build logs in Vercel dashboard
- Make sure all files uploaded correctly to GitHub
- Verify `package.json` is in the repository

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Ready to deploy? Follow the steps above and your Quask app will be live in minutes!** 🎉
