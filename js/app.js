// =================== TOAST ===================
function showToast(msg, duration = 2500) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// =================== NAVIGATION ===================
function openScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screen = document.getElementById(id);
  if (screen) { screen.classList.add("active"); window.scrollTo(0, 0); }
  if (id === "screen-my-stock") loadMyStock();
  if (id === "screen-market") renderMarketPrices();
  if (id === "screen-schemes") renderSchemes();
  if (id === "screen-paddy-guide") loadPaddyStates();
  if (id === "screen-buyer-view") loadDistricts("buyer");
  if (id === "screen-farmer-register") loadDistricts("farm");
  if (id === "screen-cotton-buyer") loadCottonDistricts();
  if (id === "screen-weather") detectLocationAndFetchWeather();
  if (id === "screen-cotton-varieties") loadCottonOptions();
  if (id !== "screen-eatgood-consumer") stopScanner();
  if (id === "screen-eatgood-consumer") initScanner();
}

// =================== DATA HELPERS ===================
function getFarmers() { return JSON.parse(localStorage.getItem(FARMER_KEY)) || []; }
function getStocks()  { return JSON.parse(localStorage.getItem(STOCK_KEY))  || []; }

function saveFarmer() {
  const name     = document.getElementById("reg-name").value;
  const district = document.getElementById("reg-district").value;
  const taluk    = document.getElementById("reg-taluk").value;
  const village  = document.getElementById("reg-village").value;
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  if (!name || !district || !taluk || !village || !username || !password) { showToast("Please fill all fields"); return; }
  const farmerId = "F" + Date.now();
  const farmer   = { id: farmerId, name, district, taluk, village };
  const farmers  = getFarmers(); farmers.push(farmer);
  localStorage.setItem(FARMER_KEY, JSON.stringify(farmers));
  localStorage.setItem("current_farmer_id", farmerId);
  document.getElementById("nav-farmer-name").textContent = name;
  showToast("Farmer profile saved!");
  openScreen("screen-farmer-dashboard");
}
async function loadMarketFromAPI() {
  const res = await fetch("/market-prices");
  const data = await res.json();

  renderMarket(data);
}
function renderMarket(data) {
  const container = document.getElementById("market-list");
  container.innerHTML = "";

  data.forEach(item => {
    const trend = getTrend(item.price, item.previousPrice);

    container.innerHTML += `
      <div style="background:#fff;padding:15px;margin-bottom:10px;border-radius:10px;">
        <h3>${item.crop}</h3>
        <p>₹${item.price}</p>
        <p>${item.market}</p>
        <p>${item.state}</p>
        <p>${trend}</p>
      </div>
    `;
  });
}
function saveStock() {
  const crop  = document.getElementById("stock-crop").value;
  const qty   = document.getElementById("stock-qty").value;
  const unit  = document.getElementById("stock-unit").value;
  const price = document.getElementById("stock-price").value;
  if (!qty || !price) { showToast("Enter quantity and price"); return; }
  const farmerId = localStorage.getItem("current_farmer_id");
  const farmers  = getFarmers();
  const farmer   = farmers.find(f => f.id === farmerId);
  if (!farmer) { showToast("Farmer profile not found. Please register first."); return; }
  const stock = { id: "S" + Date.now(), farmerId, crop, qty: Number(qty), unit, price: Number(price), district: farmer.district, taluk: farmer.taluk, village: farmer.village, name: farmer.name, status: "available", createdAt: Date.now() };
  const stocks = getStocks(); stocks.push(stock);
  localStorage.setItem(STOCK_KEY, JSON.stringify(stocks));
  showToast("Stock listed successfully!");
  document.getElementById("stock-qty").value  = "";
  document.getElementById("stock-price").value = "";
  openScreen("screen-farmer-dashboard");
}

function loadMyStock() {
  const farmerId = localStorage.getItem("current_farmer_id");
  const list = document.getElementById("my-stock-list");
  list.innerHTML = "";
  const stocks = getStocks().filter(s => s.farmerId === farmerId);
  if (stocks.length === 0) {
    list.innerHTML = '<div class="ag-card text-center text-on-surface-variant py-8"><span class="material-symbols-outlined text-4xl block mb-2">inventory_2</span>No stock added yet. <a onclick="openScreen(\'screen-add-stock\')" class="text-primary font-bold cursor-pointer underline">Add Stock</a></div>';
    return;
  }
  stocks.forEach(s => {
    const statusChip = s.status === "available"
      ? `<span class="ag-chip text-xs">Available</span>`
      : `<span class="ag-chip ag-chip-orange text-xs">Sold</span>`;
    list.innerHTML += `
    <div class="stock-card-agri${s.status === 'available' ? ' stock-card-best' : ''}">
      <div class="flex justify-between items-start mb-2">
        <div>
          <strong class="font-headline text-lg">${s.crop}</strong>
          ${statusChip}
        </div>
        <span class="font-black text-xl text-primary">₹${s.price}<span class="text-xs font-normal text-on-surface-variant">/${s.unit}</span></span>
      </div>
      <p class="text-sm text-on-surface-variant mb-3">${s.qty} ${s.unit} · Total: ₹${s.qty * s.price}</p>
      <div class="flex gap-2 flex-wrap">
        <button class="ag-btn ag-btn-secondary text-xs py-1.5 px-4" onclick="editStock('${s.id}')">Edit</button>
        <button class="ag-btn ag-btn-secondary text-xs py-1.5 px-4" onclick="markSold('${s.id}')">Mark Sold</button>
        <button class="ag-btn ag-btn-danger text-xs py-1.5 px-4" onclick="deleteStock('${s.id}')">Delete</button>
      </div>
    </div>`;
  });
}

