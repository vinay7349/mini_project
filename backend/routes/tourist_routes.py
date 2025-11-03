from flask import Blueprint, jsonify, request
from models import db, TouristSpot
import math
import random

tourist_bp = Blueprint('tourist_bp', __name__)

@tourist_bp.route("/api/tourist-spots", methods=["GET"])
def get_tourist_spots():
    """Get all tourist spots or filter by location"""
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    category = request.args.get('category')
    surprise = request.args.get('surprise', type=bool, default=False)
    
    spots = TouristSpot.query.all()
    
    if category:
        spots = [s for s in spots if s.category == category]
    
    if lat and lon:
        spots_with_distance = []
        for spot in spots:
            distance = calculate_distance(lat, lon, spot.latitude, spot.longitude)
            spot_dict = spot.to_dict()
            spot_dict['distance'] = round(distance, 2)
            spots_with_distance.append(spot_dict)
        
        spots_with_distance.sort(key=lambda x: x['distance'])
        
        # Surprise me feature - return a random spot
        if surprise:
            random_spot = random.choice(spots_with_distance)
            return jsonify(random_spot)
        
        return jsonify(spots_with_distance)
    
    return jsonify([spot.to_dict() for spot in spots])

@tourist_bp.route("/api/tourist-spots/<int:spot_id>", methods=["GET"])
def get_tourist_spot(spot_id):
    """Get a specific tourist spot by ID"""
    spot = TouristSpot.query.get_or_404(spot_id)
    return jsonify(spot.to_dict())

@tourist_bp.route("/api/tourist-spots", methods=["POST"])
def create_tourist_spot():
    """Create a new tourist spot"""
    data = request.json
    new_spot = TouristSpot(
        name=data.get("name"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        description=data.get("description"),
        category=data.get("category"),
        image_url=data.get("image_url"),
        rating=data.get("rating")
    )
    db.session.add(new_spot)
    db.session.commit()
    return jsonify({"message": "Tourist spot added successfully", "spot": new_spot.to_dict()}), 201

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

