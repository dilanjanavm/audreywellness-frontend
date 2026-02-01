# Environment Configuration Guide

This guide explains how to set up and use environment variables for the Address Shop Admin Frontend application.

## 📁 Environment Files

The project uses the following environment files:

- **`.env.dev`** - Development environment configuration
- **`.env.production`** - Production environment configuration  
- **`.env.example`** - Template file (safe to commit to git)

## 🚀 Quick Start

### 1. Create Your Environment Files

If you don't have the environment files yet, copy the example file:

```bash
# For development
cp .env.example .env.dev

# For production
cp .env.example .env.production
```

### 2. Configure Your Environment Variables

Edit the `.env.dev` or `.env.production` file and update the values:

```env
# API Configuration
REACT_APP_API_URL=http://127.0.0.1:4008

# Public URL (optional, for routing)
PUBLIC_URL=

# Environment
NODE_ENV=development
```

## 📝 Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://127.0.0.1:4008` or `https://adress-api.webmotech.com` |
| `PUBLIC_URL` | Base path for routing (optional) | Leave empty for root path |
| `NODE_ENV` | Node environment | `development` or `production` |
| `REACT_APP_ENABLE_DEBUG` | Enable debug mode (optional) | `true` or `false` |
| `REACT_APP_ENABLE_LOGGING` | Enable logging (optional) | `true` or `false` |

**Important:** All React environment variables must be prefixed with `REACT_APP_` to be accessible in the application.

## 🏃 Running the Application

### Development Mode

Run the application with development environment:

```bash
npm run start:dev
```

This command:
- Loads variables from `.env.dev`
- Starts the development server
- Opens `http://localhost:3000` (default React port)

### Production Mode (Local Testing)

Run the application with production environment locally:

```bash
npm run start:production
```

This command:
- Loads variables from `.env.production`
- Starts the development server with production config

### Standard Start (No Environment File)

If you want to use the default React environment:

```bash
npm start
```

## 🏗️ Building the Application

### Development Build

Build the application with development environment:

```bash
npm run build:dev
```

### Production Build

Build the application with production environment:

```bash
npm run build:production
```

## 🔧 How It Works

The project uses `env-cmd` package to load environment variables from specific files:

- `start:dev` → Uses `.env.dev`
- `start:production` → Uses `.env.production`
- `build:dev` → Uses `.env.dev`
- `build:production` → Uses `.env.production`

## 📍 Accessing Environment Variables in Code

Environment variables are accessed using `process.env`:

```javascript
// In src/service/apiConfig.js
const URL_REMOTE = process.env.REACT_APP_API_URL;
```

**Note:** Only variables prefixed with `REACT_APP_` are exposed to the browser.

## 🔒 Security Notes

1. **Never commit `.env.dev` or `.env.production` to git**
   - These files contain sensitive configuration
   - They are already in `.gitignore`

2. **Always commit `.env.example`**
   - This serves as a template for other developers
   - Contains no sensitive data

3. **Update `.gitignore` if needed**
   - The `.gitignore` file already excludes `.env.dev` and `.env.production`
   - `.env.example` is explicitly included

## 🐛 Troubleshooting

### Environment variables not loading?

1. **Check file name:** Ensure the file is named exactly `.env.dev` or `.env.production`
2. **Check variable prefix:** Variables must start with `REACT_APP_`
3. **Restart the server:** Environment variables are loaded at build time
4. **Check file location:** Environment files must be in the project root directory

### API calls failing?

1. **Verify `REACT_APP_API_URL`** is set correctly in your environment file
2. **Check the API server** is running and accessible
3. **Verify CORS settings** on the backend if making cross-origin requests

### Build errors?

1. **Ensure all required variables** are set in your environment file
2. **Check for typos** in variable names
3. **Verify `env-cmd` is installed:** `npm install env-cmd --save-dev`

## 📚 Additional Resources

- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [env-cmd Documentation](https://github.com/toddbluhm/env-cmd)

## 🔄 Example Workflow

```bash
# 1. Clone the repository
git clone <repository-url>
cd address-shop-admin-frontend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.dev

# 4. Edit .env.dev with your local API URL
# REACT_APP_API_URL=http://127.0.0.1:4008

# 5. Start development server
npm run start:dev
```

---

**Last Updated:** 2024
**Maintained by:** Development Team
