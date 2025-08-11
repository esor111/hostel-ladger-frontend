# Environment Configuration Guide

This project supports multiple environment configurations for easy switching between local development, dev server, and production environments.

## 🌍 Available Environments

### 1. **Localhost Development** (Default)
- **API URL**: `http://localhost:3001/hostel/api/v1`
- **Use Case**: Local backend development
- **Debug Mode**: Enabled

### 2. **Development Server**
- **API URL**: `https://dev.kaha.com.np/hostel/api/v1`
- **Use Case**: Testing with remote dev server
- **Debug Mode**: Enabled

### 3. **Production**
- **API URL**: `https://api.kaha.com.np/hostel/api/v1`
- **Use Case**: Production deployment
- **Debug Mode**: Disabled

## 🚀 Quick Start Commands

### Start Development Server

```bash
# Localhost development (default)
npm run dev
# or
npm run dev:local

# Development server
npm run dev:development

# Production mode
npm run dev:prod
```

### Build for Different Environments

```bash
# Build for local
npm run build:local

# Build for development server
npm run build:dev

# Build for production
npm run build:prod
```

## 📁 Environment Files

- `.env` - Default configuration (local)
- `.env.local` - Local development settings
- `.env.development` - Development server settings
- `.env.production` - Production settings

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001/hostel/api/v1` |
| `VITE_ENVIRONMENT` | Current environment | `localhost`, `development`, `production` |
| `VITE_DEBUG_MODE` | Enable debug features | `true`, `false` |
| `VITE_LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |

## 🎛️ Environment Switcher UI

In development mode, you'll see an environment switcher in the bottom-right corner that shows:
- Current environment status
- API base URL
- Quick switch options
- Debug information

## 🔄 Switching Environments

### Method 1: Using npm scripts (Recommended)
```bash
# Stop current server and run:
npm run dev:local        # For localhost backend
npm run dev:development  # For dev.kaha.com.np
npm run dev:prod        # For production API
```

### Method 2: Environment variables
```bash
# Set environment variable and start
VITE_ENVIRONMENT=development npm run dev
```

### Method 3: Update .env file
```bash
# Edit .env file
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=https://dev.kaha.com.np/hostel/api/v1
```

## 🛠️ Configuration Files

### Environment Config (`src/config/environment.ts`)
Central configuration for all environments with type safety.

### API Config (`src/config/api.ts`)
API configuration that automatically uses the current environment settings.

## 🐛 Debugging

### Check Current Environment
The environment switcher UI shows current configuration, or check browser console for:
```
[LOCALHOST] API Configuration loaded { baseUrl: "...", environment: "localhost" }
```

### Environment Info
```javascript
import { getEnvironmentInfo } from '@/config/environment';
console.log(getEnvironmentInfo());
```

## 📝 Adding New Environments

1. Create new `.env.{environment}` file
2. Add configuration to `ENVIRONMENT_CONFIGS` in `src/config/environment.ts`
3. Add npm script in `package.json`
4. Update this documentation

## 🔒 Security Notes

- Never commit sensitive API keys to environment files
- Use `.env.local` for local secrets (already in .gitignore)
- Production environment variables should be set in deployment platform

## 🚨 Troubleshooting

### Environment not switching?
1. Stop the development server completely
2. Clear browser cache
3. Restart with the correct npm script

### API calls failing?
1. Check the environment switcher UI for current API URL
2. Verify backend server is running on expected URL
3. Check browser network tab for actual requests

### Environment switcher not showing?
- Only visible when `VITE_DEBUG_MODE=true`
- Hidden in production builds