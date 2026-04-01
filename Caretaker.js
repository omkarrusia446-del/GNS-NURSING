const mongoose = require('mongoose');

const CaretakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Caretaker', CaretakerSchema);
