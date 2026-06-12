// =================== DATA ===================
const TNDATA = [
  {district:"Thanjavur",taluks:[{name:"Papanasam",villages:["Ayyampettai","Pandalgudi","Thiruvaiyaru"]},{name:"Kumbakonam",villages:["Darasuram","Swamimalai","Govindapuram"]},{name:"Thiruvaiyaru",villages:["Melattur","Marudur","Thirupazhanam"]}]},
  {district:"Tirunelveli",taluks:[{name:"Ambasamudram",villages:["Kallidaikurichi","Cheranmahadevi","Pudupatti"]},{name:"Tenkasi",villages:["Alangulam","Sivagiri","V.K Puram"]}]},
  {district:"Madurai",taluks:[{name:"Melur",villages:["Mudukulathur","Vilangudi","Melur South"]},{name:"Vadipatti",villages:["Vadipatti","Samayanallur","Othakadai"]}]},
  {district:"Coimbatore",taluks:[{name:"Pollachi",villages:["Anaimalai","Vettaikaranpudur","Udumalpet Road"]},{name:"Mettupalayam",villages:["Karamadai","Sirumugai","Odanthurai"]}]}
];

const MARKET_PRICES=[{crop:"Paddy",price:32},{crop:"Tomato",price:18},{crop:"Onion",price:27},{crop:"Chilli",price:135}];

const WEATHER_ADVISORY=[
  {crop:"Paddy",best_season:"June - December",notes:"Requires warm climate with moderate rainfall. Ideal temperature is 20°C - 35°C. Maintain standing water during vegetative growth phase."},
  {crop:"Tomato",best_season:"September - January",notes:"Requires well-drained soil and moderate temperature (20°C - 28°C). Avoid heavy rains during flowering."},
  {crop:"Onion",best_season:"November - March",notes:"Prefers dry weather with temperature 13°C - 24°C. Avoid waterlogging as bulbs rot easily."},
  {crop:"Chilli",best_season:"July - November",notes:"Requires warm humid climate (20°C - 30°C). Sensitive to frost and waterlogging."}
];

