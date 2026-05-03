# Environment Variables Required for Deployment

## Backend Service (Render)

Add these environment variables in your Render dashboard:

### Database
```
DATABASE_URL=YOUR_NEON_DATABASE_URL
```

### Authentication
```
SECRET_KEY=YOUR_SECRET_KEY_HERE
```
Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### Stripe Payment (REQUIRED - causing 500 error)
```
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```
Get from: https://dashboard.stripe.com/test/apikeys

### Frontend URL (for CORS and email links)
```
FRONTEND_URL=https://your-app.vercel.app
```

### Email Service (SMTP) - Required for password reset and order notifications
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_EMAIL_ADDRESS
SMTP_PASSWORD=YOUR_APP_PASSWORD
FROM_EMAIL=YOUR_EMAIL_ADDRESS
FROM_NAME=QuickStore
```

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password as SMTP_PASSWORD

**Alternative Email Providers:**
- SendGrid: SMTP_HOST=smtp.sendgrid.net, SMTP_PORT=587
- Mailgun: SMTP_HOST=smtp.mailgun.org, SMTP_PORT=587
- AWS SES: SMTP_HOST=email-smtp.us-east-1.amazonaws.com, SMTP_PORT=587

### Optional
```
CREATE_TABLES_ON_STARTUP=true
```

## Frontend Service (Vercel)

Add these environment variables in your Vercel project settings:

### Backend API
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Stripe Public Key
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
```
Get from: https://dashboard.stripe.com/test/apikeys

## How to Add on Render

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable above with your actual values
6. Click "Save Changes"
7. Render will automatically redeploy

## How to Add on Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable above with your actual values
5. Redeploy your frontend

## Current Issue

The 500 error on Stripe payment is because `STRIPE_SECRET_KEY` is not configured on Render.
Once you add it, the payment flow will work.
