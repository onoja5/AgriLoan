const express = require('express');
const router = express.Router();
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');

router.post('/:loanId/repayments', async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Update loan status
    const newPaidAmount = loan.paidAmount + parseFloat(amount);
    await Loan.findByIdAndUpdate(req.params.loanId, {
      paidAmount: newPaidAmount,
      status: newPaidAmount >= loan.totalAmount ? 'PAID' : 'ACTIVE'
    });

    // Create repayment record
    const repayment = new Repayment({
      loanId: req.params.loanId,
      amount,
      userId
    });

    await repayment.save();
    res.status(201).json(repayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;