const PADDY_VARIETIES=[
  {state:"Tamil Nadu",varieties:[
    {name:"ADT-36",duration:"115-120 days",type:"Medium-duration",suitable:"Delta areas",yield:6000,marketPrice:22,cost:{organic:{manure:6000,vermicompost:5000,neemCake:2500,labor:8000,irrigation:4000},chemical:{urea:3000,dap:3500,pesticides:4000,labor:7000,irrigation:4000}}},
    {name:"ADT-47",duration:"110 days",type:"Short-duration",suitable:"Thanjavur, Trichy belts",yield:6500,marketPrice:22,cost:{organic:{manure:6000,vermicompost:5000,labor:8000,irrigation:4000},chemical:{urea:3000,dap:3500,pesticides:4000,labor:7000,irrigation:4000}}},
    {name:"CO-43",duration:"130 days",type:"Traditional medium",suitable:"Cauvery delta",yield:6200,marketPrice:23,cost:{organic:{manure:6500,vermicompost:5000,labor:8500,irrigation:4500},chemical:{urea:3200,dap:3700,pesticides:4200,labor:7500,irrigation:4500}}},
    {name:"CO-51",duration:"110 days",type:"Short-duration",suitable:"Saline soils",yield:6800,marketPrice:23,cost:{organic:{manure:6200,vermicompost:4800,labor:8200,irrigation:4200},chemical:{urea:3000,dap:3600,pesticides:4100,labor:7200,irrigation:4200}}},
    {name:"IR-50",duration:"105-110 days",type:"High yielding",suitable:"Tank-fed areas",yield:7000,marketPrice:22,cost:{organic:{manure:6500,vermicompost:5200,labor:8500,irrigation:4300},chemical:{urea:3300,dap:3800,pesticides:4500,labor:7600,irrigation:4300}}},
    {name:"Ponni",duration:"135-140 days",type:"Popular edible rice",suitable:"Tamil Nadu river belts",yield:5800,marketPrice:26,cost:{organic:{manure:7000,vermicompost:5500,labor:9000,irrigation:4800},chemical:{urea:3500,dap:4000,pesticides:4800,labor:8200,irrigation:4800}}},
    {name:"Seeraga Samba",duration:"135-140 days",type:"Premium aromatic",suitable:"Thanjavur-Thiruvaiyaru region",yield:5000,marketPrice:38,cost:{organic:{manure:7500,vermicompost:6000,labor:9500,irrigation:5000},chemical:{urea:3800,dap:4200,pesticides:5000,labor:8500,irrigation:5000}}}
  ]},
  {state:"Andhra Pradesh / Telangana",varieties:[
    {name:"Sona Masuri",duration:"135 days",type:"Premium edible",suitable:"Irrigated zones",yield:6200,marketPrice:28,cost:{organic:{manure:7000,vermicompost:5500,labor:8800,irrigation:4700},chemical:{urea:3500,dap:4000,pesticides:4500,labor:7800,irrigation:4700}}},
    {name:"MTU-1010",duration:"120-125 days",type:"High yielding",suitable:"Canal irrigated regions",yield:6800,marketPrice:24,cost:{organic:{manure:6500,vermicompost:5200,labor:8600,irrigation:4500},chemical:{urea:3300,dap:3700,pesticides:4300,labor:7600,irrigation:4500}}},
    {name:"Swarna",duration:"140 days",type:"Long duration",suitable:"Delta areas",yield:6000,marketPrice:23,cost:{organic:{manure:6800,vermicompost:5400,labor:8800,irrigation:4600},chemical:{urea:3400,dap:3900,pesticides:4400,labor:7700,irrigation:4600}}}
  ]},
  {state:"Kerala",varieties:[
    {name:"Matta Rice",duration:"150 days",type:"Coarse red rice",suitable:"Palakkad plains",yield:5200,marketPrice:32,cost:{organic:{manure:7200,vermicompost:6000,labor:9200,irrigation:4800},chemical:{urea:3600,dap:4100,pesticides:4700,labor:8000,irrigation:4800}}},
    {name:"Uma",duration:"120-130 days",type:"Medium duration",suitable:"Rain-fed regions",yield:5800,marketPrice:24,cost:{organic:{manure:6500,vermicompost:5200,labor:8500,irrigation:4300},chemical:{urea:3200,dap:3600,pesticides:4200,labor:7400,irrigation:4300}}},
    {name:"Jaya",duration:"135 days",type:"High yielding",suitable:"Paddy-wetlands",yield:6400,marketPrice:25,cost:{organic:{manure:6800,vermicompost:5400,labor:8700,irrigation:4500},chemical:{urea:3300,dap:3800,pesticides:4400,labor:7600,irrigation:4500}}}
  ]},
  {state:"Karnataka",varieties:[
    {name:"Rajamudi",duration:"150 days",type:"Heritage red rice",suitable:"Mysore region",yield:5000,marketPrice:40,cost:{organic:{manure:7500,vermicompost:6200,labor:9600,irrigation:5000},chemical:{urea:3800,dap:4200,pesticides:5000,labor:8500,irrigation:5000}}},
    {name:"Gandhakasala",duration:"130 days",type:"Aromatic fine rice",suitable:"Malnad region",yield:5200,marketPrice:36,cost:{organic:{manure:7200,vermicompost:6000,labor:9400,irrigation:4800},chemical:{urea:3600,dap:4000,pesticides:4700,labor:8200,irrigation:4800}}},
    {name:"Rakthashali",duration:"160 days",type:"Medicinal red rice",suitable:"Rain-fed zones",yield:4800,marketPrice:42,cost:{organic:{manure:7800,vermicompost:6500,labor:10000,irrigation:5200},chemical:{urea:4000,dap:4500,pesticides:5200,labor:8800,irrigation:5200}}}
  ]}
];

