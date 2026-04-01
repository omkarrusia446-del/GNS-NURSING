require('dotenv').config();
const mongoose = require('mongoose');
const Caretaker = require('./models/Caretaker');

const dummyCaretakers = [
  {
    name: 'Rahul Sharma',
    experience: '5 Years',
    rating: 4.8,
    image: 'https://cdn-icons-png.flaticon.com/512/2815/2815428.png'
  },
  {
    name: 'Anita Verma',
    experience: '8 Years',
    rating: 4.9,
    image: 'https://cdn-icons-png.flaticon.com/512/2815/2815412.png'
  },
  {
    name: 'Vikram Singh',
    experience: '3 Years',
    rating: 4.5,
    image: 'https://cdn-icons-png.flaticon.com/512/2815/2815428.png'
  },
  {
    name: 'Meera Patel',
    experience: '10 Years',
    rating: 5.0,
    image: 'https://cdn-icons-png.flaticon.com/512/2815/2815412.png'
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gns-medical')
  .then(async () => {
    console.log('MongoDB connected for seeding');
    // Clear existing
    await Caretaker.deleteMany({});
    console.log('Old caretakers removed');
    
    // Insert new
    await Caretaker.insertMany(dummyCaretakers);
    console.log('Dummy caretakers seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
