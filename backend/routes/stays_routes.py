from flask import Blueprint, jsonify, request
from models import db, Stay
import math

stays_bp = Blueprint('stays_bp', __name__)

@stays_bp.route("/api/stays", methods=["GET"])
def get_stays():
    """Get all stays or filter by location/distance"""
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    max_distance = request.args.get('distance', type=float, default=10.0)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    
    stays = Stay.query.all()
    
    # Filter by distance if location provided
    if lat and lon:
        filtered_stays = []
        for stay in stays:
            distance = calculate_distance(lat, lon, stay.latitude, stay.longitude)
            if distance <= max_distance:
                stay_dict = stay.to_dict()
                stay_dict['distance'] = round(distance, 2)
                filtered_stays.append(stay_dict)
        
        # Sort by distance
        filtered_stays.sort(key=lambda x: x['distance'])
        stays_list = filtered_stays
    else:
        stays_list = [stay.to_dict() for stay in stays]
    
    # Filter by price
    if max_price:
        stays_list = [s for s in stays_list if s.get('price_per_night', 0) <= max_price]
    
    # Filter by rating
    if min_rating:
        stays_list = [s for s in stays_list if s.get('rating', 0) >= min_rating]
    
    return jsonify(stays_list)

@stays_bp.route("/api/stays/<int:stay_id>", methods=["GET"])
def get_stay(stay_id):
    """Get a specific stay by ID"""
    stay = Stay.query.get_or_404(stay_id)
    return jsonify(stay.to_dict())

@stays_bp.route("/api/stays", methods=["POST"])
def create_stay():
    """Create a new stay"""
    data = request.json
    new_stay = Stay(
        name=data.get("name"),
        address=data.get("address"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        price_per_night=data.get("price_per_night"),
        rating=data.get("rating"),
        description=data.get("description"),
        amenities=data.get("amenities"),
        contact=data.get("contact")
    )
    db.session.add(new_stay)
    db.session.commit()
    return jsonify({"message": "Stay added successfully", "stay": new_stay.to_dict()}), 201

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

