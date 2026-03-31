const API_URL = 'http://localhost:5000/api';

// --- AUTH UTILS ---

function setAuth(token) {
  localStorage.setItem('token', token);
}

function getAuth() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

function requireAuth() {
  if (!getAuth()) {
    window.location.href = 'login.html';
  }
}

function checkAuthOnIndex() {
  if (getAuth()) {
    document.getElementById('nav-login').classList.add('hidden');
    document.getElementById('nav-logout').classList.remove('hidden');
  }
}

// --- UI UTILS ---
function switchTab(tab) {
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-register').classList.add('hidden');

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.remove('active', 'hidden');
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `message ${type}`;
}


// --- LOGIN ---
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      setAuth(data.token);
      window.location.href = 'patient.html';
    } else {
      showMsg('login-msg', data.message, 'error');
    }
  } catch (err) {
    showMsg('login-msg', 'Error connecting to server', 'error');
  }
}


// --- REGISTER & RAZORPAY ---
async function handleRegisterAndPay() {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  if (!email || !password) {
    return showMsg('reg-msg', 'Please fill all fields', 'error');
  }

  showMsg('reg-msg', 'Initiating Razorpay payment...', '');

  try {
    // 1. Create Order
    const orderRes = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok) throw new Error(orderData.message || 'Order creation failed');

    // 2. Open Razorpay Checkout
    const options = {
      key: "rzp_test_1234567890ABCD", // Replace with your key in production
      amount: orderData.amount,
      currency: "INR",
      name: "GNS Medical Site",
      description: "Registration Fee",
      order_id: orderData.id,
      handler: async function (response) {
        // 3. Verify Payment
        showMsg('reg-msg', 'Verifying payment...', '');

        const verifyRes = await fetch(`${API_URL}/payment/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email: email
          })
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          // 4. Actual Registration
          showMsg('reg-msg', 'Payment successful! Creating account...', 'success');

          const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, isPaid: true })
          });

          const regData = await regRes.json();
          if (regRes.ok) {
            setAuth(regData.token);
            window.location.href = 'patient.html';
          } else {
            showMsg('reg-msg', regData.message, 'error');
          }
        }
      },
      prefill: { email },
      theme: { color: "#0ea5e9" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    rzp.on('payment.failed', function (response) {
      showMsg('reg-msg', 'Payment Failed. Please try again.', 'error');
    });

  } catch (err) {
    showMsg('reg-msg', err.message || 'Error processing payment.', 'error');
  }
}


// --- PATIENT & BOOKING FLOW ---

function savePatientAndProceed() {
  const type = document.getElementById('patient-type').value;
  const condition = document.getElementById('patient-condition').value;
  const date = document.getElementById('patient-date').value;

  if (!type || !condition || !date) {
    alert("Please fill all details.");
    return;
  }

  // Passing state locally before going to caretaker selection
  localStorage.setItem('bookingDetails', JSON.stringify({ type, condition, date }));
  window.location.href = 'caretaker.html';
}


// --- CARETAKER ---
async function loadCaretakers() {
  const container = document.getElementById('caretaker-list');
  try {
    const res = await fetch(`${API_URL}/caretakers`);
    const caretakers = await res.json();

    container.innerHTML = '';

    if (caretakers.length === 0) {
      container.innerHTML = '<p style="text-align: center; width: 100%;">No caretakers found.</p>';
      return;
    }

    caretakers.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${c.image}" alt="${c.name}" class="profile-image" />
        <h3>${c.name}</h3>
        <p>Experience: ${c.experience}</p>
        <div class="rating">⭐ ${c.rating}/5.0</div>
        <button class="btn-primary" onclick="bookCaretaker('${c._id}')">Hire Now</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading caretakers</p>';
  }
}

async function bookCaretaker(caretakerId) {
  const details = JSON.parse(localStorage.getItem('bookingDetails'));
  if (!details) {
    alert('Booking details missing. Redirecting...');
    window.location.href = 'patient.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuth()}`
      },
      body: JSON.stringify({
        patientType: details.type,
        condition: details.condition,
        date: details.date,
        caretakerId: caretakerId
      })
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById('caretaker-list').classList.add('hidden');
      document.querySelector('.section-title').innerText = '🎉 Booking Confirmed!';
      showMsg('booking-msg', 'Your caretaker has been hired successfully. They will contact you shortly!', 'success');
      localStorage.removeItem('bookingDetails');
    } else {
      showMsg('booking-msg', data.message || 'Booking failed. Try again.', 'error');
    }
  } catch (err) {
    showMsg('booking-msg', 'Error processing booking', 'error');
  }
}