function deleteStock(id) { let stocks = getStocks().filter(s => s.id !== id); localStorage.setItem(STOCK_KEY, JSON.stringify(stocks)); loadMyStock(); showToast("Stock removed"); }
function markSold(id)    { const stocks = getStocks(); const s = stocks.find(x => x.id === id); if (s) s.status = "sold"; localStorage.setItem(STOCK_KEY, JSON.stringify(stocks)); loadMyStock(); showToast("Marked as sold"); }
function editStock(id) {
  const stocks = getStocks(); const s = stocks.find(x => x.id === id); if (!s) return;
  const newQty   = prompt("Enter new quantity:", s.qty);
  const newPrice = prompt("Enter new price:", s.price);
  if (newQty   !== null) s.qty   = Number(newQty);
  if (newPrice !== null) s.price = Number(newPrice);
  localStorage.setItem(STOCK_KEY, JSON.stringify(stocks)); loadMyStock(); showToast("Stock updated");
}

function filterStock() {
  const d          = document.getElementById("buyer-district").value;
  const t          = document.getElementById("buyer-taluk").value;
  const v          = document.getElementById("buyer-village").value;
  const sortOption = document.getElementById("price-sort")?.value;
  let result = getStocks().filter(s => s.status === "available" && (!d || s.district === d) && (!t || s.taluk === t) && (!v || s.village === v));
  if (sortOption === "low")  result.sort((a, b) => a.price - b.price);
  if (sortOption === "high") result.sort((a, b) => b.price - a.price);
  const list = document.getElementById("buyer-stock-list");
  list.innerHTML = "";
  if (result.length === 0) { list.innerHTML = '<div class="ag-card text-center py-8 text-on-surface-variant">No produce available for this location.</div>'; return; }
  const minPrice = Math.min(...result.map(s => s.price));
  result.forEach(s => {
    const isBest = s.price === minPrice;
    list.innerHTML += `
    <div class="stock-card-agri${isBest ? ' stock-card-best' : ''}">
      <div class="flex justify-between items-start mb-2">
        <div>
          <strong class="font-headline text-lg">${s.crop}</strong>
          ${isBest ? '<span class="ag-chip ml-2 text-xs">Best Price</span>' : ""}
        </div>
        <span class="font-black text-xl text-primary">₹${s.price}<span class="text-xs font-normal text-on-surface-variant">/${s.unit}</span></span>
      </div>
      <p class="text-sm text-on-surface-variant mb-1">${s.qty} ${s.unit} available</p>
      <p class="text-sm font-medium mb-1">${s.name}</p>
      <p class="text-xs text-on-surface-variant">${s.village}, ${s.taluk}, ${s.district}</p>
    </div>`;
  });
}

function filterCottonStock() {
  const d    = document.getElementById("cotton-district")?.value;
  const list = document.getElementById("cotton-stock-list");
  list.innerHTML = "";
  let result = getStocks().filter(s => s.status === "available" && s.crop === "Cotton" && (!d || s.district === d));
  if (result.length === 0) { list.innerHTML = '<div class="ag-card text-center py-8 text-on-surface-variant">No cotton stock available for this filter.</div>'; return; }
  result.forEach(s => { list.innerHTML += `<div class="stock-card-agri"><strong class="font-headline text-lg">${s.crop}</strong><span class="font-black text-xl text-primary float-right">₹${s.price}/${s.unit}</span><br><p class="text-sm text-on-surface-variant">${s.qty} ${s.unit} · ${s.name} · ${s.village}</p></div>`; });
}

// =================== DISTRICTS ===================
function loadDistricts(mode = "farm") {
  const id = mode === "buyer" ? "buyer-district" : "reg-district";
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<option value="">Select District</option>';
  TNDATA.forEach(d => el.innerHTML += `<option value="${d.district}">${d.district}</option>`);
}
function loadTaluks(district, mode = "farm") {
  const talukEl = document.getElementById(mode === "buyer" ? "buyer-taluk" : "reg-taluk");
  if (!talukEl) return;
  talukEl.innerHTML = '<option value="">Select Taluk</option>';
  const d = TNDATA.find(x => x.district === district);
  if (!d) return;
  d.taluks.forEach(tk => talukEl.innerHTML += `<option value="${tk.name}">${tk.name}</option>`);
}
function loadVillages(taluk, mode = "farm") {
  const vEl = document.getElementById(mode === "buyer" ? "buyer-village" : "reg-village");
  if (!vEl) return;
  vEl.innerHTML = '<option value="">Select Village</option>';
  for (let d of TNDATA) { const tk = d.taluks.find(x => x.name === taluk); if (tk) { tk.villages.forEach(v => vEl.innerHTML += `<option value="${v}">${v}</option>`); break; } }
}
function loadCottonDistricts() {
  const el = document.getElementById("cotton-district");
  if (!el) return;
  el.innerHTML = '<option value="">Select District</option>';
  TNDATA.forEach(d => el.innerHTML += `<option value="${d.district}">${d.district}</option>`);
}

// =================== MARKET PRICES ===================
let chartInstance;

