# AI Cyber Guardian — Sindh Student Protection System

A mobile-friendly, multilingual (English, Urdu, Sindhi) student cyber safety web application featuring:
- **AI Scam Message Detector**
- **Suspicious Website Link Checker**
- **Cyberbullying Detector**
- **Online Safety Tips & Student Checklist**
- **Privacy-First Architecture** (zero personal data stored, never asks for passwords or OTPs)

## Deploying to GitHub Pages

This export includes both the **full source code** and a **pre-built static bundle** in `dist/` (ready for GitHub Pages).

### Option A: Automatic Deployment with GitHub Actions (Recommended)
1. Unzip this archive and upload all files to a new GitHub repository.
2. Open your repository **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Push to `main` (or trigger **Deploy AI Cyber Guardian to GitHub Pages** under **Actions**).

### Option B: Direct Static Upload (`dist/` folder)
1. Open the `dist/` folder inside this archive (`index.html` and `assets/`).
2. Upload the contents of `dist/` to your GitHub Pages branch (`gh-pages` or `main` root).
3. On static GitHub Pages hosting, the built-in browser **Rule-Based Protection Engine** runs automatically with zero backend required.

## Running Locally (Full-Stack with Gemini AI)
```bash
npm install
cp .env.example .env
# Optional: Add your GEMINI_API_KEY in .env for server-side Gemini AI analysis
npm run dev
```
