from pymongo import MongoClient
import random

client = MongoClient("mongodb+srv://smksnk:methun%402007@cluster0.sx2akqk.mongodb.net/agrinexus_db")
db = client["agrinexus_db"]

base_schemes = [
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "type": "Central Scheme",
        "benefit": "₹6000 per year direct income support",
        "eligibility": "Small and marginal farmers owning cultivable land",
        "link": "https://pmkisan.gov.in/"
    },
    {
        "name": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
        "type": "Central Scheme",
        "benefit": "Crop insurance against natural calamities, pests, diseases",
        "eligibility": "All eligible farmers growing notified crops",
        "link": "https://pmfby.gov.in/"
    },
    {
        "name": "Soil Health Card",
        "type": "Central Scheme",
        "benefit": "Soil nutrient analysis for fertilizer recommendations",
        "eligibility": "Farmers engaged in cultivation",
        "link": "https://soilhealth.dac.gov.in/"
    },
    {
        "name": "TN - Uzhavan App Integration",
        "type": "Tamil Nadu State Scheme",
        "benefit": "Agri services, market price, subsidy info, crop advisory",
        "eligibility": "Farmers registered through Uzhavan app",
        "link": "https://www.tn.gov.in/"
    },
    {
        "name": "TN - Agricultural Mechanization Subsidy",
        "type": "Tamil Nadu State Subsidy",
        "benefit": "Subsidy for tractors, power tillers, implements",
        "eligibility": "Registered farmers with land records",
        "link": "https://www.tnagrisubsidy.in/"
    },
    {
        "name": "TN - Micro Irrigation Subsidy",
        "type": "Tamil Nadu State Scheme",
        "benefit": "Drip and sprinkler irrigation subsidy",
        "eligibility": "Farmers cultivating horticulture crops",
        "link": "https://tnhorticulture.tn.gov.in/"
    }
]

schemes = []

# Generate 100 entries based on real ones
for i in range(100):
    base = random.choice(base_schemes)
    scheme = base.copy()
    scheme["name"] = f"{base['name']} #{i+1}"
    schemes.append(scheme)

# Replace DB data
db.schemes.delete_many({})
db.schemes.insert_many(schemes)

print("100 schemes inserted in correct format!")