function renderMarketChart(data) {
  const canvas = document.getElementById("marketChart");
  if (!canvas) return;

  if (chartInstance) chartInstance.destroy();

  // 🔥 GROUP BY CROP (AVERAGE PRICE)
  const grouped = {};

  data.forEach(item => {
    if (!grouped[item.crop]) {
      grouped[item.crop] = { total: 0, count: 0 };
    }
    grouped[item.crop].total += item.price;
    grouped[item.crop].count += 1;
  });

  const labels = Object.keys(grouped);
  const prices = labels.map(crop =>
    Math.round(grouped[crop].total / grouped[crop].count)
  );

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Avg Market Price",
        data: prices
      }]
    }
  });
}
async function renderMarketPrices() {
  const container = document.getElementById("market-price-table");
  container.innerHTML = "Loading...";

  let apiData = [];

  try {
    const res = await fetch("/market-prices");
    apiData = await res.json();
  } catch (e) {
    console.log("API failed, using fallback");
  }

  const stocks = getStocks();
  const demandCount = {};

  stocks.forEach(s => {
    if (s.status === "available") {
      demandCount[s.crop] = (demandCount[s.crop] || 0) + 1;
    }
  });

  const dataToUse = apiData.length > 0 ? apiData : MARKET_PRICES;

  container.innerHTML = "";

  dataToUse.forEach(item => {
    const cropStocks = stocks.filter(s => s.crop === item.crop && s.status === "available");

    let lowest = null, highest = null, percentDiff = 0, trend = "→",
        badgeClass = "ag-chip-orange", badgeText = "No Listings", barWidth = 0;

    if (cropStocks.length > 0) {
      lowest  = Math.min(...cropStocks.map(s => s.price));
      highest = Math.max(...cropStocks.map(s => s.price));

      percentDiff = (((lowest - item.price) / item.price) * 100).toFixed(1);
      barWidth = Math.min(Math.abs(percentDiff) * 3, 100);

      if (lowest < item.price) {
        trend = "↓"; badgeClass = "ag-chip"; badgeText = "Below Market";
      } else if (lowest > item.price) {
        trend = "↑"; badgeClass = "ag-chip-red"; badgeText = "Above Market";
      } else {
        trend = "→"; badgeClass = "ag-chip-orange"; badgeText = "At Market";
      }
    }

    container.innerHTML += `
    <div class="market-row">
      <div class="flex justify-between items-center mb-2">
        <div>
          <strong class="font-headline text-xl">${item.crop}</strong>
          <span class="${badgeClass} ml-2 text-xs">${badgeText}</span>
        </div>
        <span class="font-black text-2xl text-primary">
          ₹${item.price}
          <span class="text-xs">/kg</span>
        </span>
      </div>

      <div class="text-sm flex gap-6 flex-wrap">
        <span>Listings: <strong>${cropStocks.length}</strong></span>
        <span>Demand: <strong>${demandCount[item.crop] || 0}</strong></span>
        ${lowest !== null ? `<span>Range: ₹${lowest}–₹${highest} (${percentDiff}% ${trend})</span>` : ''}
      </div>

      <div class="progress-track mt-3">
        <div class="progress-fill" style="width:${barWidth}%"></div>
      </div>
    </div>`;
  });

  // 🔥 ADD GRAPH CALL HERE
  renderMarketChart(dataToUse);
}

// =================== WEATHER ===================
function detectLocationAndFetchWeather() {
  const dash    = document.getElementById("weather-dashboard");
  const loading = document.getElementById("weather-loading");
  const error   = document.getElementById("weather-error");
  if (dash)    dash.style.display    = "none";
  if (error)   error.style.display   = "none";
  if (loading) loading.style.display = "block";
  if (!navigator.geolocation) {
    if (loading) loading.style.display = "none";
    if (error)   { error.style.display = "block"; document.getElementById("weather-error-msg").textContent = "Geolocation is not supported by your browser."; }
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherDashboard(pos.coords.latitude, pos.coords.longitude),
    () => {
      if (loading) loading.style.display = "none";
      if (error)   { error.style.display = "block"; document.getElementById("weather-error-msg").textContent = "Location access denied. Please allow location in your browser settings."; }
    },
    { timeout: 10000 }
  );
}

async function fetchWeatherDashboard(lat, lon) {
  const apiKey  = "d874936bda4a7d689adfcca61e20624c";
  const loading = document.getElementById("weather-loading");
  const error   = document.getElementById("weather-error");
  try {
    const [curRes, foreRes, geoRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
    ]);
    const cur  = await curRes.json();
    const fore = await foreRes.json();
    const geo  = await geoRes.json();
    if (loading) loading.style.display = "none";
    if (cur.cod !== 200) { if (error) { error.style.display = "block"; document.getElementById("weather-error-msg").textContent = "API error: " + cur.message; } return; }
    window._lastWeatherData = { cur, fore, geo, lat, lon };
    renderWeatherDashboard({ cur, fore, geo, lat, lon });
  } catch (e) {
    if (loading) loading.style.display = "none";
    if (error)   { error.style.display = "block"; document.getElementById("weather-error-msg").textContent = "Failed to fetch weather data. Check your internet connection."; }
  }
}

