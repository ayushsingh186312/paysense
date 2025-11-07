# 🚀 Stripe Payment Integration - Setup Guide

## Overview
This guide will help you integrate Stripe payment processing into your PaySense application.

## 📋 Prerequisites
- Stripe account (sign up at https://stripe.com)
- Node.js and npm installed
- MongoDB database running

## 🔧 Setup Steps

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/
2. Navigate to **Developers → API keys**
3. Copy the following:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)

### 2. Configure Environment Variables

#### Backend (.env)
```bash
# Add to backend/.env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
FRONTEND_URL=http://localhost:3000

# For webhooks (optional - see webhook section)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Frontend (.env.local)
```bash
# Create frontend/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 3. Install Dependencies

Both Stripe packages are already installed:
- Backend: `stripe` (v19.3.0) ✅
- Frontend: `@stripe/stripe-js` (v8.3.0) ✅

### 4. Start the Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Server will run on: http://localhost:5001

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## 🧪 Testing the Integration

### Test Cards (provided by Stripe)

| Card Number | Description | Expected Result |
|------------|-------------|-----------------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0025 0000 3155` | 3D Secure | Requires authentication |
| `4000 0000 0000 9995` | Decline | Card declined |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC
- Use any valid ZIP code

### Testing Flow

1. **Navigate to Dashboard**
   - Go to http://localhost:3000

2. **Add Online Payment**
   - Click "Add Payment" button
   - Select "Online" as payment type
   - Fill in the form:
     - Client name
     - Receipt number
     - Amount (e.g., 1000)
     - Date
   
3. **Pay with Stripe**
   - Click "Pay Now with Stripe" button
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete the payment

4. **Verify Success**
   - You'll be redirected to `/payments/success`
   - Check your dashboard - payment should be recorded
   - Transaction will be saved in MongoDB automatically

## 🔔 Setting Up Webhooks (Optional but Recommended)

Webhooks ensure payment data is saved even if user closes browser before redirect.

### 1. Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other OS: https://stripe.com/docs/stripe-cli#install
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

This will give you a webhook secret (starts with `whsec_...`)

### 4. Add Webhook Secret to .env
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Test Webhooks
```bash
stripe trigger checkout.session.completed
```

## 📊 Webhook Events Handled

- ✅ `checkout.session.completed` - Creates online transaction in database
- ✅ `payment_intent.succeeded` - Logs successful payment
- ✅ `payment_intent.payment_failed` - Updates status to Failed

## 🌐 Production Deployment

### 1. Get Live API Keys
- Switch to **Live mode** in Stripe Dashboard
- Copy new live keys (starting with `pk_live_...` and `sk_live_...`)

### 2. Update Environment Variables
Replace test keys with live keys in your production environment:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
FRONTEND_URL=https://your-production-domain.com
```

### 3. Configure Production Webhooks
1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-api-domain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret and add to production environment

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` files** - Already in .gitignore
2. ✅ **Use webhook signatures** - Already implemented
3. ✅ **Validate amounts server-side** - Already implemented
4. ✅ **HTTPS in production** - Required for Stripe
5. ✅ **Keep Stripe.js up to date** - Check for updates regularly

## 📈 Features Implemented

### Payment Processing
- ✅ Stripe Checkout integration
- ✅ Support for INR currency
- ✅ Card payments
- ✅ Automatic receipt generation
- ✅ Success/Cancel pages

### Database Integration
- ✅ Auto-save successful payments to MongoDB
- ✅ Link payments to clients
- ✅ Store transaction metadata
- ✅ Stripe session and payment intent IDs

### User Experience
- ✅ "Pay Now" button only shows for online payments
- ✅ Loading states during processing
- ✅ Error handling and user feedback
- ✅ Redirect back to dashboard after payment

## 🎯 Next Steps (Optional Enhancements)

### 1. Add More Payment Methods
```javascript
// In stripe.routes.js, add to payment_method_types:
payment_method_types: ['card', 'upi', 'netbanking'],
```

### 2. Implement Refunds
Already available! Use the `/api/stripe/refund` endpoint:
```javascript
await stripeAPI.refundPayment({
  paymentIntentId: 'pi_xxx',
  amount: 10000, // optional - omit for full refund
  reason: 'requested_by_customer'
});
```

### 3. Add Payment History
Display Stripe payments separately in the online transactions list.

### 4. Email Receipts
Integrate Stripe receipts with your existing nodemailer setup.

## 🆘 Troubleshooting

### "Cannot find module '@stripe/stripe-js'"
```bash
cd frontend
npm install @stripe/stripe-js
```

### "Invalid API Key provided"
- Check that environment variables are set correctly
- Restart both servers after adding env variables
- Ensure no extra spaces in .env file

### "Webhook signature verification failed"
- Make sure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI
- Check that webhook payload is raw (not parsed JSON)

### Payments not saving to database
- Check MongoDB connection
- Verify webhook endpoint is receiving events
- Check backend logs for errors

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

## ✅ Quick Test Checklist

- [ ] Environment variables set in both frontend and backend
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can open payment dialog
- [ ] "Pay Now" button appears for online payments
- [ ] Redirects to Stripe Checkout
- [ ] Test payment succeeds
- [ ] Redirects back to success page
- [ ] Transaction appears in database
- [ ] Can view transaction in dashboard

---

**Need Help?** Check the Stripe Dashboard logs for detailed error messages and payment attempts.
