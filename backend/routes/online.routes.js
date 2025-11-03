const express = require('express');
const router = express.Router();
const Online = require('../models/Online.model');

// 🟢 Get all online transactions (with filters)
router.get('/', async (req, res) => {
  try {
    const { verified, status, startDate, endDate } = req.query;
    let query = {};

    if (verified !== undefined) query.verified = verified === 'true';
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Online.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Create a new online transaction
router.post('/', async (req, res) => {
  try {
    const onlineData = {
      ...req.body,
      amount: parseFloat(req.body.amount),
    };

    const transaction = new Online(onlineData);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟢 Get a specific online transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Online.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Update an online transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Online.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟢 Mark as verified
router.patch('/:id/verify', async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const transaction = await Online.findByIdAndUpdate(
      req.params.id,
      {
        verified: true,
        verifiedBy,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟢 Mark as deposited/settled to bank
router.patch('/:id/bank-deposit', async (req, res) => {
  try {
    const { bankName, bankDepositDate } = req.body;
    const transaction = await Online.findByIdAndUpdate(
      req.params.id,
      {
        depositedToBank: true,
        bankName,
        bankDepositDate: new Date(bankDepositDate),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟢 Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Online.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;