function renderWeatherDashboard({ cur, fore, geo, lat, lon }) {
  const dash = document.getElementById("weather-dashboard");
  if (dash) dash.style.display = "block";

  const crop = document.getElementById("weather-crop").value || "Paddy";

  // Location
  const city = geo && geo[0] ? `${geo[0].name}, ${geo[0].state || geo[0].country}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  document.getElementById("wx-location-line").textContent = `${city} • Updated just now`;

  // Temp & condition
  const temp     = Math.round(cur.main.temp);
  const condText = cur.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());
  document.getElementById("wx-big-temp").textContent = `${temp}°C`;
  document.getElementById("wx-condition").textContent = condText;

  const iconMap = { "01": "wb_sunny", "02": "partly_cloudy_day", "03": "cloud", "04": "cloud", "09": "rainy", "10": "rainy", "11": "thunderstorm", "13": "ac_unit", "50": "foggy" };
  document.getElementById("wx-icon-sym").textContent = iconMap[cur.weather[0].icon.slice(0, 2)] || "partly_cloudy_day";

  // Soil moisture
  const humid  = cur.main.humidity;
  const rainMm = (cur.rain && cur.rain["1h"]) || 0;
  const soilEst = Math.min(95, Math.round(humid * 0.6 + rainMm * 5 + 20));
  document.getElementById("wx-soil").textContent = soilEst + "%";
  setTimeout(() => { document.getElementById("wx-soil-bar").style.width = soilEst + "%"; }, 200);
  document.getElementById("wx-soil-note").textContent = soilEst < 40 ? "Below optimal — consider irrigation for your region." : soilEst < 75 ? "Optimal levels for most crop varieties in your region." : "High moisture — avoid waterlogging, check drainage.";

  // Metric cards
  const wind    = cur.wind ? Math.round(cur.wind.speed * 3.6) : 0;
  const windDir = cur.wind ? compassDir(cur.wind.deg) : "--";
  document.getElementById("wx-wind").textContent       = wind + " km/h";
  document.getElementById("wx-wind-dir").textContent   = windDir + " Direction";
  document.getElementById("wx-humidity").textContent    = humid + "%";
  document.getElementById("wx-humidity-sub").textContent = humid > 80 ? "High Heat Index" : humid > 60 ? "Moderate Index" : "Low Heat Index";

  const clouds  = cur.clouds?.all || 0;
  const hr      = new Date().getHours();
  const uvBase  = hr >= 10 && hr <= 16 ? 5 : hr >= 7 && hr <= 19 ? 3 : 1;
  const uv      = Math.max(1, Math.round(uvBase * (1 - (clouds / 100) * 0.7)));
  document.getElementById("wx-uv").textContent     = `${uv} / 11`;
  document.getElementById("wx-uv-sub").textContent = uv <= 2 ? "Low Risk" : uv <= 5 ? "Moderate Risk" : uv <= 7 ? "High Risk" : "Very High Risk";

  const vis = cur.visibility ? `${(cur.visibility / 1000).toFixed(1)} km` : "--";
  document.getElementById("wx-visibility").textContent = vis;
  document.getElementById("wx-vis-sub").textContent    = cur.visibility >= 10000 ? "Clear" : "Light Mist";

  // Donut
  const d1 = Math.round(humid * 0.7);
  const d2 = Math.round(clouds * 0.15);
  const d3 = 100 - d1 - d2;
  document.getElementById("wx-d1").setAttribute("stroke-dasharray", `${d1} ${100 - d1}`);
  document.getElementById("wx-d2").setAttribute("stroke-dasharray", `${d2} ${100 - d2}`);
  document.getElementById("wx-d2").setAttribute("stroke-dashoffset", `${-(d1)}`);
  document.getElementById("wx-d3").setAttribute("stroke-dasharray", `${Math.max(0, d3)} ${100 - Math.max(0, d3)}`);
  document.getElementById("wx-d3").setAttribute("stroke-dashoffset", `${-(d1 + d2)}`);
  document.getElementById("wx-leg-humidity").textContent = d1 + "%";
  document.getElementById("wx-leg-cloud").textContent    = d2 + "%";
  document.getElementById("wx-leg-other").textContent    = Math.max(0, d3) + "%";

  // Precipitation bars
  const slots    = fore.list.slice(0, 8);
  const maxPop   = Math.max(...slots.map(s => s.pop || 0), 0.01);
  const slotLabels = slots.map(s => {
    const d = new Date(s.dt * 1000);
    return d.getHours() === 0 ? "12AM" : d.getHours() < 12 ? d.getHours() + "AM" : d.getHours() === 12 ? "12PM" : (d.getHours() - 12) + "PM";
  });
  document.getElementById("wx-precip-bars").innerHTML = slots.map((s, i) => {
    const pop = (s.pop || 0);
    const h   = Math.round((pop / maxPop) * 80) + 8;
    const intense = pop > 0.6 ? "#012d1d" : pop > 0.3 ? "#116c4a" : "#a1f4c8";
    return `<div class="flex flex-col items-center gap-1 flex-1">
      <div style="height:${h}px;width:100%;max-width:28px;background:${intense};border-radius:6px;transition:height 0.6s ease;"></div>
      <span class="text-[10px] text-on-surface-variant">${slotLabels[i]}</span>
    </div>`;
  }).join("");

  const maxRainSlot = slots.reduce((a, b) => (b.pop || 0) > (a.pop || 0) ? b : a, slots[0]);
  const maxRainMm   = Math.round((maxRainSlot.pop || 0) * 12);
  const rainLabel   = maxRainSlot.pop > 0.6 ? "Thunderstorms likely" : maxRainSlot.pop > 0.3 ? "Rain showers likely" : "Light precipitation";
  document.getElementById("wx-precip-summary").textContent = rainLabel;
  document.getElementById("wx-precip-sub").textContent     = maxRainMm > 0 ? `Estimated ${maxRainMm}mm accumulation` : "Minimal accumulation expected";

  // Farming advice
  const adviceList = generateFarmingAdvice(temp, humid, wind, maxRainSlot.pop * 100, crop);
  document.getElementById("wx-advice-list").innerHTML = adviceList.map(a => `
    <div class="flex gap-3 items-start">
      <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style="background:rgba(161,244,200,0.15);">
        <span class="material-symbols-outlined text-base" style="color:#a1f4c8;">${a.icon}</span>
      </div>
      <div>
        <p class="font-bold text-sm mb-1" style="color:#c1ecd4;">${a.title}</p>
        <p class="text-xs leading-relaxed" style="color:rgba(255,255,255,0.65);">${a.body}</p>
      </div>
    </div>`).join("");

  // Crop vulnerability
  const stockedCrops = getCropVulnerabilityCrops(crop);
  const cropImages   = { Paddy: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=160&h=120&fit=crop", Cotton: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=160&h=120&fit=crop", Tomato: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=160&h=120&fit=crop", Onion: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=160&h=120&fit=crop", Chilli: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=160&h=120&fit=crop" };
  document.getElementById("wx-crop-cards").innerHTML = stockedCrops.map(c => {
    const vuln      = getCropVulnerabilityData(c, temp, humid, wind, maxRainSlot.pop * 100);
    const dotColor  = vuln.risk === "high" ? "#ba1a1a" : vuln.risk === "medium" ? "#856404" : "#116c4a";
    return `<div class="ag-card flex items-center gap-5">
      <img src="${cropImages[c] || cropImages.Paddy}" class="rounded-xl object-cover flex-shrink-0" style="width:100px;height:80px;" alt="${c}"/>
      <div class="flex-1">
        <h4 class="font-headline font-bold text-lg mb-0.5">${c}</h4>
        <p class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">${vuln.stage}</p>
        ${vuln.alerts.map(a => `<p class="text-sm flex items-center gap-2"><span style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;display:inline-block;"></span>${a}</p>`).join("")}
      </div>
    </div>`;
  }).join("");
}

function generateFarmingAdvice(temp, humidity, wind, rainChance, crop) {
  const advice = [];
  if (rainChance > 60)                     advice.push({ icon: "water_drop", title: "Avoid irrigation today",  body: `With an ${Math.round(rainChance)}% probability of heavy rainfall, additional irrigation may lead to waterlogging in low-lying tracts.` });
  if (wind > 20)                           advice.push({ icon: "air",        title: "Delay Pest Spraying",     body: `High wind speeds (up to ${Math.round(wind)}km/h) predicted will cause chemical drift. Postpone spraying until tomorrow morning.` });
  if (humidity > 80 && crop === "Paddy")   advice.push({ icon: "warning",    title: "Blast Disease Risk",      body: `High humidity (${Math.round(humidity)}%) increases risk of leaf blast. Monitor fields and apply preventive fungicide if needed.` });
  if (temp > 34)                           advice.push({ icon: "thermostat", title: "Heat Stress Alert",       body: `Temperature above 34°C can cause heat stress in ${crop}. Ensure adequate irrigation and consider shade nets.` });
  if (temp < 15)                           advice.push({ icon: "ac_unit",    title: "Cold Weather Alert",      body: `Temperature below 15°C may slow growth for ${crop}. Consider protective covering during night hours.` });
  if (advice.length === 0) {
    advice.push({ icon: "check_circle", title: "Favorable Conditions",   body: `Current weather is well-suited for ${crop}. Continue with regular farming activities as planned.` });
    advice.push({ icon: "eco",          title: "Optimal Growth Window",  body: "This is a good time for fertilizer application and routine crop management activities." });
  }
  return advice.slice(0, 3);
}

function getCropVulnerabilityCrops(primaryCrop) {
  const all      = ["Paddy", "Cotton", "Tomato", "Onion", "Chilli"];
  const selected = [primaryCrop];
  const stocks   = getStocks().filter(s => s.status === "available");
  stocks.forEach(s => { if (!selected.includes(s.crop) && all.includes(s.crop)) selected.push(s.crop); });
  if (selected.length < 2) { const other = all.find(c => c !== primaryCrop); if (other) selected.push(other); }
  return selected.slice(0, 4);
}

function getCropVulnerabilityData(crop, temp, humidity, wind, rainChance) {
  const stages = { Paddy: "Flowering Stage", Cotton: "Vegetative Stage", Tomato: "Fruiting Stage", Onion: "Bulb Formation", Chilli: "Fruiting Stage" };
  const alerts = []; let risk = "low";
  if      (crop === "Paddy")  { if (humidity > 80) { alerts.push("High risk of blast disease due to humidity."); risk = "high"; } else { alerts.push("Favorable conditions for growth."); } }
  else if (crop === "Cotton") { if (wind > 15)     { alerts.push("Wind may cause shedding of bolls."); risk = "medium"; } else { alerts.push("Favorable conditions for growth."); } }
  else if (crop === "Tomato") { if (temp > 30)     { alerts.push("Heat stress possible — check for wilting."); risk = "medium"; } else { alerts.push("Good growing conditions today."); } }
  else if (crop === "Onion")  { if (rainChance > 50) { alerts.push("Excess moisture risk — monitor for rot."); risk = "medium"; } else { alerts.push("Conditions are suitable for bulb development."); } }
  else if (crop === "Chilli") { if (temp < 18)     { alerts.push("Temperature may slow flowering."); risk = "medium"; } else { alerts.push("Good temperature for fruit development."); } }
  else { alerts.push("Monitor standard conditions for this crop."); }
  return { stage: stages[crop] || "Growth Stage", alerts, risk };
}

function compassDir(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8] || "N";
}

// =================== PADDY GUIDE ===================
function loadPaddyStates() {
  const stateSelect = document.getElementById("paddy-state");
  stateSelect.innerHTML = '<option value="">-- Select State --</option>';
  PADDY_VARIETIES.forEach((g, i) => stateSelect.innerHTML += `<option value="${i}">${g.state}</option>`);
}
function loadVarietyOptions() {
  const stateIndex    = document.getElementById("paddy-state").value;
  const varietySelect = document.getElementById("paddy-variety");
  varietySelect.innerHTML = '<option value="">-- Select Variety --</option>';
  if (stateIndex === "") return;
  PADDY_VARIETIES[stateIndex].varieties.forEach((v, i) => varietySelect.innerHTML += `<option value="${i}">${v.name}</option>`);
  document.getElementById("paddy-varieties").innerHTML = "";
}
function totalCost(costObj) { return Object.values(costObj).reduce((a, b) => a + b, 0); }
function profitCalculator(yieldPerHectare, price, costPerAcre) {
  const yieldPerAcre = yieldPerHectare / 2.47;
  const revenue      = yieldPerAcre * price;
  return { revenue: Math.round(revenue), profit: Math.round(revenue - costPerAcre) };
}
function renderSelectedVariety() {
  const stateIndex   = document.getElementById("paddy-state").value;
  const varietyIndex = document.getElementById("paddy-variety").value;
  const box          = document.getElementById("paddy-varieties");
  box.innerHTML = "";
  if (stateIndex === "" || varietyIndex === "") return;
  const group = PADDY_VARIETIES[stateIndex];
  const v     = group.varieties[varietyIndex];
  let html = `<div class="ag-card">
    <div class="flex gap-3 mb-4">
      <div class="bg-primary-fixed w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-on-primary-fixed">eco</span>
      </div>
      <div>
        <h3 class="font-headline font-bold text-xl">${v.name}</h3>
        <p class="text-xs text-on-surface-variant">${group.state}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 text-sm mb-4">
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Duration</p><p class="font-bold">${v.duration}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Type</p><p class="font-bold">${v.type}</p></div>
      <div class="paddy-card-agri col-span-2"><p class="text-xs text-on-surface-variant">Suitable For</p><p class="font-bold">${v.suitable}</p></div>
    </div>`;
  if (v.cost && v.yield && v.marketPrice) {
    const orgCost    = totalCost(v.cost.organic);
    const chemCost   = totalCost(v.cost.chemical);
    const orgResult  = profitCalculator(v.yield, v.marketPrice, orgCost);
    const chemResult = profitCalculator(v.yield, v.marketPrice, chemCost);
    html += `<hr class="my-4 border-outline-variant/20"/>
    <h4 class="font-bold mb-3">Cost & Profit (per Acre)</h4>
    <div class="grid grid-cols-2 gap-3 text-sm mb-4">
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Organic Cost</p><p class="font-bold text-lg">₹${orgCost.toLocaleString()}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Chemical Cost</p><p class="font-bold text-lg">₹${chemCost.toLocaleString()}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Organic Profit</p><p class="font-bold text-lg text-secondary">₹${orgResult.profit.toLocaleString()}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Chemical Profit</p><p class="font-bold text-lg">₹${chemResult.profit.toLocaleString()}</p></div>
    </div>
    ${orgResult.profit > chemResult.profit ? '<div class="badge-green">🌿 Organic More Profitable</div>' : '<div class="badge-orange">⚗ Chemical More Profitable</div>'}`;
  }
  html += '</div>';
  box.innerHTML = html;
}

// =================== SCHEMES ===================
let _schemeFilter = 'all';
function filterSchemes(type) {
  _schemeFilter = type;
  ['all', 'Central Scheme', 'Tamil Nadu State Scheme', 'Tamil Nadu State Subsidy'].forEach((t, i) => {
    const ids = ['sf-all', 'sf-central', 'sf-state', 'sf-subsidy'];
    const btn = document.getElementById(ids[i]);
    if (!btn) return;
    const active = _schemeFilter === t;
    btn.style.background = active ? '#012d1d' : '#fff';
    btn.style.color      = active ? '#fff'     : '#414844';
    btn.style.border     = active ? 'none'     : '1.5px solid #c1c8c2';
  });
  renderSchemes();
}
async function renderSchemes() {
  const list = document.getElementById("scheme-list");
  if (!list) return;

  list.innerHTML = "Loading...";

  try {
    const res = await fetch("/schemes");
    const data = await res.json();

    console.log("Schemes data:", data); // debug

    list.innerHTML = "";

    // UI styling
    const typeIcons = {
      "Central Scheme": "flag",
      "Tamil Nadu State Scheme": "location_city",
      "Tamil Nadu State Subsidy": "percent"
    };

    const typeBg = {
      "Central Scheme": "#c1ecd4",
      "Tamil Nadu State Scheme": "#e6f0fb",
      "Tamil Nadu State Subsidy": "#ffdbcf"
    };

    const typeColor = {
      "Central Scheme": "#012d1d",
      "Tamil Nadu State Scheme": "#0c447c",
      "Tamil Nadu State Subsidy": "#3a2017"
    };

    // FILTER
    const filtered = _schemeFilter === 'all'
      ? data
      : data.filter(s => s.type === _schemeFilter);

    if (!filtered || filtered.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:40px;color:#717973;">
          No schemes found.
        </div>`;
      return;
    }

    filtered.slice(0, 20).forEach(s => {
      const name = s.name || "No Name";
      const benefit = s.benefit || "No Benefit";
      const eligibility = s.eligibility || "Not specified";
      const link = s.link || "#";
      const type = s.type || "Central Scheme";

      const bg    = typeBg[type] || '#e1e3e2';
      const color = typeColor[type] || '#414844';
      const icon  = typeIcons[type] || 'account_balance';

      // Live Dictionary Check for Dynamic Cards Text
      const displayBenefitLabel = _currentLanguageState === 'ta' ? 'பலன்:' : 'Benefit:';
      const displayEligibilityLabel = _currentLanguageState === 'ta' ? 'தகுதி:' : 'Eligibility:';
      const displayBtnText = _currentLanguageState === 'ta' ? 'வலைத்தளத்திற்குச் செல்லவும்' : 'Visit Portal';

      list.innerHTML += `
      <div style="background:#fff;border-radius:1.5rem;padding:22px;box-shadow:0 2px 16px rgba(0,0,0,0.05);margin-bottom:14px;border-left:4px solid ${bg};">
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;flex:1;">
            <div style="width:42px;height:42px;border-radius:12px;background:${bg};display:flex;align-items:center;justify-content:center;">
              <span class="material-symbols-outlined" style="font-size:20px;color:${color};">${icon}</span>
            </div>
            <strong style="font-size:15px;">${name}</strong>
          </div>

          <span style="background:${bg};color:${color};padding:4px 12px;border-radius:9999px;font-size:10px;">
            ${type}
          </span>
        </div>

        <div style="margin-bottom:14px;">
          <p><strong>${displayBenefitLabel}</strong> ${benefit}</p>
          <p><strong>${displayEligibilityLabel}</strong> ${eligibility}</p>
        </div>

        <a href="${link}" target="_blank"
           style="display:inline-block;padding:8px 14px;background:#0a5c36;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;">
           ${displayBtnText}
        </a>

      </div>`;
    });

  } catch (error) {
    console.error("Error loading schemes:", error);

    list.innerHTML = `
      <div style="text-align:center;padding:40px;color:red;">
        Failed to load schemes. Check backend & CORS.
      </div>`;
  }
}







