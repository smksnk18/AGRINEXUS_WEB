// =================== LANGUAGE ===================
const LANG = {
  en: {
    // Header
    app_title: "AGRINEXUS",
    welcome: "Welcome to AGRINEXUS",
    subtitle: "Empowering farmers with real-time data, market insights, and sustainable cultivation techniques.",

    // Buttons
    farmer_login: "Farmer Login",
    buyer_view: "Buyer View",
    explore: "Explore Farming",
    learn_more: "Learn More",

    // Features
    market_price: "Market Prices",
    weather_advisory: "Weather Advisory",
    paddy_guide: "Paddy Guide",
    schemes: "Government Schemes",

    // Cards
    dashboard: "Farmer Dashboard",
    dashboard_desc: "Access personalized dashboard, manage stock, and track harvest yields in one place.",
    enter_dashboard: "Enter Dashboard",

    // Forms
    register_farmer: "Register Farmer",
    add_stock: "Add Stock",
    my_stock: "My Stock",
    enter_mobile: "Mobile Number",
    send_otp: "Send OTP",
    otp_verification: "OTP Verification",
    enter_otp: "Enter OTP",
    verify: "Verify & Login",

    // Profile
    farmer_dashboard: "Farmer Dashboard",
    enter_name: "Farmer Name",
    enter_district: "District",
    enter_taluk: "Taluk",
    enter_village: "Village",
    save: "Save Profile",

    // Filters
    filter_district: "District",
    filter_taluk: "Taluk",
    filter_village: "Village",
    search: "Search Produce"
  },


  ta: {
  // ===== HEADER =====
  app_title: "அக்ரிநெக்சஸ்",
  welcome: "AGRINEXUS-க்கு வரவேற்கிறோம்",
  subtitle: "உண்மையான தரவு, சந்தை தகவல்கள் மற்றும் நிலைத்த விவசாய முறைகளால் விவசாயிகளை வலுப்படுத்துகிறோம்.",

  // ===== HERO BUTTONS =====
  farmer_login: "விவசாயி நுழைவு",
  buyer_view: "கொள்முதல் பார்வை",
  explore: "விவசாயத்தை தொடங்கு",
  learn_more: "மேலும் அறிக",

  // ===== DASHBOARD CARD =====
  dashboard: "விவசாயி டாஷ்போர்டு",
  dashboard_desc: "உங்கள் தனிப்பட்ட டாஷ்போர்டை அணுகி, பண்ணை மேலாண்மை மற்றும் விளைச்சலை கண்காணிக்கவும்.",
  enter_dashboard: "டாஷ்போர்டுக்கு செல்ல",

  // ===== FEATURES =====
  market_price: "கொள்முதல் / விற்பனை",
  market_desc: "உங்கள் உற்பத்தியை நேரடியாக வாங்குபவர்களுக்கு விற்கவும்",

  weather_advisory: "வானிலை அறிவிப்பு",
  weather_desc: "உங்கள் பகுதியில் 7 நாள் வானிலை கணிப்பு",

  paddy_guide: "விவசாய வழிகாட்டி",
  paddy_desc: "பயிர் வாழ்க்கைச் சுழற்சி மற்றும் மேலாண்மை தகவல்கள்",
  read_guide: "வழிகாட்டியை படிக்க",

  schemes: "அரசு திட்டங்கள்",
  schemes_desc: "அரசு சலுகைகள் மற்றும் உதவித் திட்டங்களுக்கு விண்ணப்பிக்கவும்",

  cotton: "பருத்தி விவசாயம்",
  cotton_desc: "பூச்சி கட்டுப்பாடு மற்றும் அதிக விளைச்சல் நுட்பங்கள்",
  growth_stage: "வளர்ச்சி நிலை",

  // ===== EXTRA CARDS =====
  eatgood: "EatGood",
  eatgood_desc: "QR அடிப்படையிலான உணவு தரத் தகவல்",
  qr_powered: "QR மூலம் இயக்கப்படுகிறது",

  agrifund: "AgriFund",
  agrifund_desc: "சிறு விவசாயிகளுக்கு கடன் மற்றும் நிதி உதவி",
  coming_soon: "விரைவில் வரும்",

  // ===== STATUS =====
  live: "நேரலை",
  early_cloudy: "மேகமூட்டம்",

  // ===== FORMS =====
  register_farmer: "விவசாயி பதிவு",
  add_stock: "பொருள் சேர்க்க",
  my_stock: "என் பொருட்கள்",

  enter_mobile: "கைபேசி எண்",
  send_otp: "OTP அனுப்பு",
  otp_verification: "OTP சரிபார்ப்பு",
  enter_otp: "OTP உள்ளிடுக",
  verify: "சரிபார்த்து நுழை",

  // ===== PROFILE =====
  farmer_dashboard: "விவசாயி பலகை",
  enter_name: "விவசாயி பெயர்",
  enter_district: "மாவட்டம்",
  enter_taluk: "வட்டம்",
  enter_village: "கிராமம்",
  save: "சேமிக்க",

  // ===== FILTER =====
  filter_district: "மாவட்டம்",
  filter_taluk: "வட்டம்",
  filter_village: "கிராமம்",
  search: "பொருள் தேடு",

  // ===== FOOTER =====
  about: "AGRINEXUS என்பது தொழில்நுட்பத்தின் மூலம் விவசாயத்தை மேம்படுத்தும் ஒரு தளம்.",
  resources: "வளங்கள்",
  legal: "சட்ட தகவல்",
  about_us: "எங்களை பற்றி",
  contact: "தொடர்பு கொள்ள",
  privacy: "தனியுரிமை கொள்கை",
  terms: "விதிமுறைகள்",

  copyright: "© 2024 AGRINEXUS. எதிர்காலத்தை வளர்க்கிறோம்."
}
};

// =================== STATE ===================
let currentLang = localStorage.getItem("lang") || "en";

// =================== APPLY LANGUAGE ===================
function applyLanguage() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");

    // fallback logic
    const value =
      LANG[currentLang]?.[key] ||
      LANG["en"]?.[key] ||
      key;

    el.textContent = value;
  });

  // Button styles
  toggleLangButton("btn-lang-en", currentLang === "en");
  toggleLangButton("btn-lang-ta", currentLang === "ta");
}

// =================== BUTTON STYLE ===================
function toggleLangButton(id, active) {
  const el = document.getElementById(id);
  if (!el) return;

  el.className = active
    ? "text-primary font-bold border-b-2 border-primary font-label text-sm px-4 py-1 rounded-full"
    : "text-on-surface opacity-60 font-label text-sm px-4 py-1 rounded-full hover:bg-surface-container transition-all";
}

// =================== SET LANGUAGE ===================
function setLanguage(lang) {
  if (!LANG[lang]) return;

  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyLanguage();
}

// =================== INIT ===================
document.addEventListener("DOMContentLoaded", applyLanguage);