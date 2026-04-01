const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  email: {
    type: String, // Keeping email so we can verify the user before they are officially created in DB
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
