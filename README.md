# Quask - Interactive Quiz and Learning Platform

## Deployment to Vercel

### 1. Push your code to GitHub
First, push your code to a GitHub repository.

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the project settings

### 3. Set up Environment Variables
1. In your Vercel project dashboard, go to Settings → Environment Variables
2. Add the following variable:
   - Name: `DEEPSEEK_API_KEY`
   - Value: Your DeepSeek API key (get it from https://platform.deepseek.com/api_keys)
   - Environment: Production (and optionally Preview if you want it in preview deployments)

### 4. Deploy
- Vercel will automatically deploy your project
- Any push to your main branch will trigger a new deployment
- The API endpoints will be available at:
  - /api/fact-check
  - /api/question-generator
  - /api/answer-evaluation
  - /api/text-extraction

### 5. Verify Deployment
1. Visit your deployed site
2. Try the fact-checking or question generation feature
3. If you see AI-generated responses (not demo responses), everything is working!

## Local Development (Optional)
If you need to run the project locally:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your DeepSeek API key to `.env`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

Note: The `.env` file is only needed for local development. For production, always use Vercel's Environment Variables.