// =================== EatGood ===================
function generateEGQR() {
  const mfd         = document.getElementById("eg-mfd").value;
  const exp         = document.getElementById("eg-exp").value;
  const batch       = document.getElementById("eg-batch").value;
  const brand       = document.getElementById("eg-brand").value;
  const ingredients = document.getElementById("eg-ingredients").value;
  if (!mfd || !exp || !batch || !brand || !ingredients) { showToast("Fill all fields"); return; }
  const egData = `EG1|MFD:${mfd}|EXP:${exp}|BATCH:${batch}|BRAND:${brand}|ING:${ingredients}`;
  document.getElementById("eg-output").textContent = egData;
  const qrImg = document.getElementById("eg-qr");
  qrImg.src          = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(egData) + "&size=200x200";
  qrImg.style.display = "block";
  showToast("QR Code generated!");
}

let html5QrCode = null;
function initScanner() {
  document.getElementById("health-modal").style.display  = "block";
  document.getElementById("qr-reader").style.display     = "none";
  document.getElementById("eg-decoded").style.display    = "none";
  document.getElementById("eg-health").style.display     = "none";
}
function continueToScan() {
  document.getElementById("health-modal").style.display = "none";
  const readerEl = document.getElementById("qr-reader");
  readerEl.style.display = "block";
  if (!html5QrCode) html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
    html5QrCode.stop();
    processScannedQR(decodedText);
  }).catch(() => showToast("Camera access denied or not available."));
}
function stopScanner() {
  if (html5QrCode) html5QrCode.stop().catch(() => {});
}
function processScannedQR(text) {
  document.getElementById("eg-decoded").style.display = "block";
  document.getElementById("eg-health").style.display  = "block";
  if (!text.startsWith("EG1|")) { document.getElementById("eg-decoded").innerHTML = '<p class="text-error font-bold">Invalid QR format. Use AGRINEXUS EatGood QR.</p>'; return; }
  const parts = {};
  text.split("|").slice(1).forEach(p => { const [k, v] = p.split(":"); if (k && v) parts[k] = v; });
  document.getElementById("eg-decoded").innerHTML = `<strong class="font-headline text-lg block mb-3">Product Info</strong>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Brand</p><p class="font-bold">${parts.BRAND || "-"}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">Batch</p><p class="font-bold">${parts.BATCH || "-"}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">MFD</p><p class="font-bold">${parts.MFD || "-"}</p></div>
      <div class="paddy-card-agri"><p class="text-xs text-on-surface-variant">EXP</p><p class="font-bold">${parts.EXP || "-"}</p></div>
    </div>`;
  analyzeHealth(parts.ING || "", text);
}
function analyzeHealth(ingredientStr) {
  const conditions = { diabetes: document.getElementById("temp-diabetes")?.checked, bp: document.getElementById("temp-bp")?.checked, vegan: document.getElementById("temp-vegan")?.checked, weightloss: document.getElementById("temp-weightloss")?.checked };
  const RISK_DB    = { Sugar: { diabetes: 3, weightloss: 2 }, PalmOil: { bp: 2, weightloss: 1 }, Salt: { bp: 3 }, MSG: { bp: 2 }, Maida: { diabetes: 2, weightloss: 2 }, Gelatin: { vegan: 4 } };
  let totalRisk = 0, ingredientOutput = "", problemIngredients = [];
  ingredientStr.split(",").forEach(pair => {
    const [rawName, amtStr] = [pair.split(":")[0], pair.split(":")[1]];
    const grams      = parseFloat(amtStr) || 0;
    const riskEntry  = RISK_DB[rawName];
    let highlight    = false;
    if (riskEntry) { Object.entries(riskEntry).forEach(([cond, score]) => { if (conditions[cond]) { totalRisk += score * Math.ceil(grams / 10); highlight = true; problemIngredients.push(`${rawName} (${grams}g) – affects ${cond}`); } }); }
    ingredientOutput += `<div style="margin:4px 0;padding:6px 10px;border-radius:8px;background:${highlight ? '#ffdad6' : '#f3f4f3'};color:${highlight ? '#93000a' : '#191c1c'};font-size:13px;">${rawName} (${grams}g)</div>`;
  });
  let verdict = "", verdictClass = "";
  if      (totalRisk === 0)  { verdict = "🟢 Safe for You";      verdictClass = "bg-secondary-container/40"; }
  else if (totalRisk <= 6)   { verdict = "🟡 Mild Risk";          verdictClass = "bg-tertiary-fixed";         }
  else if (totalRisk <= 12)  { verdict = "🟠 Moderate Risk";      verdictClass = "bg-tertiary-fixed";         }
  else                       { verdict = "🔴 High Risk – Avoid";  verdictClass = "bg-error-container";        }
  const healthScore = Math.max(1, 10 - Math.floor(totalRisk / 2));
  document.getElementById("eg-health").innerHTML = `
    <div class="${verdictClass} rounded-xl p-4 mb-4"><p class="font-headline font-bold text-xl">${verdict}</p><p class="text-sm mt-1">Health Score: <strong>${healthScore}/10</strong></p></div>
    <p class="font-bold text-sm mb-2">Ingredients</p>${ingredientOutput}
    ${problemIngredients.length > 0 ? `<p class="font-bold text-sm mt-3 text-error">Flagged Ingredients</p><p class="text-sm text-error mt-1">${problemIngredients.join("<br>")}</p>` : "<p class='text-sm text-secondary mt-3 font-bold'>No problematic ingredients found.</p>"}`;
}

