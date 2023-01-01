const cron = require('node-cron');
const Loan = require('../models/Loan');
const { sendNotification } = require('./notificationService');

cron.schedule('0 9 * * *', async () => { // Runs daily at 9 AM
  try {
    const dueLoans = await Loan.find({
      status: 'ACTIVE',
      dueDate: { 
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Due in 3 days
      }
    });

    dueLoans.forEach(loan => {
      sendNotification(
        loan.userId,
        `Payment Due: Your loan for ${loan.purpose} is due on ${loan.dueDate.toDateString()}`
      );
    });
  } catch (err) {
    console.error('Payment reminder error:', err);
  }
});