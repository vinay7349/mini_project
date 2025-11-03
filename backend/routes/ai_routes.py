from flask import Blueprint, jsonify, request
from ai_helper import get_ai_response, generate_itinerary

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """AI chatbot endpoint"""
    data = request.json
    prompt = data.get("message", "")
    api_key = data.get("api_key")  # Optional API key
    
    response = get_ai_response(prompt, api_key)
    
    return jsonify({
        "response": response,
        "prompt": prompt
    })

@ai_bp.route("/api/ai/itinerary", methods=["POST"])
def generate_travel_itinerary():
    """Generate a travel itinerary"""
    data = request.json
    budget = data.get("budget", 1000)
    location = data.get("location", "Unknown")
    duration = data.get("duration", "1 day")
    
    itinerary = generate_itinerary(budget, location, duration)
    
    return jsonify({
        "itinerary": itinerary,
        "budget": budget,
        "location": location,
        "duration": duration
    })

@ai_bp.route("/api/ai/event-create", methods=["POST"])
def ai_event_create():
    """AI-assisted event creation"""
    data = request.json
    user_description = data.get("description", "")
    
    # AI would parse and structure the event
    # For now, return a structured format
    return jsonify({
        "suggested_title": f"Event: {user_description[:50]}...",
        "suggested_description": user_description,
        "suggested_tags": "community,travel,meetup",
        "message": "AI has structured your event. Review and submit!"
    })

