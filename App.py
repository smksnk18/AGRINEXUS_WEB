from flask import Flask, jsonify, request, session
from pymongo import MongoClient
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from twilio.rest import Client
import random
import os
from flask import send_from_directory




app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
app.secret_key = "secret123"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # keep False for local

# ------------------ DB CONNECTION ------------------

try:
    mongo_client = MongoClient(
        "mongodb+srv://smksnk:methun%402007@cluster0.sx2akqk.mongodb.net/agrinexus_db?retryWrites=true&w=majority",
        serverSelectionTimeoutMS=5000
    )
    mongo_client.admin.command('ping')
    db = mongo_client["agrinexus_db"]
    print("✅ MongoDB Connected")
except Exception as e:
    print("❌ MongoDB FAILED:", e)
    db = None

# ------------------ TWILIO CONFIG ------------------

# ⚠️ Use environment variables in real deployment
account_sid = os.getenv("TWILIO_SID", "ACe12ed6ba4837e137ff05ed02535a63c5")
auth_token = os.getenv("TWILIO_AUTH", "72b3ce2a9335f744784e169fccefb0ae")
twilio_number = "+1 385 403 8753"

client_twilio = Client(account_sid, auth_token)

# ------------------ OTP STORAGE ------------------

otp_store = {}

# ------------------ LOGOUT ------------------

@app.route("/app")
def serve_app():
    return send_from_directory(".", "index.html")
@app.route("/logout")
def logout():
    session.pop("username", None)
    return jsonify({"message": "Logged out"})
@app.route("/dashboard")
def dashboard():
    print("SESSION:", session)

    if "username" in session:
        return f"Welcome {session['username']}"
    return "Not logged in"
# ------------------ REGISTER ------------------

@app.route("/schemes")
def get_schemes():
    try:
        if db is not None:
            data = list(db.schemes.find({}, {"_id": 0}))
            return jsonify(data)
        else:
            return jsonify(fallback_data)
    except Exception as e:
        print("ERROR:", e)
        return jsonify(fallback_data)

# ------------------ FILTER SCHEMES ------------------

@app.route("/schemes/filter")
def filter_schemes():
    crop = request.args.get("crop")
    state = request.args.get("state")

    if db is None:
        return jsonify(fallback_data)

    query = {}

    if crop:
        query["crop"] = crop
    if state:
        query["state"] = state

    data = list(db.schemes.find(query, {"_id": 0}))
    return jsonify(data)

# ------------------ RECOMMENDATION SYSTEM ------------------

@app.route("/recommend")
def recommend():
    crop = request.args.get("crop")
    state = request.args.get("state")

    if db is None:
        return jsonify(fallback_data)

    query = {}

    if crop:
        query["crop"] = crop
    if state:
        query["state"] = state

    data = list(db.schemes.find(query, {"_id": 0}).limit(5))
    return jsonify(data)

# ------------------ REFRESH DATA ------------------

@app.route("/refresh-schemes")
def refresh_schemes():
    try:
        import scraper
        return "Schemes refreshed!"
    except Exception as e:
        return f"Refresh failed: {e}"


@app.route("/register-farmer", methods=["POST"])
def register_farmer():
    # TEMPORARY TEST MODE
    if "mobile" not in session:
        session["mobile"] = "test123"

    data = request.json

    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    district = data.get("district")
    taluk = data.get("taluk")
    village = data.get("village")

    # Validation
    if not username or not password:
        return jsonify({"message": "Username & Password required"}), 400

    # Check if username already exists
    if db.users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    db.users.insert_one({
        "mobile": session["mobile"],
        "username": username,
        "password": hashed_pw,
        "name": name,
        "district": district,
        "taluk": taluk,
        "village": village,
        "login_count": 0
    })

    return jsonify({"message": "Farmer registered successfully"})
