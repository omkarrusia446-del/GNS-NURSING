const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// POST /create-order
router.post('/create-order', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 1100, // ₹11 in paise (11 * 100)
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random()*1000)}`
    };

    const order = await instance.orders.create(options);

    // Save pending payment record to DB
    const paymentRecord = new Payment({
      email,
      amount: 11,
      paymentId: order.id,
      status: 'pending'
    });
    await paymentRecord.save();

    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).send(error);
  }
});

// POST /verify-payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment is successful
    try {
      await Payment.findOneAndUpdate(
        { paymentId: razorpay_order_id },
        { status: 'successful' }
      );
      return res.status(200).json({ message: "Payment verified successfully", isPaid: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error" });
    }
  } else {
    return res.status(400).json({ message: "Invalid signature sent!" });
  }
});

module.exports = router;
