# Quick Setup Guide

## ⚠️ Required: Set up your Gemini API Key

The AI analysis feature needs a Gemini API key to work. Follow these steps:

### Step 1: Get Your Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with your Google account
4. Create a new API key
5. **Copy the API key**

### Step 2: Create Environment File

1. In the `adi-shankara-viewer` folder, create a file named `.env.local`
2. Add this line (replace with your actual key):

```
GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**

```
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart the Server

1. Stop the dev server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test It

1. Open http://localhost:3000
2. Select a stotra file
3. Hover over a verse
4. Click the ✨ sparkle icon
5. See the AI analysis!

---

## Troubleshooting

**Still getting errors?**

- Make sure `.env.local` is in the root folder (same level as `package.json`)
- Make sure there are no spaces around the `=` sign
- Make sure you restarted the dev server after creating the file
- Check that your API key is valid at https://ai.google.dev/

**API Key quota exceeded?**

- Gemini has free tier limits
- You might need to wait or upgrade your quota

---

## Optional: GitHub Token

If you're hitting GitHub API rate limits, add this to `.env.local`:

```
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
```

Get it from: GitHub Settings → Developer Settings → Personal Access Tokens