# ------------------ LOGIN ------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = db.users.find_one({"username": username})

    print("Entered password:", password)
    print("Stored hash:", user["password"] if user else "No user")

    if user:
        result = bcrypt.check_password_hash(user["password"], password)
        print("Password match:", result)

        if result:
            session["username"] = username   # 🔥 ADD THIS LINE
            return jsonify({"success": True})

    return jsonify({"success": False})
# ------------------ SEND OTP ------------------

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    mobile = data.get("mobile")

    if not mobile:
        return jsonify({"message": "Mobile required"}), 400

    mobile = str(mobile).replace("+91", "").replace(" ", "")

    if len(mobile) != 10 or not mobile.isdigit():
        return jsonify({"message": "Invalid mobile number"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[mobile] = otp

    try:
        client_twilio.messages.create(
            body=f"Your AGRINEXUS OTP is {otp}",
            from_=twilio_number,
            to="+91" + mobile
        )

        print("OTP:", otp)

        return jsonify({"message": "OTP sent"})
    
    except Exception as e:
        print("Twilio Error:", e)
        return jsonify({"message": "Failed"}), 500
# ------------------ VERIFY OTP ------------------
@app.route("/debug-users")
def debug_users():
    users = list(db.users.find({}, {"_id": 0}))
    return jsonify(users)

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    mobile = data.get("mobile")
    otp = data.get("otp")

    if otp_store.get(mobile) == otp:
        session["mobile"] = mobile   # 🔥 important

        otp_store.pop(mobile, None)

        return jsonify({"message": "OTP verified"})
    else:
        return jsonify({"message": "Invalid OTP"}), 400
# ------------------ MARKET PRICES ------------------

@app.route("/market-prices")
def market_prices():
    data =[
        {"crop": "Paddy", "state": "Tamil Nadu", "price": 2250, "previousPrice": 2100, "market": "Chennai"},
        {"crop": "Paddy", "state": "Tamil Nadu", "price": 2300, "previousPrice": 2200, "market": "Trichy"},
        {"crop": "Paddy", "state": "Andhra Pradesh", "price": 2350, "previousPrice": 2250, "market": "Guntur"},
        
        {"crop": "Wheat", "state": "Punjab", "price": 2400, "previousPrice": 2500, "market": "Ludhiana"},
        {"crop": "Wheat", "state": "Haryana", "price": 2380, "previousPrice": 2450, "market": "Karnal"},
        {"crop": "Wheat", "state": "UP", "price": 2350, "previousPrice": 2400, "market": "Kanpur"},
        
        {"crop": "Cotton", "state": "Gujarat", "price": 6300, "previousPrice": 6000, "market": "Ahmedabad"},
        {"crop": "Cotton", "state": "Maharashtra", "price": 6200, "previousPrice": 6100, "market": "Nagpur"},
        {"crop": "Cotton", "state": "Telangana", "price": 6100, "previousPrice": 5900, "market": "Warangal"},
        
        {"crop": "Tomato", "state": "Karnataka", "price": 1800, "previousPrice": 2000, "market": "Bangalore"},
        {"crop": "Tomato", "state": "Tamil Nadu", "price": 1700, "previousPrice": 1600, "market": "Madurai"},
        
        {"crop": "Onion", "state": "Maharashtra", "price": 1500, "previousPrice": 1400, "market": "Nashik"},
        {"crop": "Onion", "state": "Karnataka", "price": 1450, "previousPrice": 1500, "market": "Hubli"},
        
        {"crop": "Sugarcane", "state": "UP", "price": 350, "previousPrice": 340, "market": "Meerut"},
        {"crop": "Sugarcane", "state": "Maharashtra", "price": 360, "previousPrice": 355, "market": "Kolhapur"}
    ]
    return jsonify(data)

# ------------------ HOME ------------------

@app.route("/")
def home():
    return "🚀 AgriNexus Server Running!"

# ------------------ RUN ------------------

if __name__ == "__main__":
    app.run(debug=True)