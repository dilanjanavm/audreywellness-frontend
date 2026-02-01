# Quick Start: Environment Setup

## 🚀 How to Run the Server with Environment Files

### Development Mode

```bash
npm run start:dev
```

This will:
- Load environment variables from `.env.dev`
- Start the React development server
- Use the API URL specified in `.env.dev`

### Production Mode (Local Testing)

```bash
npm run start:production
```

This will:
- Load environment variables from `.env.production`
- Start the React development server
- Use the API URL specified in `.env.production`

### Standard Start (Default)

```bash
npm start
```

This uses default React environment (no custom env file).

---

## 📋 Environment Files Structure

```
project-root/
├── .env.dev          # Development configuration (NOT in git)
├── .env.production   # Production configuration (NOT in git)
├── .env.example      # Template file (safe to commit)
└── ENV_SETUP_GUIDE.md # Full documentation
```

---

## ⚙️ Configuration

### Development (`.env.dev`)
```env
REACT_APP_API_URL=http://127.0.0.1:4008
NODE_ENV=development
```

### Production (`.env.production`)
```env
REACT_APP_API_URL=https://adress-api.webmotech.com
NODE_ENV=production
```

---

## 🔧 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start dev server with `.env.dev` |
| `npm run start:production` | Start dev server with `.env.production` |
| `npm start` | Start with default React env |
| `npm run build:dev` | Build with `.env.dev` |
| `npm run build:production` | Build with `.env.production` |

---

## 📝 First Time Setup

1. **Check if `.env.dev` exists:**
   ```bash
   dir .env.dev
   ```

2. **If it doesn't exist, create it:**
   ```bash
   copy .env.example .env.dev
   ```

3. **Edit `.env.dev` and set your API URL:**
   ```env
   REACT_APP_API_URL=http://127.0.0.1:4008
   ```

4. **Run the development server:**
   ```bash
   npm run start:dev
   ```

---

## ✅ Verification

After starting the server, check the browser console or network tab to verify the API URL is being used correctly. The API calls should go to the URL specified in your environment file.

---

For detailed documentation, see `ENV_SETUP_GUIDE.md`
