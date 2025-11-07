const mongoose = require('mongoose');

const OnlineSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  clientName: {
    type: String,
    required: true,
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'NetBanking', 'Wallet'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: String,
  },
  depositedToBank: {
    type: Boolean,
    default: false,
  },
  bankName: {
    type: String,
  },
   bankDepositDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  // Stripe-specific fields
  stripeSessionId: {
    type: String,
    sparse: true,
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true,
  },
  referenceNumber: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Online', OnlineSchema);