//cotton varieties data
const COTTON_VARIETIES = [
  {
    name: "Suvin",
    type: "Extra Long Staple",
    stapleLength: "35-38 mm",
    strength: "Very High",
    micronaire: "3.5-4.5 (Fine)",
    uniformity: "High",
    ginning: "34-36%",
    uses: "Used for premium shirts, bedsheets, and export garments. The fiber is very long and soft, so cloth feels smooth and luxurious.",
    farmerNote: "Very high price but needs good irrigation and care"
  },
  {
    name: "DCH-32",
    type: "Long Staple",
    stapleLength: "30-32 mm",
    strength: "High",
    micronaire: "4.0-4.8",
    uniformity: "Good",
    ginning: "32-34%",
    uses: "Used to produce fine yarn in spinning mills, which is then used for high-quality clothes like shirts and dresses.",
    farmerNote: "Stable yield with good market demand"
  },
  {
    name: "MCU-5",
    type: "Long Staple",
    stapleLength: "30-31 mm",
    strength: "High",
    micronaire: "4.0-4.5",
    uniformity: "Good",
    ginning: "33-35%",
    uses: "Used for export-quality fabrics and branded garments due to strong and uniform fiber.",
    farmerNote: "Good balance of quality and yield"
  },
  {
    name: "Bunny Bt",
    type: "Bt Hybrid",
    stapleLength: "28-30 mm",
    strength: "Moderate",
    micronaire: "4.5-5.0",
    uniformity: "Medium",
    ginning: "30-32%",
    uses: "Used for making everyday clothes like t-shirts, towels, and bulk textile production.",
    farmerNote: "High pest resistance, low risk"
  },
  {
    name: "RCH-2 Bt",
    type: "Bt Hybrid",
    stapleLength: "29-31 mm",
    strength: "Moderate",
    micronaire: "4.2-4.8",
    uniformity: "Medium",
    ginning: "31-33%",
    uses: "Used in large textile mills for producing regular clothing fabrics and yarn.",
    farmerNote: "High yield and widely used"
  },
  {
    name: "Shankar-6",
    type: "Hybrid",
    stapleLength: "29-31 mm",
    strength: "High",
    micronaire: "4.2-4.8",
    uniformity: "Good",
    ginning: "32-35%",
    uses: "Mainly used in denim (jeans) and strong fabrics due to high strength.",
    farmerNote: "High export demand and profit"
  },
  {
    name: "Varalakshmi",
    type: "Long Staple",
    stapleLength: "32-34 mm",
    strength: "High",
    micronaire: "3.8-4.5",
    uniformity: "High",
    ginning: "34-36%",
    uses: "Used in making soft premium garments and fine yarn fabrics.",
    farmerNote: "High price but needs proper care"
  },
  {
    name: "Suraj",
    type: "Hybrid",
    stapleLength: "28-30 mm",
    strength: "Moderate",
    micronaire: "4.5",
    uniformity: "Medium",
    ginning: "30-32%",
    uses: "Used for general textile production like shirts and home fabrics.",
    farmerNote: "Reliable and stable performance"
  },
  {
    name: "Anjali",
    type: "Hybrid",
    stapleLength: "27-29 mm",
    strength: "Moderate",
    micronaire: "4.6",
    uniformity: "Medium",
    ginning: "30%",
    uses: "Used in medium quality fabrics and daily wear clothing.",
    farmerNote: "Good yield but moderate price"
  },
  {
    name: "LRA-5166",
    type: "Medium Staple",
    stapleLength: "26-28 mm",
    strength: "Moderate",
    micronaire: "4.8",
    uniformity: "Medium",
    ginning: "29-31%",
    uses: "Used for making basic fabrics like uniforms and low-cost clothing.",
    farmerNote: "Drought tolerant, good for dry areas"
  },
  {
    name: "NCS-145",
    type: "Medium Staple",
    stapleLength: "27-29 mm",
    strength: "Moderate",
    micronaire: "4.7",
    uniformity: "Medium",
    ginning: "30%",
    uses: "Used in general textile industries for medium quality fabrics.",
    farmerNote: "Adaptable to many regions"
  },
  {
    name: "PKV Rajat",
    type: "Short Staple",
    stapleLength: "24-26 mm",
    strength: "Low",
    micronaire: "5.0",
    uniformity: "Low",
    ginning: "28%",
    uses: "Used for making low-cost fabrics and coarse yarn.",
    farmerNote: "Low price but easy to grow"
  },
  {
    name: "PKV Hy-2",
    type: "Hybrid",
    stapleLength: "27-29 mm",
    strength: "Moderate",
    micronaire: "4.5",
    uniformity: "Medium",
    ginning: "30%",
    uses: "Used in commercial textile production for regular clothing.",
    farmerNote: "High yield variety"
  },
  {
    name: "JK-4",
    type: "Medium Staple",
    stapleLength: "26-28 mm",
    strength: "Moderate",
    micronaire: "4.6",
    uniformity: "Medium",
    ginning: "30%",
    uses: "Used in medium quality garments and textile products.",
    farmerNote: "Stable and reliable"
  },
  {
    name: "H-4",
    type: "Hybrid",
    stapleLength: "28-30 mm",
    strength: "Moderate",
    micronaire: "4.4",
    uniformity: "Medium",
    ginning: "31%",
    uses: "Used for mass production of fabrics and garments.",
    farmerNote: "Widely cultivated variety"
  },
  {
    name: "MECH-1",
    type: "Bt Hybrid",
    stapleLength: "29-31 mm",
    strength: "Moderate",
    micronaire: "4.5",
    uniformity: "Medium",
    ginning: "32%",
    uses: "Used in large-scale textile production and yarn manufacturing.",
    farmerNote: "Good pest resistance"
  },
  {
    name: "F-1861",
    type: "Medium Staple",
    stapleLength: "27-29 mm",
    strength: "Moderate",
    micronaire: "4.6",
    uniformity: "Medium",
    ginning: "30%",
    uses: "Used for general textile purposes and clothing.",
    farmerNote: "Disease resistant variety"
  },
  {
    name: "LD-694",
    type: "Short Staple",
    stapleLength: "24-25 mm",
    strength: "Low",
    micronaire: "5.2",
    uniformity: "Low",
    ginning: "28%",
    uses: "Used for coarse fabrics and low-cost textile products.",
    farmerNote: "Low input cost farming"
  },
  {
    name: "Sahana",
    type: "Hybrid",
    stapleLength: "28-30 mm",
    strength: "Moderate",
    micronaire: "4.5",
    uniformity: "Medium",
    ginning: "31%",
    uses: "Used for commercial textile production and regular garments.",
    farmerNote: "High productivity variety"
  },
  {
    name: "US-51",
    type: "Long Staple",
    stapleLength: "30-32 mm",
    strength: "High",
    micronaire: "4.2",
    uniformity: "Good",
    ginning: "33%",
    uses: "Used in export-quality fabrics and strong yarn production.",
    farmerNote: "High demand in export markets"
  }
];

