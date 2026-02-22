# Railway Deployment Configuration Guide

This guide helps you configure environment variables for your Railway deployment to avoid common errors.

## Common Errors and Solutions

### Error: "OAUTH_SERVER_URL is not configured"

**Cause:** The `OAUTH_SERVER_URL` environment variable is not set in Railway.

**Solution:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add the following variable:
   ```
   OAUTH_SERVER_URL=https://api.manus.im
   ```

### Error: "Neither apiKey nor config.authenticator provided" (Stripe)

**Cause:** The `STRIPE_SECRET_KEY` environment variable is not set or is empty.

**Solution:**
1. Get your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. In Railway, go to **Variables** tab
3. Add the following variable:
   ```
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
   ```

## Required Environment Variables

The following environment variables **must** be set for the application to start:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL database connection URL | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret key for JWT signing | Generate with: `openssl rand -base64 32` |

## Important Environment Variables

These are not required to start the server, but certain features won't work without them:

| Variable | Description | Required For |
|----------|-------------|--------------|
| `OAUTH_SERVER_URL` | OAuth server endpoint | User authentication |
| `VITE_APP_ID` | Manus application ID | OAuth authentication |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Payment webhooks |

## Complete Railway Setup

1. **Create MySQL Database**
   - In Railway, click **+ New**
   - Select **Database** → **MySQL**
   - Railway automatically sets `DATABASE_URL`

2. **Configure Required Variables**
   ```bash
   # Required
   JWT_SECRET=your_secret_here_min_32_chars
   
   # Important for full functionality
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_APP_ID=your_manus_app_id
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Configure Optional Variables**
   ```bash
   NODE_ENV=production
   PORT=3000
   CORS_ORIGINS=https://yourdomain.com
   OWNER_OPEN_ID=your_owner_id
   ```

4. **Deploy**
   - Railway will automatically redeploy after variables are saved

## Verifying Configuration

After deployment, check the Railway logs:

✅ **Success:**
```
[Stripe] Successfully initialized
Server running on http://localhost:3000/
```

⚠️ **Warnings (acceptable):**
```
⚠️  WARNING: Some environment variables are not configured:
  - STRIPE_SECRET_KEY is not configured. Payment functionality will be disabled.
The server will start, but some features may not work properly.
```

❌ **Critical Error (server won't start):**
```
❌ CRITICAL: Required environment variables are missing:
  - DATABASE_URL is required
  - JWT_SECRET is required
Please set the required environment variables and restart the server.
```

## Testing Payment Integration

If you've configured Stripe:

1. Set up Stripe webhook in [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Point it to: `https://your-railway-app.up.railway.app/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Need Help?

- See `.env.example` for a complete list of all environment variables
- Check Railway logs for specific error messages
- Ensure all required variables are set before reporting issues
