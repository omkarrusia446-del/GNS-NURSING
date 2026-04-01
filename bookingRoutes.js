const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth'); // Require valid JWT for booking

// POST /book
router.post('/', auth, async (req, res) => {
  const { patientType, condition, date, caretakerId } = req.body;

  try {
    const newBooking = new Booking({
      userId: req.user.id,
      patientType,
      condition,
      date,
      caretakerId
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booked successfully!', booking: newBooking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
