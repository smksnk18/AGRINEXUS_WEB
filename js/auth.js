// =================== AUTH ===================
let OTP = "", otpTime = null, attempts = 0;

function sendOTP() {
  const mobile = document.getElementById("farmer-mobile").value;
  if (mobile.length !== 10 || isNaN(mobile)) { showToast("Enter a valid 10-digit mobile number"); return; }
  OTP = Math.floor(100000 + Math.random() * 900000).toString();
  otpTime = Date.now(); attempts = 0;
  document.getElementById("otp-display-box").textContent = "Demo OTP: " + OTP;
  document.getElementById("otp-mobile-hint").textContent = "OTP sent to +91 " + mobile;
  openScreen("screen-otp");
  startOtpTimer();
}

let otpTimerInterval = null;
function startOtpTimer() {
  clearInterval(otpTimerInterval);
  let remaining = 120;
  const el = document.getElementById("otp-timer");
  otpTimerInterval = setInterval(() => {
    remaining--;
    el.textContent = "Expires in: " + Math.floor(remaining / 60) + ":" + (remaining % 60).toString().padStart(2, "0");
    if (remaining <= 0) { clearInterval(otpTimerInterval); el.textContent = "OTP expired. Please request a new one."; }
  }, 1000);
}

function verifyOTP() {
  const input = document.getElementById("otp-input").value;
  if (Date.now() - otpTime > 120000) { showToast("OTP expired. Request a new one."); return; }
  if (attempts >= 3) { showToast("Too many attempts. Request a new OTP."); return; }
  if (input === OTP) {
    clearInterval(otpTimerInterval);
    localStorage.setItem("session", "farmer");
    updateNavForLogin();
    showToast("Login successful!");
    openScreen("screen-farmer-dashboard");
  } else {
    attempts++;
    showToast("Invalid OTP. Attempts left: " + (3 - attempts));
  }
}

function updateNavForLogin() {
  document.getElementById("nav-login-btn").classList.add("hidden");
  document.getElementById("nav-logout-btn").classList.remove("hidden");
  const fid = localStorage.getItem("current_farmer_id");
  const farmers = getFarmers();
  const farmer = farmers.find(f => f.id === fid);
  document.getElementById("nav-farmer-name").textContent = farmer ? farmer.name : "Farmer";
}

function logoutFarmer() {
  localStorage.removeItem("session");
  document.getElementById("nav-login-btn").classList.remove("hidden");
  document.getElementById("nav-logout-btn").classList.add("hidden");
  showToast("Logged out successfully");
  openScreen("screen-home");
}
