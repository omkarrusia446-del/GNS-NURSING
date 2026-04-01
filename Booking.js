const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientType: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caretaker',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
