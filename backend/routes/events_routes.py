from datetime import datetime
import math

from flask import Blueprint, jsonify, request, g

from auth_utils import auth_required, get_optional_user
from models import db, Event, EventComment

events_bp = Blueprint('events_bp', __name__)

@events_bp.route("/api/events", methods=["GET"])
def get_events():
    """Get events - only show events within visibility radius of user's location"""
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    date_from = request.args.get('date_from')

    # Require location for radius-based visibility
    if lat is None or lon is None:
        return jsonify({'error': 'Location required. Please enable location access to view events.'}), 400
    
    user = get_optional_user()
    if not user:
        return jsonify({'error': 'Login required to view events'}), 401

    events = Event.query.all()
    filtered_events = []

    # Filter events based on visibility radius
    for event in events:
        if event.latitude and event.longitude:
            distance = calculate_distance(lat, lon, event.latitude, event.longitude)
            # Only show events within the creator's set visibility radius
            visibility_radius = event.visibility_radius_km or 10.0  # Default 10km
            if distance <= visibility_radius:
                event_dict = event.to_dict()
                event_dict['distance'] = round(distance, 2)
                filtered_events.append(event_dict)
    
    # Sort by date
    filtered_events.sort(key=lambda x: x.get('date', ''))
    
    return jsonify(filtered_events)

@events_bp.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Get a specific event with comments"""
    event = Event.query.get_or_404(event_id)
    event_dict = event.to_dict()
    event_dict['comments'] = [comment.to_dict() for comment in event.comments]
    return jsonify(event_dict)

@events_bp.route("/api/events", methods=["POST"])
@auth_required
def post_event():
    """Create a new event"""
    data = request.json
    
    # Content moderation
    from ai_helper import moderate_content
    is_valid, message = moderate_content(data.get('description', '') + ' ' + data.get('title', ''))
    
    if not is_valid:
        return jsonify({"error": message}), 400
    
    date_str = data.get("date")
    if date_str:
        try:
            event_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            event_date = datetime.now()
    else:
        event_date = datetime.now()
    
    organizer = data.get("organizer") or g.current_user.get('name') or "Anonymous"
    created_by = g.current_user.get('email') or g.current_user.get('id') or "anonymous"
    visibility_radius = data.get("visibility_radius_km", 10.0)  # Default 10km

    new_event = Event(
        title=data.get("title"),
        description=data.get("description"),
        location=data.get("location"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        date=event_date,
        contact=data.get("contact", ""),
        tags=data.get("tags", ""),
        organizer=organizer,
        visibility_radius_km=visibility_radius,
        created_by=created_by
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"message": "Event added successfully", "event": new_event.to_dict()}), 201

@events_bp.route("/api/events/<int:event_id>/interest", methods=["POST"])
def mark_interest(event_id):
    """Mark interest in an event"""
    event = Event.query.get_or_404(event_id)
    event.interested_count += 1
    db.session.commit()
    return jsonify({"message": "Interest marked", "interested_count": event.interested_count})

@events_bp.route("/api/events/<int:event_id>/comments", methods=["POST"])
def add_comment(event_id):
    """Add a comment to an event"""
    data = request.json
    event = Event.query.get_or_404(event_id)
    
    new_comment = EventComment(
        event_id=event_id,
        author=data.get("author", "Anonymous"),
        comment=data.get("comment")
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({"message": "Comment added", "comment": new_comment.to_dict()}), 201

@events_bp.route("/api/events/suggest", methods=["GET"])
def suggest_events():
    """AI-suggested events based on interest"""
    interest = request.args.get('interest', '')
    location = request.args.get('location', '')
    
    from ai_helper import generate_event_suggestion
    suggestion = generate_event_suggestion(interest, location)
    
    # Also get actual events matching the interest
    events = Event.query.filter(Event.tags.contains(interest)).all() if interest else []
    
    return jsonify({
        "suggestion": suggestion,
        "events": [e.to_dict() for e in events[:5]]
    })

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