const SCHEMES=[
  {name:"PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",type:"Central Scheme",benefit:"₹6000 per year direct income support",eligibility:"Small and marginal farmers owning cultivable land",link:"https://pmkisan.gov.in/"},
  {name:"PMFBY (Pradhan Mantri Fasal Bima Yojana)",type:"Central Scheme",benefit:"Crop insurance against natural calamities, pests, diseases",eligibility:"All eligible farmers growing notified crops",link:"https://pmfby.gov.in/"},
  {name:"Soil Health Card",type:"Central Scheme",benefit:"Soil nutrient analysis for fertilizer recommendations",eligibility:"Farmers engaged in cultivation",link:"https://soilhealth.dac.gov.in/"},
  {name:"TN - Uzhavan App Integration",type:"Tamil Nadu State Scheme",benefit:"Agri services, market price, subsidy info, crop advisory",eligibility:"Farmers registered through Uzhavan app",link:"https://www.tn.gov.in/"},
  {name:"TN - Agricultural Mechanization Subsidy",type:"Tamil Nadu State Subsidy",benefit:"Subsidy for tractors, power tillers, implements",eligibility:"Registered farmers with land records",link:"https://www.tnagrisubsidy.in/"},
  {name:"TN - Micro Irrigation Subsidy",type:"Tamil Nadu State Scheme",benefit:"Drip and sprinkler irrigation subsidy",eligibility:"Farmers cultivating horticulture crops",link:"https://tnhorticulture.tn.gov.in/"}
];

const FARMER_KEY = "farmers";
const STOCK_KEY  = "stocks";
