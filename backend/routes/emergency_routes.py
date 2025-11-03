from flask import Blueprint, jsonify, request

emergency_bp = Blueprint('emergency_bp', __name__)

# Emergency contacts by country/region (can be expanded)
EMERGENCY_CONTACTS = {
    "default": {
        "police": "100",
        "fire": "101",
        "ambulance": "102",
        "women_helpline": "1091",
        "disaster_management": "108"
    },
    "india": {
        "police": "100",
        "fire": "101",
        "ambulance": "102",
        "women_helpline": "1091",
        "disaster_management": "108",
        "tourist_helpline": "1800-111-363"
    },
    "usa": {
        "police": "911",
        "fire": "911",
        "ambulance": "911",
        "women_helpline": "911"
    },
    "uk": {
        "police": "999",
        "fire": "999",
        "ambulance": "999",
        "women_helpline": "999"
    }
}

@emergency_bp.route("/api/emergency", methods=["GET"])
def get_emergency_contacts():
    """Get emergency contacts based on location"""
    country = request.args.get('country', 'default')
    contacts = EMERGENCY_CONTACTS.get(country.lower(), EMERGENCY_CONTACTS["default"])
    
    return jsonify({
        "contacts": contacts,
        "location": country,
        "message": "Call these numbers in case of emergency"
    })

@emergency_bp.route("/api/emergency/all", methods=["GET"])
def get_all_emergency_contacts():
    """Get all emergency contact information"""
    return jsonify(EMERGENCY_CONTACTS)

