// ============================================================
//  script.js
//  Connects the Yaazhlan Dance Studio frontend to the
//  Node.js/Express/MySQL backend running on localhost:5000.
// ============================================================

const API_BASE_URL = window.API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://form-production-47a9.up.railway.app/api'
);

// Warn if Railway URL is still a placeholder on non-localhost deployment
if (typeof window !== 'undefined' && API_BASE_URL.includes('YOUR-RAILWAY-APP') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('registerBanner');
    if (banner) {
      showBanner(banner, '⚠️ Netlify Configuration Notice: Please update frontend/config.js with your deployed Railway backend URL.', 'error');
    }
  });
}

/* ============================================================
   FLOATING PARTICLES
=============================================================*/
(function () {
  const field = document.getElementById('particle-field');
  const colors = ['#D4AF37', '#5B2C83', '#FF6F91', '#FFF8E7'];
  const count = window.innerWidth < 600 ? 18 : 34;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    const dur = Math.random() * 14 + 12;
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = (Math.random() * dur) + 's';
    field.appendChild(p);
  }
})();

/* ============================================================
   PASSWORD SHOW/HIDE TOGGLES
=============================================================*/
document.querySelectorAll('.toggle-eye').forEach((btn) => {
  btn.addEventListener('click', () => {
    const field = document.querySelector(`input[name="${btn.dataset.target}"]`);
    if (field) {
      field.type = field.type === 'password' ? 'text' : 'password';
      btn.textContent = field.type === 'password' ? '👁' : '🙈';
    }
  });
});

const showPassAll = document.getElementById('showPassAll');
if (showPassAll) {
  showPassAll.addEventListener('change', (e) => {
    const type = e.target.checked ? 'text' : 'password';
    ['password', 'confirmPassword'].forEach((n) => {
      const el = document.querySelector(`input[name="${n}"]`);
      if (el) el.type = type;
    });
  });
}

/* ============================================================
   FILE UPLOAD PREVIEW
=============================================================*/
document.querySelectorAll('.upload-box').forEach((box) => {
  const input = box.querySelector('input[type="file"]');
  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      box.classList.add('has-file');
      box.querySelector('.filename').textContent = file.name;
      const preview = box.querySelector('img.preview');
      if (preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
      }
    }
  });
});

/* ============================================================
   VALIDATION HELPERS
=============================================================*/
function setError(field, show) {
  field.classList.toggle('error', show);
}
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v) { return /^[6-9]\d{9}$/.test(v); }

function showBanner(el, message, type) {
  el.textContent = message;
  el.className = `banner show ${type}`;
}
function hideBanner(el) {
  el.className = 'banner';
}

/* ============================================================
   REGISTRATION — POST http://localhost:5000/api/register
=============================================================*/
const registerForm = document.getElementById('registerForm');
const registerBanner = document.getElementById('registerBanner');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const successOverlay = document.getElementById('successOverlay');
const registerBtn = document.getElementById('registerBtn');