// =================== INIT ===================

document.addEventListener("DOMContentLoaded", () => {
  // Automatically check for or default to English language states
  const savedLanguage = localStorage.getItem('agrinexus_language') || 'en';
  liveTranslateUI(savedLanguage);
  
  const session = localStorage.getItem("session");
  if (session === "farmer") { updateNavForLogin(); }
});


//cotton
function loadCottonOptions() {
  const select = document.getElementById("cotton-variety");

  select.innerHTML = `<option value="">Select Variety</option>`;

  COTTON_VARIETIES.forEach((c, index) => {
    select.innerHTML += `<option value="${index}">${c.name}</option>`;
  });
}

function renderCottonVariety() {
  const index = document.getElementById("cotton-variety").value;
  const container = document.getElementById("cotton-details");

  if (index === "") {
    container.innerHTML = "";
    return;
  }

  const c = COTTON_VARIETIES[index];

  container.innerHTML = `
    <div class="bg-surface-container-low p-5 rounded-2xl shadow-sm">

      <!-- Title -->
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-green-200 w-10 h-10 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-green-800">eco</span>
        </div>
        <div>
          <h3 class="font-bold text-lg">${c.name}</h3>
          <p class="text-xs text-on-surface-variant">Cotton Variety</p>
        </div>
      </div>

      <!-- Top Grid -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div class="bg-surface-container p-3 rounded-xl">
          <p class="text-xs text-on-surface-variant">Staple Length</p>
          <p class="font-bold text-sm">${c.stapleLength}</p>
        </div>

        <div class="bg-surface-container p-3 rounded-xl">
          <p class="text-xs text-on-surface-variant">Strength</p>
          <p class="font-bold text-sm">${c.strength}</p>
        </div>
      </div>

      <!-- Full Row -->
      <div class="bg-surface-container p-3 rounded-xl mb-4">
        <p class="text-xs text-on-surface-variant">Micronaire & Uniformity</p>
        <p class="font-bold text-sm">${c.micronaire} | ${c.uniformity}</p>
      </div>

      <!-- Divider -->
      <hr class="my-4 border-outline-variant"/>

      <!-- Uses -->
      <div class="mb-4">
        <p class="font-bold text-sm mb-1">Uses</p>
        <p class="text-xs text-on-surface-variant">${c.uses}</p>
      </div>

      <!-- Farmer Tip -->
      <div class="mb-4">
        <p class="font-bold text-sm mb-1">Farmer Tip</p>
        <p class="text-xs text-green-700">${c.farmerNote}</p>
      </div>

      <!-- Profit Section -->
      <h4 class="font-bold text-sm mb-3">Estimated Value</h4>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-surface-container p-3 rounded-xl">
          <p class="text-xs text-on-surface-variant">Ginning %</p>
          <p class="font-bold">${c.ginning}</p>
        </div>

        <div class="bg-surface-container p-3 rounded-xl">
          <p class="text-xs text-on-surface-variant">Market Value</p>
          <p class="font-bold text-green-700">High</p>
        </div>
      </div>

      <!-- Bottom Badge -->
      <div class="mt-4">
        <span class="bg-orange-200 text-xs px-3 py-1 rounded-full">
          🌿 High Quality Cotton
        </span>
      </div>

    </div>
  `;
}
// =================== LIVE TRANSLATION ENGINE ===================
let _currentLanguageState = 'en';

function liveTranslateUI(selectedLang) {
  // 1. Store language preference in local storage to keep pages unified
  _currentLanguageState = selectedLang;
  localStorage.setItem('agrinexus_language', selectedLang);

  // 2. Scan and translate permanent text with [data-key] indicators
  const translatableElements = document.querySelectorAll('[data-key]');
  translatableElements.forEach(element => {
    const translationKey = element.getAttribute('data-key');
    if (LANG[selectedLang] && LANG[selectedLang][translationKey]) {
      element.innerText = LANG[selectedLang][translationKey];
    }
  });

  // 3. Highlight the active language pill button visually in your header
  const enBtn = document.getElementById('lang-btn-en');
  const taBtn = document.getElementById('lang-btn-ta');
  if (enBtn && taBtn) {
    enBtn.classList.toggle('active', selectedLang === 'en');
    taBtn.classList.toggle('active', selectedLang === 'ta');
  }

  // 4. Force dynamic sections like schemes to immediately re-render in the new language
  const schemeContainer = document.getElementById("scheme-list");
  if (schemeContainer && schemeContainer.innerHTML !== "" && schemeContainer.innerHTML !== "Loading...") {
    renderSchemes();
  }
}