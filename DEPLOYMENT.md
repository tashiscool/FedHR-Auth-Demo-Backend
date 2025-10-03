# Deployment Instructions

## Deploy to Vercel (Recommended - Free)

### Step 1: Login to Vercel

```bash
vercel login
```

This will open your browser. Choose one of:
- Continue with GitHub
- Continue with GitLab
- Continue with Bitbucket
- Continue with Email

### Step 2: Deploy

```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy "~/IdeaProjects/workspace/FedHR-Auth-Demo-Backend"?** → Yes
- **Which scope do you want to deploy to?** → (your username/team)
- **Link to existing project?** → No
- **What's your project's name?** → `fedhr-auth-demo` (or whatever you want)
- **In which directory is your code located?** → `./`
- **Want to override the settings?** → No

### Step 3: Get Your URL

After deployment completes, you'll see:
```
✅ Production: https://fedhr-auth-demo.vercel.app [deployed]
```

### Step 4: Test It

1. Visit: `https://fedhr-auth-demo.vercel.app`
2. Click "Generate QR Code" or visit `/qr`
3. Scan with the mobile app
4. Test the auth flow

---

## Alternative: Deploy to Railway (Free Tier)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Deploy

```bash
railway init
railway up
```

### Step 4: Get URL

```bash
railway domain
```

---

## Alternative: Deploy to Render (Free Tier)

1. Go to https://render.com
2. Create account
3. Click "New +" → "Web Service"
4. Connect GitHub repo or use "Deploy from Git URL"
5. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Click "Create Web Service"

Your app will be live at: `https://your-app-name.onrender.com`

---

## Alternative: Push to GitHub and Deploy via Vercel Dashboard

### Step 1: Create GitHub Repository

```bash
# Go to https://github.com/new
# Create a new repository: FedHR-Auth-Demo-Backend
# Don't initialize with README (we already have code)
```

### Step 2: Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/FedHR-Auth-Demo-Backend.git
git push -u origin main
```

### Step 3: Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"

Done! Your app will be live at: `https://fedhr-auth-demo.vercel.app`

---

## For App Store Reviewers

Once deployed, include this in your App Store review notes:

```
Demo Backend: https://your-app.vercel.app

To test:
1. Visit https://your-app.vercel.app/qr
2. Scan the QR code with the FedHR Authenticator app
3. The device will register automatically
4. Wait 30 seconds for an auth request to appear
5. Tap "Approve" or "Deny" to test the flow

You can monitor activity at:
- Devices: https://your-app.vercel.app/api/admin/devices
- Requests: https://your-app.vercel.app/api/admin/requests
```

---

## Environment Variables

No environment variables needed! The app works out of the box.

---

## Troubleshooting

### Error: "No existing credentials found"

Run `vercel login` first, then try deploying again.

### Want to use a custom domain?

After deployment, go to your Vercel dashboard → Project → Settings → Domains

### Need to redeploy?

Just run `vercel --prod` again from the project directory.
