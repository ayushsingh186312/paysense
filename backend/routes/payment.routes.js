const express = require('express');
const router = express.Router();
const Cheque = require('../models/Cheque.model');
const Cash = require('../models/Cash.model');
const Online = require('../models/Online.model');

router.get('/dashboard', async (req, res) => {
  try {
    const pendingCheques = await Cheque.find({ status: { $in: ['Pending', 'Post-Dated'] } });
    const clearedCheques = await Cheque.find({ status: 'Cleared' });
    const bouncedCheques = await Cheque.find({ status: 'Bounced' });
    const cashTransactions = await Cash.find({ verified: true });

    const totalOutstanding = pendingCheques.reduce((sum, cheque) => sum + cheque.amount, 0);
    const totalCleared = clearedCheques.reduce((sum, cheque) => sum + cheque.amount, 0);
    const totalCash = cashTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const bounceRate = ((bouncedCheques.length / (clearedCheques.length + bouncedCheques.length)) * 100).toFixed(2);
    const now = new Date();
    const summaries = [];

    // Loop through the last 6 months
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      // Fetch data within this month
      const [cheques, cashPayments, onlinePayments] = await Promise.all([
        Cheque.find({ createdAt: { $gte: start, $lte: end } }),
        Cash.find({ createdAt: { $gte: start, $lte: end } }),
        Online.find({ createdAt: { $gte: start, $lte: end } }),
      ]);

      let pending = 0, cleared = 0, failed = 0;

      // 🧾 Cheques
      for (const c of cheques) {
        if (c.status === 'Cleared') cleared += c.amount;
        else if (c.status === 'Bounced') failed += c.amount;
        else pending += c.amount;
      }

      // 💵 Cash
      for (const c of cashPayments) {
        if (c.verified) cleared += c.amount;
        else pending += c.amount;
      }

      // 💳 Online
      for (const o of onlinePayments) {
        if (o.status === 'Success') cleared += o.amount;
        else if (o.status === 'Failed') failed += o.amount;
        else pending += o.amount;
      }

      const monthName = start.toLocaleString('default', { month: 'short' });
      summaries.push({ month: monthName, pending, cleared, failed });
    }

    res.json({
      stats: {
        totalOutstanding,
        pendingCheques: pendingCheques.length,
        clearedThisMonth: totalCleared + totalCash,
        bounceRate: parseFloat(bounceRate) || 0,
      },
      monthlySummary: summaries, 
      recentCheques: pendingCheques.slice(0, 5),
      recentCash: cashTransactions.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingPayments = await Cheque.find({
      dueDate: { $gte: today, $lte: nextMonth },
      status: { $in: ['Pending', 'Post-Dated'] },
    }).sort({ dueDate: 1 }).limit(10);

    res.json(upcomingPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;