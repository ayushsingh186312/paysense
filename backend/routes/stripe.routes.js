const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Online = require('../models/Online.model');

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    // Use environment-specific frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Online Payment',
              description: `Payment for ${metadata.clientName || 'Client'}`,
            },
            unit_amount: amount, // amount in paise (₹1 = 100 paise)
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payments/cancel`,
      metadata: {
        ...metadata,
        paymentType: 'online',
      },
    });

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
});

// Verify Payment Session and Save to Database
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // If payment is successful, save to database
    if (session.payment_status === 'paid') {
      // Check if transaction already exists
      const existingTransaction = await Online.findOne({ 
        stripeSessionId: sessionId 
      });
      
      if (!existingTransaction) {
        // Create new transaction
        const onlineTransaction = new Online({
          clientId: session.metadata.clientId || null,
          clientName: session.metadata.clientName || 'Unknown',
          receiptNumber: session.payment_intent || session.id,
          amount: session.amount_total / 100, // Convert paise to rupees
          date: new Date(),
          paymentMethod: session.metadata.paymentMethod || 'Card',
          verified: true,
          status: 'Success',
          referenceNumber: session.id,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        });

        await onlineTransaction.save();
        console.log('✅ Online transaction saved from verification:', onlineTransaction._id);
      } else {
        console.log('ℹ️ Transaction already exists:', existingTransaction._id);
      }
    }
    
    res.json({
      status: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      paymentIntent: session.payment_intent,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Create online transaction in database
      try {
        const onlineTransaction = new Online({
          clientId: session.metadata.clientId || null,
          clientName: session.metadata.clientName || 'Unknown',
          receiptNumber: session.payment_intent || session.id,
          amount: session.amount_total / 100, // Convert paise to rupees
          date: new Date(),
          paymentMethod: 'Card',
          verified: true,
          status: 'Success',
          referenceNumber: session.id,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        });

        await onlineTransaction.save();
        console.log('✅ Online transaction saved:', onlineTransaction._id);
      } catch (dbError) {
        console.error('Error saving transaction to database:', dbError);
      }
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      
      // Optionally update transaction status to Failed
      try {
        await Online.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { status: 'Failed' }
        );
      } catch (err) {
        console.error('Error updating failed payment:', err);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create Payment Intent (for more control)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refund a payment
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // optional - full refund if not specified
      reason: reason || 'requested_by_customer',
    });

    // Update transaction in database
    await Online.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: 'Refunded' }
    );

    res.json({ 
      success: true, 
      refund 
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
