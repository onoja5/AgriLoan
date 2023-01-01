const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  loanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Loan', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  userId: { 
    type: String, 
    required: true 
  },
  transactionId: { 
    type: String, 
    unique: true,
    default: () => `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
});

module.exports = mongoose.model('Repayment', repaymentSchema);