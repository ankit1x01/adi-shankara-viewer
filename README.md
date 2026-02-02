# Adi Shankaracharya Viewer - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- GitHub API access (optional, for private repos)
- Gemini API key (for AI analysis feature)

## Installation

1. **Install Dependencies:**

   ```bash
   cd adi-shankara-viewer
   npm install
   ```

2. **Configure Environment Variables:**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your API keys:

   ```
   # GitHub Token (optional - only needed for private repos or higher rate limits)
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token

   # Gemini API Key (required for AI analysis feature)
   GEMINI_API_KEY=your_gemini_api_key
   ```

   ### Getting API Keys:

   **Gemini API Key:**
   1. Go to https://ai.google.dev/
   2. Click "Get API key"
   3. Sign in with your Google account
   4. Create an API key
   5. Copy and paste it into `.env.local`

   **GitHub Token (Optional):**
   1. Go to GitHub Settings → Developer settings → Personal access tokens
   2. Generate new token (classic)
   3. Select `repo` scope
   4. Copy and paste it into `.env.local`

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### 📖 Markdown Viewer

- Beautiful rendering of Sanskrit verses
- Automatic verse detection and styling
- Devanagari font support

### 🤖 AI-Powered Analysis

- Click the ✨ icon on any verse to get deep Vedantic analysis
- Powered by Gemini 1.5 Pro
- Includes:
  - Sanskrit & transliteration
  - Word-by-word meanings
  - Psychological, symbolic, and Vedantic layers
  - Meditation practices
  - Reflection questions

### 📄 PDF Viewer

- Inline PDF viewing for documents

### 🗂️ File Navigation

- Browse the entire repository structure
- Responsive sidebar navigation

## Configuration

### Changing the Repository Source

Edit `app/page.tsx` to change the default repository:

```typescript
const DEFAULT_OWNER = "your-github-username";
const DEFAULT_REPO = "your-repo-name";
```

## Troubleshooting

**API Rate Limiting:**

- If you see rate limit errors, add a GitHub token to `.env.local`
- GitHub allows 60 requests/hour without auth, 5000/hour with token

**AI Analysis Not Working:**

- Ensure `GEMINI_API_KEY` is correctly set in `.env.local`
- Check browser console for error messages
- Verify your Gemini API key is valid

**Build Errors:**

- Try deleting `node_modules` and `.next` folders
- Run `npm install` again
- Restart the dev server

## Production Deployment

```bash
npm run build
npm start
```

For deployment to Vercel/Netlify, add environment variables in their dashboard:

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_GITHUB_TOKEN` (optional)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI:** Material UI + Custom Styling
- **Markdown:** react-markdown with remark plugins
- **AI:** Google Gemini 1.5 Pro
- **API:** GitHub Content API via Octokit

## License

Private project for personal use.
