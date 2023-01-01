// Add this with your other route imports
const repaymentRoutes = require('./routes/repaymentRoutes');

// Add this with your other app.use() routes
app.use('/api/loans', repaymentRoutes);