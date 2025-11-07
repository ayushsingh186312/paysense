# 🔄 Quick Fix Guide - 404 Error Resolved

## ✅ Changes Made

1. **Fixed Frontend API URL** (`frontend/.env.local`):
   - Changed from: `https://paysense-theta.vercel.app/api` ❌
   - Changed to: `http://localhost:5001/api` ✅

2. **Added Stripe Keys**:
   - Backend: `STRIPE_SECRET_KEY` ✅
   - Backend: `FRONTEND_URL=http://localhost:3000` ✅
   - Frontend: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅

3. **Updated CORS**:
   - Added `https://paysense-theta.vercel.app` to allowed origins ✅

## 🚀 Next Steps - RESTART SERVERS

### Step 1: Restart Backend Server

**Find the terminal running your backend** and:
```bash
# Press Ctrl + C to stop the server
# Then run:
cd backend
npm run dev
```

You should see:
```
✅ Server running on port 5001
🌐 API: http://localhost:5001/api
```

### Step 2: Restart Frontend Server

**Find the terminal running your frontend** and:
```bash
# Press Ctrl + C to stop the server
# Then run:
cd frontend
npm run dev
```

### Step 3: Test the Integration

1. Go to: http://localhost:3000
2. Click "Add Payment"
3. Select "Online" payment type
4. Fill in:
   - Amount: 1000
   - Client name: Test Client
   - Receipt number: TEST123
   - Date: Today
5. Click "Pay Now with Stripe"
6. Use test card: `4242 4242 4242 4242`
7. Exp: `12/25`, CVC: `123`
8. Complete payment ✅

## 🎯 Why This Fixes the Error

**Problem**: Your frontend was trying to call Stripe API on your **Vercel domain** (which doesn't have Stripe routes), instead of your **backend server** (which has them).

**Solution**: Updated `NEXT_PUBLIC_API_URL` to point to your local backend server where the Stripe routes actually exist.

## 📊 Architecture

```
Frontend (localhost:3000)
    ↓
    API Call to: http://localhost:5001/api/stripe/*
    ↓
Backend (localhost:5001)
    ↓
    Stripe API
```

## ⚠️ For Production Deployment

When you deploy to production:

1. **Deploy Backend** to Railway/Render/Heroku
2. **Update Vercel Environment Variable**:
   - Variable: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.com/api`
3. **Update Backend CORS** to include production frontend URL
4. **Use Live Stripe Keys** (not test keys)

## 🐛 If Still Getting 404

1. **Check backend is running**:
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"status":"OK"}`

2. **Check Stripe route exists**:
   ```bash
   curl -X POST http://localhost:5001/api/stripe/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{"amount": 100000}'
   ```
   Should return a session ID or error (not 404)

3. **Check environment variables loaded**:
   - Backend: `echo $STRIPE_SECRET_KEY` should show your key
   - Frontend: Check browser console for `NEXT_PUBLIC_API_URL`

## ✅ Expected Result

After restarting both servers:
- "Pay Now" button should redirect to Stripe Checkout ✅
- Payment should process successfully ✅
- Should redirect to success page ✅
- Transaction saved in database ✅

---

**Current Status**: Configuration complete! Just restart both servers and test! 🚀
