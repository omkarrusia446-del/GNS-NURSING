const express = require('express');
const router = express.Router();
const Caretaker = require('../models/Caretaker');

// GET /caretakers
router.get('/', async (req, res) => {
  try {
    const caretakers = await Caretaker.find();
    res.json(caretakers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