registerForm.addEventListener('submit', function (e) {
  e.preventDefault();
  hideBanner(registerBanner);
  let valid = true;

  const fullName = registerForm.querySelector('[name="fullName"]');
  setError(fullName.closest('.field'), !fullName.value.trim());
  if (!fullName.value.trim()) valid = false;

  const phone = registerForm.querySelector('[name="phone"]');
  const phoneOk = isValidPhone(phone.value.trim());
  setError(phone.closest('.field'), !phoneOk);
  if (!phoneOk) valid = false;

  const whatsapp = registerForm.querySelector('[name="whatsapp"]');
  const waOk = isValidPhone(whatsapp.value.trim());
  setError(whatsapp.closest('.field'), !waOk);
  if (!waOk) valid = false;

  const email = registerForm.querySelector('[name="email"]');
  const emailOk = isValidEmail(email.value.trim());
  setError(email.closest('.field'), !emailOk);
  if (!emailOk) valid = false;

  const course = registerForm.querySelector('[name="course"]');
  setError(course.closest('.field'), !course.value);
  if (!course.value) valid = false;

  const username = registerForm.querySelector('[name="username"]');
  setError(username.closest('.field'), !username.value.trim());
  if (!username.value.trim()) valid = false;

  const pass = registerForm.querySelector('[name="password"]');
  const passOk = pass.value.length >= 6;
  setError(pass.closest('.field'), !passOk);
  if (!passOk) valid = false;

  const confirm = registerForm.querySelector('[name="confirmPassword"]');
  const matchOk = confirm.value === pass.value && confirm.value.length > 0;
  setError(confirm.closest('.field'), !matchOk);
  if (!matchOk) valid = false;

  const photoInput = registerForm.querySelector('[name="photo"]');
  if (!photoInput.files.length) {
    document.getElementById('box-photo').style.borderColor = '#FF6F91';
    valid = false;
  } else {
    document.getElementById('box-photo').style.borderColor = '';
  }

  const agree = registerForm.querySelector('[name="agreeTerms"]');
  if (!agree.checked) {
    valid = false;
    agree.closest('label').style.color = '#FF6F91';
  } else {
    agree.closest('label').style.color = '';
  }

  if (!valid) {
    const firstError = registerForm.querySelector('.field.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  loadingText.textContent = 'Submitting your registration…';
  loadingOverlay.classList.add('active');
  registerBtn.disabled = true;

  const formData = new FormData(registerForm);

  fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: formData // multipart/form-data — browser sets the boundary header automatically
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors && data.errors[0]) || 'Registration failed.');
      }
      return data;
    })
    .then((data) => {
      loadingOverlay.classList.remove('active');
      registerBtn.disabled = false;
      successOverlay.classList.add('active'); // 🎉 Registration Successful
      registerForm.reset();
      document.querySelectorAll('.upload-box').forEach((b) => {
        b.classList.remove('has-file');
        b.querySelector('.filename').textContent = '';
        const img = b.querySelector('img.preview');
        if (img) { img.style.display = 'none'; img.src = ''; }
      });
    })
    .catch((err) => {
      loadingOverlay.classList.remove('active');
      registerBtn.disabled = false;
      let errMsg = err.message;
      if (errMsg === 'Failed to fetch' || errMsg.includes('NetworkError') || errMsg.includes('Network Error')) {
        errMsg = `Could not connect to backend server (${API_BASE_URL}). Please verify your Railway URL is correct in frontend/config.js.`;
      }
      showBanner(registerBanner, `❌ ${errMsg}`, 'error');
      registerBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

document.getElementById('closeSuccess').addEventListener('click', () => {
  successOverlay.classList.remove('active');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  hideBanner(registerBanner);
  registerForm.querySelectorAll('.field.error').forEach((f) => f.classList.remove('error'));
  document.querySelectorAll('.upload-box').forEach((b) => {
    b.classList.remove('has-file');
    b.querySelector('.filename').textContent = '';
    const img = b.querySelector('img.preview');
    if (img) { img.style.display = 'none'; img.src = ''; }
  });
});

/* ============================================================
   LOGIN — POST http://localhost:5000/api/login
=============================================================*/
const loginForm = document.getElementById('loginForm');
const loginBanner = document.getElementById('loginBanner');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  hideBanner(loginBanner);
  let valid = true;

  const identifier = loginForm.querySelector('[name="identifier"]');
  const password = loginForm.querySelector('[name="loginPassword"]');
  setError(identifier.closest('.field'), !identifier.value.trim());
  setError(password.closest('.field'), !password.value.trim());
  if (!identifier.value.trim() || !password.value.trim()) valid = false;
  if (!valid) return;

  loadingText.textContent = 'Logging you in…';
  loadingOverlay.classList.add('active');
  loginBtn.disabled = true;

  fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: identifier.value.trim(),
      password: password.value
    })
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid username/email or password.');
      }
      return data;
    })
    .then((data) => {
      // Store the JWT + student info so dashboard.html (and future
      // authenticated requests) can use them.
      const remember = loginForm.querySelector('[name="rememberMe"]').checked;
      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem('yaazhlan_token', data.token);
      storage.setItem('yaazhlan_student', JSON.stringify(data.student));

      loadingOverlay.classList.remove('active');
      loginBtn.disabled = false;
      window.location.href = 'dashboard.html';
    })
    .catch((err) => {
      loadingOverlay.classList.remove('active');
      loginBtn.disabled = false;
      let errMsg = err.message;
      if (errMsg === 'Failed to fetch' || errMsg.includes('NetworkError') || errMsg.includes('Network Error')) {
        errMsg = `Could not connect to backend server (${API_BASE_URL}). Please verify your Railway URL is correct in frontend/config.js.`;
      }
      showBanner(loginBanner, `❌ ${errMsg}`, 'error');
    });
});

document.getElementById('forgotLink').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Please contact the studio at +91 8667283150 to reset your password.');
});
